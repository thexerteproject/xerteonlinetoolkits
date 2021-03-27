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

/* _____TEXT PLUS POPCORN PLUGIN_____
	
required: target start name text clearPanel* pauseMedia*
optional: end position* line

*dealt with in mediaLesson.html

*/

(function (Popcorn) {
	Popcorn.plugin("textplus", function(options) {
		
		// define plugin wide variables / functions here
		var $target;
		
		return {
			_setup: function(options) {
				// setup code, fire on initialisation
				var txt = options.name != "" ? '<h4>' + options.name + '</h4>' + x_addLineBreaks(options.text) : x_addLineBreaks(options.text);
				
				if (options.line == "true") {
					if (options.position == "top") {
						txt = txt + "<hr/>";
					} else {
						txt = "<hr/>" + txt;
					}
				}
				$target = $("#" + options.target).hide();
				if(options.overlayPan == "true"){
					$target.parent().hide();
					$target.hide();
					if(options.optional === "true") {
						var $showHolder  = $('<div id="showHolder" />').appendTo($target);
						var size = options.attrib.hsSize;
						$showHs = $('<div class="Hs x_noLightBox showHotspot"/>').addClass(options.attrib.icon).appendTo($showHolder);
						$showHs.css({
							"padding" : size * 0.1,
							"border-radius" : size / 2 + 1,
							"font-size" : size * 0.8,
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
							
						var $showLbl = $("<div class='showLabel'>" + options.name + "</div>");

						if(options.attrib.tooltip == "label") {
							$showLbl.appendTo($showHolder);
							// Cap the fontsize to reasonable values
							var fs = size * 0.3 <= 8 ? 8 : size * 0.3 > 16 ? 16 : size * 0.3;
							$showLbl.css({
								"padding": 5,
								"padding-left": size * 0.5 + 3,
								"left": size * 0.5,
								"top": size * 0.5,
								"font-size": fs
							})
						}
						else if(options.attrib.tooltip == "tooltip"){
							$showLbl.removeClass("showLabel").addClass("tooltip").appendTo($showHolder).hide();
							$('<div class="tipArrow arrowDown"/>').appendTo($showLbl);
							$showHs.hover(function(){
								$showLbl.css({
									"left": $showLbl.outerWidth()  * -0.5 + size * 0.5,
									"top" : $showLbl.outerHeight() * -1
								}).show();
							}, function() {
								$showLbl.css({
									'box-shadow': 'none',
									'z-index': 1
								}).hide();
							});
						}
						$showHolder
                    	    .click(function () { // Open the textbox.
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
			},
			
			start: function(event, options) {
				// fire on options.start
				if (options.overlayPan) {
					if (options.optional == undefined || options.optional === "false")
					{
						$target.parent().addClass("qWindow");
					}
					else {
						$target.parent().css({
							"padding": 0
						})
					}
					$target.parent().css({
						"max-width": options._w + "%",
						"top": options._y + "%",
						"left": options._x + "%"
					}).show();
				}
				$target.show();
			},
			
			end: function(event, options) {
				// fire on options.end
                if (options.overlayPan) {
					$target.parent().removeClass("qWindow");
					$target.parent().css({
						"top": 0,
						"left": 0,
						"padding": 0
					}).hide();
				}
				$target.hide();
			}
		};
		
	});
})(Popcorn);