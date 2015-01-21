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
	 * validation, code to sanitise data input
	 *
	 * @author Patrick Lockley
	 * @version 1.0
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
