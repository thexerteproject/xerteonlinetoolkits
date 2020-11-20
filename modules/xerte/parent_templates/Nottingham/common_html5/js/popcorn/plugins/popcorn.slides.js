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
		var $target, $slide, $slideHolder;
		
		return {
			_setup: function(options) {
				// setup code, fire on initialisation
				// is this the slideshow holder? if so, just build holder div - no slides to add to it yet
				if (options.child == "false") {
					var txt = "";
					
					// is it to appear over media?
					// if (options.overlay == "true" && (this.video != undefined || $(this.audio).closest(".mediaHolder").find(".audioImg").length > 0)) {
					// 	$target = $("#" + options.target);
						
					// 	txt += '<div class="slideHolder"></div>';
						
					// 	var $parent;
					// 	if (this.video != undefined) {
					// 		$parent = $(this.media).parent();
					// 	} else {
					// 		$parent = $(this.media).closest(".mediaHolder").find(".audioImgHolder");
					// 	}
						
					// 	// move slidesHolder to overlay media
					// 	$("#" + options.target)
					// 		.appendTo($parent)
					// 		.removeClass("contentBlock")
					// 		.addClass("overlay");
						
					// 	$target = $("#" + options.target);
						
					// } else {
					$target = $("#" + options.target);
						
					txt += options.name != "" ? '<h4>' + options.name + '</h4>' : "";
					//txt += '<div class="slideHolder"></div>';
					
					if (options.line == "true") {
						if (options.position == "top") {
							txt = txt + "<hr/>";
						} else {
							txt = "<hr/>" + txt;
						}
					}

					$slideHolder = $('<div class="slideHolder"></div>').appendTo($target).hide();
					if(options.overlayPan == "true"){
						$target.parent().hide()
						$target.hide();
						if(options.optional === "true") {
							var $openPng = x_templateLocation + "common_html5/plus.png";
							var $showHolder  = $('<div id="showHolder" />').appendTo($target);
							$showBtn = $('<image class="showButton x_noLightBox" type="image" src="' + $openPng + '" >').appendTo($showHolder);
							$showLbl = $("<div class='showLabel'>" + options.name + "</div>").appendTo($showHolder);
							$showHolder.click(function () {
							 			$showHolder.hide();
										$target.prepend(txt);
										$target.parent().addClass("qWindow");
										$target.parent().css({"padding": 5});
							});
						} else {
							$target.parent().css({"padding": 5});
							$target.prepend(txt);
						}
					}
					else{
						$target.html(txt).hide();
					}

				} else {
					$target = $("#" + options.target + " .slideHolder");
					var pos = options.captionPosV != undefined ? " v" + options.captionPosV : " vbottom";
					pos += options.captionPosH != undefined ? " h" + options.captionPosH : " hcentre";
					
					var caption = options.caption != "" && options.caption != undefined ? '<div class="caption' + pos + '"><div class="inner">' + options.caption + '</div></div>' : "";
					
					$slide = $('<div class="slide"><img src="' + options.url + '" alt="' + options.name + '" />' + caption + '</div>');
					$slide.appendTo($target);
					
					$slide.find("img")
						.addClass("fullH")
						.data({
							"exclude": $("#" + options.target).find("h4"),
							"max":true
						});
					
					eval(x_currentPageXML.nodeName).resizeContent($slide.find("img"));
					
					$slide.hide();
				}
			},
			
			start: function(event, options) {
				console.log(options)
				// fire on options.start		
				if (options.overlayPan) {
					if (options.optional === "false")
					{
						$target.parent().addClass("qWindow");
					}
					else {
						$target.parent().css({"padding": 0});
					}
					var point = JSON.parse(options.points)[0];
					$target.parent().css({
						"top": point.y + "%",
						"left": point.x + "%"
					}).show();
					
					if (options.child == "false") {
						$target.show();
					} else {
						// if the image is on top of the media the initial size might not be right - check and resize if it's not
						if ($slide.closest(".mediaHolder").length != 0 && $slide.closest(".mediaHolder").width() != $slide.width()) {
							if ($slide.closest(".audioImgHolder").find(".audioImg")[0].complete == false) {
								$slide.closest(".audioImgHolder").find(".audioImg").load(function() {
									eval(x_currentPageXML.nodeName).resizeContent($slide.find("img"));
								});
							} else {
								eval(x_currentPageXML.nodeName).resizeContent($slide.find("img"));
							}
						}
						eval(x_currentPageXML.nodeName).resizeContent($slide.find("img"));
						$slide.show();
						$slide.parent().show();
					}
				} else {
					if (options.child == "false") {
						$target.show();
					} else {
						// if the image is on top of the media the initial size might not be right - check and resize if it's not
						if ($slide.closest(".mediaHolder").length != 0 && $slide.closest(".mediaHolder").width() != $slide.width()) {
							if ($slide.closest(".audioImgHolder").find(".audioImg")[0].complete == false) {
								$slide.closest(".audioImgHolder").find(".audioImg").load(function() {
									eval(x_currentPageXML.nodeName).resizeContent($slide.find("img"));
								});
							} else {
								eval(x_currentPageXML.nodeName).resizeContent($slide.find("img"));
							}
						}
					}
				}
			},
			
			end: function(event, options) {
				// fire on options.end
				if (!options.child) {
					if (options.overlayPan) {
						$target.parent().removeClass("qWindow");
						$target.parent().css({
							"top": 0,
							"left": 0,
							"padding": 0
						}).hide();
					}
					$target.hide();
				} else {
					$slide.hide();
				}
			}
		};
		
	});
})(Popcorn);