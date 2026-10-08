# Common self-hosted libraries

This folder centralises third-party libraries that were previously served from CDNs.

## Libraries

- **Font Awesome 6.6.0**
  - CSS/JS under `fontawesome-6.6.0/`
  - Used by the main UI, editors and players.

- **jQuery 1.9.1**
  - `js/jquery-1.9.1.min.js`
  - Now used instead of `//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js` in:
    - `properties.php`
    - `user_settings.php`
    - `publishproperties.php`
    - `folderproperties.php`
    - `workspaceproperties.php`
    - `tools/dashboard/index.php`
    - `editor/elfinder/browse.php`
    - CKEditor oEmbed plugin (fallback loader)

- **PeerTube embed API**
  - `js/peertube/player.min.js`
  - Local copy of `@peertube/embed-api` used by:
    - Nottingham and Site popcorn bundles for PeerTube support
    - Xerte export offline includes (`common/js/peertube/player.min.js`)

- **Plotly**
  - `website_code/scripts/plotly-latest.min.js` (existing local copy, not in this folder)
  - Used by `management.php` and `tools/dashboard/index.php` instead of `https://cdn.plot.ly/plotly-latest.min.js`.

- **MathJax**
  - Served from `offline/js/mathjax/` (existing offline bundle).
  - All `%MATHJAXPATH%` replacements now point to `offline/js/mathjax/` instead of external CDNs.

## Notes on remaining external services

- **AddThis**, **YouTube/Vimeo/SoundCloud APIs**, **Google Fonts**, map providers (Google, Yahoo, Bing, OpenLayers), KnightLab timeline, and various demo/test pages still use remote URLs because they are service-style integrations rather than pure static libraries.
- These are either:
  - Optional features (social sharing, dashboards, demos), or
  - Tight integrations with third-party platforms that cannot be trivially self-hosted.

For fully offline or firewall-restricted deployments, disable or avoid those features, or replace them with organisation-approved alternatives.

