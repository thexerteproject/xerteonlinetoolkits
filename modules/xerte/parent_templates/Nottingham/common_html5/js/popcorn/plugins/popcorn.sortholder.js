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

/* _____SORT HOLDER POPCORN PLUGIN_____
Some plugins called are not bespoke but are part of popcorn.js
This plugin is called at the same time of these to add in extra functionality that we need all of the plugins to do
	
required: target start name

*/

(function (Popcorn) {
	Popcorn.plugin("sortholder", function(options) {
		
		// define plugin wide variables / functions here
		var $target;
		
		return {
			_setup: function(options) {
				// setup code, fire on initialisation
				
				$target = $("#" + options.target);
				
				if (!options.child) {
					if (options.fullH) {
						// set up for content to fill available space (excluding heading)
						$target.children(0)
							.addClass("fullH")
							.data("exclude", $target.find("h4"));
					}
					
					if (options.name != "") {
						$target.prepend('<h4>' + options.name + '</h4>');
					}
					
					if (options.line == "true") {
						if (options.position == "top") {
							$target.append('<hr/>');
						} else {
							$target.prepend('<hr/>');
						}
					}
					
					if (options.fullH) {
						// call function to make content fill available space
						eval(parent.x_currentPageXML.nodeName).resizeContent($target.children(".fullH"));
					}
				}
				
				$target.hide();
			},
			
			start: function(event, options) {
				// fire on options.start
				
				$target.show();
			},
			
			end: function(event, options) {
				// fire on options.end
				
				$target.hide();
			}
		};
		
	});
})(Popcorn);