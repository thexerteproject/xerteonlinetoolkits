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
		var $target, $iframe;
		
		return {
			_setup: function(options) {
				// setup code, fire on initialisation
				
				$target = $("#" + options.target);
				
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
					
					if (options.name != "") {
						$iframe.before('<h4>' + options.name + '</h4>');
					}
					
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
						.addClass("fullH")
						.data("exclude", $target.find("h4"));
					eval(parent.x_currentPageXML.nodeName).resizeContent($iframe);
					
				// if it's a child then at synch points the url stays the same but the project page can change
				} else if (options.child) {
					$iframe = $target.children(".xotiframe");
				}
				
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
				
				$target.show();
			},
			
			end: function(event, options) {
				// fire on options.end
				
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