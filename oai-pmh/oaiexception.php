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


class OAIException extends Exception
{

    function __construct($code)
    {

        $this->errorTable = array(
            'badArgument' => array(
                'text' => "The request includes illegal arguments, is missing required arguments, includes a repeated argument, or values for arguments have an illegal syntax.",
            ),
            'badResumptionToken' => array(
                'text' => "The value of the resumptionToken argument is invalid or expired",
            ),
            'badVerb' => array(
                'text' => "Value of the verb argument is not a legal OAI-PMH verb, the verb argument is missing, or the verb argument is repeated.",
            ),
            'cannotDisseminateFormat' => array(
                'text' => "The metadata format identified by the value given for the metadataPrefix argument is not supported by the item or by the repository.",
            ),
            'idDoesNotExist' => array(
                'text' => "The value of the identifier argument is unknown or illegal in this repository.",
            ),
            'noRecordsMatch' => array(
                'text' => 'The combination of the values of the from, until, set and metadataPrefix arguments results in an empty list.',
            ),
            'noMetadataFormats' => array(
                'text' => 'There are no metadata formats available for the specified item.',
            ),
            'noSetHierarchy' => array(
                'text' => 'The repository does not support sets.',
            ),
        );
        parent::__construct($this->errorTable[$code]['text']);
        $this->code = $code;
    }

    public function getOAI2Code()
    {
        return $this->code;
    }
}