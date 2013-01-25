	/**	
	 * 
	 * validation, code to sanitise data input
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */


function is_ok_user(name_string){

   var ValidChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'- \r\n";
   var name_is_ok=true;
   var Char;


   for (i = 0; i < name_string.length; i++){
      Char = name_string.charAt(i);
      if (ValidChars.indexOf(Char) == -1){
         name_is_ok = false;
      }
   }

   if(name_string.length==0){

	name_is_ok = false;

   }

   return name_is_ok;

}

	 /**
	 * 
	 * Function is ok name
 	 * This function checks to see if text entered is a valid name
	 * @param string name_string = the proposed name
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function is_ok_name(name_string){

   var ValidChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ";
   var name_is_ok=true;
   var Char;


   for (i = 0; i < name_string.length; i++){
      Char = name_string.charAt(i);
      if (ValidChars.indexOf(Char) == -1){
         name_is_ok = false;
      }
   }

   if(name_string.length==0){

	name_is_ok = false;

   }

   return name_is_ok;

}
	 /**
	 * 
	 * Function is ok notes
 	 * This function checks to see if the notes are ok
	 * @param string name_string - the proposed notes
	 * @version 1.0
	 * @author Patrick Lockley
	 */
	 
function is_ok_notes(name_string){

   var ValidChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,)(-+ ";
   var name_is_ok=true;
   var Char;


   for (i = 0; i < name_string.length; i++){
      Char = name_string.charAt(i);
      if (ValidChars.indexOf(Char) == -1){
         name_is_ok = false;
      }
   }


   return name_is_ok;

}
