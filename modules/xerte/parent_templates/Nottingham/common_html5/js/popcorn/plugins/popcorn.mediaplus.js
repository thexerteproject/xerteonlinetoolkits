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

/* _____MEDIA PLUS POPCORN PLUGIN_____
Adds additional media to a panel
The media can be synced to its own popcorn.js events
	
required: target start name media tip autoplay clearPanel* pauseMedia*
optional: end width height transcript position* line
language: transcriptBtnTxt

*dealt with in mediaLesson.html

*/

(function (Popcorn) {
	Popcorn.plugin("mediaplus", function(options) {
		
		// define plugin wide variables / functions here
		var $target, mediaType;
		
		return {
			_setup: function(options) {
				// setup code, fire on initialisation
				
				$target = $("#" + options.target);
				
				// get type of media (video/audio)
				if (options.media.indexOf(".mp3") != -1) {
					mediaType = "audio";
				} else if (options.media.indexOf(".") != -1) {
					mediaType = "video";
				}
				
				if (mediaType) {
					if (options.name != "") {
						$target.append('<h4>' + options.name + '</h4>');
					}
					
					// load media and then sort & set up popcorn synch points
					var parentPageType = eval(parent.x_currentPageXML.nodeName);
					
					parentPageType.loadMedia($target, mediaType, options);
					
					if (options.childNodes != undefined) {
						parentPageType.sortPopcorn(options.childNodes, options.target, true, "#" + options.target + " .popcornMedia " + mediaType);
					}
					
					if (options.line == "true") {
						if (options.position == "top") {
							$target.append("<hr/>");
						} else {
							$target.prepend("<hr/>");
						}
					}
					
					$target.hide();
					
				} else {
					// no media set
					$target.remove();
				}
			},
			
			start: function(event, options) {
				// fire on options.start
				
				if (mediaType) {
					$target.show();
				}
			},
			
			end: function(event, options) {
				// fire on options.end
				
				if (mediaType) {
					$target.hide();
				}
			}
		};
		
	});
})(Popcorn);