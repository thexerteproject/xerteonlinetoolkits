# Dockerfile for Xerte Online Toolkits (XOT) — single, self-contained container.
#
# Bundles Apache + PHP + MariaDB so you can run Xerte locally with a plain
# `docker run` and no external database:
#
#   docker build -t xerte .
#   docker run -d --name xerte -p 8080:80 -v xerte-data:/var/lib/mysql -v xerte-files:/var/www/xerte/USER-FILES xerte
#   open http://localhost:8080/
#
# The first start auto-provisions the database (schema + default site settings),
# so there is no need to walk through the web setup wizard.

# PHP 7.4 is used because XOT's README targets PHP 7.x and parts of the
# codebase (e.g. Snoopy.class.php, editor/upload.php) still rely on functions
# that were removed in PHP 8.0 (each(), get_magic_quotes_gpc()).
FROM php:7.4-apache

# ---- Runtime / build dependencies -------------------------------------------
# mariadb-server ships the database inside the same container.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        mariadb-server \
        mariadb-client \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libzip-dev \
        libxml2-dev \
        libcurl4-openssl-dev \
        libonig-dev \
        unzip \
    && rm -rf /var/lib/apt/lists/*

# ---- PHP extensions required by Xerte --------------------------------------
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        mysqli \
        xml \
        simplexml \
        dom \
        curl \
        mbstring \
        zip \
        gd \
        intl

# ---- Antivirus (ClamAV) + media transcoding (ffmpeg) ---------------------
# ClamAV: XOT scans uploaded files with clamscan when enable_clamav_check is
# on (the entrypoint generates extra_config.php to enable it). We attempt to
# pre-seed the virus database at build time; the entrypoint does a best-effort
# refresh on start (signatures live in /var/lib/clamav).
# ffmpeg: required by cron/transcoder.php at /usr/bin/ffmpeg (libx264 enabled)
# to transcode legacy .flv uploads to .mp4 for HTML5 templates.
# python3: useful runtime; note that XOT's setupytdlp/ web tool needs Python
# 3.10+ which Debian bullseye does not ship, so install yt-dlp separately if you
# need it (see docker/README.md).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        clamav \
        clamav-daemon \
        ffmpeg \
        python3 \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /var/lib/clamav /var/log/clamav \
    && chown -R clamav:clamav /var/lib/clamav /var/log/clamav \
    # Pre-seed the ClamAV signature database (best effort with retries - do
    # not fail the build if the mirror is unreachable; the entrypoint retries
    # on start). --no-dns avoids a DNS lookup that occasionally fails in build
    # sandboxes.
    && for i in 1 2 3; do \
            freshclam --no-dns --datadir=/var/lib/clamav --no-warn \
            && break \
            || echo "[xerte] freshclam attempt $i failed - will retry"; \
           sleep 5; \
       done \
    || echo '[xerte] freshclam failed at build time - will retry at runtime'

# ---- Apache configuration ---------------------------------------------------
RUN a2enmod rewrite headers \
    && echo "ServerName localhost" > /etc/apache2/conf-available/servername.conf \
    && a2enconf servername

COPY docker/apache-xerte.conf /etc/apache2/sites-available/xerte.conf
RUN a2dissite 000-default \
    && a2ensite xerte

# Generous upload limits so importing learning objects / media works out of the box.
RUN { \
        echo 'file_uploads = On'; \
        echo 'upload_max_filesize = 100M'; \
        echo 'post_max_size = 100M'; \
        echo 'memory_limit = 256M'; \
        echo 'max_execution_time = 120'; \
    } > /usr/local/etc/php/conf.d/xerte-uploads.ini

# ---- Application code -------------------------------------------------------
WORKDIR /var/www/xerte
COPY . /var/www/xerte/

# The committed vendor/ directory is shipped with the repo, so composer install
# is normally not required.

# ---- Permissions ------------------------------------------------------------
RUN chown -R www-data:www-data /var/www/xerte \
    && chmod -R g+rwX /var/www/xerte

# The MariaDB data directory is created at build time; a volume mounted over it
# at runtime is initialised by the entrypoint. The mariadb-server postinst
# pre-initialises /var/lib/mysql with a socket-auth root; we delete that data so
# a freshly mounted (empty) volume is initialised cleanly by the entrypoint and
# the app user can connect over TCP with a password.
RUN rm -rf /var/lib/mysql/* /var/lib/mysql/.??* \
    && mkdir -p /var/lib/mysql /run/mysqld \
    && chown -R mysql:mysql /var/lib/mysql /run/mysqld

# ---- Entrypoint / provisioning scripts --------------------------------------
COPY docker/entrypoint.sh     /usr/local/bin/xerte-entrypoint.sh
COPY docker/init_site.php      /usr/local/bin/xerte-init-site.php
RUN chmod +x /usr/local/bin/xerte-entrypoint.sh

# Defaults — override any of these with `docker run -e ...`.
ENV XERTE_DOCROOT=/var/www/xerte \
    XERTE_DB_HOST=127.0.0.1 \
    XERTE_DB_PORT=3306 \
    XERTE_DB_NAME=xerte \
    XERTE_DB_USER=xerte \
    XERTE_DB_PASSWORD=xerte \
    XERTE_DB_ROOT_PASSWORD=root \
    XERTE_DB_PREFIX= \
    XERTE_ADMIN_USERNAME=admin \
    XERTE_ADMIN_PASSWORD=admin \
    XERTE_AUTH_METHOD=Guest \
    XERTE_SITE_URL=http://localhost/ \
    XERTE_ENABLE_CLAMAV=true \
    XERTE_CLAMAV_CMD=/usr/bin/clamscan \
    XERTE_CLAMAV_OPTS=--no-summary \
    XERTE_FRESHCLAM_ON_START=true

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/xerte-entrypoint.sh"]
CMD ["apache2-foreground"]
