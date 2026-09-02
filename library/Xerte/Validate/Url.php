<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * URL validator with SSRF protection
 *
 * Validates URLs to prevent Server-Side Request Forgery attacks while
 * allowing legitimate private network access (RFC1918 ranges).
 */
class Xerte_Validate_Url
{
    protected $messages = array();

    /**
     * Validate a URL for safe HTTP fetching
     *
     * Allows:
     * - http:// and https:// schemes
     * - Public IP addresses
     * - RFC1918 private networks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
     *
     * Blocks:
     * - Non-HTTP schemes (file://, ftp://, gopher://, etc.)
     * - Loopback addresses (127.0.0.0/8, ::1)
     * - Link-local addresses (169.254.0.0/16, fe80::/10)
     * - Broadcast and special addresses (0.0.0.0, 255.255.255.255)
     * - Malformed URLs
     *
     * @param string $url The URL to validate
     * @return bool True if URL is safe to fetch, false otherwise
     */
    public function isValid($url)
    {
        $this->messages = array();

        if (empty($url)) {
            $this->messages['URL_EMPTY'] = "No URL provided";
            return false;
        }

        // Parse the URL
        $parts = parse_url($url);
        if ($parts === false) {
            $this->messages['URL_MALFORMED'] = "Malformed URL";
            return false;
        }

        // Validate scheme
        $scheme = isset($parts['scheme']) ? strtolower($parts['scheme']) : '';
        if (!in_array($scheme, array('http', 'https'), true)) {
            $this->messages['URL_INVALID_SCHEME'] = "URL scheme must be http or https";
            return false;
        }

        // Validate hostname exists
        $host = isset($parts['host']) ? $parts['host'] : '';
        if ($host === '') {
            $this->messages['URL_NO_HOST'] = "URL must have a hostname";
            return false;
        }

        // Check for localhost variations
        if (in_array(strtolower($host), array('localhost', 'localhost.localdomain'), true)) {
            $this->messages['URL_LOCALHOST'] = "Localhost addresses are not allowed";
            return false;
        }

        // Resolve hostname to IP address
        $ip = gethostbyname($host);
        if ($ip === $host) {
            // If gethostbyname returns the hostname unchanged, DNS resolution failed
            // Try treating it as a direct IP address
            if (!filter_var($host, FILTER_VALIDATE_IP)) {
                $this->messages['URL_DNS_FAILED'] = "Unable to resolve hostname";
                return false;
            }
            $ip = $host;
        }

        // Validate the resolved IP address
        if (!$this->isIpAllowed($ip)) {
            return false;
        }

        return true;
    }

    /**
     * Check if an IP address is allowed for fetching
     *
     * @param string $ip The IP address to check
     * @return bool True if IP is allowed, false otherwise
     */
    protected function isIpAllowed($ip)
    {
        // Validate it's a valid IP
        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            $this->messages['URL_INVALID_IP'] = "Invalid IP address";
            return false;
        }

        // Check if it's IPv6
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            return $this->isIpv6Allowed($ip);
        }

        // IPv4 validation
        $parts = explode('.', $ip);
        if (count($parts) !== 4) {
            $this->messages['URL_INVALID_IP'] = "Invalid IPv4 address";
            return false;
        }

        $first = (int)$parts[0];
        $second = (int)$parts[1];

        // Block 0.0.0.0/8 (current network)
        if ($first === 0) {
            $this->messages['URL_BLOCKED_IP'] = "IP address is in a blocked range (0.0.0.0/8)";
            return false;
        }

        // Block 127.0.0.0/8 (loopback)
        if ($first === 127) {
            $this->messages['URL_BLOCKED_IP'] = "Loopback addresses are not allowed";
            return false;
        }

        // Block 169.254.0.0/16 (link-local / AWS metadata)
        if ($first === 169 && $second === 254) {
            $this->messages['URL_BLOCKED_IP'] = "Link-local addresses are not allowed (169.254.0.0/16)";
            return false;
        }

        // Block 224.0.0.0/4 (multicast)
        if ($first >= 224 && $first <= 239) {
            $this->messages['URL_BLOCKED_IP'] = "Multicast addresses are not allowed";
            return false;
        }

        // Block 240.0.0.0/4 (reserved) and 255.255.255.255 (broadcast)
        if ($first >= 240) {
            $this->messages['URL_BLOCKED_IP'] = "Reserved or broadcast addresses are not allowed";
            return false;
        }

        // Allow RFC1918 private networks:
        // 10.0.0.0/8
        if ($first === 10) {
            return true;
        }

        // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
        if ($first === 172 && $second >= 16 && $second <= 31) {
            return true;
        }

        // 192.168.0.0/16
        if ($first === 192 && $second === 168) {
            return true;
        }

        // Allow all other addresses (public IPs)
        return true;
    }

    /**
     * Check if an IPv6 address is allowed for fetching
     *
     * @param string $ip The IPv6 address to check
     * @return bool True if IP is allowed, false otherwise
     */
    protected function isIpv6Allowed($ip)
    {
        // Normalize the IPv6 address for comparison
        $normalized = inet_pton($ip);
        if ($normalized === false) {
            $this->messages['URL_INVALID_IP'] = "Invalid IPv6 address";
            return false;
        }

        // Block ::1 (loopback)
        if ($ip === '::1' || $normalized === inet_pton('::1')) {
            $this->messages['URL_BLOCKED_IP'] = "IPv6 loopback address not allowed";
            return false;
        }

        // Block fe80::/10 (link-local)
        // Check if first byte is 0xfe and second byte starts with 0x8-0xb
        $bytes = unpack('C*', $normalized);
        if ($bytes[1] === 0xfe && ($bytes[2] & 0xc0) === 0x80) {
            $this->messages['URL_BLOCKED_IP'] = "IPv6 link-local addresses not allowed (fe80::/10)";
            return false;
        }

        // Block fc00::/7 (unique local addresses - private)
        // These are the IPv6 equivalent of RFC1918, but less commonly used
        // For maximum compatibility, we allow these since we allow RFC1918
        if ($bytes[1] === 0xfc || $bytes[1] === 0xfd) {
            return true;
        }

        // Block ff00::/8 (multicast)
        if ($bytes[1] === 0xff) {
            $this->messages['URL_BLOCKED_IP'] = "IPv6 multicast addresses not allowed";
            return false;
        }

        // Allow all other IPv6 addresses
        return true;
    }

    /**
     * Get validation error messages
     *
     * @return array Associative array of error code => message
     */
    public function getMessages()
    {
        return $this->messages;
    }

    /**
     * Get validation error codes
     *
     * @return array Array of error codes
     */
    public function getErrors()
    {
        return array_keys($this->messages);
    }
}
