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
 * http://www.openarchives.org/OAI/2.0/guidelines-harvester.htm
 * 8. Harvesting all the Metadata from a Repository
 *
 * Proxies, aggregators and other such agents may wish to harvest a complete copy of a repository
 * including set structure and all metadata formats. One strategy for doing this would be:
 *
 * # Issue an Identify request to find the finest datestamp granularity supported.
 * # Issue a ListMetadataFormats request to obtain a list of all metadataPrefixes supported.
 * # Harvest using ListRecords requests for each metadataPrefix supported. Knowledge of the
 *   datestamp granularity allows for less overlap if granularities finer than a day are supported.
 * # Set structure can be inferred from the setSpec elements in the header blocks of each record
 *   returned (consistency checks are possible).
 * # Items may be reconstructed from the constituent records. Local datestamps must be assigned to
 *   harvested items.
 * # Provenance and other information in <about> blocks may be re-assembled at the item level if it
 *   is the same for all metadata formats harvested. However, this information may be supplied
 *   differently for different metadata formats and may thus need to be store separately for each
 *   metadata format.
 */

class OAI2Client
{

    public function __construct($server_base_url)
    {
        $this->server_base_url = $server_base_url;
        require_once('./curl.php');
        $this->curl = new Curl();
    }

    public function Identify()
    {
        return $this->curl->get($this->server_base_url . '?verb=Identify');
    }

    public function ListMetadataFormats($identifier = '')
    {
        $url = $this->server_base_url . '?verb=ListMetadataFormats';
        if (!empty($identifier)) {
            $url .= "&identifier={$identifier}";
        }
        return $this->curl->get($url);
    }

    public function ListSets($resumptionToken = '')
    {
        $url = $this->server_base_url . '?verb=ListSets';
        return $this->curl->get($url);
    }

    public function ListIdentifiers($options = array())
    {

        $options_default = array('from' => null,
            'until' => null,
            'set' => null,
            'resumptionToken' => null,
            'metadataPrefix' => null); // required

        $url = $this->server_base_url . '?verb=ListIdentifiers';

        if (!empty($options['metadataPrefix'])) {
            $url .= "&metadataPrefix={$options['metadataPrefix']}";
        }
        return $this->curl->get($url);
    }

    public function ListRecords($options = array())
    {

        $options_default = array('from' => null,
            'until' => null,
            'set' => null,
            'resumptionToken' => null,
            'metadataPrefix' => null); // required

        $url = $this->server_base_url . '?verb=ListRecords';

        if (!empty($options['metadataPrefix'])) {
            $url .= "&metadataPrefix={$options['metadataPrefix']}";
        }
        return $this->curl->get($url);
    }

    public function GetRecord($identifier, $metadataPrefix)
    {
        $url = $this->server_base_url . '?verb=ListRecords';
        $url .= "&identifier={$identifier}&metadataPrefix={$metadataPrefix}";
        return $this->curl->get($url);
    }
}