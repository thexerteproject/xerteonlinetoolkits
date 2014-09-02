/**
 * Created with JetBrains PhpStorm.
 * User: tom
 * Date: 23-3-13
 * Time: 10:56
 * To change this template use File | Settings | File Templates.
 */


function authdb_ajax_send_prepare(url){

    xmlHttp.open("post","library/Xerte/Authentication/Db/" + url,true);
    xmlHttp.onreadystatechange=authdb_stateChanged;
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

}

/**
 *
 * Function folders properties state changed
 * This function handles all of the responses from the ajax queries
 * @version 1.0
 * @author Patrick Lockley
 */

function authdb_stateChanged(){

    if (xmlHttp.readyState==4){
        document.getElementById('manage_auth_users').innerHTML = xmlHttp.responseText;
    }
}

function changeUserSelection_authDb_user()
{
    if(setup_ajax()!=false){
        var url="seluser.php";

        authdb_ajax_send_prepare(url);

        xmlHttp.send('username=' + encodeURIComponent(document.getElementById('authDb_list_user').value));
    }
}

function delete_authDb_user() {
    if(setup_ajax()!=false){
        var answer = confirm(REMOVE_USER_PROMPT);

        if(answer){
            var url="deluser.php";

            authdb_ajax_send_prepare(url);

            xmlHttp.send('username=' + encodeURIComponent(document.getElementById('authDb_list_user').value));
        }
    }
}

function changepassword_authDb_user() {
    if(setup_ajax()!=false){

        var url="changepassword.php";

        authdb_ajax_send_prepare(url);

        var passwd = document.getElementById('authDb_password').value;
        var encodedpasswd = encodeURIComponent(passwd);
        xmlHttp.send('username=' + encodeURIComponent(document.getElementById('authDb_list_user').value) + '&password=' + encodeURIComponent(document.getElementById('authDb_password').value));

    }
}

function add_authDb_user() {
    if(setup_ajax()!=false){

        var url="adduser.php";

        authdb_ajax_send_prepare(url);

        xmlHttp.send('username=' + encodeURIComponent(document.getElementById('authDb_username').value) +
                     '&firstname=' + encodeURIComponent(document.getElementById('authDb_firstname').value) +
                     '&surname=' + encodeURIComponent(document.getElementById('authDb_surname').value) +
                     '&password=' + encodeURIComponent(document.getElementById('authDb_password').value) +
                     '&email=' + encodeURIComponent(document.getElementById('authDb_email').value));

    }
}

function mod_authDb_user() {
    if(setup_ajax()!=false){

        var url="moduser.php";

        authdb_ajax_send_prepare(url);

        xmlHttp.send('username=' + encodeURIComponent(document.getElementById('authDb_list_user').value) +
            '&usernamefield=' + encodeURIComponent(document.getElementById('authDb_username').value) +
            '&firstname=' + encodeURIComponent(document.getElementById('authDb_firstname').value) +
            '&surname=' + encodeURIComponent(document.getElementById('authDb_surname').value) +
            '&password=' + encodeURIComponent(document.getElementById('authDb_password').value) +
            '&email=' + encodeURIComponent(document.getElementById('authDb_email').value));

    }
}