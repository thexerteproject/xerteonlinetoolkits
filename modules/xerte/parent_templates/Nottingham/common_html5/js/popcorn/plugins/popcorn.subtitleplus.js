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

/* _____SUBTITLE PLUS POPCORN PLUGIN_____
Adds subtitles to media
	
required: target start text position pauseMedia*
optional: end

childNodes (synchSub):
required: start position pauseMedia*
optional: end

*dealt with in mediaLesson.html

*/

(function (Popcorn) {
	Popcorn.plugin("subtitleplus", function(options) {
		
		// define plugin wide variables / functions here
		var $target, $txt, position;
		
		return {
			_setup: function(options) {
				// setup code, fire on initialisation
				
				// subtitles should only show if media is video or if there's an image above the audio bar for them to appear on
				if (this.video != undefined || $(this.audio).closest(".mediaHolder").find(".audioImg").length > 0) {
					var $parent;
					if (this.video != undefined) {
						$parent = $(this.media).parent();
					} else {
						$parent = $(this.media).closest(".mediaHolder").find(".audioImgHolder");
					}
					
					if ($parent.hasClass("youTube")) {
						position = "top";
					} else {
						position = options.position;
					}
					
					// is this the subtitle holder? if so, just build holder div - no subtitle to add to it yet
					if (!options.child) {
						
						// have any subtitles already been built here? if not, build holder
						if ($parent.children(".subtitleHolder").length == 0) {
							$target = $("#" + options.target).appendTo($parent);
							$target
								.removeClass("contentBlock")
								.addClass("subtitleHolder")
								.show();
						} else {
							$("#" + options.target).remove();
						}
						
					} else {
						$target = $parent.children(".subtitleHolder");
						$txt = $('<div class="sub">' + x_addLineBreaks(options.name) + '</div>').appendTo($target);
						$txt.hide();
					}
					
				}
			},
			
			start: function(event, options) {
				// fire on options.start
				
				if ($txt != undefined) {
					$target
						.removeClass("bottomSub topSub")
						.addClass(position + "Sub");
					
					$txt.show();
				}
			},
			
			end: function(event, options) {
				// fire on options.end
				
				if ($txt != undefined) {
					$target.removeClass("bottomSub topSub");
					$txt.hide();
				}
			}
		};
		
	});
})(Popcorn);