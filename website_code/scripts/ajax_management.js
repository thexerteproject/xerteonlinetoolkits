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