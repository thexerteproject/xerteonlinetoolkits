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
class XerteXWDInspector
{
    private $framework;
    private $fname;
    private $xml;
    private $name;
    private $models;
    private $menus;
    private $language;

    /**
     * Checks to see if some XML is valid
     * @param string $string as a string.
     * @return boolean true if the XML appears valid.
     */
    private function isValidXml($string)
    {

        $orig_error_setting = libxml_use_internal_errors(true);
        // See security note elsewhere in this file and http://php.net/manual/en/function.libxml-disable-entity-loader.php
        // Supported from 5.2.11, so allow for older versions to work as well.
        if (function_exists('libxml_disable_entity_loader'))
        {
            $original_el_setting = libxml_disable_entity_loader(false);
        }

        // Suppress anything PHP might moan about.
        $temp = @simplexml_load_string($string);
        $ok = false;
        if (!$temp) {
            $errors = array();
            foreach (libxml_get_errors() as $libXMLError) {
                $errors[] = $libXMLError->file . ' : line ' . $libXMLError->line . ', col:' . $libXMLError->column . ', message:' . $libXMLError->message;
            }
            libxml_clear_errors();
            _debug("Error detected in XML : " . implode(',', $errors));
            $ok = false;
        } else {
            $ok = true;
        }
        if (function_exists('libxml_disable_entity_loader'))
        {
            libxml_disable_entity_loader($original_el_setting);
        }
        libxml_use_internal_errors($orig_error_setting);
        return $ok;
    }

    public function loadTemplateXML($name)
    {
        _debug("Trying to simplexml_load_file : $name");
        $this->fname = $name;

        $this->models = array();

        $orig_error_setting = libxml_use_internal_errors(true);
        if (function_exists('libxml_disable_entity_loader'))
        {
            $original_el_setting = libxml_disable_entity_loader(false);
        }

        if (!file_exists($name)) {
            _debug("Can't load : $name - it's not there!");
            return false;
        }

        $xml = file_get_contents($name);
        if (!$this->isValidXml($xml)) {
            // Try and  fix it ?
            _debug("Could not load the xwd file $name; consult error logs etc.");
            return false;
        }

        $this->xml = simplexml_load_string($xml);

        if (strlen($this->language) == 0)
            $this->language = 'en-GB';
        $name = (string)$this->xml['name'];
        // This may contain HTML tags, convert to plain text
        // Remove the HTML tags
        $name = strip_tags($name);
        // Convert HTML entities to single characters
        $name = html_entity_decode($name, ENT_QUOTES, 'UTF-8');
        $this->name = $name;

        $this->models = array();

        $nodes = $this->xml->xpath('/wizard/learningObject/newNodes');

        $i = 0;
        foreach ($nodes[0] as $node) {
            $model = new stdClass();
            $model->name = $node->getName();

            $modelnode = $this->xml->xpath($model->name);
            if (count($modelnode) == 1)
            {
                $model->menu = (string)$modelnode[0]['menu'];
                $model->displayname = (string)$modelnode[0]['menuItem'];
                $model->hint = (string)$modelnode[0]['hint'];
                $model->thumb = (string)$modelnode[0]['thumb'];
                $model->deprecated = isset($modelnode[0]['deprecated']);
            }

            $this->models[] = $model;
            $i++;
        }
        // Sort the models
        usort($this->models, function($a, $b) {return strcmp($a->displayname, $b->displayname);});

        // Set menus
        $menu_node = $this->xml->xpath("/wizard");
        $menus_str = (string)$menu_node[0]['menus'];
        $menus = explode(",", $menus_str);

        $this->menus = array();
        foreach($menus as $menuitem)
        {
            $menu = new stdClass();
            $menu->name = $menuitem;
            $menu->models = array();
            foreach($this->models as $model)
            {
                if ($menuitem == $model->menu)
                {
                    $menu->models[] = $model;
                }
            }
            $this->menus[] = $menu;
        }
        if (function_exists('libxml_disable_entity_loader'))
        {
            libxml_disable_entity_loader($original_el_setting);
        }
        libxml_use_internal_errors($orig_error_setting);
    }

    public function getModels()
    {
        return $this->models;
    }

    public function getMenus()
    {
        return $this->menus;
    }

    public function getLanguage()
    {
        return $this->language;
    }

    public function getName()
    {
        return $this->name;
    }

}

//$template = new XerteXMLInspector();
//$template->loadTemplateXML('template.xml');
//$models = $template->getUsedModels();
//foreach($models as $model)
//{
//	print($model . "\n");
//}

