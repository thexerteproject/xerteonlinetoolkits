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
 * functions required in an object which zips stuff up.
 * These seem to be the ones used by export.php....
 */
interface Xerte_Zip_Interface {
    
    /* array or single string file */
    public function add_files($file_or_list);
    public function set_options(array $array);
    
    /* signal we've added everything and we're ready to package it all up */
    public function create_archive();

    /**
     * write stuff out to the browser; provide $downloadName
     * as the attachment file name that appears to the user 
     * @param string $downloadName
     */
    public function download_file($downloadName);
}
