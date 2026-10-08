<?php

class ApiRouter
{
    public static function getPath(): string
    {
        if (!empty($_GET['route'])) {
            return trim((string) $_GET['route'], '/');
        }
        if (!empty($_SERVER['PATH_INFO'])) {
            return trim((string) $_SERVER['PATH_INFO'], '/');
        }
        return '';
    }

    public static function getMethod(): string
    {
        return isset($_SERVER['REQUEST_METHOD']) ? strtoupper((string) $_SERVER['REQUEST_METHOD']) : 'GET';
    }
}
