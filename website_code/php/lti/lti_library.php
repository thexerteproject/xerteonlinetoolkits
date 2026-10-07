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

// check whether the user has a specific role in the LTI Names and Roles answer
// return the index in the roles array if found, -1 if not found
function ltiHasRole($role, $roles)
{
    if (is_array($roles)) {
        // Try to find exact match
        foreach ($roles as $i => $r) {
            if (strcasecmp($r, $role) == 0) {
                return $i;
            }
        }
        // Try to find a substring match
        foreach ($roles as $i => $r) {
            if (stripos($r, $role) !== false) {
                return $i;
            }
        }
    }
    return -1;
}

