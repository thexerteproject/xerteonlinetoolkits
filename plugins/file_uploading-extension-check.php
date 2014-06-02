<?php

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
