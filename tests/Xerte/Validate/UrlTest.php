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

class Xerte_Validate_UrlTest extends PHPUnit_Framework_TestCase {

    protected $validator;

    public function setUp() {
        $this->validator = new Xerte_Validate_Url();
    }

    // Valid URL tests - these should all pass

    public function testValidHttpUrl() {
        $this->assertTrue($this->validator->isValid('http://example.com/feed.xml'));
    }

    public function testValidHttpsUrl() {
        $this->assertTrue($this->validator->isValid('https://example.com/feed.xml'));
    }

    public function testValidUrlWithPort() {
        $this->assertTrue($this->validator->isValid('http://example.com:8080/feed.xml'));
    }

    public function testValidUrlWithQueryString() {
        $this->assertTrue($this->validator->isValid('http://example.com/feed.xml?param=value'));
    }

    // RFC1918 private network tests - these should pass

    public function testPrivateNetwork10() {
        $this->assertTrue($this->validator->isValid('http://10.0.0.50/feed.xml'));
    }

    public function testPrivateNetwork192() {
        $this->assertTrue($this->validator->isValid('http://192.168.1.100/feed.xml'));
    }

    public function testPrivateNetwork172() {
        $this->assertTrue($this->validator->isValid('http://172.16.0.10/feed.xml'));
        $this->assertTrue($this->validator->isValid('http://172.31.255.255/feed.xml'));
    }

    // Invalid scheme tests - these should fail

    public function testFileScheme() {
        $this->assertFalse($this->validator->isValid('file:///etc/passwd'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_INVALID_SCHEME', $messages);
    }

    public function testFtpScheme() {
        $this->assertFalse($this->validator->isValid('ftp://example.com/file'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_INVALID_SCHEME', $messages);
    }

    public function testGopherScheme() {
        $this->assertFalse($this->validator->isValid('gopher://example.com/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_INVALID_SCHEME', $messages);
    }

    public function testJavascriptScheme() {
        $this->assertFalse($this->validator->isValid('javascript:alert(1)'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_INVALID_SCHEME', $messages);
    }

    public function testNoScheme() {
        $this->assertFalse($this->validator->isValid('example.com/feed.xml'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_INVALID_SCHEME', $messages);
    }

    // Dangerous IP address tests - these should fail

    public function testLoopbackIp() {
        $this->assertFalse($this->validator->isValid('http://127.0.0.1/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_BLOCKED_IP', $messages);
    }

    public function testLoopbackRange() {
        $this->assertFalse($this->validator->isValid('http://127.1.2.3/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_BLOCKED_IP', $messages);
    }

    public function testLocalhostHostname() {
        $this->assertFalse($this->validator->isValid('http://localhost/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_LOCALHOST', $messages);
    }

    public function testAwsMetadataIp() {
        $this->assertFalse($this->validator->isValid('http://169.254.169.254/latest/meta-data/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_BLOCKED_IP', $messages);
    }

    public function testLinkLocalRange() {
        $this->assertFalse($this->validator->isValid('http://169.254.1.1/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_BLOCKED_IP', $messages);
    }

    public function testZeroIp() {
        $this->assertFalse($this->validator->isValid('http://0.0.0.0/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_BLOCKED_IP', $messages);
    }

    public function testBroadcastIp() {
        $this->assertFalse($this->validator->isValid('http://255.255.255.255/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_BLOCKED_IP', $messages);
    }

    public function testMulticastIp() {
        $this->assertFalse($this->validator->isValid('http://224.0.0.1/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_BLOCKED_IP', $messages);
    }

    // IPv6 tests

    public function testIpv6Loopback() {
        $this->assertFalse($this->validator->isValid('http://[::1]/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_BLOCKED_IP', $messages);
    }

    public function testIpv6LinkLocal() {
        $this->assertFalse($this->validator->isValid('http://[fe80::1]/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_BLOCKED_IP', $messages);
    }

    public function testIpv6Multicast() {
        $this->assertFalse($this->validator->isValid('http://[ff02::1]/'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_BLOCKED_IP', $messages);
    }

    public function testIpv6UniqueLocal() {
        // fc00::/7 (IPv6 equivalent of RFC1918) - should be allowed
        $this->assertTrue($this->validator->isValid('http://[fc00::1]/feed.xml'));
        $this->assertTrue($this->validator->isValid('http://[fd00::1]/feed.xml'));
    }

    public function testIpv6Public() {
        // Public IPv6 address - should be allowed
        $this->assertTrue($this->validator->isValid('http://[2001:db8::1]/feed.xml'));
    }

    // Malformed URL tests

    public function testEmptyUrl() {
        $this->assertFalse($this->validator->isValid(''));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_EMPTY', $messages);
    }

    public function testMalformedUrl() {
        $this->assertFalse($this->validator->isValid('ht!tp://invalid'));
        $messages = $this->validator->getMessages();
        $this->assertTrue(count($messages) > 0);
    }

    public function testUrlWithoutHost() {
        $this->assertFalse($this->validator->isValid('http:///path'));
        $messages = $this->validator->getMessages();
        $this->assertArrayHasKey('URL_NO_HOST', $messages);
    }

    // Edge cases

    public function testUrlWithCredentials() {
        // URLs with credentials should still validate based on the hostname
        $this->assertTrue($this->validator->isValid('http://user:pass@example.com/feed.xml'));
    }

    public function testUrlWithFragment() {
        $this->assertTrue($this->validator->isValid('http://example.com/feed.xml#section'));
    }

    public function testGetErrors() {
        $this->validator->isValid('http://127.0.0.1/');
        $errors = $this->validator->getErrors();
        $this->assertTrue(count($errors) > 0);
        $this->assertContains('URL_BLOCKED_IP', $errors);
    }
}
