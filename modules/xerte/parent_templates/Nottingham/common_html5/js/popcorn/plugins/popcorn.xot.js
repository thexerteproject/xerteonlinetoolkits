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
	Popcorn.plugin("xot", function(popOptions) {
		
		// define plugin wide variables here
		var $target, $iframe;
		
		return {
			_setup: function(popOptions) {
				// setup code, fire on initialisation
				
				$target = $("#" + popOptions.target);
				
				// has a xot iframe already been built here for this block? if not, build iframe
				if (!popOptions.child && $target.children(".xotiframe").length == 0) {
					$target.addClass("xotHolder");
						
					$iframe = $('<iframe class="xotiframe"/>')
						.appendTo($target)
						.width("100%")
						.attr({
							"frameborder":	0,
							"scrolling":	"no"
						});
					
					if (popOptions.name != "") {
						$iframe.before('<h4>' + popOptions.name + '</h4>');
					}
					
					if (popOptions.description) {
						$iframe.attr("title", popOptions.description);
					}
					
					// sort url to include extra parameters (display, hide)
					var params = popOptions.url.split("?"),
						myURL = params[0];
					
					params.splice(0,1);
					
					if ($.isNumeric(popOptions.page) == false) {
						delete popOptions.page;
					}
					
					// check whether any params set in url should be used or if they are overridden by other xwd popOptions
					if (params.length > 0) {
						params = params[0].split("&");
						
						// remove params from url if they're also set in xwd
						for (i=0; i<params.length; i++) {
							if (params[i].indexOf("display=") != -1) {
								// never include display param from url as it will be forced to 'fill'
								params.splice(i, 1);
								i-=1;
								
							} else if (params[i].indexOf("page=") != -1 || params[i].indexOf("pageID=") != -1 || params[i].indexOf("linkID=") != -1) {
								if (popOptions.page) {
									params.splice(i, 1);
									i-=1;
								} else if (params[i].indexOf("page=") != -1) {
									popOptions.page = Number(params[i].split("=")[1]);
									params.splice(i, 1);
									i-=1;
								}
								
							} else if (popOptions.hide && params[i].indexOf("hide=") != -1) {
								params.splice(i, 1);
								i-=1;
							}
						}
					}
					
					if (!popOptions.page) {
						popOptions.page = 1;
					}
					
					params.push("display=fill");
					
					if (popOptions.hide) {
						params.push("hide=" + popOptions.hide);
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
						"page"	:popOptions.page
					});
					
					if (popOptions.line == "true") {
						if (popOptions.position == "top") {
							$target.append("<hr/>");
						} else {
							$target.prepend("<hr/>");
						}
					}
					
					// call function to set $iframe to use 100% of available height
					$iframe
						.addClass("fullH")
						.data("exclude", $target.find("h4"));
					eval(x_currentPageXML.nodeName).resizeContent($iframe);
					
				// if it's a child then at synch points the url stays the same but the project page can change
				} else if (popOptions.child) {
					$iframe = $target.children(".xotiframe");
				}
				
				$target.hide();
			},
			
			start: function(event, popOptions) {
				// fire on popOptions.start
				
				var pageStr = "";
				if (popOptions.page) {
					pageStr = $iframe.data("url").indexOf("?") == -1 ? "?" : "&";
					pageStr = String(popOptions.page).indexOf("PG") == -1 ? pageStr + "page=" + popOptions.page : pageStr + "linkID=" + popOptions.page;
				}
				
				if ($iframe.attr("src") == undefined) {
					// it's the 1st url to load in iframe
					$iframe.attr("src", $iframe.data("url") + pageStr);
					
				} else if (popOptions.page != undefined) {
					try {
						// if possible change page by calling xot function
						$iframe[0].contentWindow.x_changePage(popOptions.page - 1);
					} catch(e) {
						// otherwise reset src for iframe
						$iframe.attr("src", $iframe.data("url") + pageStr);
					}
				}
				
				$target.show();
			},
			
			end: function(event, popOptions) {
				// fire on popOptions.end
				
				if (!popOptions.child == true) {
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