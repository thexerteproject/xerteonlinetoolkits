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

/* _____XOT POPCORN PLUGIN_____
Adds iframe containing XOT project

required: target start name url clearPanel* pauseMedia*
optional: end description page hide position* line

childNodes (synchXotChange):
required: page start
optional: pauseMedia*

*dealt with in mediaLesson.html

*/

(function (Popcorn) {
	Popcorn.plugin("xot", function(options) {
		
		// define plugin wide variables here
		var $target, $iframe, $showHs, $showLbl, $showHsActive, $panelHeight, $panelWidth;
		
		return {
			_setup: function(options) {
				// setup code, fire on initialisation
				$target = $("#" + options.target);
				if(options.overlayPan == "true"){
					$target.parent().hide()
					$target.hide();
					if(options.optional === "true") {
	                    var $showHolder  = $('<div id="showHolder" />').appendTo($target);
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
						$target.show();
						$showHolder
							.show()
                    	    .click(function () {
								$showHsActive = true;
                        	    $showHolder.hide();
								if (options.name != "") {
									$target.prepend('<h4>' + options.name + '</h4>');
								}
								$target.parent().addClass("qWindow").addClass("panel");
								//$target.parent().css({"padding": 5});
								$panelHeight = (($target.parent().parent().height() - 15) / $target.parent().parent().height()) * 100 + "%";
								$panelWidth  = (($target.parent().parent().width() - 15)  / $target.parent().parent().width() ) * 100 + "%";
								$target.parent().css({
									"height": $panelHeight,
									"width": $panelWidth,
									"overflow": "hidden"
								});
								$iframe.show();
                        	});
					// if not optional
               		} else {
						$showHsActive = true;
						$target.parent().css({"padding": 5});
						if (options.name != "") {
							$target.prepend('<h4>' + options.name + '</h4>');
						}
					}
				}


				// has a xot iframe already been built here for this block? if not, build iframe
				if (!options.child && $target.children(".xotiframe").length == 0) {
					$target.addClass("xotHolder");
						
					$iframe = $('<iframe class="xotiframe"/>')
						.appendTo($target)
						.width("100%")
						.attr({
							"frameborder":	0,
							"scrolling":	"no"
						});
					
					if (options.description) {
						$iframe.attr("title", options.description);
					}
					
					// sort url to include extra parameters (display, hide)
					var params = options.url.split("?"),
						myURL = params[0];
					
					params.splice(0,1);
					
					if ($.isNumeric(options.page) == false) {
						delete options.page;
					}
					
					// check whether any params set in url should be used or if they are overridden by other xwd options
					if (params.length > 0) {
						params = params[0].split("&");
						
						// remove params from url if they're also set in xwd
						for (i=0; i<params.length; i++) {
							if (params[i].indexOf("display=") != -1) {
								// never include display param from url as it will be forced to 'fill'
								params.splice(i, 1);
								i-=1;
								
							} else if (params[i].indexOf("page=") != -1 || params[i].indexOf("pageID=") != -1 || params[i].indexOf("linkID=") != -1) {
								if (options.page) {
									params.splice(i, 1);
									i-=1;
								} else if (params[i].indexOf("page=") != -1) {
									options.page = Number(params[i].split("=")[1]);
									params.splice(i, 1);
									i-=1;
								}
								
							} else if (options.hide && params[i].indexOf("hide=") != -1) {
								params.splice(i, 1);
								i-=1;
							}
						}
					}
					
					if (!options.page) {
						options.page = 1;
					}
					
					params.push("display=fill");
					
					if (options.hide) {
						params.push("hide=" + options.hide);
					}
					
					// recreate url with all relevant parameters
					for (i=0; i<params.length; i++) {
						if (i == 0) {
							myURL += "?" + params[i];
						} else {
							myURL += "&" + params[i];
						}
					}
					
					// if project is being viewed as https then force iframe to be https too
					if (window.location.protocol == "https:" && myURL.indexOf("http:") == 0) {
						myURL = "https:" + myURL.substring(myURL.indexOf("http:") + 5);
					}
					
					$iframe.data({
						"url"	:myURL,
						"page"	:options.page
					});
					
					if (options.line == "true") {
						if (options.position == "top") {
							$target.append("<hr/>");
						} else {
							$target.prepend("<hr/>");
						}
					}
					
					// call function to set $iframe to use 100% of available height
					$iframe
						.addClass("fullH fullW")
						.data("exclude", $target.find("h4"));
					eval(x_currentPageXML.nodeName).resizeContent($target);
					eval(x_currentPageXML.nodeName).resizeContent($iframe);
					
				// if it's a child then at synch points the url stays the same but the project page can change
				} else if (options.child) {
					$iframe = $target.children(".xotiframe");
				}
				$iframe.hide();
				$target.hide();
			},
			
			start: function(event, options) {
				// fire on options.start
				
				var pageStr = "";
				if (options.page) {
					pageStr = $iframe.data("url").indexOf("?") == -1 ? "?" : "&";
					pageStr = String(options.page).indexOf("PG") == -1 ? pageStr + "page=" + options.page : pageStr + "linkID=" + options.page;
				}
				
				if ($iframe.attr("src") == undefined) {
					// it's the 1st url to load in iframe
					$iframe.attr("src", $iframe.data("url") + pageStr);
					
				} else if (options.page != undefined) {
					try {
						// if possible change page by calling xot function
						$iframe[0].contentWindow.x_changePage(options.page - 1);
					} catch(e) {
						// otherwise reset src for iframe
						$iframe.attr("src", $iframe.data("url") + pageStr);
					}
				}

				//var marginWidth = ($target.parent().css("padding") + $target.parent().css("margin") + 1) * 2
				//var marginTop = ($target.parent().css("padding") + $target.parent().css("margin") + 3) * 2
				var marginWidth = 22;
				var marginTop = 25;
				$panelHeight = (($target.parent().parent().height() - marginTop) / $target.parent().parent().height()) * 100 + "%";
				$panelWidth  = (($target.parent().parent().width() - marginWidth)  / $target.parent().parent().width())  * 100 + "%";
				if ($showHsActive == true) 
				{
					$target.parent().css({
						"height"  : $panelHeight,
						"width"   : $panelWidth,
						"overflow": "hidden"
					});
					$target.parent().addClass("qWindow").addClass("panel");
				}
				if (options.overlayPan) {
					var hs = ((($target.parent().parent().height() - 15 - 2 * $target.parent().css("padding").replace(/[^-\d\.]/g, ''))) / $target.parent().parent().height())  * 100 + "%"
					
					if (options.optional == undefined || options.optional === "false") {
						$target.parent().addClass("qWindow").addClass("panel");
						$target.parent().css({
							"max-width": '',
							"height": $panelHeight,
							"width": $panelWidth,
							"top": "3px",
							"overflow-y": "hidden"
						}).show();
						$iframe.show();
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
							"padding": 0,
							"height": "auto",
						});
					}
					
					
					$target.css("height", "100%");
					if (options.name == "") {
						$iframe.css("height", "100%");
					}
					else {
						$iframe.css("height", ((($target.parent().parent().height() - 44 - 2 * $target.parent().css("padding").replace(/[^-\d\.]/g, ''))) / $target.parent().parent().height())  * 100 + "%")
					}
				}
				// If not overlaypanel show frame directly
				else {
					$iframe.show();
				}
				$target.parent().show();
				$target.show();
				
			},
			
			end: function(event, options) {
				// fire on options.end
				if (options.overlayPan) {
					if ($target.parent().hasClass("qWindow")) {
						$target.parent().removeClass("qWindow").removeClass("panel");
						$target.parent().css({
							"top": 0,
							"left": 0,
							"padding": 0,
							"height": "auto",
							"margin-right" : 0,
							"overflow": '',
							"overflow-x": '',
							"overflow-y": ''
						}).hide();
					}
					$target.hide();
				}

				if (!options.child == true) {
					$target.hide();
					
				} else {
					// force back to original page (needed for when rewinding)
					var pageStr = $iframe.data("url").indexOf("?") == -1 ? "?" : "&";
					pageStr = String($iframe.data("page")).indexOf("PG") == -1 ? pageStr + "page=" + $iframe.data("page") : pageStr + "linkID=" + $iframe.data("page");
					
					try {
						// if possible change page by calling xot function
						$iframe[0].contentWindow.x_changePage($iframe.data("page") - 1);
					} catch(e) {
						// otherwise reset src for iframe
						$iframe.attr("src", $iframe.data("url") + pageStr);
					}
				}
			}
		};
		
	});
})(Popcorn);