<?php

class OAIXMLResponse {

    public $doc; // DOMDocument. Handle of current XML Document object

    function __construct($uri, $verb, $request_args) {

        $this->verb = $verb;
        $this->doc = new DOMDocument("1.0","UTF-8");
        $oai_node = $this->doc->createElement("lom"); //"OAI-PMH");
        $oai_node->setAttribute("xmlns","http://ltsc.ieee.org/xsd/LOM");
        $oai_node->setAttribute("xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance");
        $oai_node->setAttribute("xsi:schemaLocation","http://ltsc.ieee.org/xsd/LOM http://standards.ieee.org/reading/ieee/downloads/LOM/lomv1.0/xsd/lomLoose.xsd");
        $this->addChild($oai_node,"responseDate",gmdate("Y-m-d\TH:i:s\Z"));
        $this->doc->appendChild($oai_node);

        $request = $this->addChild($this->doc->documentElement,"request",$uri);
        $request->setAttribute('verb', $this->verb);
        foreach($request_args as $key => $value) {
            $request->setAttribute($key,$value);
        }

        if (!empty($this->verb)) {
            $this->verbNode = $this->addChild($this->doc->documentElement,$this->verb);
        }
    }

    /**
     * Add a child node to a parent node on a XML Doc: a worker function.
     *
     * @param $mom_node Type: DOMNode. The target node.
     * @param $name     Type: string. The name of child nade is being added
     * @param $value    Type: string. Text for the adding node if it is a text node.
     *
     * @return DOMElement $added_node * The newly created node
     */

    function addChild($mom_node,$name, $value='') {
        $added_node = $this->doc->createElement($name,$value);
        $added_node = $mom_node->appendChild($added_node);
        return $added_node;
    }

    /**
     * Add direct child nodes to verb node (OAI-PMH), e.g. response to ListMetadataFormats.
     * Different verbs can have different required child nodes.
     * \see create_record, create_header
     *
     * \param $nodeName Type: string. The name of appending node.
     * \param $value Type: string. The content of appending node.
     */
    function addToVerbNode($nodeName, $value=null) {
        return $this->addChild($this->verbNode,$nodeName,$value);
    }

    /**
     * Headers are enclosed inside of \<record\> to the query of ListRecords, ListIdentifiers and etc.
     *
     * \param $identifier Type: string. The identifier string for node \<identifier\>.
     * \param $timestamp Type: timestamp. Timestapme in UTC format for node \<datastamp\>.
     * \param $setSpec Type: mix. Can be an array or just a string. Content of \<setSpec\>.
     * \param $add_to_node Type: DOMElement. Default value is null.
     * In normal cases, $add_to_node is the \<record\> node created previously.
     * When it is null, the newly created header node is attatched to $this->verbNode.
     * Otherwise it will be attatched to the desired node defined in $add_to_node.
     */
    function createHeader($identifier, $timestamp, $setSpec, $add_to_node=null) {

        if(is_null($add_to_node)) {
            $header_node = $this->addToVerbNode("header");
        } else {
            $header_node = $this->addChild($add_to_node,"header");
        }

        $this->addChild($header_node, "identifier", $identifier);
        $this->addChild($header_node, "datestamp", $timestamp);

        if (is_array($setSpec)) {
            foreach ($setSpec as $set) {
                $this->addChild($header_node,"setSpec",$set);
            }
        } else {
            $this->addChild($header_node,"setSpec",$setSpec);
        }
        return $header_node;
    }

    /**
     * If there are too many records request could not finished a resumpToken is generated to let harvester know
     *
     * @param $token              Type: string. A random number created somewhere?
     * @param $expirationdatetime Type: string. A string representing time.
     * @param $num_rows           Type: integer. Number of records retrieved.
     * @param $cursor             Type: string. Cursor can be used for database to retrieve next time.
     */
    function createResumptionToken($token, $expirationdatetime, $num_rows, $cursor=null) {
        $resump_node = $this->addChild($this->verbNode,"resumptionToken",$token);
        if(isset($expirationdatetime)) {
            $resump_node->setAttribute("expirationDate",$expirationdatetime);
        }
        $resump_node->setAttribute("completeListSize",$num_rows);
        $resump_node->setAttribute("cursor",$cursor);
    }
}