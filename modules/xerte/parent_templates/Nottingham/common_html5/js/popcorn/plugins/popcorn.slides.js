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

/* _____SLIDES POPCORN PLUGIN_____
	


*dealt with in mediaLesson.html

*/

(function (Popcorn) {
	Popcorn.plugin("slides", function(options) {
		
		// define plugin wide variables / functions here
		var $target;
		
		return {
			_setup: function(options) {
				// setup code, fire on initialisation
				
				/*
				var txt = options.name != "" ? '<h4>' + options.name + '</h4>' + x_addLineBreaks(options.text) : x_addLineBreaks(options.text);
				
				if (options.line == "true") {
					if (options.position == "top") {
						txt = txt + "<hr/>";
					} else {
						txt = "<hr/>" + txt;
					}
				}
				
				$target = $("#" + options.target)
					.html(txt)
					.hide();
				*/
			},
			
			start: function(event, options) {
				// fire on options.start
				
				//$target.show();
			},
			
			end: function(event, options) {
				// fire on options.end
				
				//$target.hide();
			}
		};
		
	});
})(Popcorn);