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
	 * code to handle settings dropdown menu
	 *
	 * @author Noud Liefrink
	 * @version 1.0
	 * @package
	 */

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function settingsDropdown() {
    document.getElementById("settings").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
$(function() {
    $("body").click(function(e) {
        if (!(e.target.class == "settingsDropdown" || $(e.target).parents(".settingsDropdown").length)) {
            var dropdowns = $(".settings-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    });
})

/**
 * Password change popup and form code:
 */

function changepasswordPopup() {
    if(setup_ajax()!=false){
        var changePassWindow = window.open(site_url + "user_settings.php", "settingswindow", "height=665, width=800");

        changePassWindow.window_reference = self;

        changePassWindow.focus();
    }
}

var xmlHttp = new XMLHttpRequest();

function authdb_ajax_send_prepare(url){

    xmlHttp.open("post","library/Xerte/Authentication/Db/" + url,true);
    xmlHttp.onreadystatechange=authdb_stateChanged;
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

}
function authdb_stateChanged(){

    if (xmlHttp.readyState==4){
        document.getElementById('result').innerHTML = xmlHttp.responseText;
    }
}

function changePassword(username){
    //TODO: first check if old password is correct:
    //this whole option should only be possible on Db

    var url="changepassword.php";

    authdb_ajax_send_prepare(url);

    var passwd1 = $("#newpass").val();
    var passwd2 = $("#newpassrepeat").val();
    if (passwd1 == passwd2) {
        var encodedpasswd = encodeURIComponent(passwd1);
        var message = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(passwd1) + '&personal=' + true;
        xmlHttp.send('username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(passwd1) + '&personal=' + true);
    }else{
        document.getElementById('result').innerHTML = "<p>" + PASS_FAILED + "</p><p><font color = \"red\"><ul><li>" + NOT_SAME_PASS + "</li></ul></font></p>";
    }
}

