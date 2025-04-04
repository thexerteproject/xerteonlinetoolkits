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

require_once('oaiexception.php');
require_once('oaixml.php');
require_once('../config.php');

/**
 * This is an implementation of OAI Data Provider version 2.0.
 * @see http://www.openarchives.org/OAI/2.0/openarchivesprotocol.htm
 */
class OAIServer
{

    public $errors = array();
    private $args = array();
    private $verb = '';
    private $token_prefix = '/tmp/oai_pmh-';
    private $token_valid = 86400;

    function __construct($uri, $args, $identifyResponse, $callbacks)
    {

        $this->uri = $uri;

        if (!isset($args['verb']) || empty($args['verb'])) {
            $this->errors[] = new OAIException('badVerb');
        } else {
            $verbs = array('Identify', 'ListMetadataFormats', 'ListSets', 'ListIdentifiers', 'ListRecords', 'GetRecord');
            if (in_array($args['verb'], $verbs)) {

                $this->verb = $args['verb'];

                unset($args['verb']);

                $this->args = $args;

                $this->identifyResponse = $identifyResponse;

                $this->listMetadataFormatsCallback = $callbacks['ListMetadataFormats'];
                $this->listSetsCallback = $callbacks['ListSets'];
                $this->listRecordsCallback = $callbacks['ListRecords'];
                $this->getRecordCallback = $callbacks['GetRecord'];

                $this->response = new OAIXMLResponse($this->uri, $this->verb, $this->args);

                call_user_func(array($this, $this->verb));

            } else {
                $this->errors[] = new OAIException('badVerb');
            }
        }

    }

    public function response()
    {
        if (empty($this->errors)) {
            return $this->response->doc;
        } else {
            $errorResponse = new OAIXMLResponse($this->uri, $this->verb, $this->args);
            $oai_node = $errorResponse->doc->documentElement;
            foreach ($this->errors as $e) {
                $node = $errorResponse->addChild($oai_node, "error", $e->getMessage());
                $node->setAttribute("code", $e->getOAI2Code());
            }
            return $errorResponse->doc;
        }
    }

    public function Identify()
    {

        if (count($this->args) > 0) {
            foreach ($this->args as $key => $val) {
                $this->errors[] = new OAIException('badArgument');
            }
        } else {
            foreach ($this->identifyResponse as $key => $val) {
                $this->response->addToVerbNode($key, $val);
            }
        }
    }

    public function ListMetadataFormats()
    {

        foreach ($this->args as $argument => $value) {
            if ($argument != 'identifier') {
                $this->errors[] = new OAIException('badArgument');
            }
        }
        if (isset($this->args['identifier'])) {
            $identifier = $this->args['identifier'];
        } else {
            $identifier = '';
        }
        if (empty($this->errors)) {
            try {
                if ($formats = call_user_func($this->listMetadataFormatsCallback, $identifier)) {
                    foreach ($formats as $key => $val) {
                        $cmf = $this->response->addToVerbNode("metadataFormat");
                        $this->response->addChild($cmf, 'metadataPrefix', $key);
                        $this->response->addChild($cmf, 'schema', $val['schema']);
                        $this->response->addChild($cmf, 'metadataNamespace', $val['metadataNamespace']);
                    }
                } else {
                    $this->errors[] = new OAIException('noMetadataFormats');
                }
            } catch (OAIException $e) {
                $this->errors[] = $e;
            }
        }
    }

    public function ListSets()
    {

        if (isset($this->args['resumptionToken'])) {
            if (count($this->args) > 1) {
                $this->errors[] = new OAIException('badArgument');
            } else {
                if ((int)$val + $this->token_valid < time()) {
                    $this->errors[] = new OAIException('badResumptionToken');
                }
            }
            $resumptionToken = $this->args['resumptionToken'];
        } else {
            $resumptionToken = null;
        }
        if (empty($this->errors)) {
            // Remove (and false) for normal function
            if ($sets = call_user_func($this->listSetsCallback, $resumptionToken) and false) {

                foreach ($sets as $set) {

                    $setNode = $this->response->addToVerbNode("set");

                    foreach ($set as $key => $val) {
                        if ($key == 'setDescription') {
                            $desNode = $this->response->addChild($setNode, $key);
                            $des = $this->response->doc->createDocumentFragment();
                            $des->appendXML($val);
                            $desNode->appendChild($des);
                        } else {
                            $this->response->addChild($setNode, $key, $val);
                        }
                    }
                }
            } else {
                $this->errors[] = new OAIException('noSetHierarchy');
            }
        }
    }

    public function GetRecord()
    {

        if (!isset($this->args['metadataPrefix'])) {
            $this->errors[] = new OAIException('badArgument');
        } else {
            $metadataFormats = call_user_func($this->listMetadataFormatsCallback);
            if (!isset($metadataFormats[$this->args['metadataPrefix']])) {
                $this->errors[] = new OAIException('cannotDisseminateFormat');
            }
        }
        if (!isset($this->args['identifier'])) {
            $this->errors[] = new OAIException('badArgument');
        }

        // if (!isnumeric($this->args['identifier'])) {
        //     //$this->errors[] = new OAIException('badArgument');
        // }

        if (empty($this->errors)) {
            try {
                if ($record = call_user_func($this->getRecordCallback, $this->args['identifier'], $this->args['metadataPrefix'])) {

                    $identifier = $record['identifier'];

                    $datestamp = $this->formatDatestamp($record['datestamp']);
                    $modified = $this->formatDatestamp($record['modified']);

                    $set = $record['set'];

                    $status_deleted = (isset($record['deleted']) && ($record['deleted'] == 'true') &&
                        (($this->identifyResponse['deletedRecord'] == 'transient') ||
                            ($this->identifyResponse['deletedRecord'] == 'persistent')));

                    $cur_record = $this->response->addToVerbNode('record');
                    $cur_header = $this->response->createHeader($identifier, $modified, $cur_record);
                    if ($status_deleted) {
                        $cur_header->setAttribute("status", "deleted");
                    } else {
                        $this->add_metadata($this->args['metadataPrefix'],$cur_record, $record);
                    }
                } else {
                    $this->errors[] = new OAIException('idDoesNotExist');
                }
            } catch (OAIException $e) {
                $this->errors[] = $e;
            }
        }
    }

    public function ListIdentifiers()
    {
        $this->ListRecords();
    }

    public function ListRecords()
    {

        $maxItems = 1000;
        $deliveredRecords = 0;
        $metadataPrefix = $this->args['metadataPrefix'];
        $from = isset($this->args['from']) ? $this->args['from'] : '';
        $until = isset($this->args['until']) ? $this->args['until'] : '';
        $set = isset($this->args['set']) ? $this->args['set'] : '';

        if (isset($this->args['resumptionToken'])) {
            if (count($this->args) > 1) {
                $this->errors[] = new OAIException('badArgument');
            } else {
                if ((int)$val + $this->token_valid < time()) {
                    $this->errors[] = new OAIException('badResumptionToken');
                } else {
                    if (!file_exists($this->token_prefix . $this->args['resumptionToken'])) {
                        $this->errors[] = new OAIException('badResumptionToken');
                    } else {
                        if ($readings = $this->readResumptionToken($this->token_prefix . $this->args['resumptionToken'])) {
                            list($deliveredRecords, $metadataPrefix, $from, $until, $set) = $readings;
                        } else {
                            $this->errors[] = new OAIException('badResumptionToken');
                        }
                    }
                }
            }
        } else {
            if (!isset($this->args['metadataPrefix'])) {
                $this->errors[] = new OAIException('badArgument');
            } else {
                $metadataFormats = call_user_func($this->listMetadataFormatsCallback);
                if (!isset($metadataFormats[$this->args['metadataPrefix']])) {
                    $this->errors[] = new OAIException('cannotDisseminateFormat');
                }
            }
            if (isset($this->args['from'])) {
                if (!$this->checkDateFormat($this->args['from'])) {
                    $this->errors[] = new OAIException('badArgument');
                }
            }
            if (isset($this->args['until'])) {
                if (!$this->checkDateFormat($this->args['until'])) {
                    $this->errors[] = new OAIException('badArgument');
                }
            }
        }

        if (empty($this->errors)) {
            try {

                $records_count = call_user_func($this->listRecordsCallback, $metadataPrefix, $from, $until, $set, true);

                $records = call_user_func($this->listRecordsCallback, $metadataPrefix, $from, $until, $set, false, $deliveredRecords, $maxItems);

                foreach ($records as $record) {

                    $identifier = $record['identifier'];
                    $datestamp = $this->formatDatestamp($record['datestamp']);
                    $modified = $this->formatDatestamp($record['modified']);

                    $status_deleted = (isset($record['deleted']) && ($record['deleted'] === true) &&
                        (($this->identifyResponse['deletedRecord'] == 'transient') ||
                            ($this->identifyResponse['deletedRecord'] == 'persistent')));

                    if ($this->verb == 'ListRecords') {
                        $cur_record = $this->response->addToVerbNode('record');
                        $cur_header = $this->response->createHeader($identifier, $modified, $cur_record);
                        if (!$status_deleted) {
                            $this->add_metadata($this->args['metadataPrefix'],$cur_record, $record);
                        }
                    } else { // for ListIdentifiers, only identifiers will be returned.
                        $cur_header = $this->response->createHeader($identifier, $modified);
                    }
                    if ($status_deleted) {
                        $cur_header->setAttribute("status", "deleted");
                    }
                }

                // Will we need a new ResumptionToken?
                if ($records_count - $deliveredRecords > $maxItems) {

                    $deliveredRecords += $maxItems;
                    $restoken = $this->createResumptionToken($deliveredRecords);

                    $expirationDatetime = gmstrftime('%Y-%m-%dT%TZ', time() + $this->token_valid);

                } elseif (isset($args['resumptionToken'])) {
                    // Last delivery, return empty ResumptionToken
                    $restoken = null;
                    $expirationDatetime = null;
                }

                if (isset($restoken)) {
                    $this->response->createResumptionToken($restoken, $expirationDatetime, $records_count, $deliveredRecords);
                }

            } catch (OAIException $e) {
                $this->errors[] = $e;
            }
        }
    }

    private function add_metadata($metadataPrefix,$cur_record, $record)
    {

        $meta_node = $this->response->addChild($cur_record, "metadata");

        $schema_node = $this->response->addChild($meta_node, $record['metadata']['container_name']);
        foreach ($record['metadata']['container_attributes'] as $name => $value) {
            $schema_node->setAttribute($name, $value);
        }
        if($metadataPrefix == "oai_dc"){
            foreach ($record['metadata']['fields'] as $name => $value) {
                $this->response->addChild($schema_node, $name, $value);
            }
        }
        else if($metadataPrefix == "lom_ims") {


            // GENERAL

            $general_node = $this->response->addChild($schema_node, 'general');
            $language = $record['metadata']['general']['language'];
            $title = $record['metadata']['general']['title'];
            $description = $record['metadata']['general']['description'];
            $identifier = $record['identifier'];
            $title_node = $this->response->addChild($general_node, 'title');
            $langstring_node = $this->response->addChild($title_node, 'langstring', $title);
            $langstring_node->setAttribute("xml:lang", $language);
            $catalogentry_node = $this->response->addChild($general_node, 'catalogentry');
            $this->response->addChild($catalogentry_node, 'catalog', "URI");
            $entry_node = $this->response->addChild($catalogentry_node, 'entry');
            $langstring_node = $this->response->addChild($entry_node, 'langstring', $identifier);
            $langstring_node->setAttribute("xml:lang", "x-none");
            $this->response->addChild($general_node, 'language', $language);

            // GENERAL - Description
            if (isset($description) && $description != "")
            {
                $description_node = $this->response->addChild($general_node, 'description');
                $langstring_node = $this->response->addChild($description_node, 'langstring', $description);
                $langstring_node->setAttribute("xml:lang", $language);
            }
            // GENERAL - Keywords
            foreach ($record['metadata']['keywords'] as $value) {
                $keyword_node = $this->response->addChild($general_node, 'keyword');
                $langstring_node = $this->response->addChild($keyword_node, 'langstring', $value);
                $langstring_node->setAttribute("xml:lang", $language);
            }
            // GENERAL - Keywords - Course
            if (isset($record['metadata']['misc']['course']) && $record['metadata']['misc']['course'] != "") {
                $course_name = $record['metadata']['misc']['course'];
                $keyword_node = $this->response->addChild($general_node, 'keyword');
                $langstring_node = $this->response->addChild($keyword_node, 'langstring', ('Course: ' . $course_name));
                $langstring_node->setAttribute("xml:lang", $language);
            }
            // GENERAL - Keywords - Educational code
            if (isset($record['metadata']['misc']['educational_code']) && $record['metadata']['misc']['educational_code'] != "") {
                $educational_code = $record['metadata']['misc']['educational_code'];
                $keyword_node = $this->response->addChild($general_node, 'keyword');
                $langstring_node = $this->response->addChild($keyword_node, 'langstring', ($educational_code));
                $langstring_node->setAttribute("xml:lang", $language);
            }

            // GENERAL - Aggregation level

            $aggregation_level_node = $this->response->addChild($general_node, 'aggregationlevel');
            $source_node = $this->response->addChild($aggregation_level_node, 'source');
            $langstring_node = $this->response->addChild($source_node, 'langstring', "http://purl.edustandaard.nl/vdex_aggregationlevel_czp_20060628.xml");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $value_node = $this->response->addChild($aggregation_level_node, 'value');
            $langstring_node = $this->response->addChild($value_node, 'langstring', "3");
            $langstring_node->setAttribute("xml:lang", "x-none");

            // LIFECYCLE - Author
            $lifecycle_node = $this->response->addChild($schema_node, 'lifecycle');
            $contribute_node = $this->response->addChild($lifecycle_node, 'contribute');
            $role_node = $this->response->addChild($contribute_node, 'role');
            $source_node = $this->response->addChild($role_node, 'source');
            $langstring_node = $this->response->addChild($source_node, 'langstring', "http://purl.edustandaard.nl/vdex_lifecycle_contribute_role_lomv1p0_20060628.xml");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $value_node = $this->response->addChild($role_node, 'value');
            $langstring_node = $this->response->addChild($value_node, 'langstring', "author");
            $langstring_node->setAttribute("xml:lang", "x-none");



            $author_names = explode(',', $record['metadata']['lifecycle']['author']);

            foreach ($author_names as $author_name) {
                $trimmed = trim($author_name);
                $centity_node = $this->response->addChild($contribute_node, 'centity');
                $vcard = "BEGIN:VCARD\nFN:{$trimmed}\nVERSION:3.0\nEND:VCARD";
                $this->response->addChild($centity_node, 'vcard', $vcard);
            }

            // LIFECYCLE - Publisher
            $contribute_node = $this->response->addChild($lifecycle_node, 'contribute');
            $role_node = $this->response->addChild($contribute_node, 'role');
            $source_node = $this->response->addChild($role_node, 'source');
            $langstring_node = $this->response->addChild($source_node, 'langstring', "LOMv1.0");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $value_node = $this->response->addChild($role_node, 'value');
            $langstring_node = $this->response->addChild($value_node, 'langstring', "publisher");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $centity_node = $this->response->addChild($contribute_node, 'centity');

            $publisher_name = $record['metadata']['lifecycle']['publisher'];
            $vcard = "BEGIN:VCARD\nFN:{$publisher_name}\nN:;{$publisher_name}\nORG:{$publisher_name}\nVERSION:3.0 END:VCARD";
            $this->response->addChild($centity_node, 'vcard', $vcard);

            $publish_date = $this->formatDatestamp($record['metadata']['lifecycle']['publishdate']);
            $date_node = $this->response->addChild($contribute_node, 'date');
            $this->response->addChild($date_node, 'datetime', ($publish_date));
            $description_node = $this->response->addChild($date_node, 'description');
            $langstring_node = $this->response->addChild($description_node, 'langstring', "The date the object was published.");
            $langstring_node->setAttribute("xml:lang", $language);

            $contribute_node = $this->response->addChild($lifecycle_node, 'contribute');
            $role_node = $this->response->addChild($contribute_node, 'role');
            $source_node = $this->response->addChild($role_node, 'source');
            $langstring_node = $this->response->addChild($source_node, 'langstring', "LOMv1.0");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $value_node = $this->response->addChild($role_node, 'value');
            $langstring_node = $this->response->addChild($value_node, 'langstring', "technical implementer");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $centity_node = $this->response->addChild($contribute_node, 'centity');
            $vcard = "BEGIN:VCARD VERSION:3.0 FN:Xerte UID:https://www.xerte.org.uk END:VCARD";
            $this->response->addChild($centity_node, 'vcard', $vcard);

            // METAMETADATA - metadataschema
            $metametadata_node = $this->response->addChild($schema_node, 'metametadata');
            $this->response->addChild($metametadata_node, 'metadatascheme', "LOMv1.0");
            $this->response->addChild($metametadata_node, 'metadatascheme', "nl_lom_v1p0");

            // TECHNICAL - location

            $technical_node = $this->response->addChild($schema_node, 'technical');
            $this->response->addChild($technical_node,'format','text/html');
            $location = $record['metadata']['misc']['location'];
            $this->response->addChild($technical_node, 'location', $location);

            // EDUCATIONAL

            $education_node = $this->response->addChild($schema_node, 'educational');
            $intendeduserrole_node = $this->response->addChild($education_node, 'intendedenduserrole');
            $source_node = $this->response->addChild($intendeduserrole_node, 'source');
            $langstring_node = $this->response->addChild($source_node, 'langstring', "http://purl.edustandaard.nl/vdex_intendedenduserrole_lomv1p0_20060628.xml");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $value_node = $this->response->addChild($intendeduserrole_node, 'value');
            $langstring_node = $this->response->addChild($value_node, 'langstring', "learner");
            $langstring_node->setAttribute("xml:lang", "x-none");
         

            //RIGHTS - Cost
            $rights_node = $this->response->addChild($schema_node, 'rights');
            $cost_node = $this->response->addChild($rights_node, 'cost');
            $source_node = $this->response->addChild($cost_node, 'source');
            $langstring_node = $this->response->addChild($source_node, 'langstring', "http://purl.edustandaard.nl/vdex_cost_lomv1p0_20060628.xml");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $value_node = $this->response->addChild($cost_node, 'value');
            $langstring_node = $this->response->addChild($value_node, 'langstring', "no");
            $langstring_node->setAttribute("xml:lang", "x-none");

            //RIGHTS - Copy right and other restrictions
            $copyright_node = $this->response->addChild($rights_node, 'copyrightandotherrestrictions');
            $source_node = $this->response->addChild($copyright_node, 'source');
            $langstring_node = $this->response->addChild($source_node, 'langstring', "http://purl.edustandaard.nl/copyrightsandotherrestrictions_nllom_20131202");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $value_node = $this->response->addChild($copyright_node, 'value');
            _debug("Rights: " . print_r($record['metadata']['rights'], true));
            $download = $record['metadata']['rights']['download'];
            $copyright_description = $record['metadata']['rights']['rights'];
            if ($copyright_description == "") {
                $copy_right_value = "no";
            } else {
                $copy_right_value = $record['metadata']['rights']['rightsId'];
            }

            $langstring_node = $this->response->addChild($value_node, 'langstring', $copy_right_value);
            $langstring_node->setAttribute("xml:lang", "x-none");

            //RIGHTS - Description
            if ($copy_right_value !== "no") {
                $description_node = $this->response->addChild($rights_node, 'description');
                $langstring_node = $this->response->addChild($description_node, 'langstring', $copyright_description);
                $langstring_node->setAttribute("xml:lang", $language);
            }


            //RELATION - Thumbnail

            $relation_node = $this->response->addChild($schema_node, 'relation');
            $kind_node = $this->response->addChild($relation_node, 'kind');
            $source_node = $this->response->addChild($kind_node, 'source');
            $langstring_node = $this->response->addChild($source_node, 'langstring', "http://purl.edustandaard.nl/relation_kind_nllom_20131211");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $value_node = $this->response->addChild($kind_node, 'value');
            $langstring_node = $this->response->addChild($value_node, 'langstring', "thumbnail");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $resource_node = $this->response->addChild($relation_node, 'resource');
            $catalogentry_node = $this->response->addChild($resource_node, 'catalogentry');
            $this->response->addChild($catalogentry_node, 'catalog', 'URI');
            $entry_node = $this->response->addChild($catalogentry_node, 'entry');
            $thumbnail_url = $record['metadata']['relation']['thumbnail'];
            $langstring_node = $this->response->addChild($entry_node, 'langstring', $thumbnail_url);
            $langstring_node->setAttribute("xml:lang", "x-none");

            //RELATION - download package - normal export
            if (isset($record['metadata']['relation']['download_url']) && $record['metadata']['relation']['download_url'] != "") {

                $relation_node = $this->response->addChild($schema_node, 'relation');
                $kind_node = $this->response->addChild($relation_node, 'kind');
                $source_node = $this->response->addChild($kind_node, 'source');
                $langstring_node = $this->response->addChild($source_node, 'langstring', "http://purl.edustandaard.nl/relation_kind_nllom_20131211");
                $langstring_node->setAttribute("xml:lang", "x-none");

                $value_node = $this->response->addChild($kind_node, 'value');
                $langstring_node = $this->response->addChild($value_node, 'langstring', "hasformat");
                $langstring_node->setAttribute("xml:lang", "x-none");

                $resource_node = $this->response->addChild($relation_node, 'resource');
                $description_node = $this->response->addChild($resource_node, 'description');
                $langstring_node = $this->response->addChild($description_node, 'langstring', "application/zip");
                $langstring_node->setAttribute("xml:lang", "x-none");
                $catalogentry_node = $this->response->addChild($resource_node, 'catalogentry');
                $this->response->addChild($catalogentry_node, 'catalog', 'URI');
                $entry_node = $this->response->addChild($catalogentry_node, 'entry');
                // Bleeh eascpe & in url
                $download_url = str_replace("&", "&amp;", $record['metadata']['relation']['download_url']);
                $langstring_node = $this->response->addChild($entry_node, 'langstring', $download_url);
                $langstring_node->setAttribute("xml:lang", "x-none");
            }

            // CLASSIFICATION - domain
            $domain = $record['metadata']['classification']['domain'];
            $domain_id = $record['metadata']['classification']['domain_id'];
            foreach ($domain as $key => $value) {
                $classification_node = $this->response->addChild($schema_node, 'classification');
                $purpose_node = $this->response->addChild($classification_node, 'purpose');
                $source_node = $this->response->addChild($purpose_node, 'source');
                $langstring_node = $this->response->addChild($source_node, 'langstring', "LOMv1.0");
                $langstring_node->setAttribute("xml:lang", "x-none");
                $value_node = $this->response->addChild($purpose_node, 'value');
                $langstring_node = $this->response->addChild($value_node, 'langstring', "discipline");
                $langstring_node->setAttribute("xml:lang", "x-none");

                $taxonpath_node = $this->response->addChild($classification_node, 'taxonpath');
                $source_node = $this->response->addChild($taxonpath_node, 'source');
                $domain_source = $record['metadata']['classification']['domain_source'];
                $langstring_node = $this->response->addChild($source_node, 'langstring', "http://purl.edustandaard.nl/begrippenkader");
                $langstring_node->setAttribute("xml:lang", "x-none");
                $taxon_node = $this->response->addChild($taxonpath_node, 'taxon');
                $this->response->addChild($taxon_node, 'id', $domain_id[$key]);
                $entry_node = $this->response->addChild($taxon_node, 'entry');
                $langstring_node = $this->response->addChild($entry_node, 'langstring', $value);
                $langstring_node->setAttribute("xml:lang", "nl");
            }

            // CLASSIFICATION education - level
            $level_id = $record['metadata']['classification']['levelId'];
            $level = $record['metadata']['classification']['level'];
            foreach ($level as $key => $value) {
                $classification_node = $this->response->addChild($schema_node, 'classification');
                $purpose_node = $this->response->addChild($classification_node, 'purpose');
                $source_node = $this->response->addChild($purpose_node, 'source');
                $langstring_node = $this->response->addChild($source_node, 'langstring', "LOMv1.0");
                $langstring_node->setAttribute("xml:lang", "x-none");
                $value_node = $this->response->addChild($purpose_node, 'value');
                $langstring_node = $this->response->addChild($value_node, 'langstring', "educational level");
                $langstring_node->setAttribute("xml:lang", "x-none");

                $taxonpath_node = $this->response->addChild($classification_node, 'taxonpath');
                $source_node = $this->response->addChild($taxonpath_node, 'source');
                $education_source = "http://purl.edustandaard.nl/begrippenkader";
                $langstring_node = $this->response->addChild($source_node, 'langstring', $education_source);
                $langstring_node->setAttribute("xml:lang", "x-none");
                $taxon_node = $this->response->addChild($taxonpath_node, 'taxon');
                $this->response->addChild($taxon_node, 'id', $level_id[$key]);
                $entry_node = $this->response->addChild($taxon_node, 'entry');
                $langstring_node = $this->response->addChild($entry_node, 'langstring', $value);
                $langstring_node->setAttribute("xml:lang", 'nl');
            }

            // CLASSIFICATION accesrights
            $classification_node = $this->response->addChild($schema_node, 'classification');
            $purpose_node = $this->response->addChild($classification_node, 'purpose');
            $source_node = $this->response->addChild($purpose_node, 'source');
            $langstring_node = $this->response->addChild($source_node, 'langstring', "http://purl.edustandaard.nl/classification_purpose_nllom_20180530");
            $langstring_node->setAttribute("xml:lang", "x-none");
            $value_node = $this->response->addChild($purpose_node, 'value');
            $langstring_node = $this->response->addChild($value_node, 'langstring', "access rights");
            $langstring_node->setAttribute("xml:lang", "x-none");

            $taxonpath_node = $this->response->addChild($classification_node, 'taxonpath');
            $source_node = $this->response->addChild($taxonpath_node, 'source');
            $rights_source = "http://purl.edustandaard.nl/classification_accessrights_nllom_20180530";
            $langstring_node = $this->response->addChild($source_node, 'langstring', $rights_source);
            $langstring_node->setAttribute("xml:lang", "x-none");
            $acces_id = "OpenAccess";

            $taxon_node = $this->response->addChild($taxonpath_node, 'taxon');
            $this->response->addChild($taxon_node, 'id', $acces_id);
            $entry_node = $this->response->addChild($taxon_node, 'entry');
            if($language == 'nl')
                {
                    $entry_value = "Vrij beschikbaar op het publieke Internet.";
                }
            else
            {
                $entry_value = "Freely available on the public Internet.";
            }


            $langstring_node = $this->response->addChild($entry_node, 'langstring', $entry_value);
            $langstring_node->setAttribute("xml:lang", $language);

        }


    }

    private function createResumptionToken($delivered_records)
    {

        list($usec, $sec) = explode(" ", microtime());
        $token = ((int)($usec * 1000) + (int)($sec * 1000));

        $fp = fopen($this->token_prefix . $token, 'w');
        if ($fp == false) {
            exit("Cannot write. Writer permission needs to be changed.");
        }
        fputs($fp, "$delivered_records#");
        fputs($fp, "$metadataPrefix#");
        fputs($fp, "{$this->args['from']}#");
        fputs($fp, "{$this->args['until']}#");
        fputs($fp, "{$this->args['set']}#");
        fclose($fp);
        return $token;
    }

    private function readResumptionToken($resumptionToken)
    {
        $rtVal = false;
        $fp = fopen($resumptionToken, 'r');
        if ($fp != false) {
            $filetext = fgets($fp, 255);
            $textparts = explode('#', $filetext);
            fclose($fp);
            unlink($resumptionToken);
            $rtVal = array_values($textparts);
        }
        return $rtVal;
    }

    /**
     * All datestamps used in this system are localtime even
     * return value from database has no information
     * MAKE SURE date_timezone is correct in php.ini
     */
    private function formatDatestamp($datestamp)
    {
        return gmdate("Y-m-d\TH:i:s\Z", strtotime($datestamp));
    }

    /**
     * The database uses datastamp without time-zone information.
     * It needs to clean all time-zone informaion from time string and reformat it
     */
    private function checkDateFormat($date)
    {
        $date = str_replace(array("T", "Z"), " ", $date);
        $time_val = strtotime($date);
        if (!$time_val) return false;
        if (strstr($date, ":")) {
            return date("Y-m-d H:i:s", $time_val);
        } else {
            return date("Y-m-d", $time_val);
        }
    }
}