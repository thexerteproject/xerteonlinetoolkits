<?php

use PHPUnit\Framework\TestCase;

final class ApiV1Test extends TestCase
{
    private function b64url(string $raw): string
    {
        $b64 = base64_encode($raw);
        $b64 = rtrim($b64, '=');
        return strtr($b64, '+/', '-_');
    }

    /**
     * @param array<string,mixed> $params
     * @param array<string,mixed> $session
     * @return array{httpStatus:int,body:array<string,mixed>,raw:string,wrappedRaw:string}
     */
    private function callApi(string $method, string $route, array $params = array(), array $session = array()): array
    {
        $runner = __DIR__ . '/run_api.php';
        $paramsB64 = $this->b64url((string) json_encode($params));
        $sessionB64 = $this->b64url((string) json_encode($session));
        $cmd = escapeshellarg(PHP_BINARY)
            . ' '
            . escapeshellarg($runner)
            . ' '
            . escapeshellarg($method)
            . ' '
            . escapeshellarg($route)
            . ' '
            . escapeshellarg($paramsB64)
            . ' '
            . escapeshellarg($sessionB64);

        $wrappedRaw = (string) shell_exec($cmd);
        $this->assertNotSame('', $wrappedRaw, 'No output from API runner');

        $wrapper = json_decode($wrappedRaw, true);
        $this->assertIsArray($wrapper, 'Runner did not return JSON');
        $this->assertArrayHasKey('httpStatus', $wrapper);
        $this->assertArrayHasKey('raw', $wrapper);

        $raw = (string) $wrapper['raw'];
        $body = json_decode($raw, true);
        $this->assertIsArray($body, 'API did not return JSON body');

        return array(
            'httpStatus' => (int) $wrapper['httpStatus'],
            'body' => $body,
            'raw' => $raw,
            'wrappedRaw' => $wrappedRaw,
        );
    }

    private function assertApiError(array $res, int $status, string $code): void
    {
        $this->assertSame($status, $res['httpStatus'], 'Unexpected HTTP status. Raw: ' . $res['raw']);
        $this->assertArrayHasKey('ok', $res['body']);
        $this->assertFalse((bool) $res['body']['ok']);
        $this->assertArrayHasKey('error', $res['body']);
        $this->assertSame($code, $res['body']['error']['code'] ?? null, 'Unexpected error code. Raw: ' . $res['raw']);
    }

    public function testSystemHealthOk(): void
    {
        $res = $this->callApi('GET', 'system/health');
        $this->assertSame(200, $res['httpStatus']);
        $this->assertTrue((bool) $res['body']['ok']);
        $this->assertSame('v1', $res['body']['data']['api'] ?? null);
        $this->assertNotEmpty($res['body']['data']['time'] ?? null);
    }

    public function testMissingRouteReturns400(): void
    {
        $res = $this->callApi('GET', '');
        $this->assertApiError($res, 400, 'bad_route');
    }

    public function testUnknownRouteReturns404(): void
    {
        $res = $this->callApi('GET', 'does-not-exist');
        $this->assertApiError($res, 404, 'unknown_route');
    }

    public function testPropertiesRequiresLogin(): void
    {
        $res = $this->callApi('GET', 'properties/project');
        $this->assertApiError($res, 401, 'auth_required');
    }

    public function testWizardRequiresLogin(): void
    {
        $res = $this->callApi('GET', 'wizard/definition');
        $this->assertApiError($res, 401, 'auth_required');
    }

    public function testWorkspacePropertiesRequiresLogin(): void
    {
        $res = $this->callApi('GET', 'workspaceproperties/projects/menu');
        $this->assertApiError($res, 401, 'auth_required');
    }

    public function testManagementRequiresLogin(): void
    {
        $res = $this->callApi('GET', 'management/feeds');
        $this->assertApiError($res, 401, 'auth_required');
    }

    public function testWizardDefinitionMissingTemplateIdWhenLoggedIn(): void
    {
        $session = array(
            'toolkits_logon_id' => 1,
            'toolkits_language' => 'en-GB',
        );
        $res = $this->callApi('GET', 'wizard/definition', array(), $session);
        $this->assertApiError($res, 400, 'missing_template_id');
    }

    public function testPropertiesProjectMissingTemplateIdWhenLoggedIn(): void
    {
        $session = array(
            'toolkits_logon_id' => 1,
            'toolkits_language' => 'en-GB',
        );
        $res = $this->callApi('GET', 'properties/project', array(), $session);
        $this->assertApiError($res, 400, 'missing_template_id');
    }

    public function testWorkspacePropertiesUnknownRouteWhenLoggedIn(): void
    {
        $session = array(
            'toolkits_logon_id' => 1,
            'toolkits_language' => 'en-GB',
        );
        $res = $this->callApi('GET', 'workspaceproperties/does-not-exist', array(), $session);
        $this->assertApiError($res, 404, 'unknown_workspaceproperties_route');
    }
}

