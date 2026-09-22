Xerte Online Toolkits
=====================

Latest release : v3.13 (released on October 31, 2024)

Installation Instructions (Stable release, .zip)
------------------------------------------------


Here's a quick guide to installing toolkits on your local computer:

 1. Download and install XAMPP from http://www.apachefriends.org accepting the default settings;
 2. Download Xerte Online Toolkits from http://xerte.org.uk
 3. Unzip the folder 'xertetoolkits' to c:\xampp\htdocs\, giving you c:\xampp\htdocs\xertetoolkits
 4. Start Apache and MySQL in XAMPP control panel
 5. Visit http://localhost/xertetoolkits/setup
 6. Follow the steps through the setup wizard

Installation Instructions (unstable release, github)
--------------------------------------------------

```
cd /path/to/apache/document/root
git clone https://github.com/thexerteproject/xerteonlinetoolkits.git .
```

Requires :

 1. PHP v7.x with either mysql, xml, curl, mbstring and zip extensions available.
 2. Apache or some other web server that is setup to execute PHP.
 3. Write permission to USER-FILES

Optional additions :

 1. ClamAV - if /usr/bin/clamscan exists, uploads will be checked for viruses. Requires appropriate AV definitions are in place.
 2. XML parsing - if PHP has the 'xml' module installed, then we'll validate the Learning Object's XML before saving on the server.
 3. Transcoding support for video files - see/read cron/transcoding.php - when run it will attempt to convert .flv files to .mp4 files to improve template viewing on Adobe-flash-free devices.


For full installation instructions please see the documentation/ToolkitsInstallationGuide.pdf

Quick start with Docker (single container)
------------------------------------------

The repository ships a self-contained `Dockerfile` that bundles Apache, PHP and
a MariaDB server in a single image, so you can run Xerte locally with a plain
`docker run` and no external database. On first start the database and default
site configuration are provisioned automatically — there is no need to walk
through the web setup wizard.

Build and run:

```
docker build -t xerte .

docker run -d --name xerte -p 8080:80 \
  -v xerte-data:/var/lib/mysql \
  -v xerte-files:/var/www/xerte/USER-FILES \
  xerte
```

Then open <http://localhost:8080/>.

The two named volumes persist your database and uploaded learning-object files
across restarts. To stop it: `docker stop xerte`. To start it again later:
`docker start xerte`. To throw everything away and start fresh:
`docker rm -f xerte && docker volume rm xerte-data xerte-files`.

### Configuration (environment variables)

Override any of these by passing `-e NAME=value` to `docker run`:

| Variable | Default | Notes |
|---|---|---|
| `XERTE_DB_NAME` | `xerte` | MariaDB database name |
| `XERTE_DB_USER` | `xerte` | MariaDB application user |
| `XERTE_DB_PASSWORD` | `xerte` | MariaDB application password |
| `XERTE_DB_ROOT_PASSWORD` | `root` | MariaDB root password |
| `XERTE_DB_PREFIX` | *(empty)* | Table prefix |
| `XERTE_AUTH_METHOD` | `Guest` | `Guest`, `Db`, `Ldap`, `Static`, `Moodle`, `Saml2`, or `OAuth2` |
| `XERTE_ADMIN_USERNAME` | `admin` | Management area admin username |
| `XERTE_ADMIN_PASSWORD` | `admin` | Management area admin password |
| `XERTE_SITE_URL` | `http://localhost/` | Stored site URL (host/port are recomputed at runtime) |
| `XERTE_ENABLE_CLAMAV` | `true` | ClamAV upload scanning (clamscan + signatures ship in the image) |
| `XERTE_FRESHCLAM_ON_START` | `true` | Refresh ClamAV signatures on start (best effort) |

**Security note:** the default `Guest` authentication lets *anyone* visiting
the site create, edit and delete content. That is fine for a purely local
machine, but **do not expose a `Guest`-auth instance to a public network**. Set
`XERTE_AUTH_METHOD=Db` and create users via the management area for anything
beyond local testing.

### Logs / debugging

- Apache logs: `docker exec xerte tail -f /var/log/apache2/xerte_error.log`
- MariaDB logs: `docker exec xerte tail -n 100 /var/log/mysqld.log`
- To enable Xerte's own debug logging, edit `config.php` inside the container
  and set `$development = true;`, then restart.

### Antivirus & transcoding (included)

The image ships **ClamAV** (upload scanning, on by default — tested against the
EICAR test file) and **ffmpeg** with `libx264` (for `cron/transcoder.php`).
Disable ClamAV with `-e XERTE_ENABLE_CLAMAV=false`. See `docker/README.md` for
verification commands and the ffmpeg `-sameq` caveat.

For full details — including **bind-mount ("pass-through") volumes**, backups,
troubleshooting, and what the entrypoint does under the hood — see
[`docker/README.md`](docker/README.md).