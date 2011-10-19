<?PHP    

 class toolkits_session_handler{
	
		var $database_connect;
	
		function toolkits_session_handler(){



		}

		function xerte_session_open(){
		
			global $xerte_toolkits_site;
		
			$this->database_connect = mysql_connect($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password);

			mysql_select_db($xerte_toolkits_site->database_name);

			return TRUE;
		
		}
		
		function xerte_session_close(){
		
			mysql_close();
		
		}
		
		function xerte_session_read($id){

			global $xerte_toolkits_site;

			$response = mysql_query("select data from user_sessions where session_id = '$id'");

			$value = mysql_fetch_object($response);
			
			if(isset($value->data)){

				return $value->data;
				
			}else{
			
				return false;
			
			}
		
		}
		
		function xerte_session_write($id,$data){

			global $xerte_toolkits_site;
		
			$access = time();

			mysql_query("replace into user_sessions values('$id','$access','$data')");
	
		}
		
		function xerte_session_destroy($id){
		
			global $xerte_toolkits_site;
		
			mysql_query("delete from user_sessions where session_id = '$id'");				
		
		}	
		
		function xerte_session_clean($max){
		
			global $xerte_toolkits_site;
		
		  	$old = time() - $max;

			$old = mysql_real_escape_string($old);

			$sql = "delete from user_sessions WHERE  access < '$old'";
			
			mysql_query($sql);	
		
		
		}
	
	}


?>