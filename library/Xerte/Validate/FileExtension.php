<?php

class Xerte_Validate_FileExtension
{

    protected $messages = array();

    public static $BLACKLIST = 'php,php5,pl,cgi,exe,vbs,pif,application,gadget,msi,msp,com,scr,hta,htaccess,ini,cpl,msc,jar,bat,cmd,vb,vbe,jsp,jse,ws,wsf,wsc,wsh,ps1,ps1xml,ps2,ps2xml,psc1,psc2,msh,msh1,msh2,mshxml,msh1xml,msh2xml,scf,lnk,inf,reg,docm,dotm,xlsm,xltm,xlam,pptm,potm,ppam,ppsm,sldm';



    public static function canRun()
    {
        return function_exists('pathinfo');
    }


    public function isValid($filename)
    {
        $this->messages = array();

        $blacklist = explode(',', strtolower(self::$BLACKLIST));
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        _debug($blacklist);
        _debug($extension);

        if (empty($extension)) {
            _debug("File extension not found for '$filename'.");
            $this->messages['NO_EXTENSION'] = "File extension not found.";
            return false;
        }

        if (in_array($extension, $blacklist)) {
            _debug("Invalid file type uploaded - '$extension' matches entry in blacklist");
            $this->messages["INVALID_EXTENSION"] = "Invalid file format - $extension is blacklisted";
            return false;
        }
        return  true;
    }


    public function getMessages()
    {
        return $this->messages;
    }


    public function getErrors()
    {
        return array_keys($this->messages);
    }
}

