#!/usr/bin/env bash
# Entrypoint for the single-container Xerte Online Toolkits image.
#
# Starts a local MariaDB server, provisions the database + default site settings
# on first run, then runs Apache in the foreground.
set -euo pipefail

: "${XERTE_DOCROOT:=/var/www/xerte}"
: "${XERTE_DB_HOST:=127.0.0.1}"
: "${XERTE_DB_PORT:=3306}"
: "${XERTE_DB_NAME:=xerte}"
: "${XERTE_DB_USER:=xerte}"
: "${XERTE_DB_PASSWORD:=xerte}"
: "${XERTE_DB_ROOT_PASSWORD:=root}"
: "${XERTE_DB_PREFIX:=}"

cd "${XERTE_DOCROOT}"

log() { echo "[xerte] $*"; }

MYSQL_DATA="/var/lib/mysql"
MYSQL_RUN="/run/mysqld"
MYSQL_SOCK="${MYSQL_RUN}/mysqld.sock"
mkdir -p "${MYSQL_RUN}"
chmod 1777 "${MYSQL_RUN}" 2>/dev/null || true

# Decide which system user MariaDB will run as. With a named Docker volume the
# data directory is root-owned and root can chown it to the `mysql` user. With a
# host bind mount (e.g. on macOS Docker Desktop) the directory is owned by the
# host user and root cannot chown the mount root, so `mariadb-install-db` would
# fail. In that case we create a system user whose uid matches the directory
# owner and run MariaDB as that user (so install-db's chown-to-self succeeds).
MYSQL_USER="mysql"
data_uid="$(stat -c %u "${MYSQL_DATA}" 2>/dev/null || echo 0)"
if [ "$data_uid" != "0" ] && [ "$data_uid" != "$(id -u mysql 2>/dev/null || echo 101)" ]; then
    if ! id -u "$data_uid" >/dev/null 2>&1; then
        useradd -ou "$data_uid" -m -s /usr/sbin/nologin xertedbn 2>/dev/null || true
    fi
    MYSQL_USER="$(id -nu "$data_uid" 2>/dev/null || echo mysql)"
    # Fall back to mysql if we somehow couldn't resolve a name.
    [ -z "$MYSQL_USER" ] && MYSQL_USER="mysql"
fi
log "MariaDB will run as user: ${MYSQL_USER} (data dir uid=${data_uid})"

# Ensure the data directory is writable by $MYSQL_USER.
ensure_mysql_writable() {
    if ! su "$MYSQL_USER" -s /bin/sh -c 'test -w "'"$1"'"' 2>/dev/null; then
        chown -R "$MYSQL_USER" "$1" 2>/dev/null || chmod -R a+rwX "$1" 2>/dev/null || true
        if ! su "$MYSQL_USER" -s /bin/sh -c 'test -w "'"$1"'"' 2>/dev/null; then
            chmod 1777 "$1" 2>/dev/null || true
        fi
    fi
}

# ---------------------------------------------------------------------------
# 1. Initialise the MariaDB data directory (only when the volume is empty)
# ---------------------------------------------------------------------------
needs_init=false
if [ ! -d "${MYSQL_DATA}/mysql" ] || [ -z "$(ls -A "${MYSQL_DATA}" 2>/dev/null)" ]; then
    needs_init=true
fi

if [ "$needs_init" = "true" ]; then
    log "Initialising a fresh MariaDB data directory ..."
    ensure_mysql_writable "${MYSQL_DATA}"
    # Run as $MYSQL_USER so install-db's chown-to-self succeeds on bind mounts.
    if command -v mariadb-install-db >/dev/null 2>&1; then
        su "$MYSQL_USER" -s /bin/sh -c "mariadb-install-db --user=${MYSQL_USER} --datadir=${MYSQL_DATA}" >/tmp/mariadb-init.log 2>&1
    else
        su "$MYSQL_USER" -s /bin/sh -c "mysql_install_db --user=${MYSQL_USER} --datadir=${MYSQL_DATA}" >/tmp/mariadb-init.log 2>&1
    fi
    if [ $? -ne 0 ]; then
        log "MariaDB initialisation failed:" >&2
        tail -n 60 /tmp/mariadb-init.log >&2 || true
        exit 1
    fi
else
    ensure_mysql_writable "${MYSQL_DATA}"
fi

# ---------------------------------------------------------------------------
# 2. Start MariaDB (background). It listens on 127.0.0.1 only.
# ---------------------------------------------------------------------------
log "Starting MariaDB (background) ..."
mysqld_safe --user="${MYSQL_USER}" --datadir="${MYSQL_DATA}" \
    --bind-address=127.0.0.1 --port="${XERTE_DB_PORT}" \
    --socket="${MYSQL_SOCK}" \
    >/var/log/mysqld.log 2>&1 &

# Wait until MariaDB accepts connections via the unix socket. On a freshly
# initialised datadir root has no password (socket auth); on subsequent starts
# root has the configured password, so try both.
max_wait=60
elapsed=0
root_pw_arg=""
if [ -n "${XERTE_DB_ROOT_PASSWORD}" ]; then
    root_pw_arg="-p${XERTE_DB_ROOT_PASSWORD}"
fi
until \
    mariadb --socket="${MYSQL_SOCK}" -uroot -e "SELECT 1" >/dev/null 2>&1 \
    || mysql  --socket="${MYSQL_SOCK}" -uroot -e "SELECT 1" >/dev/null 2>&1 \
    || mariadb --socket="${MYSQL_SOCK}" -uroot ${root_pw_arg} -e "SELECT 1" >/dev/null 2>&1 \
    || mysql  --socket="${MYSQL_SOCK}" -uroot ${root_pw_arg} -e "SELECT 1" >/dev/null 2>&1; do
    if [ "$elapsed" -ge "$max_wait" ]; then
        log "ERROR: MariaDB did not start within ${max_wait}s." >&2
        tail -n 50 /var/log/mysqld.log >&2 || true
        exit 1
    fi
    elapsed=$((elapsed + 2))
    sleep 2
done
log "MariaDB is up."

# Run a SQL script as root via the unix socket with no password (used only on a
# fresh datadir, before a root password is set).
mysql_socket_nopw() {
    if command -v mariadb >/dev/null 2>&1; then
        mariadb --socket="${MYSQL_SOCK}" -uroot "$@"
    else
        mysql --socket="${MYSQL_SOCK}" -uroot "$@"
    fi
}

# ---------------------------------------------------------------------------
# 3. Configure root password, database + application user (idempotent)
# ---------------------------------------------------------------------------
# On a freshly initialised datadir root has no password (socket auth). Give it a
# password so that TCP connections work too. Safe to run repeatedly (fails
# harmlessly with `|| true` once the password is already set).
if [ -n "${XERTE_DB_ROOT_PASSWORD}" ]; then
    mysql_socket_nopw <<-SQL || true
        ALTER USER 'root'@'localhost' IDENTIFIED BY '${XERTE_DB_ROOT_PASSWORD}';
        GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
        FLUSH PRIVILEGES;
SQL
fi

root_pw_arg=""
if [ -n "${XERTE_DB_ROOT_PASSWORD}" ]; then
    root_pw_arg="-p${XERTE_DB_ROOT_PASSWORD}"
fi

# Reconnect helper that now uses the root password (still over the socket).
mysql_root() {
    if command -v mariadb >/dev/null 2>&1; then
        mariadb --socket="${MYSQL_SOCK}" -uroot ${root_pw_arg} "$@"
    else
        mysql --socket="${MYSQL_SOCK}" -uroot ${root_pw_arg} "$@"
    fi
}

# Create the database and application user (TCP-capable, password auth).
mysql_root <<-SQL
    CREATE DATABASE IF NOT EXISTS \`${XERTE_DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER IF NOT EXISTS '${XERTE_DB_USER}'@'%'         IDENTIFIED BY '${XERTE_DB_PASSWORD}';
    CREATE USER IF NOT EXISTS '${XERTE_DB_USER}'@'127.0.0.1' IDENTIFIED BY '${XERTE_DB_PASSWORD}';
    CREATE USER IF NOT EXISTS '${XERTE_DB_USER}'@'localhost' IDENTIFIED BY '${XERTE_DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON \`${XERTE_DB_NAME}\`.* TO '${XERTE_DB_USER}'@'%';
    GRANT ALL PRIVILEGES ON \`${XERTE_DB_NAME}\`.* TO '${XERTE_DB_USER}'@'127.0.0.1';
    GRANT ALL PRIVILEGES ON \`${XERTE_DB_NAME}\`.* TO '${XERTE_DB_USER}'@'localhost';
    FLUSH PRIVILEGES;
SQL
log "Database '${XERTE_DB_NAME}' and user '${XERTE_DB_USER}' ready."

# ---------------------------------------------------------------------------
# 4. Write database.php (Xerte's runtime DB config)
# ---------------------------------------------------------------------------
esc() { printf "%s" "$1" | sed "s/'/\\\\'/g"; }

cat > "${XERTE_DOCROOT}/database.php" <<PHP
<?php
/**
 * Auto-generated by the Xerte Docker entrypoint.
 * Do not commit this file - it contains local database credentials.
 */
global \$xerte_toolkits_site;
\$xerte_toolkits_site->database_type          = 'mysql';
\$xerte_toolkits_site->database_host          = '$(esc "${XERTE_DB_HOST}")';
\$xerte_toolkits_site->database_name          = '$(esc "${XERTE_DB_NAME}")';
\$xerte_toolkits_site->database_username      = '$(esc "${XERTE_DB_USER}")';
\$xerte_toolkits_site->database_password      = '$(esc "${XERTE_DB_PASSWORD}")';
\$xerte_toolkits_site->database_table_prefix  = '$(esc "${XERTE_DB_PREFIX}")';
PHP
chown www-data:www-data "${XERTE_DOCROOT}/database.php" 2>/dev/null || true
log "Wrote ${XERTE_DOCROOT}/database.php"

# ---------------------------------------------------------------------------
# 5. Provision schema + default site settings (idempotent)
# ---------------------------------------------------------------------------
log "Provisioning database (idempotent) ..."
php /usr/local/bin/xerte-init-site.php

# ---------------------------------------------------------------------------
# 6. Runtime permissions
# ---------------------------------------------------------------------------
# USER-FILES / error_logs / import must be writable by the web server. With a
# named volume chown works; with a host bind mount it may not, so fall back to
# making the directory group/world writable so www-data can still write.
for d in USER-FILES error_logs import; do
    mkdir -p "${XERTE_DOCROOT}/${d}"
    if ! su www-data -s /bin/sh -c 'test -w "'"${XERTE_DOCROOT}/${d}"'"' 2>/dev/null; then
        chown -R www-data:www-data "${XERTE_DOCROOT}/${d}" 2>/dev/null \
            || chmod -R a+rwX "${XERTE_DOCROOT}/${d}" 2>/dev/null || true
    fi
done

# ---------------------------------------------------------------------------
# 7. Run Apache (the CMD) in the foreground, with mysqld running alongside.
#    We avoid `exec` so a trap can cleanly shut the database down on
#    `docker stop` (XOT uses MyISAM tables that benefit from a clean shutdown).
#    Apache reaps its own worker processes, so the shell acting as PID 1 is fine.
# ---------------------------------------------------------------------------
cleanup() {
    log "Stopping Apache ... "
    if [ -n "${APACHE_PID:-}" ]; then
        kill -TERM "${APACHE_PID}" 2>/dev/null || true
        wait "${APACHE_PID}" 2>/dev/null || true
    fi
    log "Shutting down MariaDB ..."
    mysql_root -e "SHUTDOWN" 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM

log "Starting Apache: $*"
"$@" &
APACHE_PID=$!
wait "$APACHE_PID"
