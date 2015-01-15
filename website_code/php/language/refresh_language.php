<?php
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
 * Created by JetBrains PhpStorm.
 * User: tom
 * Date: 22-3-13
 * Time: 23:44
 * To change this template use File | Settings | File Templates.
 */

require_once("../../../config.php");
require_once("../management/management_library.php");
require_once("../user_library.php");
_load_language_file("/website_code/php/language/delete_language.inc");


if(!is_user_admin()){
    management_fail();
}

echo "****";
language_details(true);
?>