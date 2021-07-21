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
		var $target, $showHs, $showLbl, showHsActive;
		
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
						$showHolder
                    	    .click(function () { // Open the textbox.
								showHsActive = true;
                        	    $showHolder.hide();
								$target.prepend(txt);
								$target.parent().addClass("qWindow").addClass("panel");
								$target.parent().css({"padding": 5, "overflow-x": "hidden"});
                        	});
					// If not optional
               		} else {
						$target.parent().css({"padding": 5});
						showHsActive = true;
						$target.prepend(txt);
					}
				}
				// Else if not on overlay panel
				else {
					$target.prepend(txt);
				}
			},
			
			start: function(event, options) {
				// fire on options.start
				if (options.overlayPan) {
					if (showHsActive == true)
					{
						$target.parent().addClass("qWindow").addClass("panel");
					}
					if (options.optional == undefined || options.optional === "false")
					{
						$target.parent().addClass("qWindow").addClass("panel");
						$target.parent().css({"width" : options._w + "%", "overflow-x": "hidden"});
					}
					else {
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
					$target.parent().removeClass("qWindow").removeClass("panel");
					$target.parent().css({
						"top": 0,
						"left": 0,
						"padding": 0,
						"overflow-x": '',
						"overflow" : '',
						"max-width": ''
					}).hide();
				}
				$target.hide();
			}
		};
		
	});
})(Popcorn);