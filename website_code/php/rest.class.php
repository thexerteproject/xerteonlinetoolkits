<?php
require_once (__DIR__ . "/../../config.php");
require_once (__DIR__ . "/lib/Httpful/bootstrap.php");
class rest
{
    private $testmode;
    private $url;
    function __construct()
    {
        $this->testmode = false;
        $this->url = "";
    }


    private function _restclient_post($method, $payload, $headers=[], $send='json')
    {

        if ($this->testmode)
        {
            _debug("TESTMODE: skipping post to $method");
            $response = new \stdClass();
            $response->code = 201;
            return $response;
        }

        if (strpos($method, 'http') === false) {
            $url = $this->url . "/";
            $uri = $url . $method;
        }
        else
        {
            $uri = $method;
        }

        _debug("POST: uri=$uri, payload=$payload");

        $request = \Httpful\Request::post($uri);
        if ($send == 'xml')
        {
            $request = $request->sendsXml();
        }
        else if ($send == 'form')
        {
            $request = $request->sendsForm();
        }
        else
        {
            $request = $request->sendsJson();
        }
        if (count($headers) > 0)
        {
            $request = $request->addHeaders($headers);
        }
        $response = $request->body($payload)
            ->send();

        if ($response->code !== 201 || $response->hasErrors()) {
            _debug("ERROR: Something went wrong when trying to post data: (code=" . $response->code . "), " . print_r($response, true));
        }

        return $response;
    }

    private function _restclient_put($method, $payload, $headers=[], $send='json')
    {

        if ($this->testmode)
        {
            _debug("TESTMODE: skipping put to $method");
            $response = new \stdClass();
            $response->code = 201;
            return $response;
        }

        if (strpos($method, 'http') === false) {
            $url = $this->url . "/";
            $uri = $url . $method;
        }
        else
        {
            $uri = $method;
        }

        _debug("PUT: uri=$uri, payload=$payload");

        $request = \Httpful\Request::put($uri);
        if ($send == 'xml')
        {
            $request = $request->sendsXml();
        }
        else if ($send == 'form')
        {
            $request = $request->sendsForm();
        }
        else
        {
            $request = $request->sendsJson();
        }
        if (count($headers) > 0)
        {
            $request = $request->addHeaders($headers);
        }
        $response = $request->body($payload)
            ->send();

        if ($response->code !== 201 || $response->hasErrors()) {
            _debug("ERROR: Something went wrong when trying to put data: (code=" . $response->code . "), " . print_r($response, true));
        }

        return $response;
    }

    private function _restclient_delete($method, $payload, $headers=[], $send='json')
    {
        if ($this->testmode)
        {
            _debug("TESTMODE: skipping delete to $method");
            $response = new \stdClass();
            $response->code = 201;
            return $response;
        }

        if (strpos($method, 'http') === false) {
            $url = $this->url . "/";
            $uri = $url . $method;
        }
        else
        {
            $uri = $method;
        }

        // add payload
        $uri .= $payload;

        _debug("DELETE: uri=$uri");

        $request = \Httpful\Request::delete($uri);

        if (count($headers) > 0)
        {
            $request = $request->addHeaders($headers);
        }
        $response = $request->send();

        if ($response->code !== 201 || $response->hasErrors()) {
            _debug("ERROR: Something went wrong when trying to delete data: (code=" . $response->code . "), " . print_r($response, true));
        }

        return $response;
    }

    private function _restclient_get($method, $headers=[], $asjson=true)
    {
        if (strpos($method, 'http') === false) {
            $url = $this->url . "/";
            $uri = $url . $method;
        } else {
            $uri = $method;
        }

        _debug("GET: uri=$uri");

        $request = \Httpful\Request::get($uri);
        if ($asjson) {
            $request = $request->expectsJson();
        }
        if (count($headers) > 0)
        {
            $request = $request->addHeaders($headers);
        }
        $response = $request->send();

        if ($response->code !== 200 || $response->hasErrors()) {
            _debug("ERROR: Something went wrong when trying to retrieve data: (code=" . $response->code . "), " . print_r($response, true));
        }
        return $response;
    }

    public function get($url, $headers=[], $asjson=true)
    {
        $ret =  $this->_restclient_get($url, $headers, $asjson);
        if ($ret->code != 200) {
            _debug("ERROR: Cannot retrieve information: " . print_r($ret, true));
            die("Access denied");
        }
        return $ret->body;
    }

}