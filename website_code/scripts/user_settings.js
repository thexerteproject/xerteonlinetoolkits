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
    var left = window.screenLeft;
    var top = window.screenTop;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var leftPopup = left + (width - 400) / 2;
    var topPopup = top + (height - 350) / 2;
    var changePassWindow = window.open(site_url + "user_settings.php", "settingswindow", "left=" + leftPopup + ", top=" + topPopup + ", height=350, width=300");

    changePassWindow.window_reference = self;

    changePassWindow.focus();
}

function ajax_send(url, mesg, success){

    $.ajax({
        type: "POST",
        url: "library/Xerte/Authentication/Db/" + url,
        data: mesg,
        success: success
    })

}

function changePassword(username){
    var oldpass = $("#oldpass").val();
    var passwd1 = $("#newpass").val();
    var passwd2 = $("#newpassrepeat").val();
    if (passwd1 == passwd2) {

        var url = "changepassword.php";
        var mesg = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(passwd1) + '&oldpass=' + encodeURIComponent(oldpass);

        ajax_send("changepassword.php", mesg, function(response) {$("#result").html(response)})

    }else{
        $('#result').html("<p>" + PASS_FAILED + "</p><p><font color = \"red\"><ul><li>" + NOT_SAME_PASS + "</li></ul></font></p>");
    }

    $("#passform").find("input[type=password], textarea").val('');
}

