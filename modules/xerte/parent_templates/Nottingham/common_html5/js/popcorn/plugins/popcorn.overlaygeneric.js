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

/* _____GENERIC OVERLAY POPCORN UTIL_____
Enables all other plugins to have the same behaviour when placed over another (media) panel.

required: target start name text type button|radio|list answerType single|multiple clearPanel* pauseMedia*
optional: end feedback position* line overlay
language: feedbackLabel singleRight singleWrong multiRight multiWrong checkBtnTxt continueBtnTxt topOption

childNodes (synchMCQOption):
required: text correct
optional: feedback page synch play enable

*dealt with in mediaLesson.html

*/

