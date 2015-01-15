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
	 * Ajax management, global function to check ajax is available
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */
	 
	 /**
	 * 
	 * Function setup ajax
 	 * This function tries to set up ajax
	 * @return bool - true or false if the ajax has been set up.
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function setup_ajax(){

	try{
	
		xmlHttp=new XMLHttpRequest();
		
	}catch (e){    // Internet Explorer    

		try{
	     	  	
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
      
			}catch (e){      
			
		try{        
					
			xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
					
	   	}catch (e){
				
			alert(AJAX_FAIL);
			return false;
		}      
	   }    
	}
}