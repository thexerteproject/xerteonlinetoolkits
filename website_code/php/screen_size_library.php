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
 * 
 * get_template_screen_size, opens an RLT to get the sizes for the preview window
 *
 * @author Patrick Lockley
 * @version 1.0
 * @return string with the size in separated by a ~
 * @package
 */

function get_template_screen_size($filename, $type){

    global $xerte_toolkits_site;

    $filename = $xerte_toolkits_site->basic_template_path . $type . "/parent_templates/" . $filename . "/" . $filename . ".rlt";

    $data = file_get_contents($filename);

    $place = strpos($data, 'stageSize="')+11;

    if($place==11){

        return "805~635";

    }else{

        $secondplace = strpos($data, '"', $place);

        $temp = substr($data, $place, ($secondplace-$place));

        $temp = split(",",$temp);

        return $temp[0] . "~" . $temp[1];
    }	

}

