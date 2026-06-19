# Running Xerte Online Toolkits in Docker

This directory contains everything needed to run Xerte Online Toolkits (XOT) in
a **single, self-contained Docker container** — Apache + PHP + a MariaDB
database all in one image, so you can get a working Xerte site on your laptop
with a couple of commands and **no** external database server, and **no** walk
through the web setup wizard.

| File | Purpose |
|------|---------|
| `../Dockerfile` | Builds the image (PHP 7.4 + Apache + MariaDB + XOT code). |
| `entrypoint.sh` | Starts MariaDB, auto-provisions the DB/schema/site config, then runs Apache. |
| `init_site.php`  | Idempotent PHP provisioning script (imports `setup/basic.sql`, inserts default site settings). |
| `apache-xerte.conf` | Apache vhost serving XOT from `/var/www/xerte` at the web root. |

---

## Quick start

From the root of this repository:

```bash
docker build -t xerte .

docker run -d --name xerte -p 8080:80 \
  -v xerte-data:/var/lib/mysql \
  -v xerte-files:/var/www/xerte/USER-FILES \
  xerte
```

Then open <http://localhost:8080/>.

The first start takes ~15–25 seconds while MariaDB initialises and the schema
is imported. Watch progress with `docker logs -f xerte`. When you see
`Starting Apache: apache2-foreground` the site is ready.

By default the site uses **Guest** authentication, so anyone visiting can
create and edit content — fine for a local machine, **not** for a public
server (see [Security](#security) below).

### Basic lifecycle

```bash
docker stop xerte        # stop the site (data is kept)
docker start xerte       # start it again
docker restart xerte     # restart
docker logs -f xerte     # follow logs
docker rm -f xerte       # remove the container (volumes/data survive)
```

---

## Where your data lives (and how to keep it)

Xerte stores data in **two** places, and you almost always want both of them
outside the container so they survive `docker rm`:

1. **The MariaDB database** — all site config, users, projects, folders, etc.
   Lives in `/var/lib/mysql` inside the container.
2. **User files** — uploaded media and generated learning-object files for
   every project. Lives in `/var/www/xerte/USER-FILES` inside the container.
   (Xerte also writes to `error_logs/` and `import/`, but those are
   ephemeral/operational.)

There are two ways to mount these: **named volumes** (managed by Docker) and
**bind mounts** (a.k.a. "pass-through" volumes — a host directory you point
at). Both work with this image.

### Option A — Named volumes (recommended, simplest)

Named volumes are Docker-managed. They work identically on Linux, macOS and
Windows, handle file ownership for you, and are the safest default:

```bash
docker volume create xerte-data
docker volume create xerte-files

docker run -d --name xerte -p 8080:80 \
  -v xerte-data:/var/lib/mysql \
  -v xerte-files:/var/www/xerte/USER-FILES \
  xerte
```

Inspect / back up / move a named volume:

```bash
# Where is the data actually stored on the host?
docker volume inspect xerte-data   # look at "Mountpoint"

# Back up the database to a tarball on the host
docker exec xerte sh -c \
  'mariadb-dump --socket=/run/mysqld/mysqld.sock -uroot -proot --all-databases' \
  > xerte-backup-$(date +%F).sql

# Back up the USER-FILES volume to a tarball
docker run --rm -v xerte-files:/src -v "$PWD":/dst alpine \
  tar czf /dst/xerte-userfiles-$(date +%F).tgz -C /src .

# Restore USER-FILES into a fresh volume
docker volume create xerte-files
docker run --rm -v xerte-files:/dst -v "$PWD":/src alpine \
  tar xzf /src/xerte-userfiles-DATE.tgz -C /dst
```

### Option B — Bind mounts ("pass-through" volumes)

A bind mount maps a directory on **your host machine** directly into the
container, so you can see and edit the files with your normal tools:

```bash
mkdir -p ~/xerte/mysql ~/xerte/userfiles

docker run -d --name xerte -p 8080:80 \
  -v ~/xerte/mysql:/var/lib/mysql \
  -v ~/xerte/userfiles:/var/www/xerte/USER-FILES \
  xerte
```

After it starts, you'll see the MariaDB data files and the uploaded learning
object files appear under `~/xerte/` on your host.

**Notes on bind mounts:**

- The entrypoint detects when it cannot change the ownership of the bind-mounted
  data directory (this happens on macOS Docker Desktop, where the directory is
  owned by your host user) and automatically runs MariaDB as a user whose uid
  matches the directory owner. You'll see a log line like
  `MariaDB will run as user: xertedbn (data dir uid=501)`. This is normal.
- On **macOS Docker Desktop**, bind mounts only work for paths that Docker is
  allowed to share (by default your home directory and anything under it).
  `/tmp` and other system paths are **not** shared, so don't bind-mount those.
- You only **need** to bind-mount `USER-FILES` if you want direct host access to
  the files. The database is usually best left on a named volume, but a bind
  mount works too if you want to see the raw InnoDB files.

### Option C — No volumes at all (throwaway / testing)

If you omit the `-v` flags, all data lives inside the container and is
**destroyed** when you `docker rm` it. Useful for a quick test:

```bash
docker run --rm -p 8080:80 xerte   # removed entirely when you stop it
```

---

## Configuration (environment variables)

Override any of these by passing `-e NAME=value` to `docker run`. They are read
once by the entrypoint on each start; the database/user and `database.php` are
(ide)mpotently re-created to match.

| Variable | Default | Meaning |
|---|---|---|
| `XERTE_DB_NAME` | `xerte` | MariaDB database name |
| `XERTE_DB_USER` | `xerte` | MariaDB application user (connects over TCP) |
| `XERTE_DB_PASSWORD` | `xerte` | MariaDB application password |
| `XERTE_DB_ROOT_PASSWORD` | `root` | MariaDB root password (used for provisioning) |
| `XERTE_DB_PREFIX` | *(empty)* | Table prefix (e.g. `xot_`) if you want one |
| `XERTE_AUTH_METHOD` | `Guest` | `Guest`, `Db`, `Ldap`, `Static`, `Moodle`, `Saml2`, or `OAuth2` |
| `XERTE_ADMIN_USERNAME` | `admin` | Management-area admin username |
| `XERTE_ADMIN_PASSWORD` | `admin` | Management-area admin password (stored SHA-256 hashed) |
| `XERTE_SITE_URL` | `http://localhost/` | Stored site URL. The host/port are recomputed at request time from the browser, so this mainly controls the sub-path. |
| `XERTE_ENABLE_CLAMAV` | `true` | Enables ClamAV scanning of uploads (`true`/`false`). The image ships clamscan + a pre-seeded signature database. |
| `XERTE_CLAMAV_CMD` | `/usr/bin/clamscan` | Path to the clamscan binary (must be executable). |
| `XERTE_CLAMAV_OPTS` | `--no-summary` | Extra options passed to clamscan. |
| `XERTE_FRESHCLAM_ON_START` | `true` | Run `freshclam` on container start to refresh signatures (best effort; signatures are also baked into the image). |

Example — a more locked-down local instance using database authentication:

```bash
docker run -d --name xerte -p 8080:80 \
  -v xerte-data:/var/lib/mysql \
  -v xerte-files:/var/www/xerte/USER-FILES \
  -e XERTE_AUTH_METHOD=Db \
  -e XERTE_ADMIN_USERNAME=me \
  -e XERTE_ADMIN_PASSWORD='a-strong-secret' \
  -e XERTE_DB_PASSWORD='another-strong-secret' \
  xerte
```

> Changing `XERTE_DB_*` or `XERTE_ADMIN_*` after the first run will update the
> database/user and the `database.php` file, but will **not** overwrite a
> `sitedetails` row that already exists (provisioning is idempotent and skips
> once the site is configured). To re-apply changed admin credentials or auth
> method to an existing install, edit them in the management area, or wipe the
> database volume and start fresh.

---

## What the entrypoint does (so you can trust it)

On every `docker start` the entrypoint:

1. **Initialises MariaDB data** if the `/var/lib/mysql` volume is empty
   (`mariadb-install-db`), running as the user that owns the data dir so it
   works on both named volumes and host bind mounts.
2. **Starts MariaDB** on `127.0.0.1` (not exposed to the host) and waits for it
   to accept socket connections.
3. **Creates the database + app user** (idempotent) and sets a root password.
4. **Writes `database.php`** in the XOT root from the environment variables —
   this is the file the web setup wizard would normally create by hand.
5. **Imports the schema** from `setup/basic.sql` **only if** the `sitedetails`
   table is missing (so it never wipes an existing install).
6. **Inserts default site settings** into `sitedetails` (and a starter `ldap`
   row) **only if** that table is empty — mirroring the wizard's defaults.
7. **Fixes permissions** on `USER-FILES`, `error_logs` and `import`.
8. **Starts Apache** in the foreground, and on `docker stop` cleanly shuts
   MariaDB down (a trap calls `SHUTDOWN`) so MyISAM tables aren't crash-killed.

Because steps 5 and 6 are guarded by "already exists / already populated"
checks, your users, projects and files are safe across restarts and upgrades.

---

## Antivirus (ClamAV) & media transcoding (ffmpeg)

The image bundles **ClamAV** and **ffmpeg** so two of XOT's optional features
work out of the box.

### ClamAV upload scanning

XOT scans every uploaded file with `clamscan` when `enable_clamav_check` is on.
The image installs `clamav`, pre-seeds the virus database (`/var/lib/clamav/*.cvd`)
at build time, and the entrypoint writes `extra_config.php` to enable scanning
(XOT's `config.php` forces ClamAV **off** unless that file exists). It is on by
default; turn it off with `-e XERTE_ENABLE_CLAMAV=false`.

Signatures are baked into the image, so scanning works with no network at
runtime. The entrypoint also runs `freshclam` once on start (best effort) to
refresh them; disable that with `-e XERTE_FRESHCLAM_ON_START=false`. To persist
fresh signatures across container recreations, mount a volume at
`/var/lib/clamav`.

Quick check that it works (uses the standard EICAR test file):

```bash
docker exec xerte sh -c 'printf "X5O!P%@AP[4\\PZX54(P^)7CC)7}\$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!\$H+H*" > /tmp/eicar.txt'
docker exec xerte clamscan --no-summary /tmp/eicar.txt      # -> Eicar-Test-Signature FOUND, exit 1
docker exec xerte clamscan --no-summary /etc/passwd         # -> OK, exit 0
```

The same check through Xerte's own validator (`Xerte_Validate_VirusScanClamAv`,
the class the upload pipeline uses):

```bash
docker exec xerte php -r '
  require_once("/var/www/xerte/config.php");
  require_once("/var/www/xerte/library/Xerte/Validate/VirusScanClamAv.php");
  Xerte_Validate_VirusScanClamAv::$ClamAV_Cmd=$xerte_toolkits_site->clamav_cmd;
  Xerte_Validate_VirusScanClamAv::$ClamAV_Opts=$xerte_toolkits_site->clamav_opts;
  $v=new Xerte_Validate_VirusScanClamAv();
  var_dump($v->isValid("/tmp/eicar.txt"), $v->getMessages()); // false + VIRUS_FOUND
'
```

> Note: `clamscan` loads the full (~110 MB) signature database on every call,
> so each scan takes a few seconds. For high-volume sites you'd run `clamd`
> instead, but `clamscan` is what XOT's code invokes.

### ffmpeg transcoding

`cron/transcoder.php` transcodes legacy `.flv` uploads to `.mp4` so they play
in HTML5 templates. It requires `/usr/bin/ffmpeg` (with `libx264`), which the
image provides. Run it manually or via cron:

```bash
docker exec xerte php /var/www/xerte/cron/transcoder.php
```

> **Caveat:** `cron/transcoder.php` invokes ffmpeg with the `-sameq` flag,
> which was removed from ffmpeg years ago, so the job will error
> (`Unrecognized option 'sameq'`) on modern ffmpeg builds (including the one
> in this image). This is an upstream XOT bug, not a container issue — to
> actually run transcodes, edit that line in `cron/transcoder.php` (e.g. drop
> `-sameq` and use `-c:v libx264 -preset fast -crf 23`). ffmpeg itself works:
>
> ```bash
> docker exec xerte sh -c '
>   ffmpeg -hide_banner -loglevel error -f lavfi -i testsrc=duration=1:size=120x80:rate=10 -c:v flv1 /tmp/s.flv &&
>   ffmpeg -hide_banner -loglevel error -i /tmp/s.flv -c:v libx264 /tmp/s.mp4 &&
>   file -b /tmp/s.mp4'   # -> ISO Media, MP4 Base Media ...
> ```

### yt-dlp (not included)

XOT's `setupytdlp/` web tool downloads media via yt-dlp, which now requires
**Python 3.10+**. This image is based on Debian bullseye (Python 3.9), so
yt-dlp is **not** installed. If you need it, either run the `setupytdlp/`
installer on a host with Python 3.10+, or rebuild this image on a newer base
(e.g. switch the `FROM` line to `php:8.2-apache` — note XOT's code currently
has PHP 8 incompatibilities, see the Dockerfile comment — and `pip install yt-dlp`).

---

## Logs & debugging

```bash
# Provisioning + Apache + MariaDB startup, all in one stream
docker logs -f xerte

# Apache access / error logs
docker exec xerte tail -f /var/log/apache2/xerte_error.log
docker exec xerte tail -f /var/log/apache2/xerte_access.log

# MariaDB log
docker exec xerte tail -n 100 /var/log/mysqld.log

# Connect to the database from the host (no port is published; use exec)
docker exec -it xerte mariadb --socket=/run/mysqld/mysqld.sock -uroot -proot xerte
```

To turn on Xerte's own debug logging (PHP errors to the browser + a debug log
file), edit `config.php` inside the container and set `$development = true;`:

```bash
docker exec xerte sed -i 's/\$development = false;/\$development = true;/' /var/www/xerte/config.php
docker restart xerte
# then read: docker exec xerte tail -f /var/www/xerte/error_logs/debug.log
```

---

## Security

- The default **`Guest`** authentication lets **anyone** who can reach the site
  create, edit and delete **all** content. That is deliberately convenient for
  a purely local machine but **dangerous on a network**. For anything beyond
  local testing, set `XERTE_AUTH_METHOD=Db` (or `Ldap`/`Saml2`/`OAuth2`) and
  create real users via the management area (`http://localhost:8080/management.php`).
- Only port `80` (HTTP) is published. MariaDB listens on `127.0.0.1` **inside**
  the container and is intentionally not exposed to the host.
- The `/setup` wizard directory is left in the image but is inert once the
  database is provisioned (its pages detect that `database.php` / the
  `sitedetails` row already exist and refuse to re-install). You can delete it
  from a running container if you like:
  `docker exec xerte rm -rf /var/www/xerte/setup`.

---

## Troubleshooting

**`docker logs` shows `ERROR: MariaDB did not start within 60s.`**
Most often a leftover lock from an unclean shutdown. Try
`docker restart xerte`. If it persists, the data dir may be corrupt; back up
what you can and remove the volume to reinitialise:
`docker rm -f xerte && docker volume rm xerte-data && docker volume create xerte-data`
then run again.

**Bind-mounted `USER-FILES` is empty on the host on macOS.**
You probably bind-mounted a path Docker Desktop doesn't share (e.g. `/tmp`).
Use a path under your home directory, e.g. `~/xerte/userfiles`.

**`chown: changing ownership of '/var/lib/mysql': Permission denied`**
This is expected with host bind mounts and is handled automatically — the
entrypoint switches MariaDB to run as the directory's owner. If you see it as
a *fatal* error, you're on an old image; rebuild with `docker build -t xerte .`.

**Port 8080 is already in use.** Pick another host port:
`docker run -p 9090:80 ...` and visit `http://localhost:9090/`.

**I want to start completely fresh.**
```bash
docker rm -f xerte
docker volume rm xerte-data xerte-files   # named volumes
# or: rm -rf ~/xerte                       # bind mounts
# then run the `docker run` command again
```

---

## Rebuilding after updating the XOT code

Because the XOT source is copied into the image at build time, pull/update the
repo and rebuild:

```bash
git pull
docker build -t xerte .
docker rm -f xerte
docker run -d --name xerte -p 8080:80 \
  -v xerte-data:/var/lib/mysql \
  -v xerte-files:/var/www/xerte/USER-FILES \
  xerte
```

Your database and user files (on the volumes) are untouched; only the
application code is refreshed. The schema is not re-imported because the
`sitedetails` table already exists. If a new XOT release ships schema changes,
run the in-app upgrade at `http://localhost:8080/upgrade.php` (or the
management area) as you would for a non-Docker install.
