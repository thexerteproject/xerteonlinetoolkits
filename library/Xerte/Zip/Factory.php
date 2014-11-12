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
 * Creates ZipFileobjects which abide to Xerte_Zip_Interface.
 *
 * @see zip_file
 * @see Xerte_Zip_Interface
 * @see export.php
 */
class Xerte_Zip_Factory {

    public static function factory($tempfilename, $options) {
        if (extension_loaded('zip')) {
            return new Xerte_Zip_Native($tempfilename, $options);
        } else {
            // Use the legacy Zip thing - note it may hit memory limit(s). :-(
            $zip = new zip_file($tempfilename);
            $zip->set_options($options);
            return $zip;
        }
    }
}
