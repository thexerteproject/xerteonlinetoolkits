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
 * Function tutorial created from edlib
 * This function opens the edit window when a new file is created
 * @version 1.0
 * @author Timo Boer
 */

function tutorial_created_from_edlib(response) {
    debugger
    //todo use this to open editor in edlib?
    if (typeof response == 'string') {
        response = String(response);
        response = response.trim();
        if (response != "") {
            data = response.split(",");
            let targetUrl = edit_url + '&template_id=' + data[0];
            $('#selector_space').hide();
            $('#editor_iframe').attr('src', targetUrl);
            $('#editor_space').addClass('shown');
        }
    }
}

/**
 *
 * Function create tutorial from edlib
 * This function creates the blank templates
 * @param string tutorial_id - the template type to create
 * @param
 * @version 1.0
 * @author Timo Boer
 */
function create_template_from_edlib(tutorial_id, template_name) {
    if (setup_ajax() != false) {
        //todo how to handle folders?
        var new_template_folder = "";
        if (is_ok_name($('#template_name_input_field').val())) {
            $.ajax({
                type: "POST",
                url: template_url,
                data: {
                    tutorialid: tutorial_id,
                    templatename: template_name,
                    tutorialname: $('#template_name_input_field').val(),
                    folder_id: new_template_folder,
                    lti: true
                }
            })
                .done(function(response){
                    tutorial_created_from_edlib(response);
                });
        } else {
            alert("nope");
        }
    }
}