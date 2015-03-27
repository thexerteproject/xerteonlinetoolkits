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
Creates a slideshow of images and captions
	
required: target start name pauseMedia* clearPanel*
optional: end position* line overlay

childNodes (synchSlide):
required: start name url pauseMedia*
optional: caption captionPosV captionPosH

*dealt with in mediaLesson.html

*/

(function (Popcorn) {
	Popcorn.plugin("slides", function(options) {
		
		// define plugin wide variables / functions here
		var $target, $slide;
		
		return {
			_setup: function(options) {
				// setup code, fire on initialisation
				
				// is this the slideshow holder? if so, just build holder div - no slides to add to it yet
				if (!options.child) {
					var txt = "";
					
					// is it to appear over media?
					if (options.overlay == "true" && (this.video != undefined || $(this.audio).closest(".mediaHolder").find(".audioImg").length > 0)) {
						$target = $("#" + options.target);
						
						txt += '<div class="slideHolder"></div>';
						
						var $parent;
						if (this.video != undefined) {
							$parent = $(this.media).parent();
						} else {
							$parent = $(this.media).closest(".mediaHolder").find(".audioImgHolder");
						}
						
						// move slidesHolder to overlay media
						$("#" + options.target)
							.appendTo($parent)
							.removeClass("contentBlock")
							.addClass("overlay");
						
						$target = $("#" + options.target);
						
					} else {
						$target = $("#" + options.target);
						
						txt += options.name != "" ? '<h4>' + options.name + '</h4>' : "";
						txt += '<div class="slideHolder"></div>';
						
						if (options.line == "true") {
							if (options.position == "top") {
								txt = txt + "<hr/>";
							} else {
								txt = "<hr/>" + txt;
							}
						}
					}
					
					$target
						.html(txt)
						.hide();
					
				} else {
					$target = $("#" + options.target + " .slideHolder");
					
					var pos = options.captionPosV != undefined ? " v" + options.captionPosV : " vbottom";
					pos += options.captionPosH != undefined ? " h" + options.captionPosH : " hcentre";
					
					var caption = options.caption != "" && options.caption != undefined ? '<div class="caption' + pos + '"><div class="inner">' + options.caption + '</div></div>' : "";
					
					$slide = $('<div class="slide"><img src="' + options.url + '" alt="' + options.name + '" />' + caption + '</div>').appendTo($target);
					
					$slide.find("img")
						.addClass("fullH")
						.data({
							"exclude": $("#" + options.target).find("h4"),
							"max":true
						});
					
					eval(parent.x_currentPageXML.nodeName).resizeContent($slide.find("img"));
					
					$slide.hide();
				}
			},
			
			start: function(event, options) {
				// fire on options.start
				
				if (!options.child) {
					$target.show();
				} else {
					$slide.show();
				}
			},
			
			end: function(event, options) {
				// fire on options.end
				
				if (!options.child) {
					$target.hide();
				} else {
					$slide.hide();
				}
			}
		};
		
	});
})(Popcorn);