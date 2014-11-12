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
 * @see modules/site/engine/upload.php
 */
function filter_by_extension_name() {

    Xerte_Validate_FileExtension::$BLACKLIST = 'php,php5,pl,cgi,exe,vbs,pif,application,gadget,msi,msp,com,scr,hta,htaccess,ini,cpl,msc,jar,bat,cmd,vb,vbe,jsp,jse,ws,wsf,wsc,wsh,ps1,ps1xml,ps2,ps2xml,psc1,psc2,msh,msh1,msh2,mshxml,msh1xml,msh2xml,scf,lnk,inf,reg,docm,dotm,xlsm,xltm,xlam,pptm,potm,ppam,ppsm,sldm';

    $args = func_get_args();
    $files = $args[0];
    
    if(!Xerte_Validate_FileExtension::canRun()) {
        return $files;
    }


    foreach($files as $file) {
        $validator = new Xerte_Validate_FileExtension();
        if(!$validator->isValid($file['name'])) {
            _debug("Invalid file {$file['name']} type uploaded - matches blacklist");
            return false;
        }
    } 

    return $files;
}

add_filter('editor_upload_file', 'filter_by_extension_name');
