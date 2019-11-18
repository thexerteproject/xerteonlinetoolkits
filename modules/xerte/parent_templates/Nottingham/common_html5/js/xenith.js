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

// all elements, variables and functions for interface are called "x_id" - do not make new id's prefixed with "x_" in page models
var x_languageData  = [],
    x_params        = new Object(), // all attributes of learningObject that aren't undefined
    x_pages,        // xml info about all pages in this LO
    x_pageInfo      = [],   // holds info about pages (type, built, linkID, pageID, savedData) - use savedData if any input from page needs to be saved for use on other pages or on return to this page
    x_currentPage   = -1,
    x_currentPageXML,
    x_glossary      = [],
	x_variables		= [],
	x_variableInfo  = [],
	x_variableErrors= [],
    x_specialChars  = [],
    x_inputFocus    = false,
    x_dialogInfo    = [], // (type, built)
    x_browserInfo   = {iOS:false, Android:false, touchScreen:false, mobile:false, orientation:"portrait"}, // holds info about browser/device
    x_pageHistory   = [], // keeps track of pages visited for historic navigation
    x_firstLoad     = true,
    x_fillWindow    = false,
    x_volume        = 1,
    x_audioBarH     = 30,
    x_mediaText     = [],
    x_deepLink		= "",
    x_timer,        // use as reference to any timers in page models - they are cancelled on page change
	x_responsive = [], // list of any responsivetext.css files in use
	x_cssFiles = [],
	x_pageLoadPause = false;

// Determine whether offline mode or not
var xot_offline = !(typeof modelfilestrs === 'undefined');
var modelfilestrs = modelfilestrs || [];

var $x_window, $x_body, $x_head, $x_mainHolder, $x_mobileScroll, $x_headerBlock, $x_pageHolder, $x_helperText, $x_pageDiv, $x_footerBlock, $x_footerL, $x_menuBtn, $x_colourChangerBtn, $x_prevBtn, $x_pageNo, $x_nextBtn, $x_background, $x_glossaryHover;

// Patch jQuery to add support for .toggle(function, function...) which was removed in jQuery 1.9
// Code from http://forum.jquery.com/topic/beginner-function-toggle-deprecated-what-to-use-instead
if (!$.fn.toggleClick) {
    $.fn.toggleClick = function(){
		var functions=arguments, iteration=0;

		return this.click(function(){
			functions[iteration].apply(this,arguments);
			iteration = (iteration+1) % functions.length;
		})
    };
}

$(document).keydown(function(e) {
    switch(e.which) {
        case 33: // PgUp
            if (x_currentPage > 0 && $x_prevBtn.is(":enabled") && $x_nextBtn.is(":visible")) {
                if (x_params.navigation != "Historic" && x_params.navigation != "LinearWithHistoric") {
					x_changePage(x_currentPage -1);
                } else {
                    var prevPage = x_pageHistory[x_pageHistory.length-2];
                    x_pageHistory.splice(x_pageHistory.length - 2, 2);
					//check if history is empty and if so allow normal back navigation and change to normal back button
				if(prevPage==undefined && x_currentPage > 0 && x_params.navigation == "LinearWithHistoric"){
					prevIcon = "x_prev";
					$x_prevBtn
						.button({
							icons: {
							primary: prevIcon
					},
			label:	x_getLangInfo(x_languageData.find("backButton")[0], "label", "Back"),
			text:	false
		})
		 x_changePage(x_currentPage -1);
				   }
				   //disable normal back navigation if 1st page
				if (x_currentPage <=1){
					$x_prevBtn
            .button("disable")
            .removeClass("ui-state-focus")
            .removeClass("ui-state-hover");
					}
                    x_changePage(prevPage);
                }
			}
            break;

        case 34: // PgDn
			if ($x_nextBtn.is(":enabled") && $x_nextBtn.is(":visible")) {
				x_changePage(x_currentPage + 1);
			}
            break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

$(document).ready(function() {
	// Load the script.js dependency loader
    if (!xot_offline) {
        // TODO - we should move this to play/preview and let it kickstart the loading of all files
        $.getScript(x_templateLocation + "common_html5/js/script.js");
    }

    $x_mainHolder = $("#x_mainHolder");

    if (navigator.userAgent.match(/iPhone/i) != null || navigator.userAgent.match(/iPod/i) != null || navigator.userAgent.match(/iPad/i) != null) {
        x_browserInfo.iOS = true;
		if (navigator.userAgent.match(/iPad/i) != null) {
			x_browserInfo.Device = "iPad";
		}
		else
		{
			x_browserInfo.Device = "iPhone";
		}
    }
    if (navigator.userAgent.match(/Android/i) != null)
    {
        x_browserInfo.Android = true;
    }

    x_browserInfo.touchScreen = !!("ontouchstart" in window);
	if (x_browserInfo.touchScreen == true) {
		$x_mainHolder.addClass("x_touchScreen");
	}

	x_browserInfo.mobile = x_isMobileBrowser();

    // get xml data and sort it
    if (typeof dataxmlstr != 'undefined')
    {
        var newString = x_makeAbsolute(x_fixLineBreaks(dataxmlstr)),
        xmlData = $($.parseXML(newString)).find("learningObject");
        x_projectDataLoaded(xmlData);
    }
    else {
        $.ajax({
            type: "GET",
            url: x_projectXML,
            dataType: "text",
            success: function (text) {
                var newString = x_makeAbsolute(x_fixLineBreaks(text)),
                    xmlData = $($.parseXML(newString)).find("learningObject");
                x_projectDataLoaded(xmlData);
            },
            error: function () {
                // can't have translation for this as if it fails to load we don't know what language file to use
                $("body").append("<p>The project data has not loaded.</p>");
            }
        });
    }

});

// To be able to check on orientation, and also detect the difference between a mobile and tablet
// See https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
x_isMobileBrowser = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

x_projectDataLoaded = function(xmlData) {
    var i, len;
	var markedPages = new Array();
    for (i = 0, len = xmlData[0].attributes.length; i < len; i++) {
        x_params[xmlData[0].attributes[i].name] = xmlData[0].attributes[i].value;
    }

	// author support should only work when previewed (not play link)
	if (x_params.authorSupport == "true") {
		if (window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1, window.location.pathname.length).indexOf("preview") == -1) {
			x_params.authorSupport = "false";
		}
	}

    x_pages = xmlData.children();
	var pageToHide = [];
	var currActPage = 0;
    x_pages.each(function (i) {
		// work out whether the page is hidden or not - can be simply hidden or hidden between specific dates/times
		var hidePage = $(this)[0].getAttribute("hidePage") == "true" ? true : false;
		if (hidePage == true) {
			// get current date/time according to browser
			var nowTemp = new Date();
			var now = {day:nowTemp.getDate(), month:nowTemp.getMonth()+1, year:nowTemp.getFullYear(), time:Number(String(nowTemp.getHours()) + (String(nowTemp.getMinutes()) < 10 ? '0' : '') + String(nowTemp.getMinutes()))};

			// functions to get hide on/until date/times from xml
			var hideOn, hideUntil,
				hideOnString = '', hideUntilString = '';
			var getDateInfo = function(dmy, hm) {
				// some basic checks of whether values are valid & then splits the data into time/day/month/year
				var tempDmy = dmy.split('/'), // original date format
					formatType = 0,
					format = [[0,1,2], [2,1,0]]; // d, m, y
				
				if (tempDmy.length == 3) {
					dmy = tempDmy;
				} else if (tempDmy.length == 1) {
					tempDmy = dmy.split('-'); // try the newer date format
					if (tempDmy.length == 3) {
						tempDmy.splice(2, 1, tempDmy[2].split('T')[0]);
						dmy = tempDmy;
						formatType = 1;
					} else {
						dmy = false;
					}
					
				} else {
					dmy = false;
				}
				
				if (dmy == false) {
					return [false];
				} else {
					var day = Math.max(1, Math.min(Number(dmy[format[formatType][0]]), 31)),
						month = Math.max(1, Math.min(Number(dmy[format[formatType][1]]), 12)),
						year = Math.max(Number(dmy[format[formatType][2]]), 2017),
						time = 0; // use midnight if no time is given
					
					if (hm != undefined && hm.trim() != '') {
						var hm = hm.split(':');
						if (hm.length == 2) {
							var hour = Math.min(Number(hm[0]), 23),
								minute = Math.min(Number(hm[1]), 59);
							time = Number(String(hour) + (minute < 10 ? '0' : '') + String(minute));
						}
					}
					return [{day:day, month:month, year:year, time:time}, (formatType == 0 ? day + '/' + month + '/' + year : year + '-' + month + '-' + day)];
				}
			}
			
			var getFullDate = function(info) {
				var timeZero = '';
				for (var i=0; i<4-String(info.time).length; i++) {
					timeZero += '0';
				}
				return Number(String(info.year) + (info.month < 10 ? '0' : '') + String(info.month) + (info.day < 10 ? '0' : '') + String(info.day) + timeZero + String(info.time));
			}

			// is it hidden from a certain date? if so, have we passed that date/time?
			if ($(this)[0].getAttribute("hideOnDate") != undefined && $(this)[0].getAttribute("hideOnDate") != '') {
				var dateInfo = getDateInfo($(this)[0].getAttribute("hideOnDate"), $(this)[0].getAttribute("hideOnTime"));
				hideOn = dateInfo[0];

				if (hideOn != false) {
					if (hideOn.year > now.year || (hideOn.year == now.year && hideOn.month > now.month) || (hideOn.year == now.year && hideOn.month == now.month && hideOn.day > now.day) || (hideOn.year == now.year && hideOn.month == now.month && hideOn.day == now.day && hideOn.time > now.time)) {
						hidePage = false;
					}

					hideOnString = '{from}: ' + dateInfo[1] + ' ' + $(this)[0].getAttribute("hideOnTime");
				}
			}

			// is it hidden until a certain date? if so, have we passed that date/time?
			if ($(this)[0].getAttribute("hideUntilDate") != undefined && $(this)[0].getAttribute("hideUntilDate") != '') {
				var dateInfo = getDateInfo($(this)[0].getAttribute("hideUntilDate"), $(this)[0].getAttribute("hideUntilTime"));
				hideUntil = dateInfo[0];

				if (hideUntil != false) {
					// if hideUntil date is before hideOn date then the page is hidden/shown/hidden rather than shown/hidden/shown & it might need to be treated differently:
					var skip = false;
					if (hideOn != undefined && getFullDate(hideOn) > getFullDate(hideUntil)) {
						if (hidePage == false) {
							hidePage = true;
						} else {
							skip = true;
						}
					}

					if (skip != true && hidePage == true) {
						if (hideUntil.year < now.year || (hideUntil.year == now.year && hideUntil.month < now.month) || (hideUntil.year == now.year && hideUntil.month == now.month && hideUntil.day < now.day) || (hideUntil.year == now.year && hideUntil.month == now.month && hideUntil.day == now.day && hideUntil.time <= now.time)) {
							hidePage = false;
						}
					}

					hideUntilString = '{until}: ' + dateInfo[1] + ' ' + $(this)[0].getAttribute("hideUntilTime");
				}
			}

			// language data hasn't been sorted yet so temporarily just store the attribute name of where we can later get the language we need
			var infoString = '';
			if (hideOnString != '') {
				infoString += '(' + hideOnString;
			}
			if (hideUntilString != '') {
				if (infoString == '') { infoString += '('; } else { infoString += ' & '; }
				infoString += hideUntilString;
			}
			if (infoString != '') { infoString += ')'; }

			if (hidePage == true) {
				infoString = '{hidden} ' + infoString;
			} else {
				infoString = '{shown} ' + infoString;
			}

			$(this)[0].setAttribute("hidePageInfo", infoString);
		}

		if (hidePage == false || x_params.authorSupport == "true") {
			var linkID = $(this)[0].getAttribute("linkID"),
				pageID = $(this)[0].getAttribute("pageID"),
				page = {type: $(this)[0].nodeName, built: false};
			if (linkID != undefined) {
				page.linkID = linkID;
			}
			if (pageID != undefined && pageID != "Unique ID for this page") { // Need to use this English for backward compatibility
				page.pageID = pageID;
			}

			//Get child linkIDs for deeplinking
			page.childIDs = [];
			var tempArrays = [];
			var allChildIDs = function($this, array) {
				$this.children().each(function () {
					var $child = $(this)
					if ($child.children().length > 0) {
						array.push($child[0].getAttribute("linkID"));
						tempArrays.push([]);
						var tempArray = tempArrays[tempArrays.length-1];
						allChildIDs($child, tempArray);
						array.push(tempArray);

					} else {
						array.push($child[0].getAttribute("linkID"));
					}
				});
			}
			allChildIDs($(this), page.childIDs);
			x_pageInfo.push(page);
            if(($(this)[0].getAttribute("unmarkForCompletion") === "false" || $(this)[0].getAttribute("unmarkForCompletion") == undefined) && this.nodeName !== "results" )
            {
                markedPages.push(currActPage);
                currActPage++;
            }
            else {
                currActPage++;
            }
		}
		else {
			pageToHide.push(i);
		}

    });

	// removes hidden pages from array
	for (i=0; i<pageToHide.length; i++) {
		x_pages.splice(pageToHide[i]-i,1);
	}

    if (x_pages.length < 2) {
        // don't show navigation options if there's only one page
        $("#x_footerBlock .x_floatRight").remove();
    } else {
        if (x_params.navigation == undefined) {
            x_params.navigation = "Linear";
        }
        if (x_params.navigation != "Linear" && x_params.navigation != "LinearWithHistoric" && x_params.navigation != "Historic" && x_params.navigation != undefined) { // 1st page is menu
            x_pages.splice(0, 0, "menu");
            x_pageInfo.splice(0, 0, {type: 'menu', built: false});
        }
    }

    if (x_params.fixDisplay != undefined) {
        if ($.isNumeric(x_params.fixDisplay.split(",")[0]) == true && $.isNumeric(x_params.fixDisplay.split(",")[1]) == true) {
            x_params.displayMode = x_params.fixDisplay.split(",");
            x_fillWindow = false; // overrides fill window for touchscreen devices
        }
    }

    // sort any parameters in url - these will override those in xml
    var tempUrlParams = window.location.search.substr(1, window.location.search.length).split("&");
    x_urlParams = {};
    for (i = 0; i < tempUrlParams.length; i++) {
        x_urlParams[tempUrlParams[i].split("=")[0]] = tempUrlParams[i].split("=")[1];
    }

	// url embed parameter uses ideal setup for embedding in iframes - can be overridden with other parameters below
	if (x_urlParams.embed == 'true') {
		x_params.embed = true;
		x_params.displayMode = 'full screen';
		x_params.responsive = 'false';
		// css button also won't appear
	}

    // url display parameter will set size of LO (display=fixed|full|fill - or a specified size e.g. display=200,200)
    if (x_urlParams.display != undefined) {
        if ($.isNumeric(x_urlParams.display.split(",")[0]) == true && $.isNumeric(x_urlParams.display.split(",")[1]) == true) {
            x_params.displayMode = x_urlParams.display.split(",");
            x_fillWindow = false; // overrides fill window for touchscreen devices

        } else if (x_urlParams.display == "fixed" || x_urlParams.display == "default" || x_urlParams.display == "full" || x_urlParams.display == "fill") {
            if (x_browserInfo.touchScreen == true) {
                x_fillWindow = true;
            }
            if (x_urlParams.display == "fixed" || x_urlParams.display == "default") { // default fixed size using values in css (800,600)
                x_params.displayMode = "default";
            } else if (x_urlParams.display == "full" || x_urlParams.display == "fill") {
                x_params.displayMode = "full screen"
            }
        }
    }

	if (window.location.href.indexOf("/peer.php") != -1 || window.location.href.indexOf("/peerreview_") != -1) {
		x_params.displayMode = "default";
		x_fillWindow = false;
	}

	// this is being shown in iframe so force to fill available space
	if (self !== top) {
		x_fillWindow = true;
	}

    // url hide parameter will remove x_headerBlock &/or x_footerBlock divs
    if (x_urlParams.hide != undefined) {
        if (x_urlParams.hide == "none") {
            x_params.hideHeader = "false";
            x_params.hideFooter = "false";
        } else if (x_urlParams.hide == "both") {
            x_params.hideHeader = "true";
            x_params.hideFooter = "true";
        } else if (x_urlParams.hide == "bottom") {
            x_params.hideHeader = "false";
            x_params.hideFooter = "true";
        } else if (x_urlParams.hide == "top") {
            x_params.hideHeader = "true";
            x_params.hideFooter = "false";
        }
    }

	// url parameter to turn responsive on / off
	if (x_urlParams.responsive != undefined && (x_urlParams.responsive == "true" || x_urlParams.responsive == "false")) {
		x_params.responsive = x_urlParams.responsive;
	}

	if (x_urlParams.theme != undefined && (x_params.themeurl == undefined || x_params.themeurl != 'true'))
    {
        x_params.theme = x_urlParams.theme;
    }

    x_getLangData(x_params.language);

    // Setup nr of pages for tracking
    XTSetOption('nrpages', x_pageInfo.length);
	XTSetOption('toComplete', markedPages);
	XTSetOption('templateId', x_TemplateId);
	XTSetOption('templateName', x_params.name);

    if (x_params.trackingMode != undefined) {
        XTSetOption('tracking-mode', x_params.trackingMode);
    }


	if (x_params.trackingPassed != undefined)
	{
		// Get value, and try to convert to decimal between 0 and 1
        var passed = x_params.trackingPassed;
        var factor = 1;
        var percpos = passed.indexOf('%')
        if (percpos > 0)
        {
            factor = 0.01;
            passed = passed.substr(0, passed.indexOf('%'));
        }
        // Change decimal ',' to '.'
        passed = passed.replace(',', '.');
        var passednumber = Number(passed) * factor;
        XTSetOption('objective_passed', passednumber);
	}

	if (x_params.trackingPageTimeout != undefined)
    {
        XTSetOption('page_timeout', x_params.trackingPageTimeout);
    }
    if (x_params.forceTrackingMode != undefined)
    {
        XTSetOption('force_tracking_mode', x_params.forceTrackingMode);
    }
}

// Make absolute urls from urls with FileLocation + ' in their strings
x_makeAbsolute = function(html){
    //var tempDecoded = decodeURIComponent(html);
   // var tempDecoded = $('<textarea/>').html(tempURIDecoded).text();
    var temp = html.replace(/FileLocation \+ \'([^\']*)\'/g, FileLocation + '$1');

    return temp;
}

// replace all line breaks in attributes with ascii code - otherwise these are replaced with spaces when parsed to xml
function x_fixLineBreaks(text) {
    var     split_up = text.split(/<\!\[CDATA\[|\]\]>/),
        temp, i, j, len, len2;

    for (i=0, len=split_up.length; i<len; i+=2) {
        temp = split_up[i].split('"');
        for (j=1, len2=temp.length; j<len2; j+=2) {
            temp[j] = temp[j].replace(/(\n|\r|\r\n)/g, "&#10;");
        }
        split_up[i] = temp.join('"');
    }

    // Put the CDATA blocks back...
    temp = [];
    for (i=0, len=split_up.length-1; i<len; i+=2) {
        temp.push(split_up[i] + "<![CDATA[" + split_up[i+1]);
    }
    temp.push(split_up[i]);

    return temp.join("]]>");
}

// function gets data from language file
function x_getLangData(lang) {
    if (typeof langxmlstr != 'undefined')
    {
        // We have a off-line object with the language definition in a string
        // Convert to an XML object and continue like before
        x_languageData = $($.parseXML(langxmlstr)).find("language");
        x_setUp();
    }
    else {
        if (lang == undefined || lang == "undefined" || lang == "") {
            lang = "en-GB";
        }
        $.ajax({
            type: "GET",
            url: "languages/engine_" + lang + ".xml",
            dataType: "xml",
            success: function (xml) {
                x_languageData = $(xml).find("language");
                x_setUp();
            },
            error: function () {
                if (lang != "en-GB") { // no language file found - try default GB one
                    x_getLangData("en-GB");
                } else { // hasn't found GB language file - set up anyway, will use fallback text in code
                    x_languageData = $("");
                    x_setUp();
                }
            }
        });
    }
}

function x_evalURL(url)
{
    if (url == null)
        return null;
    var trimmedURL = $.trim(url);
    if (trimmedURL.indexOf("'")==0 || trimmedURL.indexOf("FileLocation + ") >=0)
    {
        if (xot_offline)
        {
            if (url.indexOf("FileLocation + ") >=0)
            {
                var pos = url.indexOf("FileLocation + ");
                url = url.substr(0,pos) + url.substr(pos + 16);
                return eval(url);
            }
            else
            {
                return eval(url);
            }
        }
        else {
            return eval(url)
        }
    }
    else
    {
        return url;
    }
}

function x_GetTrackingTextFromHTML(html, fallback)
{
    var div = $('<div>').html(html);
    var txt = $.trim(div.text());
    if (txt == "")
    {
        var img = div.find("img");
        if (img != undefined && img.length > 0)
        {
            txt = img[0].attributes['alt'].value;
        }
    }
    if (txt == "")
    {
        txt = fallback;
    }
    return txt;
}

// setup functions load interface buttons and events
function x_setUp() {
	x_params.dialogTxt = x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "dialog", "") != "" && x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "dialog", "") != null ? " " + x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "dialog", "") : "";
	x_params.newWindowTxt = x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "newWindow", "") != "" && x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "newWindow", "") != null ? " " + x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "newWindow", "") : "";

	if (x_pages.length == 0) {
		$("body").append(x_getLangInfo(x_languageData.find("noPages")[0], "label", "<p>This project does not contain any pages.</p>"));
	} else {

		$x_head			= $("head");
		$x_body			= $("body");
		$x_window		= $(window);
		$x_mobileScroll	= $("#x_mobileScroll");
		$x_headerBlock	= $("#x_headerBlock");
		$x_pageHolder	= $("#x_pageHolder");
		$x_helperText	= $("#x_helperText");
		$x_pageDiv		= $("#x_pageDiv");
		$x_footerBlock	= $("#x_footerBlock");
		$x_footerL		= $("#x_footerBlock .x_floatLeft");
		$x_menuBtn		= $("#x_menuBtn");
		$x_colourChangerBtn	= $("#x_colourChangerBtn");
		$x_prevBtn		= $("#x_prevBtn");
		$x_pageNo		= $("#x_pageNo");
		$x_nextBtn		= $("#x_nextBtn");
		$x_background	= $("#x_background");

		$x_body.css("font-size", Number(x_params.textSize) - 2 + "pt");

		if (x_params.authorSupport == "true") {
			var msg = x_getLangInfo(x_languageData.find("authorSupport")[0], "label", "") != "" && x_getLangInfo(x_languageData.find("authorSupport")[0], "label", "") != null ? x_getLangInfo(x_languageData.find("authorSupport")[0], "label", "") : "Author Support is ON: text shown in red will not appear in live projects.";
			$x_headerBlock.prepend('<div id="x_authorSupportMsg" class="alert"><p>' + msg + '</p></div>');
		}

		// calculate author set variables
		x_newVariables();
		x_dialogInfo.push({type:'msg', built:false});

		// hides header/footer if set in url
		if (x_params.hideHeader == "true") {
			$x_headerBlock.hide().height(0);
		}
		if (x_params.hideFooter == "true") { // More complex since narration is in here
			$('#x_footerBlock > div').each(function () {
				$(this).hide().height(0);
			});
		}
		if (x_params.hideHeader == "true" && x_params.hideFooter == "true") {
			$x_mainHolder.css("border", "none");
		}

		// sets initial size if set in url e.g. display=500,500
		if ($.isArray(x_params.displayMode)) {
			$x_mainHolder.css({
				"width"		:x_params.displayMode[0],
				"height"	:x_params.displayMode[1]
			});
		}

		if (x_browserInfo.mobile) {
		    x_fillWindow = true;
			$x_mainHolder.addClass("x_mobile");
			x_insertCSS(x_templateLocation + "common_html5/css/mobileStyles.css", function() {x_cssSetUp()});
		} else {
			$x_mainHolder.addClass("x_desktop");
			x_insertCSS(x_templateLocation + "common_html5/css/desktopStyles.css", x_desktopSetUp);
		}
	}
}

function x_desktopSetUp() {
	if (x_params.embed != true || x_params.displayMode != 'full screen') {
		$x_footerL.prepend('<button id="x_cssBtn"></button>');
		$("#x_cssBtn")
			.button({
				icons:	{primary: "x_maximise"},
				label: 	x_getLangInfo(x_languageData.find("sizes").find("item")[3], false, "Full screen"),
				text:	false
			})
            .attr("aria-label", $("#x_cssBtn").attr("title"))
			.click(function() {
				// Post flag to containing page for iframe resizing
				if (window && window.parent && window.parent.postMessage) {
					window.parent.postMessage((String)(!x_fillWindow), "*");
				}

				if (x_fillWindow == false) {
					x_setFillWindow();
				} else {
					for (var i=0; i<x_responsive.length; i++) {
						$x_mainHolder.removeClass("x_responsive");
						$(x_responsive[i]).prop("disabled", true);
					};

					// minimised size to come from display size specified in xml or url param
					if ($.isArray(x_params.displayMode)) {
						$x_mainHolder.css({
							"width"		:x_params.displayMode[0],
							"height"	:x_params.displayMode[1]
						});
					// minimised size to come from css (800,600)
					} else {
						$x_mainHolder.css({
							"width"		:"",
							"height"	:""
							});
					}
					$x_body.css("overflow", "auto");
					$(this).button({
						icons:	{primary: "x_maximise"},
						label:	x_getLangInfo(x_languageData.find("sizes").find("item")[3], false, "Full screen")
					});
					$("#x_cssBtn").addClass("x_maximise").removeClass("x_minimise");
					x_fillWindow = false;
					x_updateCss();
				}
				$(this)
					.blur()
					.removeClass("ui-state-focus")
					.removeClass("ui-state-hover");
			});

		$("#x_cssBtn").addClass("x_maximise").removeClass("x_minimise");
	}

	if (x_params.displayMode == "full screen" || x_params.displayMode == "fill window") {
		x_fillWindow = true;
	}

	if (x_fillWindow == true) {
		x_setFillWindow(false);
	}

	x_cssSetUp();
}

function x_cssSetUp(param) {
	param = (typeof param !== 'undefined') ?  param : "menu";

	switch(param) {
        case "menu":
        	x_insertCSS(x_templateLocation + "models_html5/menu.css", function() {x_cssSetUp("language")});
            break;
        case "menu2":
            if (x_params.theme != undefined && x_params.theme != "default") {
                x_insertCSS(x_themePath + x_params.theme + "/css/menu.css", function () {x_cssSetUp("language")});
            }
            else
			{
                x_cssSetUp("language");
			}
            break;
        case "language":
			if (x_params.kblanguage != undefined) {
				x_insertCSS(x_templateLocation + "models_html5/language.css", function() {x_cssSetUp("glossary")});
			} else {
				x_cssSetUp("glossary");
			}
            break;
        case "language2":
            if (x_params.theme != undefined && x_params.theme != "default") {
                x_insertCSS(x_themePath + x_params.theme + "/css/language.css", function () {x_cssSetUp("glossary")});
            }
            else
            {
                x_cssSetUp("glossary");
            }
            break;
        case "glossary":
			if (x_params.glossary != undefined) {
				x_insertCSS(x_templateLocation + "models_html5/glossary.css", function() {x_cssSetUp("colourChanger")});
			} else {
				x_cssSetUp("colourChanger");
			}
            break;
        case "glossary2":
            if (x_params.theme != undefined && x_params.theme != "default") {
                x_insertCSS(x_themePath + x_params.theme + "/css/glossary.css", function () {x_cssSetUp("colourChanger")});
            }
            else
            {
                x_cssSetUp("colourChanger");
            }
            break;
        case "colourChanger":
            x_insertCSS(x_templateLocation + "models_html5/colourChanger.css", function() {x_cssSetUp("theme")});
            break;
        case "colourChanger2":
            if (x_params.theme != undefined && x_params.theme != "default") {
                x_insertCSS(x_themePath + x_params.theme + "/css/colourChanger.css", function () {x_cssSetUp("theme")});
            }
            else
            {
                x_cssSetUp("theme");
            }
            break;
        case "theme":
            if (!xot_offline) {
                $.getScript(x_themePath + x_params.theme + '/' + x_params.theme + '.js'); // most themes won't have this js file
                // Set id
                $('link[href="' + x_themePath + x_params.theme + '/' + x_params.theme + '.js"]').attr('id', 'theme_js');
            }
            x_cssSetUp("responsive");
            break;
		case "responsive":
            if (x_params.responsive == "true") {
				// adds default responsiveText.css - in some circumstances this will be immediately disabled
				if (x_params.displayMode == "default" || $.isArray(x_params.displayMode)) { // immediately disable responsivetext.css after loaded
					x_insertCSS(x_templateLocation + "common_html5/css/responsivetext.css", function () {x_continueSetUp1()}, true);
				} else {
					x_insertCSS(x_templateLocation + "common_html5/css/responsivetext.css", function () {x_continueSetUp1()});
                }
			} else {
                x_insertCSS(x_templateLocation + "common_html5/css/responsivetext.css", function () {x_continueSetUp1()}, true);
			}
            break;
    }
}

function x_continueSetUp1() {
	//if (x_params.styles != undefined){
	//	$x_head.append('<style type="text/css">' +  x_params.styles + '</style>');
	//}

	if (x_pageInfo[0].type == "menu") {
		$x_pageNo.hide();
		if (x_params.navigation == "Menu") {
			$x_prevBtn.hide();
			$x_nextBtn.hide();
			$("#x_pageControls").css("display","block");
			$x_footerBlock.find(".x_floatRight button:eq(0)").css("border-right", "0px");
		}
	} else if (x_params.navigation == "Historic") {
		$x_pageNo.hide();
	} else {
		x_dialogInfo.push({type:'menu', built:false});
	}


    var trimmedNfo = $.trim(x_params.nfo);
    if (x_params.nfo != undefined && trimmedNfo != '') {
		$x_footerL.prepend('<button id="x_helpBtn"></button>');
		$("#x_helpBtn")
			.button({
				icons: {
					primary: "x_help"
				},
				label:	x_getLangInfo(x_languageData.find("helpButton")[0], "label", "Help"),
				text:	false
			})
			.attr("aria-label", $("#x_helpBtn").attr("title") + " " + x_params.newWindowTxt)
			.click(function() {
				window.open(x_evalURL(x_params.nfo), "_blank");
				$(this)
					.blur()
					.removeClass("ui-state-focus")
					.removeClass("ui-state-hover");
			});
	}


	if (x_params.glossary != undefined) {
		x_dialogInfo.push({type:'glossary', built:false});

		var i, len, item, word,
			items = x_params.glossary.split("||");

		for (i=0, len=items.length; i<len; i++) {
			item = items[i].split("|"),
			word = {word:item[0], definition:item[1]};

			if (word.word.replace(/^\s+|\s+$/g, "") != "" && word.definition.replace(/^\s+|\s+$/g, "") != "") {
				x_glossary.push(word);
			}
		}
		if (x_glossary.length > 0) {
			x_glossary.sort(function(a, b){ // sort by size
				return a.word.length > b.word.length ? -1 : 1;
			});

			$x_footerL.prepend('<button id="x_glossaryBtn"></button>');
			$("#x_glossaryBtn")
				.button({
					icons: {
						primary: "x_glossary"
					},
					label:	x_getLangInfo(x_languageData.find("glossaryButton")[0], "label", "Glossary"),
					text:	false
				})
				.attr("aria-label", $("#x_glossaryBtn").attr("title") + " " + x_params.dialogTxt)
				.click(function() {
					x_openDialog(
						"glossary",
						x_getLangInfo(x_languageData.find("glossary")[0], "label", "Glossary"),
						x_getLangInfo(x_languageData.find("glossary").find("closeButton")[0], "description", "Close Glossary List Button"),
						null,
						null,
						function () {
							$("#x_glossaryBtn")
								.blur()
								.removeClass("ui-state-focus")
								.removeClass("ui-state-hover");
						}
					);
				});

			$x_pageDiv
				.on("mouseenter", ".x_glossary", function(e) {
					$(this).trigger("mouseleave");

					var $this = $(this),
						myText = $this.text(),
						myDefinition, i, len;

					// Rip out the title attribute
					$this.data('title', $this.attr('title'));
					$this.attr('title', '');

					for (i=0, len=x_glossary.length; i<len; i++) {
						if (myText.toLowerCase() == $('<div>' + x_glossary[i].word + '</div>').text().toLowerCase()) {
							myDefinition = "<b>" + myText + ":</b><br/>"
							if (x_glossary[i].definition.indexOf("FileLocation + '") != -1) {
								myDefinition += "<img src=\"" + x_evalURL(x_glossary[i].definition) +"\">";
							} else {
								myDefinition += x_glossary[i].definition;
							}
						}
					}

					$x_mainHolder.append('<div id="x_glossaryHover" class="x_tooltip">' + myDefinition + '</div>');

					// Queue reparsing of MathJax - fails if no network connection
					try { MathJax.Hub.Queue(["Typeset",MathJax.Hub]); } catch (e){}

					$x_glossaryHover = $("#x_glossaryHover");
					$x_glossaryHover.css({
						"left"	:$(this).offset().left + 20,
						"top"	:$(this).offset().top + 20
					});
					$x_glossaryHover.fadeIn("slow");
					if (x_browserInfo.touchScreen == true) {
						$x_mainHolder.on("click.glossary", function() {}); // needed so that mouseleave works on touch screen devices
					}
				})
				.on("mouseleave", ".x_glossary", function(e) {
					$x_mainHolder.off("click.glossary");

					if ($x_glossaryHover != undefined) {
						$x_glossaryHover.remove();
					}

					// Put back the title attribute
					$this = $(this);
					$this.attr('title', $this.data('title'));
				})
				.on("mousemove", ".x_glossary", function(e) {
					var leftPos,
						topPos = e.pageY + 20;

					if (x_browserInfo.mobile == false) {
						leftPos = e.pageX + 20;
						if (leftPos + $x_glossaryHover.width() > $x_mainHolder.offset().left + $x_mainHolder.width()) {
							leftPos = e.pageX - $x_glossaryHover.width() - 20;
						}
						if (topPos + $x_glossaryHover.height() > $x_mainHolder.offset().top + $x_mainHolder.height()) {
							topPos = e.pageY - $x_glossaryHover.height() - 20;
						}
					} else {
						leftPos = ($x_mobileScroll.width() - $x_glossaryHover.width()) / 2;
						if (topPos + $x_glossaryHover.height() > $x_mobileScroll.height()) {
							topPos = $(this).offset().top - $x_glossaryHover.height() - 10;
						}
					}
					$x_glossaryHover.css({
						"left"	:leftPos,
						"top"	:topPos
					});
				})
				.on("focus", ".x_glossary", function(e) { // called when link is tabbed to
					$(this).trigger("mouseenter");
				})
				.on("focusout", ".x_glossary", function(e) {
					$(this).trigger("mouseleave");
				});
		}
	}

	if (x_params.media != undefined) {
		x_checkMediaExists(x_evalURL(x_params.media), function(mediaExists) {
			if (mediaExists) {
				$x_footerL.prepend('<button id="x_mediaBtn"></button>');
				$("#x_mediaBtn")
					.button({
						icons: {
							primary: "x_media"
						},
						label:	x_getLangInfo(x_languageData.find("mediaButton")[0], "label", "Media"),
						text:	false
					})
					.attr("aria-label", $("#x_mediaBtn").attr("title") + " " + x_params.newWindowTxt)
					.click(function() {
						$(this)
							.blur()
							.removeClass("ui-state-focus")
							.removeClass("ui-state-hover");

						x_openMediaWindow();
					});
			}
		});
	}

	//add optional progress bar
    if (x_params.progressBar != undefined && x_params.progressBar != "" && x_params.hideFooter != "true") {
		//add a div for the progress bar
		$('#x_footerBlock').append('<div id="x_footerProgress" style="margin:auto; width:20%; text-align:center"></div>');
		//add the progress bar
		$('#x_footerProgress').append('<div class="pbContainer"><div class="pbPercent pbBar">&nbsp;</div></div><p class="pbTxt"></p>');
		if (x_params.progressBar =="pBarNoCounter") {
			//remove page counter if that option selected
			$("#x_pageNo").remove();
		}
	}

	//add show/hide footer tools
	if (x_params.footerTools != "none" && x_params.hideFooter != "true") {
		var hideMsg=x_getLangInfo(x_languageData.find("footerTools")[0], "hide", "Hide footer tools");
		var showMsg=x_getLangInfo(x_languageData.find("footerTools")[0], "show", "Hide footer tools");
		//add a div for the show/hide chevron
		$('#x_footerBlock .x_floatLeft').before('<div id="x_footerShowHide" ><button id="x_footerChevron"><i class="fa fa-angle-double-left fa-lg " aria-hidden="true"></i></button></div>');
		$('#x_footerChevron').prop('title', hideMsg);

		//chevron to show/hide function
		$('#x_footerChevron').click(function(){
			$('#x_footerBlock .x_floatLeft').fadeToggle( "slow", function(){
					if($(this).is(':visible')){
						$('#x_footerChevron').html('<div class="chevron" id="chevron" title="Hide footer tools"><i class="fa fa-angle-double-left fa-lg " aria-hidden="true"></i></div>');
						$('#x_footerChevron').prop('title', hideMsg);
					}else{
						$('#x_footerChevron').html('<div class="chevron" id="chevron"><i class="fa fa-angle-double-right fa-lg " aria-hidden="true"></i></div>');
						$('#x_footerChevron').prop('title', showMsg);
					}
				});
			return(false);
		});
		if (x_params.footerTools =="hideFooterTools") {
			$('#x_footerBlock .x_floatLeft').hide();
			$('#x_footerChevron').html('<div class="chevron" id="chevron"><i class="fa fa-angle-double-right fa-lg " aria-hidden="true"></i></div>');
			$('#x_footerChevron').prop('title', showMsg);
		}
	}

	// default logo used is logo.png in modules/xerte/parent_templates/Nottingham/common_html5/
	// it's overridden by logo in theme folder
	// default & theme logos can also be overridden by images uploaded via Icon optional property
	$('#x_headerBlock img.x_icon').hide();
	$('#x_headerBlock img.x_icon').data('defaultLogo', $('#x_headerBlock .x_icon').attr('src'));

	var icPosition = "x_floatLeft";
	if (x_params.icPosition != undefined && x_params.icPosition != "") {
		icPosition = (x_params.icPosition === 'right') ? "x_floatRight" : "x_floatLeft";
	}
	$('#x_headerBlock img.x_icon').addClass(icPosition);

	var checkExists = function(type, fallback) {
	    if (type == 'LO') {
            $('#x_headerBlock img.x_icon').show();
            return;
        }
		$.ajax({
			url: $('#x_headerBlock img.x_icon').attr('src'),
			success: function() {
				$('#x_headerBlock img.x_icon').show();
				if (x_firstLoad == false) {x_updateCss();};

				// the theme logo is being used - add a class that will allow for the different size windows to display different logos
				if (type == 'theme') {
					$('#x_headerBlock img.x_icon').addClass('themeLogo');
				}

				if (x_params.icTip != undefined && x_params.icTip != "") {
					$('#x_headerBlock img.x_icon').attr('alt', x_params.icTip);
				} else {
					$('#x_headerBlock img.x_icon').attr('aria-hidden', 'true');
				}
			},
			error: function() {
				if (fallback == 'theme') {
					$('#x_headerBlock img.x_icon').attr('src', x_themePath + x_params.theme + "/logo.png");
					checkExists('theme', 'default');
				} else if (fallback == 'default') {
					$('#x_headerBlock img.x_icon').attr('src', $('#x_headerBlock img.x_icon').data('defaultLogo'));
					checkExists();
				}
			}
		});
	}

	var type, fallback;
	if (x_params.ic != undefined && x_params.ic != '') {
		$('#x_headerBlock img.x_icon').attr('src', x_evalURL(x_params.ic));
		type = 'LO';
		fallback = x_params.theme != undefined && x_params.theme != "default" ? 'theme' : 'default';
	} else if (x_params.theme != undefined && x_params.theme != "default") {
		type = 'theme';
		$('#x_headerBlock img.x_icon').attr('src', x_themePath + x_params.theme + "/logo.png");
	}
	checkExists(type, fallback);

	// ignores x_params.allpagestitlesize if added as optional property as the header bar will resize to fit any title
	$("#x_headerBlock h1").html(x_params.name);

	// strips code out of page title
    var div = $("<div>").html(x_params.name);
    var strippedText = div.text();
	if (strippedText != "") {
		document.title = strippedText;
	}

	var prevIcon = "x_prev";
	if (x_params.navigation == "Historic" || x_params.navigation == "LinearWithHistoric") {
		prevIcon = "x_prev_hist";
	}

	$x_prevBtn
		.button({
			icons: {
				primary: prevIcon
			},
			label:	x_getLangInfo(x_languageData.find("backButton")[0], "label", "Back"),
			text:	false
		})
        .attr("aria-label", $("#x_prevBtn").attr("title"))
		.click(function() {
			if (x_params.navigation != "Historic" && x_params.navigation != "LinearWithHistoric") {
				x_changePage(x_currentPage -1);
			} else {
				//ensure button is historic style
				prevIcon = "x_prev_hist";
					$x_prevBtn
						.button({
							icons: {
							primary: prevIcon
					},
			label:	x_getLangInfo(x_languageData.find("backButton")[0], "label", "Back"),
			text:	false
		})
				var prevPage = x_pageHistory[x_pageHistory.length-2];
				x_pageHistory.splice(x_pageHistory.length - 2, 2);
				//check if history is empty and if so allow normal back navigation and change to normal back button
				if(prevPage==undefined && x_currentPage > 0 && x_params.navigation == "LinearWithHistoric"){
					prevIcon = "x_prev";
					$x_prevBtn
						.button({
							icons: {
							primary: prevIcon
					},
			label:	x_getLangInfo(x_languageData.find("backButton")[0], "label", "Back"),
			text:	false
		})
				   x_changePage(x_currentPage -1);
				   }
				//disable normal back navigation if 1st page
				if (x_currentPage <=1){
					$x_prevBtn
            .button("disable")
            .removeClass("ui-state-focus")
            .removeClass("ui-state-hover");
					}
				x_changePage(prevPage);
			}
			$(this)
				.removeClass("ui-state-focus")
				.removeClass("ui-state-hover");
		});

	$x_nextBtn
		.button({
			icons: {
				primary: "x_next"
			},
			label:	x_getLangInfo(x_languageData.find("nextButton")[0], "label", "Next"),
			text:	false
		})
        .attr("aria-label", $("#x_nextBtn").attr("title"))
		.click(function() {
		if (x_params.navigation == "Historic" || x_params.navigation == "LinearWithHistoric") {
				//when moving forward history is generated so ensure button is historic style
				prevIcon = "x_prev_hist";
					$x_prevBtn
						.button({
							icons: {
							primary: prevIcon
					},
			label:	x_getLangInfo(x_languageData.find("backButton")[0], "label", "Back"),
			text:	false
		})
			}
			x_changePage(x_currentPage+1);
			$(this)
				.removeClass("ui-state-focus")
				.removeClass("ui-state-hover");
		});


	var	menuIcon = "x_info",
		menuLabel = x_getLangInfo(x_languageData.find("tocButton")[0], "label", "Table of Contents");

	if (x_params.navigation == "Historic") {
		menuIcon = "x_home";
		menuLabel = x_getLangInfo(x_languageData.find("homeButton")[0], "label", "Home");
		$x_menuBtn.addClass("x_home");
	}

	$x_menuBtn
		.button({
			icons: {
				primary: menuIcon
			},
			label:	menuLabel,
			text:	false
		})
		.attr("aria-label", $("#x_menuBtn").attr("title") + (x_params.navigation == "Linear" || x_params.navigation == undefined ? " " + x_params.dialogTxt : ""))
		.click(function() {
			if (x_params.navigation == "Linear" || x_params.navigation == "LinearWithHistoric" || x_params.navigation == undefined) {
				x_openDialog(
					"menu",
					x_getLangInfo(x_languageData.find("toc")[0], "label", "Table of Contents"),
					x_getLangInfo(x_languageData.find("toc").find("closeButton")[0], "description", "Close Table of Contents"),
					null,
					null,
					function () {
						$x_menuBtn
							.blur()
							.removeClass("ui-state-focus")
							.removeClass("ui-state-hover");
					}
				);
			} else if (x_params.navigation == "Historic" && x_params.homePage != undefined && x_params.homePage != "") {
				x_navigateToPage(false,{type:'linkID',ID:x_params.homePage});
			} else {
				x_changePage(0);
			}
			$(this)
				.blur()
				.removeClass("ui-state-focus")
				.removeClass("ui-state-hover");
		});

	x_dialogInfo.push({type:'colourChanger', built:false});
	$x_colourChangerBtn
		.button({
			icons: {
				primary: "x_colourChanger"
			},
			label:	x_getLangInfo(x_languageData.find("colourChanger")[0], "tooltip", "Change Colour"),
			text:	false
		})
		.attr("aria-label", $("#x_colourChangerBtn").attr("title") + " " + x_params.dialogTxt)
		.click(function() {
			x_openDialog(
				"colourChanger",
				x_getLangInfo(x_languageData.find("colourChanger")[0], "label", "Colour Changer"),
				x_getLangInfo(x_languageData.find("colourChanger").find("closeButton")[0], "description", "Close Colour Changer"),
				null,
				null,
				function () {
					$x_colourChangerBtn
						.blur()
						.removeClass("ui-state-focus")
						.removeClass("ui-state-hover");
				}
			);
		});

	if (x_params.kblanguage != undefined) {
		if (typeof charpadstr != 'undefined')
		{
			var xml = $($.parseXML(charpadstr));
			x_charmapLoaded(xml);
		}
		else {
			$.ajax({
				type: "GET",
				url: x_templateLocation + "common_html5/charPad.xml",
				dataType: "xml",
				success: function (xml) {
					x_charmapLoaded(xml);
				},
				error: function () {
					delete x_params["kblanguage"];
				}
			});
		}
	}


	$x_window.resize(function() {
		if (x_fillWindow == true) {
			if (this.resizeTo) {
				clearTimeout(this.resizeTo);
			}
			this.resizeTo = setTimeout(function() {
				$(this).trigger("resizeEnd");
			}, 200);
		}
	});

	$x_window.on("resizeEnd", function() {
		if (x_pageLoadPause !== false && $x_body.width() > 0) {
			var pagePaused = x_pageLoadPause;
			x_pageLoadPause = false;
			x_changePage(pagePaused)
			
		} else {
			x_updateCss();
		}
	});


	// ** swipe to change page on touch screen devices - taken out as caused problems with drag and drop activities - need to be able to disable it for these activities
	if (x_browserInfo.touchScreen == true) {
		/*
		var numTouches = 0;
		var mouseDown = [0, 0]; // [x, y]
		var mouseUp = [0, 0];
		*/

		// Set start orientation
        if (window.orientation == 0 || window.orientation == 180) {
            x_browserInfo.orientation = "portrait";
        } else {
            x_browserInfo.orientation = "landscape";
        }

		$x_pageHolder.bind("touchstart", function(e) {
			/*
			var touch = e.originalEvent.touches[0];
			numTouches = e.originalEvent.touches.length;
			mouseDown = [touch.pageX, touch.pageY];
			*/
			$x_mainHolder.off("click.glossary");
			if ($x_glossaryHover != undefined) {
				$x_glossaryHover.remove();
			}
		});

		$x_pageHolder.bind("touchend", function(e) {
			/*
			if (numTouches == 1) { // if >1 then don't use to change page (user may be zooming)
				var touch = e.originalEvent.changedTouches[0];
				mouseUp = [touch.pageX, touch.pageY];
				var dif = [mouseDown[0] - mouseUp[0], mouseDown[1] - mouseUp[1]];
				// only swipes of min 75px & swipes where xDif > yDif will change page to avoid scrolling up and down triggering page change
				if (Math.abs(dif[0]) > Math.abs(dif[1])) {
					if (dif[0] >= 75) {
						if (x_pageInfo.length > x_currentPage + 1) {
							x_changePage(x_currentPage+1);
						}
					} else if (dif[0] <= -75) {
						if (x_currentPage != 0) {
							x_changePage(x_currentPage-1);
						}
					}
				}
			}
			*/
		});

		// call x_updateCss function on orientation change (resize event should trigger this but it's inconsistent)
		$x_window.on("orientationchange", function() {
			if (x_fillWindow == true) {
				var newOrientation;
				if (window.orientation == 0 || window.orientation == 180) {
					newOrientation = "portrait";
				} else {
					newOrientation = "landscape";
				}
				if (newOrientation != x_browserInfo.orientation) {
					x_browserInfo.orientation = newOrientation;
					x_updateCss(true);
				}
			}
		});
	}

	if (x_params.background != undefined && x_params.background != "") {

		x_checkMediaExists(x_evalURL(x_params.background), function(mediaExists) {
			if (mediaExists) {
				var alpha = 30;
                var lo_objectfit =  (x_params.backgroundFit != undefined && x_params.backgroundFit == "cover" ? "cover" : "fill");
				if (x_params.backgroundopacity != undefined) {
					alpha = x_params.backgroundopacity;
				}
				if (x_params.backgroundGrey == "true") {
					// uses a jquery plugin as just css way won't work in all browsers
					x_insertCSS(x_templateLocation + "common_html5/js/gray-gh-pages/css/gray.css", function() {
						$x_background.append('<img id="x_mainBg" class="grayscale" src="' + x_evalURL(x_params.background) + '"/>');
						$("#x_mainBg").css({
							"opacity"	:Number(alpha/100),
                            "object-fit"    : lo_objectfit,
							"filter"	:"alpha(opacity=" + alpha + ")"
						});
						// grey function called on image when unhidden later as it won't work properly otherwise
					});
				} else {
					$x_background.append('<img id="x_mainBg" src="' + x_evalURL(x_params.background) + '"/>');
					$("#x_mainBg").css({
						"opacity"	:Number(alpha/100),
                        "object-fit"    : lo_objectfit,
						"filter"	:"alpha(opacity=" + alpha + ")"
					});
				}
				if (x_params.backgroundDark != undefined && x_params.backgroundDark != "" && x_params.backgroundDark != "0") {
					$x_background.append('<div id="x_bgDarken" />');
					$("#x_bgDarken").css({
						"opacity" :Number(x_params.backgroundDark/100),
						"filter" :"alpha(opacity=" + x_params.backgroundDark + ")"
					});
				}

				x_continueSetUp2();
			} else {
				x_continueSetUp2();
			}
		});

	} else {
		x_continueSetUp2();
	}
}

function x_continueSetUp2() {
	// store language data for mediaelement buttons - use fallbacks in mediaElementText array if no lang data
	var mediaElementText = [{name:"stopButton", label:"Stop", description:"Stop Media Button"},{name:"playPauseButton", label:"Play/Pause", description:"Play/Pause Media Button"},{name:"muteButton", label:"Mute Toggle", description:"Toggle Mute Button"},{name:"fullscreenButton", label:"Fullscreen", description:"Fullscreen Movie Button"},{name:"captionsButton", label:"Captions/Subtitles", description:"Show/Hide Captions Button"}];

	for (var i=0, len=mediaElementText.length; i<len; i++) {
		x_mediaText.push({
			label: x_getLangInfo(x_languageData.find("mediaElementControls").find(mediaElementText[i].name)[0], "label", mediaElementText[i].label[0]),
			description: x_getLangInfo(x_languageData.find("mediaElementControls").find(mediaElementText[i].name)[0], "description", mediaElementText[i].description[0])
		});
	}
	x_mediaText.push(
		{label: x_getLangInfo(x_languageData.find("mediaElementControls")[0], "video", "")},
		{label: x_getLangInfo(x_languageData.find("mediaElementControls")[0], "audio", "")}
	);

	// script optional property added after all interface set up & before any pages load
	if (x_params.script != undefined && x_params.script != "") {
		$x_head.append('<script>' +  x_params.script + '</script>');
	}

	// Setup beforeunload
    window.onbeforeunload = XTTerminate;

    XTInitialise(x_params.category); // initialise here, because of XTStartPage in next function
	// Set course and module options AFTER XTInitialise
    if (x_params.course != undefined && x_params.course != "")
    {
        XTSetOption('course', x_params.course);
    }
    if (x_params.module != undefined && x_params.module != "")
    {
        XTSetOption('module', x_params.module);
    }

    x_navigateToPage(true, x_startPage);
}

// function checks whether a media file exists
function x_checkMediaExists(src, callback) {
	$.get(src)
		.done(function() { callback(true); })
		.fail(function() {
			// if it's an exported project being viewed locally $.get will always fail so force it to work anyway
			if (location.hostname != "") {
				callback(false);
			} else {
				callback(true);
			}
		});
}

function x_charmapLoaded(xml)
{
    x_dialogInfo.push({type:'language', built:false});

    var $charPadData = $(xml).find("data").find("language[name='" + x_params.kblanguage + "']"),
        specCharsLower = $charPadData.find("char[case='lower']").text().split(""),
        specCharsUpper = $charPadData.find("char[case='upper']").text().split("");

    for (var i=0, len=specCharsLower.length; i<len; i++) {
        x_specialChars.push({lower:specCharsLower[i] ,upper:specCharsUpper[i]});
    }

    $x_pageDiv.on("focus", "textarea,input[type='text'],input:not([type])",function() {
        var $this = $(this);
        if ($this.attr("readonly") == undefined) { // focus is on editable text field
            x_inputFocus = this;
            if ($("#x_language").length == 0 && x_specialChars.length != 0) { // language dialog isn't already open
                x_openDialog("language", x_getLangInfo(x_languageData.find("kbLanguage")[0], "label", "Special Characters"), x_getLangInfo(x_languageData.find("kbLanguage").find("closeButton")[0], "description", "Close special character list button"), {left:"left", top:"top", width:"small"});
            }
        }
    });
}

function x_dialog(text){

    window.open('','','width=300,height=450').document.write('<p style="font-family:sans-serif; font-size:12">' + text + '</p>');

}


// function called after interface first setup (to load 1st page) and for links to other pages in the text on a page
function x_navigateToPage(force, pageInfo) { // pageInfo = {type, ID}
    var page = XTStartPage();
    if (force && page >= 0) {  // this is a resumed tracked LO, got to the page saved by the LO
        x_changePage(page);
    }
    else {
    	// Handle page scope deeplinking
    	if ((pageInfo.ID).indexOf('|') >= 0) {
    		x_deepLink = (pageInfo.ID).split('|')[1].trim();
    		if ($.isNumeric(x_deepLink)) x_deepLink = parseInt(x_deepLink - 1);

    		pageInfo.ID = (pageInfo.ID).split('|')[0].trim();
    	}
    	else {
    		x_deepLink = '';
    	}

        if (pageInfo.type == "resume" && (parseInt(pageInfo.ID) > 0)  && (parseInt(pageInfo.ID) <= x_pages.length)) {
            x_changePage(parseInt(pageInfo.ID) - 1);

        }
        else if (pageInfo.type == "linkID" || pageInfo.type == "pageID") {
        	if ((pageInfo.ID).indexOf('[') > -1 && (pageInfo.ID).indexOf(']') > -1) {
				switch ((pageInfo.ID).substring(1, pageInfo.ID.length-1)) {
					case "next":
						if (x_currentPage < x_pages.length)
							x_changePage(x_currentPage + 1);
						break;
					case "previous":
						if (x_currentPage > 0)
							x_changePage(x_currentPage - 1);
						break;
					case "first":
						x_changePage(0);
						break;
					case "last":
						x_changePage(x_pages.length-1);
						break;
				}
        	}
        	else {
				page = x_lookupPage(pageInfo.type, pageInfo.ID);
				if ($.isArray(page)) {
					x_deepLink = page.slice(1, page.length);
					x_changePage(page[0]);
				}
				else if (page != null) {
					x_changePage(page);
				}
				else {
					x_deepLink = "";
					if (force == true) {
						x_changePage(0);
					}
				}
			}
        }
        else {
            page = parseInt(pageInfo.ID);
            if (page > 0 && page <= x_pages.length) {
                x_changePage(page-1);
            }
            else {
            	x_deepLink = "";
            	if (force == true) {
                	x_changePage(0);
                }
            }
        }
    }
}


// function returns page no. of page with matching linkID / pageID
function x_lookupPage(pageType, pageID) {
    for (var i=0, len = x_pageInfo.length; i<len; i++) {
        if (
			(pageType == "linkID" && x_pageInfo[i].linkID && x_pageInfo[i].linkID == pageID) ||
			(pageType == "pageID" && x_pageInfo[i].pageID && x_pageInfo[i].pageID == pageID)
        ) {
            return i
        }
    }

	// added this to catch any broken links because the HTML editor always creates links of linkID type even when there was a pageID (pageID is now deprecated)
	for (var i=0, len = x_pageInfo.length; i<len; i++) {
		if (
			pageType == "linkID" && x_pageInfo[i].pageID && x_pageInfo[i].pageID == pageID
		) {
			return i;
		}
	}

	// Lastly we now need to check children of each page
	var tempArray = [];
	var checkChildIDs = function(ids) {
		for (var i=0, j=-1; i<ids.length; i++) {
			if ($.isArray(ids[i])) {
				tempArray.push(j);
				var result = checkChildIDs(ids[i]);
				if (result == true) {
					return true;
				} else {
					tempArray = tempArray.splice(0, tempArray.length-1);
				}
			} else {
				j++;
				if (ids[i] == pageID) {
					tempArray.push(j);
					return true;
				}
			}
		}
		return null;
	}

	for (var i=0; i<x_pageInfo.length; i++) {
		tempArray = tempArray.splice();
		tempArray.push(i);
		if (x_pageInfo[i].type != 'menu') {
			var result = checkChildIDs(x_pageInfo[i].childIDs);
			if (result == true) {
				return tempArray;
				break;
			}
		}
	}

	return null;
}


// function called on page change to remove old page and load new page model
// If x_currentPage == -1, than do not try to exit tracking of the page
function x_changePage(x_gotoPage) {
	
	if ($x_body.width() == 0 && $x_body.height() == 0) {
		// don't load page yet as they probably won't load properly (possibly because it's being loaded in an iframe on non-active tab on a navigator)
		x_pageLoadPause = x_gotoPage;
		
	} else {
		// Prevent content from behaving weird as we remove css files
		$("#x_pageDiv").hide();


		var modelfile = x_pageInfo[x_gotoPage].type;

		var classList = $x_mainHolder.attr('class') == undefined ? [] : $x_mainHolder.attr('class').split(/\s+/);
		$.each(classList, function(index, item) {
			if (item.substring(0,2) == "x_" && item.substr(item.length-5,item.length) == "_page") {
				$x_mainHolder.removeClass(item);
			}
		});

		$x_mainHolder.addClass("x_" + modelfile + "_page");

		x_insertCSS(x_templateLocation + "models_html5/" + modelfile + ".css", function () {
			x_changePageStep2(x_gotoPage);
		}, false, "page_model_css");
	}
}

function x_changePageStep2(x_gotoPage) {
    x_insertCSS(x_themePath + x_params.theme + '/' + x_params.theme + '.css', function () {
            x_changePageStep3(x_gotoPage);
    }, false, "theme_css", true);
}

function x_changePageStep3(x_gotoPage) {
    if (x_params.theme != undefined && x_params.theme != "default") {
        // adds responsiveText.css for theme if it exists - in some circumstances this will be immediately disabled
        if (x_params.displayMode == "default" || $.isArray(x_params.displayMode)) { // immediately disable responsivetext.css after loaded
            x_insertCSS(x_themePath + x_params.theme + '/responsivetext.css', function () {
                x_changePageStep4(x_gotoPage);
            }, true, "theme_responsive_css", true);
        } else {
            x_insertCSS(x_themePath + x_params.theme + '/responsivetext.css', function () {
                x_changePageStep4(x_gotoPage);
            }, (x_params.responsive == "false"), "theme_responsive_css", true);
        }
    }
    else {
        x_changePageStep4(x_gotoPage);
    }
}
function x_changePageStep4(x_gotoPage) {
    if (x_params.stylesheet != undefined && x_params.stylesheet != "") {
        x_insertCSS(x_evalURL(x_params.stylesheet), function () {
            x_changePageStep5(x_gotoPage);
        }, false, "lo_sheet_css");
    }
    else {
        x_changePageStep5(x_gotoPage);
    }
}
function x_endPageTracking(pagechange, x_gotoPage) {
    // End page tracking of x_currentPage
    if (x_currentPage != -1 &&  (x_currentPage != 0 || x_pageInfo[0].type != "menu") && (!pagechange || x_currentPage != x_gotoPage))
    {
        var pageObj;

        if (x_pageInfo[x_currentPage].type == "text") {
            pageObj = simpleText;
        } else {
            pageObj = eval(x_pageInfo[x_currentPage].type);
        }
        if (typeof pageObj.leavePage === 'function')
        {
            pageObj.leavePage();
        }
        // calls function in any customHTML that's been loaded into page
        if ($(".customHTMLHolder").length > 0)
        {
            if (typeof customHTML.leavePage() === 'function')
            {
                customHTML.leavePage();
            }
        }
        XTExitPage(x_currentPage);
    }
}

function x_changePageStep5(x_gotoPage) {
	var prevPage = x_currentPage;

    if (x_params.styles != undefined){
        $x_head.append('<style type="text/css" id="page_css">' +  x_params.styles + '</style>');
    }

    // End page tracking of x_currentPage
    x_endPageTracking(true, x_gotoPage);

    x_currentPage = x_gotoPage;
    x_currentPageXML = x_pages[x_currentPage];


    if ($x_pageDiv.children().length > 0) {
        // remove everything specific to previous page that's outside $x_pageDiv
        $(".pageBg").hide();

		if ($("#x_mainBg").length > 0 && $("#x_bgDarken").length > 0 && x_params.backgroundDark != undefined && x_params.backgroundDark != "" && x_params.backgroundDark != "0") {
			$("#x_bgDarken")
				.css({
					"opacity" :Number(x_params.backgroundDark/100),
					"filter" :"alpha(opacity=" + x_params.backgroundDark + ")"
				})
				.show();
		} else {
			$("#x_bgDarken").hide();
		}

		$("#x_mainBg").show();
        $(".x_pageNarration").remove(); // narration flash / html5 audio player
        $("body div.me-plugin:not(#x_pageHolder div.me-plugin)").remove();
        $(".x_popupDialog").parent().detach();
        $("#x_pageTimer").remove();
		$x_helperText.empty();
        $(document).add($x_pageHolder).off(".pageEvent"); // any events in page models added to document or pageHolder should have this namespace so they can be removed on page change - see hangman.html for example

        // stop any swfs on old page before detaching it so that any audio stops playing (problem in IE only)
        if ($x_pageDiv.find("object").length > 0) {
            var $obj = $x_pageDiv.find("object"),
                flashMovie = x_getSWFRef($obj.attr("id"));

            //flashMovie.StopPlay(); // ** fix removed as it causes problems if the LO is resized (changing page stops working - don't know why)
        }

        if (x_pageInfo[prevPage].built != false) {
            $("#x_pageDiv div:lt(" + $x_pageDiv.children().length + ")")
                .data("size", [$x_mainHolder.width(), $x_mainHolder.height()]) // save current LO size so when page is next loaded we can check if it has changed size and if anything needs updating
                .detach();

        } else {
            $("#x_pageDiv div:lt(" + $x_pageDiv.children().length + ")").remove();
        }
    }

    if (x_params.navigation == "Historic" || x_params.navigation == "LinearWithHistoric") {
        x_pageHistory.push(x_currentPage);
    }

    // change page title and add narration / timer before the new page loads so $x_pageHolder margins can be sorted - these often need to be right so page layout is calculated correctly
    if (x_pageInfo[0].type == "menu" && x_currentPage == 0) {
        pageTitle = x_getLangInfo(x_languageData.find("toc")[0], "label", "Table of Contents");
		
		x_changePageStep6();
		
    } else {
        pageTitle = x_currentPageXML.getAttribute("name");

		// add screen reader info for this page type (if exists)
		var screenReaderInfo = x_pageInfo[x_currentPage].type != "nav" ? x_pageInfo[x_currentPage].type : x_currentPageXML.getAttribute("type") == "Acc" ? "accNav" : x_currentPageXML.getAttribute("type") == "Button" ? "buttonNav" : x_currentPageXML.getAttribute("type") == "Col" ? "columnPage" : x_currentPageXML.getAttribute("type") == "Slide" ? "slideshow" : "tabNav";
		if (x_getLangInfo(x_languageData.find("screenReaderInfo").find(screenReaderInfo)[0], "description", undefined) != undefined) {
			$x_helperText.html('<h3>' + x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "label", "Screen Reader Information") + ':</h3><p>' + x_getLangInfo(x_languageData.find("screenReaderInfo").find(screenReaderInfo)[0], "description", "") + '</p>');
		}

		var extraTitle = "";
		if (x_params.authorSupport == "true" && x_currentPageXML.getAttribute("hidePage") == "true") {
			// sort the string - language data wasn't available when hidePageInfo was created
			var str = x_currentPageXML.getAttribute("hidePageInfo")
				.replace('{from}', x_getLangInfo(x_languageData.find("hiddenPage")[0], "from", "") != "" && x_getLangInfo(x_languageData.find("hiddenPage")[0], "from", "") != null ? x_getLangInfo(x_languageData.find("hiddenPage")[0], "from", "") : 'Hide from')
				.replace('{until}', x_getLangInfo(x_languageData.find("hiddenPage")[0], "until", "") != "" && x_getLangInfo(x_languageData.find("hiddenPage")[0], "until", "") != null ? x_getLangInfo(x_languageData.find("hiddenPage")[0], "until", "") : 'Hide until')
				.replace('{hidden}', x_getLangInfo(x_languageData.find("hiddenPage")[0], "hidden", "") != "" && x_getLangInfo(x_languageData.find("hiddenPage")[0], "hidden", "") != null ? x_getLangInfo(x_languageData.find("hiddenPage")[0], "hidden", "") : 'This page is currently hidden in live projects')
				.replace('{shown}', x_getLangInfo(x_languageData.find("hiddenPage")[0], "shown", "") != "" && x_getLangInfo(x_languageData.find("hiddenPage")[0], "shown", "") != null ? x_getLangInfo(x_languageData.find("hiddenPage")[0], "shown", "") : 'This page is currently shown in live projects');

			extraTitle = ' <span class="alert">' + str + '</span>';
		}

		pageTitle = pageTitle + extraTitle;
		
		x_addCountdownTimer();
		x_addNarration('x_changePageStep6', '');
    }
}

function x_changePageStep6() {

    $("#x_headerBlock h2").html(pageTitle);

    x_updateCss(false);

	$("#x_pageDiv").show();

    // x_currentPage has already been viewed so is already loaded
    if (x_pageInfo[x_currentPage].built != false) {
        // Start page tracking -- NOTE: You HAVE to do this before pageLoad and/or Page setup, because pageload could trigger XTSetPageType and/or XTEnterInteraction
		// Use a clean text version of the page title
        var label = $('<div>').html(pageTitle).text();
        if (x_currentPageXML != "menu" && x_currentPageXML.getAttribute("trackinglabel") != null && x_currentPageXML.getAttribute("trackinglabel") != "")
        {
            label = x_currentPageXML.getAttribute("trackinglabel");
        }
        XTEnterPage(x_currentPage, label);

        var builtPage = x_pageInfo[x_currentPage].built;
        $x_pageDiv.append(builtPage);
        builtPage.hide();
        builtPage.fadeIn();

		if ((x_pageInfo[0].type != "menu" || x_currentPage != 0) && x_currentPageXML.getAttribute("script") != undefined && x_currentPageXML.getAttribute("script") != "" && x_currentPageXML.getAttribute("run") == "all") {
			$("#x_pageScript").remove();
			$("#x_page" + x_currentPage).append('<script id="x_pageScript">' +  x_currentPageXML.getAttribute("script") + '</script>');
		}

		// show page background & hide main background
		if ($(".pageBg#pageBg" + x_currentPage).length > 0) {
			$(".pageBg#pageBg" + x_currentPage).show();
			if ((x_pageInfo[0].type != "menu" || x_currentPage != 0) && x_currentPageXML.getAttribute("bgImageDark") != undefined && x_currentPageXML.getAttribute("bgImageDark") != "" && x_currentPageXML.getAttribute("bgImageDark") != "0") {
				$("#x_bgDarken")
					.css({
						"opacity" :Number(x_currentPageXML.getAttribute("bgImageDark")/100),
						"filter" :"alpha(opacity=" + x_currentPageXML.getAttribute("bgImageDark") + ")"
					})
					.show();
			} else {
				$("#x_bgDarken").hide();
			}

			if ($("#x_mainBg").length > 0) {
				$("#x_mainBg").hide();
			}
		}

        x_setUpPage();

        // get short page type var
        var pt = x_pageInfo[x_currentPage].type;
        if (pt == "text") pt = 'simpleText'; // errors if you just call text.pageChanged()

        // calls function in current page model (if it exists) which does anything needed to reset the page (if it needs to be reset)
        if (typeof window[pt].pageChanged === "function") window[pt].pageChanged();

        // calls function in any customHTML that's been loaded into page
        if ($(".customHTMLHolder").length > 0) {
                if (typeof customHTML.pageChanged === "function") {
                	customHTML.pageChanged();
                }
        }
		
		// updates variables as their values might have changed
		if (x_currentPageXML.getAttribute('varUpdate') != 'false') {
			// variables on screen
			if (x_variables.length > 0 && $('.x_var').length > 0) {
				x_updateVariable();
			}
			
			// updates xml for page otherwise text that isn't on screen yet won't be updated
			x_findText(x_currentPageXML, false, ['variables']);
		}

        // checks if size has changed since last load - if it has, call function in current page model which does anything needed to adjust for the change
        var prevSize = builtPage.data("size");
        if (prevSize[0] != $x_mainHolder.width() || prevSize[1] != $x_mainHolder.height()) {
			if (typeof window[pt].sizeChanged === "function") window[pt].sizeChanged();

            // calls function in any customHTML that's been loaded into page
            if ($(".customHTMLHolder").length > 0) {
                if (typeof customHTML.sizeChanged === "function") {
                	customHTML.sizeChanged();
                }
            }
        }

    // x_currentPage hasn't been viewed previously - load model file
    } else {
		function loadModel() {
			$x_pageDiv.append('<div id="x_page' + x_currentPage + '"></div>');
			$("#x_page" + x_currentPage).css("visibility", "hidden");

			if (x_currentPage != 0 || x_pageInfo[0].type != "menu") {
				// check page text for anything that might need replacing / tags inserting (e.g. glossary words, links...)
				if (x_currentPageXML.getAttribute("disableGlossary") == "true") {
					x_findText(x_currentPageXML, true, ["glossary"]); // exclude glossary
				} else {
					x_findText(x_currentPageXML);
				}
			}

			// Start page tracking -- NOTE: You HAVE to do this before pageLoad and/or Page setup, because pageload could trigger XTSetPageType and/or XTEnterInteraction
            var label = $('<div>').html(pageTitle).text();
            if ((x_pageInfo[0].type != "menu" || x_currentPage != 0) && x_currentPageXML.getAttribute("trackinglabel") != null && x_currentPageXML.getAttribute("trackinglabel") != "")
            {
                label = x_currentPageXML.getAttribute("trackinglabel");
            }
            XTEnterPage(x_currentPage, label);

			var modelfile = x_pageInfo[x_currentPage].type;
			if (typeof modelfilestrs[modelfile] != 'undefined')
			{
				$("#x_page" + x_currentPage).html(modelfilestrs[modelfile]);
				x_loadPage("", "success", "");
			}
			else {
				$("#x_page" + x_currentPage).load(x_templateLocation + "models_html5/" + modelfile + ".html", x_loadPage);
			}
		}

		// show page background & hide main background
		if ((x_pageInfo[0].type != "menu" || x_currentPage != 0) && x_currentPageXML.getAttribute("bgImage") != undefined && x_currentPageXML.getAttribute("bgImage") != "") {
			x_checkMediaExists(x_currentPageXML.getAttribute("bgImage"), function(mediaExists) {
				if (mediaExists) {
					if (x_currentPageXML.getAttribute("bgImageGrey") == "true") {
						// load css for jquery greyscale plugin if not already loaded
						if (!$("link[href='" + x_templateLocation + "common_html5/js/gray-gh-pages/css/gray.css']").length) {
							x_insertCSS(x_templateLocation + "common_html5/js/gray-gh-pages/css/gray.css", x_loadPageBg(loadModel));
						} else {
							// css required will already be loaded (either already loaded for this title page or already loaded for LO bg image)
							x_loadPageBg(loadModel);
						}
					} else {
						x_loadPageBg(loadModel);
					}
				} else {
					loadModel();
				}
			});

		} else {
			loadModel();
		}
    }

    // Queue reparsing of MathJax - fails if no network connection
    try { MathJax.Hub.Queue(["Typeset",MathJax.Hub]); } catch (e){}

    x_updateHash();

	if (x_pageInfo[x_currentPage].built != false) {
		x_doDeepLink();
	}
}

// trigger that page contents have updated
function x_pageContentsUpdated(){
	// Queue reparsing of MathJax - fails if no network connection
    try { MathJax.Hub.Queue(["Typeset",MathJax.Hub]); } catch (e){}
}

// function used for hashtag deeplinking
function x_updateHash() {
    if (x_params.resume === "true") {
        window.location.hash = "#resume=" + (x_currentPage+1);
    } else {
        if (window.location.href.indexOf('#') > -1) {
            if ("pushState" in history) {
                history.pushState("", document.title, window.location.pathname + window.location.search);

            } else {
                var tempV = document.body.scrollTop;
                var tempH = document.body.scrollLeft;
                window.location.hash = "";
                //window.location.href = window.location.href.split('#')[0];
                document.body.scrollTop = tempV;
                document.body.scrollLeft = tempH;
            }
        }
    }
}


// function called on page model load
function x_loadPage(response, status, xhr) {
    if (status == "error") {
        $("#x_pageDiv div").html(x_getLangInfo(x_languageData.find("errorPage")[0], "label", "No template is currently available for this page type") + " (" + x_pageInfo[x_currentPage].type + ")");
        x_pageLoaded();
    }

    // Queue reparsing of MathJax - fails if no network connection
    try { MathJax.Hub.Queue(["Typeset",MathJax.Hub]); } catch (e){}

    x_setUpPage();
}


// function to do deeplink
function x_doDeepLink() {
	if (x_deepLink !== "") {
		if (window[x_pageInfo[x_currentPage].type] && (typeof window[x_pageInfo[x_currentPage].type].deepLink === "function")) {
			window[x_pageInfo[x_currentPage].type].deepLink(decodeURIComponent(x_deepLink));
			x_deepLink = "";
		}
	}
}


// function called when page model loaded/appended - sorts button states etc.
function x_setUpPage() {
    $x_pageDiv.parent().scrollTop(0);
    $("#x_pageDiv div").scrollTop(0);
    $x_mobileScroll.scrollTop(0);

    $x_pageNo
        .html((x_currentPage+1) + " / " + x_pageInfo.length)
        .attr("title", x_getLangInfo(x_languageData.find("vocab").find("page")[0], false, "Page") + " " + (x_currentPage+1) + " " + x_getLangInfo(x_languageData.find("vocab").find("of")[0], false, "of") + " " + x_pageInfo.length);

    if (x_pageInfo[0].type == "menu" && x_currentPage == 0) {
        $x_menuBtn
            .button("disable")
            .removeClass("ui-state-focus")
            .removeClass("ui-state-hover");
    } else {
        $x_menuBtn.button("enable");
    }


    if (x_currentPage > 0) {
        $x_prevBtn.button("enable");
    } else if (x_params.navigation != "Historic" && x_params.navigation != "LinearWithHistoric" || (x_params.navigation == "Historic" && x_pageHistory.length <= 1)) {
        $x_prevBtn
            .button("disable")
            .removeClass("ui-state-focus")
            .removeClass("ui-state-hover");
    }

    if (x_pageInfo.length > x_currentPage + 1) {
        $x_nextBtn.button("enable");
    } else {
        $x_nextBtn
            .button("disable")
            .removeClass("ui-state-focus")
            .removeClass("ui-state-hover");
    }

	// navigation buttons can be disabled on a page by page basis
	if ((x_pageInfo[0].type != "menu" || (x_pageInfo[0].type == "menu" && x_currentPage != 0)) && (x_currentPageXML.getAttribute("home") != undefined || x_currentPageXML.getAttribute("back") != undefined || x_currentPageXML.getAttribute("next") != undefined)) {
		if (x_currentPageXML.getAttribute("home") == "false") {
			$x_menuBtn.button("disable");
		}
		if (x_currentPageXML.getAttribute("back") == "false") {
			$x_prevBtn.button("disable");
		}
		if (x_currentPageXML.getAttribute("next") == "false") {
			$x_nextBtn.button("disable");
		}

	} else if ((x_pageInfo[0].type != "menu" || (x_pageInfo[0].type == "menu" && x_currentPage != 0)) && x_currentPageXML.getAttribute("navSetting") != undefined) {
		// fallback to old way of doing things (navSetting - this should still work for projects that contain it but will be overridden by the navBtns group way of doing it where each button can be turned off individually)
		if (x_currentPageXML.getAttribute("navSetting") != "all") {
			$x_menuBtn.button("disable");
		}
		if (x_currentPageXML.getAttribute("navSetting") == "backonly" || x_currentPageXML.getAttribute("navSetting") == "none") {
			$x_nextBtn.button("disable");
		}
		if (x_currentPageXML.getAttribute("navSetting") == "nextonly" || x_currentPageXML.getAttribute("navSetting") == "none") {
			$x_prevBtn.button("disable");
		}
    }


    if (x_firstLoad == true) {
        $x_mainHolder.css("visibility", "visible");
		if (x_params.backgroundGrey == "true") {
			$("#x_mainBg").show();
			$("#x_mainBg").gray(); // won't work properly if called when hidden
			if ($("#x_mainBg").length < 1) { // IE where the greyscale is done differently - make sure the div that has replaced the original pageBg is given the pageBg id
				$(".grayscale:not(.pageBg)").attr("id", "x_mainBg");
			}
			if ($(".pageBg#pageBg" + x_currentPage).length > 0) {
				$("#x_mainBg").hide();
			}
		}
        x_firstLoad = false;
    }
}


// function called from each model when fully loaded to trigger fadeIn
function x_pageLoaded() {
    x_pageInfo[x_currentPage].built = $("#x_page" + x_currentPage);

	// Do deeplinking here so model has appropriate data at hand
	x_doDeepLink();

    // Resolve all text box added <img> and <a> src/href tags to proper urls
    $("#x_page" + x_currentPage).find("img,a").each(function() {
        var $this = $(this),
            val = $this.attr("src") || $this.attr("href"),
            attr_name = $this.attr("src") ? "src" : "href";

        $this.attr(attr_name, x_evalURL(val));
    });

	// script & style optional properties for each page added after page is otherwise set up
	if (x_pageInfo[0].type != "menu" || x_currentPage != 0) {
		if (x_currentPageXML.getAttribute("script") != undefined && x_currentPageXML.getAttribute("script") != "") {
			$("#x_page" + x_currentPage).append('<script id="x_pageScript">' +  x_currentPageXML.getAttribute("script") + '</script>');
		}
		if (x_currentPageXML.getAttribute("styles") != undefined && x_currentPageXML.getAttribute("styles") != "") {
			$("#x_page" + x_currentPage).append('<style type="text/css">' +  x_currentPageXML.getAttribute("styles") + '</style>');
		}
	}
	
	// is there a submit button & at least one variable input?
	if ($('.x_varSubmit').length > 0 && $('.x_varInput').length > 0) {
		$('.x_varSubmit').click(function() {
			var dependants = [],
				changed = [],
				i, j, k;
			
			// update the variables changed via text fields
			for (i=0; i<$('.x_varInput').length; i++) {
				if ($('.x_varInput')[i].value != '') {
					changed.push($('.x_varInput')[i].name);
					var temp = x_setVariable($('.x_varInput')[i].name, $('.x_varInput')[i].value);
					if (temp.length > 0) {
						$.merge(dependants, temp);
					}
				}
			}
			
			// as well as updating any variables that have been directly changed there may be dependants of those variables to change too
			if (dependants.length > 0) {
				dependants = dependants.filter(function(a){if (!this[a]) {this[a] = 1; return a;}},{});
				
				for (i=0; i<dependants.length; i++) {
					for (j=0; j<x_variables.length; j++) {
						if (dependants[i] == x_variables[j].name) {
							for (k=0; k<x_variables[j].requiredBy.length; k++) {
								if ($.inArray(x_variables[j].requiredBy[k], dependants) == -1) {
									dependants.push(x_variables[j].requiredBy[k]);
								}
							}
						}
					}
				}
				
				var toCalc = [];
				for (i=0; i<x_variableInfo.length; i++) {
					if ($.inArray(x_variableInfo[i].name, dependants) > -1) {
						changed.push(x_variableInfo[i].name);
						toCalc.push(i);
						
						// clear current variable value
						for (k=0; k<x_variables.length; k++) {
							if (x_variableInfo[i].name == x_variables[k].name) {
								x_variables.splice(k,1);
								break;
							}
						}
					}
				}
				
				x_calcVariables(toCalc);
			}
			
			// should this page be immediately updated to show changes to the variable values?
			if (x_currentPageXML.getAttribute('varUpdate') != 'false') {
				for (i=0; i<x_variables.length; i++) {
					for (j=0; j<changed.length; j++) {
						if (x_variables[i].name == changed[j]) {
							$('.x_var_' + x_variables[i].name).html(x_checkDecimalSeparator(x_variables[i].value));
							
							// updates xml for page otherwise text that isn't on screen yet won't be updated
							x_findText(x_currentPageXML, false, ['variables']);
						}
					}
				}
			}
			
			// submit confirmation message
			if (changed.length > 0) {
				var submitConfirmMsg = x_currentPageXML.getAttribute('varConfirm') != undefined && x_currentPageXML.getAttribute('varConfirm') != '' ? x_currentPageXML.getAttribute('varConfirm') : x_getLangInfo(x_languageData.find("submitConfirmMsg")[0], "label", "Your answers have been submitted");
				x_openDialog("msg", '', x_getLangInfo(x_languageData.find("closeBtnLabel")[0], "label", "Close"), null, submitConfirmMsg);
			}
		});
	}

    $("#x_page" + x_currentPage)
        .hide()
        .css("visibility", "visible")
        .fadeIn();

	// Trigger featherlight
    var config = $.featherlight.defaults;
    $(config.selector, config.context).featherlight();

	doPercentage();
}

	//detect page loaded change and update progress bar

  function  doPercentage() {
    var menuOffset = x_pageInfo[0].type == 'menu' ? 1 : 0;
    var totalpages = x_pageInfo.length - menuOffset;
    var pagesviewed = $(x_pageInfo).filter(function(){return this.built !== false;}).length - menuOffset;
    var progress = Math.round((pagesviewed * 100) / totalpages);
    var pBarText = x_getLangInfo(x_languageData.find("progressBar")[0], "label", "COMPLETE");

    $(".pbBar").css({"width": progress + "%"});
    $('.pbTxt').html(progress + "% " + pBarText);
  };

// function adds / reloads narration bar above main controls on interface
function x_addNarration(funct, arguments) {
    if (x_currentPageXML.getAttribute("narration") != null && x_currentPageXML.getAttribute("narration") != "") {
        x_checkMediaExists(x_evalURL(x_currentPageXML.getAttribute("narration")), function(mediaExists) {
			if (mediaExists) {
				$("#x_footerBlock div:first").before('<div id="x_pageNarration" class="x_pageNarration"></div>');
				$("#x_footerBlock #x_pageNarration").mediaPlayer({
					type        :"audio",
					source      :x_currentPageXML.getAttribute("narration"),
					width       :"100%",
					autoPlay    :x_currentPageXML.getAttribute("playNarration"),
					autoNavigate:x_currentPageXML.getAttribute("narrationNavigate")
				});
			}
			
			if (funct != undefined) {
				window[funct](arguments);
			}
		});
    } else {
		if (funct != undefined) {
			window[funct](arguments);
		}
	}
}


// function adds timer bar above main controls on interface - optional property that can be added to any interactivity page
function x_addCountdownTimer() {
    var x_timerLangInfo = [
		x_getLangInfo(x_languageData.find("timer").find("remaining")[0], "name", "Time remaining"),
		x_currentPageXML.getAttribute("timerLabel") != null && x_currentPageXML.getAttribute("timerLabel") != "" ? x_currentPageXML.getAttribute("timerLabel") : x_getLangInfo(x_languageData.find("timer").find("timeUp")[0], "name", "Time up"),
		x_getLangInfo(x_languageData.find("timer").find("seconds")[0], "name", "seconds")
	];

    var x_countdownTicker = function () {
        x_countdownTimer--;
        if (x_countdownTimer > 0) {
            $("#x_footerBlock #x_pageTimer").html(x_timerLangInfo[0] + ": " + x_formatCountdownTimer());

         	// If page model wants timer tick to know then pass value
        	if (typeof window[x_pageInfo[x_currentPage].type].onTimerTick === "function") window[x_pageInfo[x_currentPage].type].onTimerTick(x_countdownTimer);
        }
        else {
            window.clearInterval(x_timer);
            $("#x_footerBlock #x_pageTimer").html(x_timerLangInfo[1]);

        	// If page model wants to know then pass event
        	if (typeof window[x_pageInfo[x_currentPage].type].onTimerZero === "function") window[x_pageInfo[x_currentPage].type].onTimerZero();

        }
    };

    var x_formatCountdownTimer = function () {
        var dd = function (x) { return (x<10 ? "0"+x : x); };

        var hours   = Math.floor(x_countdownTimer / 3600),
            minutes = Math.floor(x_countdownTimer / 60),
            seconds = x_countdownTimer % 60;

        if (hours > 0) {
            return hours + ":" + dd(minutes) + ":" + dd(seconds);
        } else if (minutes > 0) {
            return dd(minutes) + ":" + dd(seconds);
        } else {
            return seconds + " " + x_timerLangInfo[2];
        }
    };

    var x_countdownTimer;
    if ((x_currentPageXML.getAttribute("showTimer") == null || x_currentPageXML.getAttribute("showTimer") == "true") && (x_currentPageXML.getAttribute("timer") != null && x_currentPageXML.getAttribute("timer") != "")) {
        clearInterval(x_timer);
        $("#x_footerBlock div:first").before('<div id="x_pageTimer"></div>');
        x_countdownTimer = parseInt(x_currentPageXML.getAttribute("timer"));
        $("#x_footerBlock #x_pageTimer").html(x_timerLangInfo[0] + ": " + x_formatCountdownTimer());
        x_timer = setInterval(x_countdownTicker, 1000);
    }
}


// function adds individual page backgrounds & sets up all the attributes of it (opacity, size etc.)
function x_loadPageBg(loadModel) {
	// vertical/horizontal align & max/min height optional properties are only in title page xwd
	var vConstrain = x_currentPageXML.getAttribute("bgImageVConstrain"),
		hConstrain = x_currentPageXML.getAttribute("bgImageHConstrain"),
		alpha = x_currentPageXML.getAttribute("bgImageAlpha") != undefined && x_currentPageXML.getAttribute("bgImageAlpha") != "" ? x_currentPageXML.getAttribute("bgImageAlpha") : 100;

	var $pageBg = $('<img id="pageBg' + x_currentPage + '" class="pageBg"/>');
    var objectfit =  (x_currentPageXML.getAttribute("backgroundFit") != undefined && x_currentPageXML.getAttribute("backgroundFit") == "cover" ? "cover" : "fill");
	$pageBg
		.attr("src", x_evalURL(x_currentPageXML.getAttribute("bgImage")))
		.css({
			"opacity"		:Number(alpha/100),
			"filter"		:"alpha(opacity=" + alpha + ")",
			"visibility"	:"hidden",
            "object-fit"    : objectfit
		})
		.addClass(x_currentPageXML.getAttribute("bgImageGrey") == "true" ? "grayscale" :"")
		.one("load", function() {
			var $this = $(this);
			setTimeout(function(){
				if ((vConstrain != undefined && vConstrain != "" && vConstrain != "0") || (hConstrain != undefined && hConstrain != "" && hConstrain != "0")) {
					var imgMaxW = 800,
						imgMaxH = 500;

					if (hConstrain != undefined && hConstrain != "" && hConstrain != "0") {
						imgMaxW = Number(hConstrain);
					}
					if (vConstrain != undefined && vConstrain != "" && vConstrain != "0") {
						imgMaxH = Number(vConstrain);
					}

					x_scaleImg($this[0], imgMaxW, imgMaxH, true, false, true);

					var vAlign = x_currentPageXML.getAttribute("bgImageVAlign") != undefined ? x_currentPageXML.getAttribute("bgImageVAlign") : "middle",
						hAlign = x_currentPageXML.getAttribute("bgImageHAlign") != undefined ? x_currentPageXML.getAttribute("bgImageHAlign") : "centre";

					if (vAlign == "middle" || vAlign == "bottom") {
						var topValue = "50%",
							topMargin = 0 - Math.round($this.height() / 2);

						if (vAlign == "bottom") {
							topValue = "100%"
							topMargin = 0 - $this.height();
						}
						$this.css({
							"top"			:topValue,
							"margin-top"	:topMargin
						})
					}
					if (hAlign == "centre" || hAlign == "right") {
						var leftValue = "50%",
							leftMargin = 0 - Math.round($this.width() / 2);

						if (hAlign == "right") {
							leftValue = "100%"
							leftMargin = 0 - $this.width();
						}
						$this.css({
							"left"			:leftValue,
							"margin-left"	:leftMargin
						})
					}
				} else {
					$this.css("visibility", "visible");
				}
			}, 0);

			if (loadModel != undefined) { loadModel() };
		})
		.each(function() { // called if loaded from cache as in some browsers load won't automatically trigger
			if (this.complete) {
				$(this).trigger("load");
			}
		});

	$x_background.prepend($pageBg);
    
	if (x_currentPageXML.getAttribute("bgImageDark") != undefined && x_currentPageXML.getAttribute("bgImageDark") != "" && x_currentPageXML.getAttribute("bgImageDark") != "0") {
		var $bgDarken = $("#x_bgDarken").length > 0 ? $("#x_bgDarken") : $('<div id="x_bgDarken" />').appendTo($x_background);

		$bgDarken
			.css({
				"opacity" :Number(x_currentPageXML.getAttribute("bgImageDark")/100),
				"filter" :"alpha(opacity=" + x_currentPageXML.getAttribute("bgImageDark") + ")"
			})
			.show();
	} else {
		$("#x_bgDarken").hide();
	}



	if (x_currentPageXML.getAttribute("bgImageGrey") == "true") {
		//setTimeout(function(){$pageBg.gray();}, 100);
		//$pageBg.gray();
		if ($("#pageBg" + x_currentPage).length < 1) { // IE where the greyscale is done differently - make sure the div that has replaced the original pageBg is given the pageBg id
			$(".grayscale:not(#x_mainBg):not('[id]')").addClass("pageBg").attr("id", "pageBg" + x_currentPage);
			$pageBg = $("#pageBg" + x_currentPage);
			$pageBg.css("visibility", "visible");
		}
		$("#pageBg").gray().fadeIn();
	}



	$("#x_mainBg").hide();
}


// function sorts out css that's dependant on screensize
function x_updateCss(updatePage) {
	
	if (updatePage != false) {
		// adjust width of narration controls - to get this to work consistently across browsers and with both html5/flash players the audio needs to be reset
		if ($("#x_pageNarration").length > 0) {
			if ($("#x_pageNarration audio").css("display") == "none") { // flash
				var audioRefNum = $("#x_pageNarration .mejs-audio").attr("id").substring(4);
				$("body div#me_flash_" + audioRefNum + "_container").remove();
			}
			$("#x_pageNarration").remove();
			
			x_addNarration('x_updateCss2', updatePage);
			
		} else {
			x_updateCss2(updatePage);
		}
		
	} else {
		x_updateCss2(updatePage);
	}
}

// function isn't called until the narration bar has loaded
function x_updateCss2(updatePage) {
    $x_pageHolder.css("margin-bottom", $x_footerBlock.height());
    $x_background.css("margin-bottom", $x_footerBlock.height());
	
    if (x_browserInfo.mobile == false) {
        $x_pageHolder.css("margin-top", $x_headerBlock.height());
        $x_background.css("margin-top", $x_headerBlock.height());
		$x_pageHolder.height($x_mainHolder.height() - parseInt($x_pageHolder.css("margin-bottom")) - parseInt($x_pageHolder.css("margin-top"))); // fix for Opera - css in other browsers do this automatically
    }

    if (updatePage != false) {
        try {
            // calls function in current page model which does anything needed on size change
            if (x_pageInfo[x_currentPage].type == "text") {
                simpleText.sizeChanged(); // errors if you just call text.sizeChanged()
            } else {
                eval(x_pageInfo[x_currentPage].type).sizeChanged();
            }
        }
        catch(e) {} // Catch error thrown when you call sizeChanged() on an unloaded model

        // calls function in any customHTML that's been loaded into page
        if ($(".customHTMLHolder").length > 0) {
            try { customHTML.sizeChanged(); } catch(e) {};
        }
    }

    $(".x_popupDialog").parent().detach();
}

// functions open dialogs e.g. glossary, table of contents - just reattach if it's already loaded previously
function x_openDialog(type, title, close, position, load, onclose) {
    for (var i=0, len=x_dialogInfo.length; i<len; i++) {
        if (x_dialogInfo[i].type == type) {
            $(".x_popupDialog").parent().detach();

            if (x_dialogInfo[i].built != false) {
                $x_body.append(x_dialogInfo[i].built);

                if (load != undefined) {
                    x_dialogInfo[i].built.children(".x_popupDialog").html(load);
					x_dialogInfo[i].built.find('.ui-dialog-title').html(title);
                }

				x_setDialogSize(x_dialogInfo[i].built.children(".x_popupDialog"), position);

                if (type == "language") {
                    language.turnOnKeyEvents();
                } else if (type == "menu") {
					menu.showCurrent();
				}

            } else {
                $x_body.append('<div id="x_' + type + '" class="x_popupDialog"></div>');

                var $x_popupDialog = $("#x_" + type);
                $x_popupDialog
                    .dialog({
                        closeOnEscape:  true,
                        title:          title,
                        closeText:      close,
                        close: function() {
                        	$x_popupDialog.parent().detach();
                        	if (onclose && typeof onclose == 'function')  onclose();
                        },
						create: function(event, ui) {
							$(this).parent(".ui-dialog").find(".ui-dialog-titlebar-close .ui-icon")
								.removeClass("ui-icon-closethick")
								.addClass("fa fa-x-close");
							}
                        })
                    .parent().hide();

                if (load == undefined) { // load dialog contents from a file in the models_html5 folder called [type].html
                    if (typeof modelfilestrs[type] != 'undefined')
                    {
                        load = modelfilestrs[type];
                        $x_popupDialog.html(load);
                        x_setDialogSize($x_popupDialog, position);
                    }
                    else
                    {
                        $x_popupDialog.load(x_templateLocation + "models_html5/" + type + ".html", function () {
                            x_setDialogSize($x_popupDialog, position);
                        });
                    }

                } else {
                    $x_popupDialog.html(load);
                    x_setDialogSize($x_popupDialog, position);
                }

                x_dialogInfo[i].built = $x_popupDialog.parent();
            }
            break;
        }
    }
}

function x_setDialogSize($x_popupDialog, position) {
    var width = $x_mainHolder.width()/2,
        height = undefined,
        left = $x_mainHolder.width()/4,
        top = $x_mainHolder.height()/4;

    if (x_browserInfo.mobile == true) {
        width = $x_mainHolder.width()-20;
        left = 10;
        top = $x_mainHolder.height()/4;

    } else if (position != undefined) {
        if (position.width == "small") {
            width = $x_mainHolder.width()/4;
        } else if (position.width != undefined) {
            width = position.width;
        }

        if (position.height != undefined) {
            height = position.height;
        }

        if (position.left == "left") {
            left = 10;
        } else if (position.left == "right") {
            left = $x_mainHolder.width() - width - 10;
        }

        if (position.top == "top") {
            top = $x_headerBlock.height() + 5;
        } else if (position.top == "bottom") {
            top = $x_mainHolder.height() * 0.75;
        }
    }

    $x_popupDialog.dialog({
        "width" :width,
		"height" : "auto"
    });
    $x_popupDialog.parent().css({
        "left"  :left,
        "top"   :top
    });
    $x_popupDialog.parent().show();

    if (height != undefined) {
        $x_popupDialog.height(height);
    } else {
        if ($x_popupDialog.height() > $x_mainHolder.height()/2) {
            $x_popupDialog.height($x_mainHolder.height()/2);
        }
    }
}


// function called from button on footer bar or from link in main text e.g. <a onclick="x_openMediaWindow(); return false;" href="#">Open media in new window</a>
function x_openMediaWindow() {
    // get info about how to display captions - if none are found the code in the mediaViewer folder will look for details in tt file - otherwise it will use defaults
    var captionDetails = "",
        nodeNames = ["mediaTiming", "mediaPosition", "mediaAlign", "mediaColour", "mediaHighlight", "mediaHighlightColour"];
    for (var i=0, len=nodeNames.length; i<len; i++) {
        if (x_params[nodeNames[i]] != undefined) {
            if (captionDetails != "") {
                captionDetails += ";";
            }
            captionDetails += nodeNames[i] + "=" + x_params[nodeNames[i]];
        }
    }
    if (captionDetails == "") {
        captionDetails = undefined;
    }
	var mediaTxtStr = x_mediaText[0].label + "~" + x_mediaText[1].label + "~" + x_mediaText[2].label + "~" + x_mediaText[3].label + "~" + x_mediaText[4].label;

	window.open("mediaViewer/mediaHTML5.htm?media='" + x_evalURL(x_params.media) + "',transcript='" + x_evalURL(x_params.mediaTranscript) + "',img='" + x_evalURL(x_params.mediaImage) + "',imgTip='" + x_params.mediaImageTip + "',caption='" + captionDetails + "',title='" + x_getLangInfo(x_languageData.find("mediaWindow")[0], "label", "Media Viewer") + "',lang='" + mediaTxtStr + "'", "_blank", "height=100,width=100,toolbar=0,menubar=0");
}

function x_openInfoWindow(text){

    window.open('','','width=300,height=450,scrollbars=yes').document.write('<p style="font-family:sans-serif; font-size:12">' + text + '</p>');

}


// function returns correct phrase from language file or uses fallback if no matches / no language file
function x_getLangInfo(node, attribute, fallBack) {
    var string = fallBack;
    if (node != undefined && node != null) {
        if (attribute == false) {
            string = node.childNodes[0].nodeValue;
        } else {
            string = node.getAttribute(attribute);
        }
    }
    return string;
}


// function starts the calculation of variables set by author via the variables optional property
function x_newVariables() {
	// clears arrays if they have previously been calculated
	x_variables.splice(0, x_variables.length);
	x_variableInfo.splice(0, x_variableInfo.length);
	x_variableErrors.splice(0, x_variableErrors.length);

	if (x_params.variables != undefined) {
		var i, j, k, temp, thisVar,
			toCalc = [];
		
		x_variableInfo = x_params.variables.split("||");

		// get array of data for all uniquely named variables & sort them so empty strings etc. become undefined
		for (i=0; i<x_variableInfo.length; i++) {
			var temp = x_variableInfo[i].split("|");
			thisVar = {name:$.trim(temp[0]), data:temp.slice(1), requires:[]}; // data = [fixed value, [random], min, max, step, decimal place, significant figure, trailing zero, [exclude], default]
			if (thisVar.name != "" && x_variableInfo.filter(function(a){ return a.name == thisVar.name }).length == 0) {
				for (j=0; j<thisVar.data.length; j++) {
					if (j == 1 || j == 8) { // convert data (random/exclude) to array
						thisVar.data.splice(j, 1, thisVar.data[j].split(","));
						for (k=0; k<thisVar.data[j].length; k++) {
							temp = $.trim(thisVar.data[j][k]);
							if (temp === "") {
								thisVar.data[j].splice(k, 1);
								k--;
							} else {
								thisVar.data[j].splice(k, 1, temp);
							}
						}
					} else {
						temp = $.trim(thisVar.data[j]);
						if (temp === "") {
							temp = undefined;
						}
						thisVar.data.splice(j, 1, temp);
					}
				}

				x_variableInfo.splice(i, 1, thisVar);
				toCalc.push(i);

			} else {
				x_variableInfo.splice(i, 1);
				i--;
			}
		}
		
		x_calcVariables(toCalc);
	}
}

function x_calcVariables(toCalc) {
	var lastLength, checkDefault,
		thisVar, i;

	// goes through all variables and attempts to calculate their value
	// may loop several times if variables require other variable values to be ready before calculating their value
	// stops when no. var values calculated is no longer increasing - either all done or some vars can't be calculated (circular calculations or referencing non-existant vars)
	while (toCalc.length > 0 && (toCalc.length != lastLength || checkDefault == true)) {
		lastLength = toCalc.length;

		for (i=0; i<toCalc.length; i++) {
			thisVar = x_calcVar(x_variableInfo[toCalc[i]], false, checkDefault);
			if (thisVar.ok == true) {
				thisVar.requiredBy = [];
				x_variables.push(thisVar);
				toCalc.splice(i,1);
				i--;
				if (thisVar.default == true) {
					checkDefault = false;
				}
			} else if (thisVar.ok == false) {
				x_variableErrors.push(thisVar);
				toCalc.splice(i,1);
				i--;
			}

			if (i + 1 == toCalc.length && toCalc.length == lastLength) {
				checkDefault = checkDefault == true ? false : true;
			}
		}
	}

	for (i=0; i<toCalc.length; i++) {
		thisVar = x_variableInfo[toCalc[i]];
		thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("error")[0], "unable", "Unable to calculate") + ": " + x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "undef", "References an undefined variable");
		x_variableErrors.push(thisVar);
		toCalc.splice(i,1);
		i--;
	}

	if ($("#x_authorSupportMsg").length > 0 && (x_variables.length > 0 || x_variableErrors.length > 0)) {
		$('.x_varMsg').remove();
		$("#x_authorSupportMsg p").append('<span class="x_varMsg"></br>' + '<a onclick="x_showVariables()" href="javascript:void(0)" style="color:red">' + x_getLangInfo(x_languageData.find("authorVars")[0], "label", "View variable data") + '</a></span>');
	}
}


// function calculates the value of any author set variables
function x_calcVar(thisVar, recalc, checkDefault) {
	thisVar.ok = undefined;

	// calculate min / max / step values
	var data = {min:thisVar.data[2], max:thisVar.data[3], step:thisVar.data[4]},
		exclude = [], index;

	for (var key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			// check for use of other variables & keep track of which are required
			if (data[key] != undefined && ((thisVar.data[0] == undefined && thisVar.data[1].length == 0) || key != "step")) {
				var info = x_getVarValues(data[key], thisVar.name);
				data[key] = info[0];
				if (info[1].length > 0) { thisVar.requires = thisVar.requires.concat(info[1].filter(function (item) { return thisVar.requires.indexOf(item) < 0; })); }

				thisVar.ok = info[2];
				if (thisVar.ok != true) { // a variable needed doesn't exist / hasn't been calculated yet
					break;
				} else {
					data[key] = Number(data[key]);
				}
			}
		}
	}

	// calculate exclude values
	if ((thisVar.ok == true || thisVar.ok == undefined) && thisVar.data[8].length > 0) {
		exclude = thisVar.data[8].slice();
		// check for use of other variables & keep track of which are required
		for (var i=0; i<exclude.length; i++) {
			var info = x_getVarValues(exclude[i], thisVar.name);
			exclude.splice(i, 1, info[0]);
			if (info[1].length > 0) { thisVar.requires = thisVar.requires.concat(info[1].filter(function (item) { return thisVar.requires.indexOf(item) < 0; })); }

			thisVar.ok = info[2];
			if (info[2] != true) {  // a variable needed doesn't exist / hasn't been calculated yet
				break;

			} else if (typeof exclude[i] === "string" && exclude[i].indexOf("&&") != -1) {
				// it's a range e.g. -2<&&<2 or -2<=&&<=2
				var temp = exclude[i].split("&&").filter(function (a) { return a.indexOf("<") > -1 || a.indexOf(">") > -1; });
				if (temp.length == 2) {
					temp.splice(0, 1, temp[0] + "[" + thisVar.name + "]");
					temp.splice(1, 1, "[" + thisVar.name + "]" + temp[1]);
					exclude.splice(i, 1, temp);
				}
			}
		}
	}

	// no missing dependancies so far
	if (thisVar.ok == true || thisVar.ok == undefined) {

		if (data.min != undefined && data.max != undefined && data.min > data.max) {
			// fail because min > max
			thisVar.ok = false;
			thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("error")[0], "unable", "Unable to calculate") + ": " + x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "minMax", "min > max") + " (" + data.min + " > " + data.max + ")";

		} else if (thisVar.data[0] != undefined || thisVar.data[1].length > 0) {
			if (thisVar.data[0] != undefined) {
				// FIXED VALUE
				thisVar.type = "fixed";
				thisVar.value = thisVar.data[0];

				// check for use of other variables & keep track of which are required
				var info = x_getVarValues(thisVar.value, thisVar.name);
				thisVar.value = info[0];
				if (info[1].length > 0) { thisVar.requires = thisVar.requires.concat(info[1].filter(function (item) { return thisVar.requires.indexOf(item) < 0; })); }
				thisVar.ok = info[2];

			} else if (thisVar.data[1].length > 0) {
				// RANDOM FROM LIST
				thisVar.type = "random";

				index = Math.floor(Math.random()*thisVar.data[1].length);
				thisVar.value = thisVar.data[1][index];

				// check for use of other variables & keep track of which are required
				var info = x_getVarValues(thisVar.value, thisVar.name);
				thisVar.value = info[0];
				if (info[1].length > 0) { thisVar.requires = thisVar.requires.concat(info[1].filter(function (item) { return thisVar.requires.indexOf(item) < 0; })); }
				thisVar.ok = info[2];

			}

			if (thisVar.ok == true) {
				if (data.min != undefined && data.min > thisVar.value) {
					// fail because value < min
					if (thisVar.type == "random") {
						thisVar.ok = "retry";
					} else {
						thisVar.ok = false;
					}
					thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("error")[0], "invalid", "Invalid value") + ": " + x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "valueMin", "value < min") + " (" + thisVar.value + " < " + data.min + ")";

				} else if (data.max != undefined && data.max < thisVar.value) {
					// fail because value > max
					if (thisVar.type == "random") {
						thisVar.ok = "retry";
					} else {
						thisVar.ok = false;
					}
					thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("error")[0], "invalid", "Invalid value") + ": " + x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "valueMax", "value > max") + " (" + thisVar.value + " > " + data.max + ")";
				}
			}

		} else if (data.min != undefined || data.max != undefined) { // from max & min
			// RANDOM BETWEEN MIN & MAX VALUES
			thisVar.type = "minMax";

			// uses defaults of min=0 & max=100 if only min or max are set
			if (data.min == undefined) {
				data.min  = 0;
			} else if (data.max == undefined) {
				data.max = 100;
			}

			// use default of 1 for step
			if (data.step == undefined) {
				data.step = 1;
			}

			var maxDecimal = Math.max(Math.floor(data.min) === data.min ? 0 : data.min.toString().split(".")[1].length || 0, Math.floor(data.step) === data.step ? 0 : data.step.toString().split(".")[1].length || 0);
			thisVar.value = Math.floor(Math.random()*(((data.max - data.min) / data.step) + 1)) * data.step + data.min;
			if (thisVar.value > data.max) { thisVar.value = thisVar.value - data.step; } // can be over max if step doesn't take to exact max number - adjust for this
			thisVar.value = thisVar.value.toFixed(maxDecimal); // forces correct decimal num - should work without this but occasionally it ends up with e.g. 1.1999999999999.... instead of 1.2
			thisVar.ok = true;

		} else if (thisVar.type == undefined) {
			thisVar.ok = false;
			thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("error")[0], "none", "No variable data");
		}
	}

	if (thisVar.ok == true && $.isNumeric(Number(thisVar.value))) {
		// to significant figure
		if ($.isNumeric(Number(thisVar.data[6]))) {
			thisVar.value = Number(thisVar.value).toPrecision(Number(thisVar.data[6])).includes('e') ? parseFloat(Number(thisVar.value).toPrecision(Number(thisVar.data[6]))) : Number(thisVar.value).toPrecision(Number(thisVar.data[6]));
		}
		// to decimal place
		if ($.isNumeric(Number(thisVar.data[5]))) {
			thisVar.value = Number(thisVar.value).toFixed(Number(thisVar.data[5]));
			if (thisVar.data[7] != "true") {
				// remove trailing zeros
				thisVar.value = Number(thisVar.value);
			}
		}
	}

	// check value isn't one that should be excluded
	if (thisVar.ok == true) {
		for (var i=0; i<exclude.length; i++) {
			var clash = false;
			if (typeof exclude[i] == "number") {
				if (exclude[i] == thisVar.value) {
					clash = true;
				}

			// it's an exclude range
			} else if (typeof exclude[i] == "object") {
				for (var j=0; j<exclude[i].length; j++) {
					exclude[i].splice(j, 1, exclude[i][j].replace("[" + thisVar.name + "]", thisVar.value));
				}
				if (eval(exclude[i][0]) && eval(exclude[i][1])) {
					clash = true;
				}
			}

			if (clash == true) {
				if (thisVar.type == "fixed") {
					thisVar.ok = false;
					thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("error")[0], "invalid", "Invalid value") + ": " + x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "exclude", "{n} is excluded").replace("{n}", thisVar.value);
				} else {
					thisVar.ok = "retry";
					thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("error")[0], "invalid", "Invalid value") + ": " + x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "exclude", "{n} is excluded").replace("{n}", thisVar.value);
				}
				break;
			}
		}

	} else if (thisVar.ok == false && thisVar.info == undefined) {
		thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("error")[0], "unable", "Unable to calculate") + ": " + x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "circular", "Circular variable reference");
	}

	// only retry random if there's a value that hasn't already failed
	if (thisVar.ok == "retry" && thisVar.type == "random") {
		thisVar.data[1].splice(index, 1);
		if (thisVar.data[1].length == 0) {
			thisVar.ok = false;
			thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "none", "All possible values are excluded or fall outside the min & max range");
		}
	}

	// retry multiple times to see if we can get a valid value
	if (thisVar.ok == "retry") {
		var attempts = 100;

		if (recalc != true) {
			var counter = 0;
			do {
				thisVar = x_calcVar(thisVar, true);
				counter++;
			} while (counter < attempts && thisVar.ok == "retry");

			if (thisVar.ok == "retry") {
				thisVar.ok = false;
				thisVar.info = " " + x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "none2", "{n} attempts have not returned an accepted value").replace("{n}", attempts);
			} else if (thisVar.ok == true) {
				thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "attempts", "{n} attempts to calculate a valid value").replace("{n}", (counter + 1));
			}
		}
	}

	// fallback to default
	if (thisVar.data[9] != undefined && (thisVar.ok == false || checkDefault == true)) {
		try {
			var sum = eval(thisVar.data[9]);
			thisVar.value = sum;
		} catch (e) {
			thisVar.value = thisVar.data[9];
		}
		thisVar.requiredBy = [];
		thisVar.default = true;
		thisVar.ok = true;
		thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "default", "Fallback to default value");
	}
	
	return thisVar;
}

function x_getVariable(name)
{
    for (var i=0; i<x_variables.length; i++)
    {
        if (x_variables[i].name == name)
            return x_variables[i].value;
    }
    return null;
}

// function updates a variable update
function x_setVariable(name, value) {
	
	var dependants;
	
    for (var i=0; i<x_variables.length; i++) {
        if (x_variables[i].name == name) {
            x_variables[i].value = x_checkDecimalSeparator(value, true);
			dependants = x_variables[i].requiredBy;
            break;
        }
    }
	
	return dependants;
}

// function updates all variables on screen with the current value
function x_updateVariable() {
	
	for (var i=0; i<$('.x_var').length; i++) {
		
		var $thisVarSpan = $($('.x_var')[i]),
			classes = $thisVarSpan.attr('class').split(' '),
			varName;
		
		for (var j=0; j<classes.length; j++) {
			
			if (classes[j].indexOf('x_var_') == 0) {
				varName = classes[j].substring(6);
				break;
			}
		}
		
		if (varName != '') {
			for (var j=0; j<x_variables.length; j++) {
				
				if (x_variables[j].name == varName) {
					$thisVarSpan.html(x_checkDecimalSeparator(x_variables[j].value));
					break;
				}
			}
		}
	}
}

// function gets values of other variables needed for calculation and evals the value when everything's ready
function x_getVarValues(thisValue, thisName) {
	var requires = [];

	if (thisValue.indexOf("[" + thisName + "]") != -1) {
		return [thisValue, requires, false];
	}

	if (String(thisValue).indexOf("[") != -1) {
		for (var i=0; i<x_variables.length; i++) {
			if (thisValue.indexOf("[" + x_variables[i].name + "]") != -1) {
				// keeps track of what other variables reference this so they can be recalculated together if needed
				if (x_variables[i].requiredBy.indexOf(thisName) == -1) {
					x_variables[i].requiredBy.push(thisName);
				}
				requires.push(x_variables[i].name);

				RegExp.esc = function(str) {
					return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
				};
				var regExp = new RegExp(RegExp.esc("[" + x_variables[i].name + "]"), "g");
				thisValue = thisValue.replace(regExp, x_variables[i].value);
				if (thisValue.indexOf("[") == -1) { break; }
			}
		}
	}

	try {
		var sum = eval(thisValue);
		return [sum, requires, true];
	} catch (e) {
		if (thisValue.indexOf("[") == -1) {
			return [thisValue, requires, true]; // string
		} else {
			return [thisValue, requires, "variable"];
		}
	}
}


// function displays author set variables in popup when in author support mode
function x_showVariables() {
	var varHeadings = ["Name", "Fixed Value", "Random", "Min", "Max", "Step", "DP", "SF", "Trailing Zeros", "Exclude", "Default"];
	var pageText = '<html><body><style>table, tr, td, th { border: 1px solid black; text-align: left; } th { background-color: LightGray; } table { border-collapse: collapse; min-width: 100%; } th, td { padding: 1em; width: ' + (100/(varHeadings.length+1)) + '%; } .alert { color: red; } td:nth-child(1), td:nth-child(2) { font-weight: bold; } </style><table>',
		cells, temp, infoTxt;

	for (var i=0; i<varHeadings.length; i++) {
		pageText += '<th>' + x_getLangInfo(x_languageData.find("authorVars").find("item")[i], false, varHeadings[i]) + '</th>';
		if (i == 0) {
			pageText += '<th>' + x_getLangInfo(x_languageData.find("authorVars").find("item")[varHeadings.length], false, "Value") + '</th>';
		}
	}

	for (var i=0; i<x_variables.length; i++) {
		cells = "";
		for (var j=0; j<x_variables[i].data.length; j++) {
			temp = x_variables[i].data[j] === undefined ? "" : x_variables[i].data[j];
			cells += '<td>' + temp + '</td>';
		}
		infoTxt = x_variables[i].info == undefined ? "" : '<br/><span class="alert">' + x_variables[i].info + '</span>';
		pageText += '<tr><td>' + x_variables[i].name + '</td><td>' + x_variables[i].value + infoTxt + '</td>' + cells + '</tr>';
	}

	for (var i=0; i<x_variableErrors.length; i++) {
		cells = "";
		for (var j=0; j<x_variableErrors[i].data.length; j++) {
			temp = x_variableErrors[i].data[j] === undefined ? "" : x_variableErrors[i].data[j];
			cells += '<td>' + temp + '</td>';
		}
		pageText += '<tr style="background-color: LightGray;"><td>' + x_variableErrors[i].name + '</td><td>' + x_variableErrors[i].info + '</td>' + cells + '</tr>';
	}

	pageText += '</table></body></html>';

	window.open('','','width=300,height=450').document.write('<p style="font-family:sans-serif; font-size:12">' + pageText + '</p>');
}

// function finds attributes/nodeValues where text may need replacing for things like links / glossary words
function x_findText(pageXML, exclude, list) {
    var attrToCheck = ["text", "instruction", "instructions", "answer", "description", "prompt", "question", "option", "hint", "feedback", "summary", "intro", "txt", "goals", "audience", "prereq", "howto", "passage", "displayTxt"],
        i, j, len;
	if (pageXML.nodeName == "mcqStepOption") { attrToCheck.push("name"); } // don't include name normally as it's generally only used in titles

    for (i=0, len = pageXML.attributes.length; i<len; i++) {
        if ($.inArray(pageXML.attributes[i].name, attrToCheck) > -1) {
            x_insertText(pageXML.attributes[i], exclude, list);
        }
    }

    for (i=0, len=pageXML.childNodes.length; i<len; i++) {
        if (pageXML.childNodes[i].nodeValue == null) {
            x_findText(pageXML.childNodes[i], exclude, list); // it's a child node of node - check through this too
        } else {
            if (pageXML.childNodes[i].nodeValue.replace(/^\s+|\s+$/g, "") != "") { // not blank
                x_insertText(pageXML.childNodes[i], exclude, list);
            }
        }
    }
}

// function adds glossary links, LaTeX, page links to text found in x_findText function
function x_insertText(node, exclude, list) {
	// Decode node.value in order to make sure it works for for foreign characters like é
	// But keep html tags, so use textarea
	// cf. http://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it (3rd answer)
	var temp=document.createElement("pre");
	temp.innerHTML=node.nodeValue;
	var tempText = temp.innerHTML;

	// if exclude == true then we don't look at those in list - if exclude == false then we only look at those in list
	list = list == undefined ? [] : list;
	
	// check text for variables - if found replace with variable value
	if (x_variables.length > 0 && (exclude == undefined || (exclude == false && list.indexOf("variables") > -1) || (exclude == true && list.indexOf("variables") == -1))) {
		for (var k=0; k<x_variables.length; k++) {
			// replace with the variable text (this looks at both original variable mark up (e.g. [a]) & the tag it's replaced with as it might be updating a variable value that's already been inserted)
			var regExp = new RegExp('\\[' + x_variables[k].name + '\\]|<span class="x_var x_var_' + x_variables[k].name + '">(.*?)</span>', 'g');
			tempText = tempText.replace(regExp, '<span class="x_var x_var_' + x_variables[k].name + '">' + x_checkDecimalSeparator(x_variables[k].value) + '</span>');
			
			// replace with a text input field which the end user can use to set the value of the variable
			regExp = new RegExp('\\[=' + x_variables[k].name + '\\]', 'g');
			tempText = tempText.replace(regExp, '<input type="text" name="' + x_variables[k].name + '" class="x_varInput">');
			
			// this format of the text input field has specified a default value
			regExp = new RegExp('\\[=' + x_variables[k].name + ':(.*?)\\]', 'g');
			
			var matches = tempText.match(regExp);
			if (matches != null) {
				for (var m=0; m<matches.length; m++) {
					tempText = tempText.replace(matches[m], '<input type="text" name="' + x_variables[k].name + '" class="x_varInput" placeholder="' + matches[m].substring(matches[m].indexOf(':')+1, matches[m].length-1) + '">');
				}
			}
		}
		
		// replace with a submit button which will submit all the new variable values entered on the page
		var submitBtnLabel = x_getLangInfo(x_languageData.find("submitBtnLabel")[0], "label", "Submit");
		var regExp = new RegExp('\\[\\+submit\\]', 'g');
		tempText = tempText.replace(regExp, '<input type="submit" value="' + submitBtnLabel + '" class="x_varSubmit">');
		
		// this format of the submit button has specified a default value
		regExp = new RegExp('\\[\\+submit:(.*?)\\]', 'g');
		
		var matches = tempText.match(regExp);
		if (matches != null) {
			for (var m=0; m<matches.length; m++) {
				tempText = tempText.replace(matches[m], '<input type="submit" value="' + matches[m].substring(matches[m].indexOf(':')+1, matches[m].length-1) + '" class="x_varSubmit">');
			}
		}
	}

	// if project is being viewed as https then force iframe src to be https too
	if (window.location.protocol == "https:" && (exclude == undefined || (exclude == false && list.indexOf("iframe") > -1) || (exclude == true && list.indexOf("iframe") == -1))) {
		function changeProtocol(iframe) {
			if (/src="http:/.test(iframe)){
				iframe = iframe.replace(/src="http:/g, 'src="https:').replace(/src='http:/g, "src='https:");
			}
			return iframe;
		}
		tempText = tempText.replace(/(<iframe([\s\S]*?)<\/iframe>)/g, changeProtocol);
	}

    // check text for glossary words - if found replace with a link
	if (x_glossary.length > 0 && (exclude == undefined || (exclude == false && list.indexOf("glossary") > -1) || (exclude == true && list.indexOf("glossary") == -1))) {
        for (var k=0, len=x_glossary.length; k<len; k++) {
			var regExp = new RegExp('(^|[\\s\(>]|&nbsp;)(' + x_glossary[k].word + ')([\\s\\.,!?:;\)<]|$|&nbsp;)', 'i');
			tempText = tempText.replace(regExp, '$1{|{'+k+'::$2}|}$3');
        }
        for (var k=0, len=x_glossary.length; k<len; k++) {
			var regExp = new RegExp('(^|[\\s\(>]|&nbsp;)(\\{\\|\\{' + k + '::(.*?)\\}\\|\\})([\\s\\.,!?:;\)<]|$|&nbsp;)', 'i');
			//tempText = tempText.replace(regExp, '$1<a class="x_glossary" href="#" title="' + x_glossary[k].definition + '">$3</a>$4');
			tempText = tempText.replace(regExp, '$1<a class="x_glossary" href="#" def="' + x_glossary[k].definition.replace(/\"/g, "'") + '">$3</a>$4');
        }
    }

    // check text for LaTeX tags - if found replace with image
    var startIndex = tempText.indexOf('<tex src');
    while (startIndex > -1) {
        var latex = tempText.substr(startIndex, tempText.indexOf('>', startIndex) - startIndex + 1);
        n = latex.length;
        latex = latex.split('tex').join('img');
        latex = latex.split('"');
        latex[1] = 'http://xerte.tor.nl/cgi-bin/mathtex.cgi?' + escape(latex[1]) + ' #.png';
        latex = latex.join('"');
        tempText = tempText.substr(0, startIndex) + latex + tempText.substr(startIndex + n);
        startIndex = tempText.indexOf('<tex src', startIndex + 1);
    }

    // check text for page links - if found convert to xenith compatible link
    var regExp = new RegExp('href="asfunction:_level0\.engine\.rootIcon\.pageLink,([A-Za-z0-9]+)">','ig');
    tempText = tempText.replace(regExp, function (str, p1, offset, s) {
        if (!isNaN(parseFloat(p1)) && isFinite(p1))
            return 'href="#" onclick="x_navigateToPage(false,{type:\'page\',ID:\'' + p1 + '\'});return false;">';
        else
            return 'href="#" onclick="x_navigateToPage(false,{type:\'linkID\',ID:\''+ p1 +'\'});return false;">';
    });
    node.nodeValue = tempText;
}


// function maximises LO size to fit window
function x_setFillWindow(updatePage) {
	x_fillWindow = true;

    if (x_params.responsive == "true") {
        for (var i = 0; i < x_responsive.length; i++) {
			$x_mainHolder.addClass("x_responsive");
            $(x_responsive[i]).prop("disabled", false);
        }
    }

    $x_mainHolder.css({
        "width"     :"100%",
        "height"    :"100%"
    });

    $x_body.css("overflow", "hidden");
    x_updateCss(updatePage);
    window.scrolling = false;

    $("#x_cssBtn").button({
        icons:  {primary: "x_minimise"},
        label:  x_getLangInfo(x_languageData.find("sizes").find("item")[0], false, "Default")
    });

	$("#x_cssBtn").addClass("x_minimise").removeClass("x_maximise");
}


// function applies CSS file to page - can't do this using media attribute in link tag or the jQuery way as in IE the page won't update with new styles
function x_insertCSS(href, func, disable, id, keep) {
    var css = document.createElement("link");
    var element = null;
    var donotreplace = false;
    css.rel = "stylesheet";
    css.href = href;
    css.type = "text/css";
    if (id != undefined)
	{
		css.id = id;
		element = document.getElementById(id);
		if (keep != undefined)
        {
           donotreplace=keep;
        }
	}

	// in some cases code is stopped until css loaded as some heights are done with js and depend on css being loaded
	if (func != undefined) {
        var f = function() {
            if (x_cssFiles.indexOf(this) == -1) {
                x_cssFiles.push(this);
                if (href.indexOf("responsivetext.css") >= 0) {
                    x_responsive.push(this);
                    if (disable == true) {
                        $x_mainHolder.removeClass("x_responsive");
                        $(this).prop("disabled", true);
                    } else {
                        $x_mainHolder.addClass("x_responsive");
                    }
                }
            }
            func();
        };
		css.onload = f;

		css.onerror = function(){
			func();
		};

	} else if (disable == true) {
		css.onload = function() {
			$(this).prop("disabled", true);
		}
	}

	if (element != null)
    {
        // Update element
        if (donotreplace != true) {
            var parent = element.parentNode;
            parent.replaceChild(css, element);
        }
        else
        {
            if (func != undefined)
            {
                func();
            }
        }
    }
    else {
        // Create element
        document.getElementsByTagName("head")[0].appendChild(css);
    }
}

// handle case where comma decimal separator has been requested
function x_checkDecimalSeparator(value, forcePeriod) {
	if (forcePeriod == true) {
		// force convert to . so any dependant variables can be calculated correctly (can later be converted to , when shown on page)
		if (x_params.decimalseparator !== undefined && x_params.decimalseparator === 'comma') {
			var temp = value.replace(/\,/g, '.');
			if ($.isNumeric(temp)) {
				return temp;
			} else {
				return value;
			}
		} else {
			return value;
		}
		
	} else {
		// convert to , as it is to be shown on page
		if ($.isNumeric(value) && x_params.decimalseparator !== undefined && x_params.decimalseparator === 'comma') {
			return String(value).replace('.', ',');
		} else {
			return value;
		}
	}
}


// ___ FUNCTIONS CALLED FROM PAGE MODELS ___

// function called from model pages to scale images - scale, firstScale & setH are optional
function x_scaleImg(img, maxW, maxH, scale, firstScale, setH, enlarge) {
    var $img = $(img);
    if (scale != false) {
        var imgW = $img.width(),
            imgH = $img.height();

        if (firstScale == true) { // store orig dimensions - will need them if resized later so it doesn't get larger than orignial size
            $img.data("origSize", [imgW, imgH]);
        } else if ($img.data("origSize") != undefined) { // use orig dimensions rather than current dimensions (so it can be scaled up if previously scaled down)
            imgW = $img.data("origSize")[0];
            imgH = $img.data("origSize")[1];
        }

		if (enlarge != true) {
			if (maxW > imgW) {
				maxW = imgW;
			}
			if (maxH > imgH) {
				maxH = imgH;
			}
		}

        if (imgW > maxW || imgH > maxH || firstScale != true || enlarge == true) {
            var scaleW = maxW / imgW;
            var scaleH = maxH / imgH;
            var scaleFactor;
			scaleFactor = Math.min(scaleW, scaleH);

            imgW = Math.round(imgW * scaleFactor);
            imgH = Math.round(imgH * scaleFactor);
            $img.css("width", imgW + "px"); // set width only to constrain proportions

            if (setH == true) {
                $img.css("height", imgH + "px"); // in some places the height also needs to be set - normally it will keep proportions right just by changing the width
            }
        }
    }

    $img.css("visibility", "visible"); // kept hidden until resize is done
}


// function called from model pages - swaps line breaks in xml text attributes and CDATA to br tags
function x_addLineBreaks(text, override) {
	if (override != true) { // override only used when text being tested isn't from xml (e.g. modelAnswer page)
		// First test for new editor
		if (x_params.editorVersion && parseInt("0" + x_params.editorVersion, 10) >= 3)
		{
			return text; // Return text unchanged
		}

		// Now try to identify v3beta created LOs
		var trimmedText = $.trim(text);
		if ((trimmedText.indexOf("<p") == 0 || trimmedText.indexOf("<h") == 0) && (trimmedText.lastIndexOf("</p") == trimmedText.length-4 || trimmedText.lastIndexOf("</h") == trimmedText.length-5))
		{
			return text; // Return text unchanged
		}
	}

    // Now assume it's v2.1 or before
    if (text.indexOf("<math") == -1 && text.indexOf("<table") == -1)
    {
        return text.replace(/(\n|\r|\r\n)/g, "<br />");
    }
    else { // ignore any line breaks inside these tags as they don't work correctly with <br>
        var newText = text;
        if (newText.indexOf("<math") != -1) { // math tag found
            var tempText = "",
                mathNum = 0;

            while (newText.indexOf("<math", mathNum) != -1) {
                var text1 = newText.substring(mathNum, newText.indexOf("<math", mathNum)),
                    tableNum = 0;
                while (text1.indexOf("<table", tableNum) != -1) { // check for table tags before/between math tags
                    tempText += text1.substring(tableNum, text1.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
                    tempText += text1.substring(text1.indexOf("<table", tableNum), text1.indexOf("</table>", tableNum) + 8);
                    tableNum = text1.indexOf("</table>", tableNum) + 8;
                }
                tempText += text1.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
                tempText += newText.substring(newText.indexOf("<math", mathNum), newText.indexOf("</math>", mathNum) + 7);
                mathNum = newText.indexOf("</math>", mathNum) + 7;
            }

            var text2 = newText.substring(mathNum),
                tableNum = 0;
            while (text2.indexOf("<table", tableNum) != -1) { // check for table tags after math tags
                tempText += text2.substring(tableNum, text2.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
                tempText += text2.substring(text2.indexOf("<table", tableNum), text2.indexOf("</table>", tableNum) + 8);
                tableNum = text2.indexOf("</table>", tableNum) + 8;
            }
            tempText += text2.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
            newText = tempText;

        } else if (newText.indexOf("<table") != -1) { // no math tags - so just check table tags
            var tempText = "",
                tableNum = 0;
            while (newText.indexOf("<table", tableNum) != -1) {
                tempText += newText.substring(tableNum, newText.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
                tempText += newText.substring(newText.indexOf("<table", tableNum), newText.indexOf("</table>", tableNum) + 8);
                tableNum = newText.indexOf("</table>", tableNum) + 8;
            }
            tempText += newText.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
            newText = tempText;
        }

        return newText;
    }
}


// function called from model pages - returns reference to swfs (different depending on browser)
function x_getSWFRef(swfID) {
    var flashMovie;
    if (window.document[swfID]) {
        flashMovie = window.document[swfID];
    }
    if (navigator.appName.indexOf("Microsoft Internet") == -1) {
        if (document.embeds && document.embeds[swfID]) {
            flashMovie = document.embeds[swfID];
        }
    } else {
        flashMovie = document.getElementById(swfID);
    }
    return flashMovie;
}


// function sorts initObject data for any pages where swfs or custom html can be added (e.g. textSWF, xerteModel, navigators)
function x_sortInitObject(initObj) {
    var initObject, i, len, pair, pairs;

    if (initObj != undefined && initObj != "") {
        if (initObj.substring(0,1) == "{") { // object - just doing eval or parseJSON won't work.

            //add try ... ...catch to try the JSON parser first, which will work with valid JSON strings, else fallback to Fay's method if an error occurs.
            try {
                initObject = $.parseJSON(initObj);
            }
            catch (e) {
                pairs = initObj.replace("{", "").replace("}", "").split(","),
                initObject = {};
                for (i=0, len=pairs.length; i<len; i++) {
                    pair = temp[i].split(":");
                    initObject[$.trim(pair[0])] = eval($.trim(pair[1]));
                }
            }
        }

    } // else { initObject already is undefined }

    return initObject;
}


// function selects text (e.g. when users are to be prompted to copy text on screen)
function x_selectText(element) {
    var     text = document.getElementById(element),
        range;

    if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}


// function deals with hex values that might be abbreviated ones from the flash editor
function x_getColour(colour) {
	return colour.substring(0, 2) == '0x' ? '#' + Array(9-colour.length).join('0') + colour.substring(2) : colour;
}


// function returns black or white depending on which contrasts best with a given colour (e.g. for text over background colour)
function x_blackOrWhite(colour) {
	var rgbval = parseInt(colour.substr(1), 16),
		brightness = ((rgbval >> 16) * 0.299) + (((rgbval & 65280) >> 8) * 0.587) + ((rgbval & 255) * 0.114);

	return (brightness > 160) ? "#000000" : "#FFFFFF"; // checks whether black or white text is best on bg colour
}


// function randomises the order of items in an array
function x_shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}


// function returns whether string is a url to a youtube or vimeo video
function x_isYouTubeVimeo(url) {
	if (url.indexOf("www.youtube.com") != -1 || url.indexOf("//youtu") != -1) {
		return 'youtube';
	} else if (url.indexOf("vimeo.com") != -1) {
		return 'vimeo';
	} else {
		return false;
	}
}