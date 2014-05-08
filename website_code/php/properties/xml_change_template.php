<?php
/**
 * 
 * xml changetemplate, changes the xml share for this template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";

include "../url_library.php";

include "../user_library.php";

include "properties_library.php";
$prefix = $xerte_toolkits_site->database_table_prefix;
$database_id=database_connect("xml change template database connect success","xml change template database connect success");

if(is_numeric($_POST['template_id'])){

    if(is_user_creator($_POST['template_id'])||is_user_admin()){

        if($_POST['xml_status']=="off"){

            $query = "delete from {$prefix}additional_sharing where template_id= ? AND sharing_type = ?";
            $params = array($_POST['template_id'], "xml");
            db_query($query, $params); 

        }else{

            $query = "select * from {$prefix}additional_sharing where sharing_type= ? AND template_id = ?";
            $params = array("xml", $_POST['template_id']);

            $query_response = db_query($query, $params);

            if(sizeof($query_response)==0){
                $query = "INSERT INTO {$prefix}additional_sharing (template_id, sharing_type, extra) VALUES (?,?,?)";
                $params = array($_POST['template_id'], 'xml');
                if($_POST['address']=="null"){
                    $params[] = '';

                }else{
                    $params[] = $_POST['address'];

                }

                db_query($query, $params); 

            }else{
                $query = "UPDATE {$prefix}additional_sharing SET extra = ? where template_id = ?";
                if($_POST['address']=="null"){
                    $params = array('', $_POST['template_id']);
                    
                }else{
                    $params = array($_POST['address'], $_POST['template_id']);
                }

                db_query($query, $params);

            }

        }		

        //Update the screen

        xml_template_display($xerte_toolkits_site,true);

    }else{

        xml_template_display_fail();

    }

}
