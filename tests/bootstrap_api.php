<?php
// Keep API tests isolated from legacy bootstrap (tests/common.php),
// which pulls full app config and starts sessions.
error_reporting(E_ALL);
ini_set('display_errors', '1');

