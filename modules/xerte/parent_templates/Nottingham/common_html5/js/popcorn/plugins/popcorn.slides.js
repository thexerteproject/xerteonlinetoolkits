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
		var $target, $slide, $slideHolder, $showHs, $showLbl, showHsActive;
		
		return {
			_setup: function(options) {
				// setup code, fire on initialisation
				// is this the slideshow holder? if so, just build holder div - no slides to add to it yet
				if (options.child == "false") {
					var txt = "";
					$target = $("#" + options.target);
					txt += options.name != "" ? '<h4>' + options.name + '</h4>' : "";
					
					// Add divider if necessary
					if (options.line == "true") {
						txt = options.position == "top" ? txt + "<hr/>" : "<hr/>" + txt;
					}

					$slideHolder = $('<div class="slideHolder"></div>').appendTo($target).hide();
					
					// Handle the holder having the appear over the video.
					if(options.overlayPan == "true"){
						$target[0].setAttribute("active", false);
						$target.parent().hide()
						$target.hide();
						// Handle optional slides
						if(options.optional === "true") {
							var $showHolder  = $('<div id="showHolder" />').appendTo($target);
							var size = options.attrib.hsSize;
							$showHs = $('<div class="Hs x_noLightBox showHotspot"/>').addClass(options.attrib.icon).appendTo($showHolder);
							$showHs.css({
								"background-color": options.attrib.colour1,
								"color": options.attrib.colour2,
							}).data({
								size: options.attrib.hsSize,
								colour2: options.attrib.colour1
							}).hover(function(){
								var $this = $(this);
								$this.css({
									'box-shadow': '0px 0px ' + ($this.data('size')/2) + 'px ' + $this.data('colour2'),
									'cursor': 'pointer',
									'z-index': 1000
								});
							},
							function() { // On end hover, remove glow effect
								$(this)
									.css({
										'box-shadow': 'none',
										'z-index': 1
									})
							});

							$showLbl = $("<div class='showLabel panel'>" + options.name + "</div>");

							if(options.attrib.tooltip == "label") {
								$showLbl.appendTo($showHolder);
							}
							else if(options.attrib.tooltip == "tooltip"){
								$showLbl.removeClass("showLabel").addClass("tooltip").appendTo($showHolder).hide();
								$('<div class="tipArrow arrowDown"/>').appendTo($showLbl);
								$showHs.hover(function(){
									$showLbl.show();
								}, function() {
									$showLbl.hide();
								});
							}
							$showHolder.click(function () {
							 	$showHolder.hide();
								$target[0].setAttribute("active", true);
								$target.prepend(txt);
								showHsActive = true;
								var lms = $target[0].getAttribute("lastMissedSlide")
								if (lms != undefined && lms != null) {
									$("#" + lms).parent().show();
									$("#" + lms).show(); 
								}
								$target.parent().addClass("qWindow").addClass("panel");
								$target.parent().css({"padding": 5});
							});
						} else {
							$target.parent().css({"padding": 5});
							$target.prepend(txt);
						}
					}
					else {
						$target.html(txt).hide();
					}

				} else {
					// For the children of the slide holder
					$target = $("#" + options.target + " .slideHolder");
					var pos = options.captionPosV != undefined ? " v" + options.captionPosV : " vbottom";
					pos += options.captionPosH != undefined ? " h" + options.captionPosH : " hcentre";
					
					if (options.caption != "" && options.caption != undefined) {
						var caption = '<div class="caption' + pos + '"><div class="inner">' + options.caption + '</div></div>';
					} else {
						var caption = "";
					}
					
					$slide = $('<div id="slide_' + $target.children().length + '" class="slide"><img src="' + options.url + '" alt="' + options.name + '" />' + caption + '</div>');
					$slide.appendTo($("#" + options.target));
					
					$slide.find("img")
						.addClass("fullH")
						.data({
							"exclude": $("#" + options.target).find("h4"),
							"max":true
						});
					
					eval(x_currentPageXML.nodeName).resizeContent($slide.find("img"));
					$slide.css("max-height", "");
					$slide.hide();
				}
			},
			
			start: function(event, options) {
				// fire on options.start		
				if (options.overlayPan == "true") {
					if (showHsActive == true)
					{
						$target.parent().addClass("panel");
					}
					if (options.optional === "false") {
						showHsActive = true;
						$target.parent().addClass("qWindow").addClass("panel");
					}
					else {
						$target.parent().css({"padding": 0});
						if (options.child == "false") {
							var hh = $(".mainMedia").height();
							var size = options.attrib.hsSize;
							$showHs.css({
								"height"  :       (size * 0.008) * hh + "px",
								"width"   :       (size * 0.008) * hh + "px",
								"padding" :       (size * 0.001) * hh + "px",
								"border-radius" : (size / 2 + 1) * 0.01 * hh + "px",
								"font-size" : 	  (size * 0.007) * hh + "px",
							});
							if(options.attrib.tooltip == "label") {	
								// Cap the fontsize to reasonable values
								var fs = size * 0.4 <= 12 ? 12 : size * 0.4 > 32 ? 32 : size * 0.4;
								$showLbl.css({
									"padding": 5,
									"padding-left": (size * 0.55) * 0.01 * hh + 5,
									"left": (size * 0.005) * hh,
									"top": (size * 0.005) * hh - 2,
									"font-size": fs
								});
							}
							else if(options.attrib.tooltip == "tooltip"){
								$showHs.hover(function(){
									$showLbl.css({
										"left": $showLbl.outerWidth()  * -0.5 + (size * 0.005 * hh),
										"top" : $showLbl.outerHeight() * -1,
										'box-shadow': 'none',
										"overflow" : 'hidden'
									}).show();
								}, function() {
									$showLbl.css({
										'box-shadow': 'none',
										'z-index': 1
									}).hide();
								});
							}
							$target.parent().css({
								"padding": 0
							})
						}
					}
					$target.parent().css({
						"top": options._y + "%",
						"left": options._x + "%",
						"max-width": options._w + "%"
					}).show();
					
					if (options.child == "false") {
						$target.show();
					} else {
						// if the image is on top of the media the initial size might not be right - check and resize if it's not
						if ($slide.closest(".mediaHolder").length != 0 && $slide.closest(".mediaHolder").width() != $slide.width()) {
							if ($slide.closest(".audioImgHolder").find(".audioImg")[0].complete == false) {
								$slide.closest(".audioImgHolder").find(".audioImg").load(function() {
									//eval(x_currentPageXML.nodeName).resizeContent($slide.find("img"));
									resizeImage($slide);
								});
							} else {
								//eval(x_currentPageXML.nodeName).resizeContent($slide.find("img"));
								resizeImage($slide);
							}
						}
						//eval(x_currentPageXML.nodeName).resizeContent($slide.find("img"));
						resizeImage($slide);
						if($target.parent()[0].getAttribute("active") == "true") {
							$slide.show();
							$slide.parent().show();
						}
						else {
							$target.parent()[0].setAttribute("lastMissedSlide", $slide.attr('id'));
						}
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
						$slide.show();
					}
				}

				resizeImage = function(slide){
					var img = slide.find("img")[0];
					var ratio = img.width / img.height;
					var ww = options._w * 0.01 * $(".mainMedia").width();
					var hh = $(".mainMedia").height() - (options._y * 0.01 * $(".mainMedia").height());
					var wh = Math.floor(ww / ratio);
					var hw = Math.floor(hh * ratio);
					img.style.cssText = "max-height: 10000; height: 95%; width: 95%;"

					if (ww < hw) {
						slide.width(ww);
						slide.height(wh);
					}
					else {
						slide.width(hw);
						slide.height(hh);
					}
				}				
			},
			
			end: function(event, options) {
				// fire on options.end
				if (options.overlayPan) {
					$target.parent().removeClass("qWindow").removeClass("panel");
					$target.parent().css({
						"top": 0,
						"left": 0,
						"padding": 0
					}).hide();
				}
				if (!options.child) {
					$target.hide();
				} else {
					if ($slide != undefined)
						$slide.hide();
				}
			}
		};
		
	});
})(Popcorn);