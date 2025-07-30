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
var XENITH = {};
var x_languageData  = [],
    x_params        = new Object(), // all attributes of learningObject that aren't undefined
    x_pages,        // xml info about all pages in this LO
    x_pageInfo      = [],   // holds info about pages (type, built, linkID, pageID, standalone, savedData) - use savedData if any input from page needs to be saved for use on other pages or on return to this page
	x_normalPages	= [],	// indexes of pages in x_pages that are normal pages (i.e. not standalone)
	x_chapters = [], // contains details of all page chapters
	x_urlParams		= {},
	x_startPage		= {type : "index", ID : "0"},
    x_currentPage   = -1,
    x_currentPageXML,
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
	x_pageLoadPause = false,
	x_btnIcons = [
	// default interface buttons icons can be overridden:
	// x_params[custom] = should a custom btn icon be used (FA icon selected in editor)? true/false
	// x_params[name+'Icon'] = the icon to use if custom is true
	// defaultFA = old themes that use images for buttons can have all btns set to use these default FA icons using themeIcons checkbox
	// defaultIconClass = if icon isn't customised via icon selectors in editor or themeIcons checkbox, fallback to use this css style (this will mean btn icons/images set in theme will be used)
		{name: 'max',				defaultIconClass:'x_maximise',						custom: 'fullScreenIcons',	defaultFA: 'fas fa-expand-arrows-alt'}, 	// full screen on
		{name: 'min',				defaultIconClass:'x_minimise',						custom: 'fullScreenIcons',	defaultFA: 'fas fa-compress-arrows-alt'},	// full screen off
		{name: 'prev',				defaultIconClass:'x_prev',							custom: 'navIcons',			defaultFA: 'fas fa-chevron-circle-left'},	// previous page
		{name: 'next',				defaultIconClass:'x_next',							custom: 'navIcons',			defaultFA: 'fas fa-chevron-circle-right'},	// next page
		{name: 'toc',				defaultIconClass:'x_info',							custom: 'navIcons',			defaultFA: 'fas fa-bars'},					// table of contents
		{name: 'home',				defaultIconClass:'x_home',							custom: 'navIcons',			defaultFA: 'fas fa-home'},					// home page
		{name: 'hideTools',			defaultIconClass:'fa fa-angle-double-left fa-lg',	custom: 'footerToolIcons',	defaultFA: 'fas fa-angle-double-left'},		// footer tools hide
		{name: 'showTools',			defaultIconClass:'fa fa-angle-double-right fa-lg',	custom: 'footerToolIcons',	defaultFA: 'fas fa-angle-double-right'},	// footer tools show
		{name: 'accessibility',		defaultIconClass:'x_colourChanger',					custom: 'accessibilityIc',	defaultFA: 'fas fa-eye-slash'},				// accessibility options
		{name: 'help',				defaultIconClass:'x_help',							custom: 'helpIc',			defaultFA: 'fas fa-question'},				// project help file
		{name: 'saveSession',		defaultIconClass:'x_saveSession',					custom: 'saveSessionIc',	defaultFA: 'fas fa-save'},					// save session
		{name: 'glossary',			defaultIconClass:'x_glossary',						custom: 'glossaryIc',		defaultFA: 'fas fa-book'},					// glossary
		{name: 'resource',			defaultIconClass:'fa fa-folder-open',				custom: 'resourceIc',		defaultFA: 'fa fa-folder-open'},			// resources
		{name: 'intro',				defaultIconClass:'x_projectIntro',					custom: 'introIc',			defaultFA: 'fas fa-info'},					// project introduction
		{name: 'pageIntro',			defaultIconClass:'fas fa-info',						custom: 'pageIntroIc',		defaultFA: 'fas fa-info'}					// page introduction
	];
	
// Determine whether offline mode or not
var xot_offline = !(typeof modelfilestrs === 'undefined');
var modelfilestrs = modelfilestrs || [];

var $x_window, $x_body, $x_head, $x_mainHolder, $x_mobileScroll, $x_headerBlock, $x_pageHolder, $x_helperText, $x_pageDiv, $x_footerBlock, $x_footerL,
	$x_introBtn, $x_helpBtn, $x_pageIntroBtn, $x_pageResourcesBtn, $x_glossaryBtn, $x_menuBtn, $x_colourChangerBtn, $x_saveSessionBtn, $x_prevBtn, $x_pageNo, $x_nextBtn, $x_cssBtn, $x_background;

$(document).keydown(function(e) {
	// if lightbox open then don't allow page up/down buttons to change the page open in the background
	// Place lightbox check in a try block, because an exception will be triggered if LO is embedded in an iframe
	let shownInFeatherlight = false;
	try
	{
		shownInFeatherlight = parent.window.$.featherlight.current();
	}
	catch (e)
	{
		// Ignore
	}
	if (!shownInFeatherlight) {
		switch(e.which) {
			case 33: // PgUp
				var pageIndex = $.inArray(x_currentPage, x_normalPages);
				if (pageIndex > -1 && $x_prevBtn.is(":enabled") && $x_nextBtn.is(":visible")) {
					if (x_params.navigation != "Historic" && x_params.navigation != "LinearWithHistoric") {
						// linear back
						if (pageIndex > 0) {
							x_changePage(x_normalPages[pageIndex -1]);
						}
						
					} else {
						var prevPage = x_pageHistory[x_pageHistory.length-2];
						x_pageHistory.splice(x_pageHistory.length - 2, 2);
						
						// check if history is empty and if so allow normal back navigation and change to normal back button
						if (prevPage == undefined && x_currentPage > 0) {
							x_changePage(x_normalPages[pageIndex -1]);
						} else {
							x_changePage(prevPage);
						}
					}
				} else if (pageIndex == -1) {
					// historic back (standalone page)
					if (history.length > 1 && (x_params.forcePage1 != 'true' || shownInFeatherlight)) {
						history.go(-1);
					} else {
						x_changePage(x_normalPages[0]);
					}
				}
				break;

			case 34: // PgDn
				// if it's a standalone page then nothing will happen
				var pageIndex = $.inArray(x_currentPage, x_normalPages);
				if (pageIndex != -1 && $x_nextBtn.is(":enabled") && $x_nextBtn.is(":visible")) {
					x_changePage(x_normalPages[pageIndex + 1]);
				}
				break;

			default: return; // exit this handler for other keys
		}
	} else {
		return;
	}
});

$(document).ready(function() {
	
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
	
	// detect touchscreen function (https://patrickhlauke.github.io/touch/touchscreen-detection/)
	function detectTouchscreen() {
		var result = false;
		if (window.PointerEvent && ('maxTouchPoints' in navigator)) {
			// if Pointer Events are supported, just check maxTouchPoints
			if (navigator.maxTouchPoints > 0) {
			result = true;
			}
		} else {
			// no Pointer Events...
			if (window.matchMedia && window.matchMedia("(any-pointer:coarse)").matches) {
				// check for any-pointer:coarse which mostly means touchscreen
				result = true;
			} else if (window.TouchEvent || ('ontouchstart' in window)) {
				// last resort - check for exposed touch events API / event handler
				result = true;
			}
		}
		return result;
	}
	
	x_browserInfo.touchScreen = detectTouchscreen();
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
		var now = new Date().getTime();
    	let url = "website_code/php/templates/get_template_xml.php?file=" + x_projectXML + "&time=" + now;
    	if (typeof use_url !== "undefined" && use_url)
		{
			url = x_projectXML + "?time=" + now;
		}
        $.ajax({
            type: "GET",
            url: url,
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

x_pagesViewed = function()
{
	var viewed = [];
	x_pageInfo.forEach(function(item, index){
		if (item.viewed) {
			viewed.push(index);
		}
	});
	return viewed;
}

x_restorePagesViewed = function(viewed)
{
	viewed.forEach(function(item){
		x_pageInfo[item].viewed = true;
	});
}

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

	// sort any parameters in url - these will override those in xml
	var tempUrlParams = window.location.href.slice(window.location.href.indexOf('?') + 1).split(/[#&]/),
		hash;

	for (var i=0; i<tempUrlParams.length; i++) {
		var split = tempUrlParams[i].split("=");
		if (split.length == 2) {
			x_urlParams[split[0]] = split[1];
		} else {
			hash = tempUrlParams[i];
		}
	}

    x_pages = xmlData.children();
	var pageToHide = [],
		currActPage = 0;

	// remove pages from chapters and put directly in x_pages
	// keep record of chapter details in x_chapters and keep track of which page belongs in each chapter
	let tempPages = [];
	x_pages.each(function (i) {
		const $this = $(this)
		if ($this[0].nodeName === "chapter") {
			$($this.children()).each(function() {
				const $thisChild = $(this);
				$thisChild[0].setAttribute("chapterIndex", x_chapters.length);

				// if the chapter is a standalone chapter then all pages within it will take on the same standalone properties
				// unless the page has separate standalone properties set - these will take priority
				const standAloneAttrs = ["linkPage", "linkTarget", "headerHide", "footerHide", "reqProgress"];
				if ($thisChild[0].getAttribute(standAloneAttrs[0]) === null && $this[0].getAttribute(standAloneAttrs[0] + "Chapter") === 'true') {
					$(standAloneAttrs).each(function() {
						$thisChild[0].setAttribute(this, $this[0].getAttribute(this + "Chapter"));
					});
				}

				tempPages.push($thisChild[0]);
			});

			const chapterInfo = {};
			for (let i=0; i<$this[0].attributes.length; i++) {
				chapterInfo[$this[0].attributes[i].name] = $this[0].attributes[i].value;
			}

			x_chapters.push(chapterInfo);
		} else {
			tempPages.push($this[0]);
		}
	});
	x_pages = $(tempPages);
	
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
			
			var skipHideDateCheck = false,
				hideOnInfo,
				hideUntilInfo;
			
			if ($(this)[0].getAttribute("hideOnDate") != undefined && $(this)[0].getAttribute("hideOnDate") != '') {
				hideOnInfo = getDateInfo($(this)[0].getAttribute("hideOnDate"), $(this)[0].getAttribute("hideOnTime"));
				hideOn = hideOnInfo[0];
			}
			
			if ($(this)[0].getAttribute("hideUntilDate") != undefined && $(this)[0].getAttribute("hideUntilDate") != '') {
				hideUntilInfo = getDateInfo($(this)[0].getAttribute("hideUntilDate"), $(this)[0].getAttribute("hideUntilTime"));
				hideUntil = hideUntilInfo[0];
			}
			
			// if hide from & to date/times are identical then hide (to prevent issue with a previous release where these were never blank but pages should have been hidden)
			if ($(this)[0].getAttribute("hideOnDate") != undefined && $(this)[0].getAttribute("hideOnDate") != '' && $(this)[0].getAttribute("hideUntilDate") != undefined && $(this)[0].getAttribute("hideUntilDate") != '') {
				if (hideOn.day == hideUntil.day && hideOn.month == hideUntil.month && hideOn.year == hideUntil.year) {
					if ($(this)[0].getAttribute("hideOnTime") == $(this)[0].getAttribute("hideUntilTime") || $(this)[0].getAttribute("hideOnTime") == '' || $(this)[0].getAttribute("hideUntilTime") == '') {
						skipHideDateCheck = true;
					}
				}
			}
			
			if (skipHideDateCheck != true) {
				// is it hidden from a certain date? if so, have we passed that date/time?
				if ($(this)[0].getAttribute("hideOnDate") != undefined && $(this)[0].getAttribute("hideOnDate") != '') {

					if (hideOn != false) {
						if (hideOn.year > now.year || (hideOn.year == now.year && hideOn.month > now.month) || (hideOn.year == now.year && hideOn.month == now.month && hideOn.day > now.day) || (hideOn.year == now.year && hideOn.month == now.month && hideOn.day == now.day && hideOn.time > now.time)) {
							hidePage = false;
						}

						hideOnString = '{from}: ' + hideOnInfo[1] + ' ' + $(this)[0].getAttribute("hideOnTime");
					}
				}

				// is it hidden until a certain date? if so, have we passed that date/time?
				if ($(this)[0].getAttribute("hideUntilDate") != undefined && $(this)[0].getAttribute("hideUntilDate") != '') {
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

						hideUntilString = '{until}: ' + hideUntilInfo[1] + ' ' + $(this)[0].getAttribute("hideUntilTime");
					}
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
				pageID = $.trim($(this)[0].getAttribute("pageID")),
				page = {type: $(this)[0].nodeName, built: false, viewed: false};
			
			if (linkID != undefined) {
				page.linkID = linkID;
			}
			
			// pageID optional property was deprecated previously but has been brought back
			// it's now blank when added to editor but need to ignore default text that used to be in field prior to it being deprecated
			if (pageID != undefined && pageID != "" && pageID != "Unique ID for this page") {
				// if pages have custom ID then make sure they don't include spaces
				page.pageID = pageID.split(" ").join("_");
			}

			// Get child linkIDs for deeplinking
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
			
			// is this a standalone page?
			if ($(this)[0].getAttribute("linkPage") == 'true') {
				page.standalone = true;
			}
			
			x_pageInfo.push(page);
			
            if (($(this)[0].getAttribute("unmarkForCompletion") === "false" || $(this)[0].getAttribute("unmarkForCompletion") == undefined) && this.nodeName !== "results" )
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
	
	// removes hidden pages from x_pages array
	var numPages = x_pages.length,
		offset = 0;
	
	for (var i=0; i<numPages; i++) {
		if (pageToHide.indexOf(i) != -1) {
			x_pages.splice(i-offset, 1);
			offset++;
		}
	}

	// make array containing indexes of normal pages (not standalone)
	for (var i=0; i<x_pageInfo.length; i++) {
		if (x_pageInfo[i].standalone != true) {
			x_normalPages.push(i);
		}
	}

	// will a sidebar need to be built?
	// need to know now as depending on how it's set up it can change the navigation and displayMode
	XENITH.SIDEBAR.init();
	
    if (x_normalPages.length < 2) {
        // don't show navigation options if there's only one page
        $("#x_footerBlock .x_floatRight").remove();
    } else {
        if (x_params.navigation == undefined) {
            x_params.navigation = "Linear";
        }

		if (x_params.navigation != "Linear" && x_params.navigation != "LinearWithHistoric" && x_params.navigation != "Historic" && x_params.navigation != undefined) {
			XENITH.PAGEMENU.init("page");
		}
    }

    if (x_params.fixDisplay != undefined) {
        if ($.isNumeric(x_params.fixDisplay.split(",")[0]) == true && $.isNumeric(x_params.fixDisplay.split(",")[1]) == true) {
            x_params.displayMode = x_params.fixDisplay.split(",");
            x_fillWindow = false; // overrides fill window for touchscreen devices
        }
    }
	
	// there are several URL params that can determine the 1st page viewed - check if they are valid pages before setting start page
	var customStartPage = false;
	
	if (x_urlParams.linkID) { // ID auto-generated in xwd e.g. URL/play_123&linkID=PG1593081880325
		var temp = getDeepLink(x_urlParams.linkID);
		if (temp.length > 1) {
			x_deepLink = temp[1];
		}
		
		var validPage = x_lookupPage("linkID", temp[0]);
		if (validPage !== false) {
			x_startPage = { type : "index", ID : validPage };
			customStartPage = true;
		}
		
		delete x_urlParams.linkID;
	}
	
	if (x_urlParams.pageID) { // ID created by author OR auto-generated in xwd e.g. URL/play_123&pageID=customID OR URL/play_123&pageID=PG1593081880325
		var temp = getDeepLink(x_urlParams.pageID);
		if (temp.length > 1) {
			x_deepLink = temp[1];
		}
		
		var validPage = x_lookupPage("pageID", temp[0]);
		if (validPage !== false) {
			x_startPage = { type : "index", ID : validPage };
			customStartPage = true;
		}
		
		delete x_urlParams.pageID;
	}
	
	if (x_urlParams.page) { // ID created by author OR numeric page number e.g. URL/play_123&page=customID OR URL/play_123&page=5
		var temp = getDeepLink(x_urlParams.page);
		if (temp.length > 1) {
			x_deepLink = temp[1];
		}
		
		var validPage = x_lookupPage("pageID", temp[0]);
		if (validPage !== false) {
			x_startPage = {type : "index", ID : validPage};
			customStartPage = true;
			
		} else {
			if ($.isNumeric(temp[0]) && temp[0] <= x_normalPages.length) {
				var tempIndex = x_normalPages[Number(temp[0])-1];
				x_startPage = { type : "index", ID : tempIndex };
				customStartPage = true;
			}
		}
		
		delete x_urlParams.page;
	}
	
	if (x_urlParams.resume) { // Numeric page number e.g. URL/play_123#resume=5 - deprecated but needs to work for existing links
		var temp = getDeepLink(x_urlParams.resume);
		if (temp.length > 1) {
			x_deepLink = temp[1];
		}
		
		if ($.isNumeric(temp[0]) && temp[0] <= x_normalPages.length) {
			var tempIndex = x_normalPages[Number(temp[0])-1];
			x_startPage = { type : "index", ID : tempIndex };
			customStartPage = true;
		}
		
		delete x_urlParams.resume;
	}
	
	if (hash != undefined) { // ID created by author OR numeric page number e.g. URL/play_123#customID OR URL/play_123#page5 OR URL/play_123#5
		var temp = getDeepLink(hash);
		if (temp.length > 1) {
			x_deepLink = temp[1];
		}
		
		var info = getHashInfo(temp[0]);
		if (info !== false) {
			x_startPage = {type : "index", ID : info};
			customStartPage = true;
		}
	}

	// any params in URL which can change the start page can be disabled from working by adding optional property
	// also, if 1st page is project is standalone page then it should default to 1st non-standalone page instead
	if (x_pageInfo[x_startPage.ID] != undefined) {
		if ((x_pageInfo[x_startPage.ID].standalone == true && customStartPage == false) || 
			(x_params.forcePage1 == 'true' && customStartPage == true && (x_pageInfo[x_startPage.ID].standalone == undefined || x_pageInfo[x_startPage.ID].standalone == false))) {
			var tempIndex;
			for (var i=0; i<x_pageInfo.length; i++) {
				if (x_pageInfo[i].standalone != true) {
					tempIndex = i;
					break;
				}
			}
			
			if (tempIndex) {
				x_startPage = {type : "index", ID : String(tempIndex)};
			} else {
				x_startPage = {type : "index", ID : "0"};
			}
		}
	}
	
	// tidy up the URL to remove all of the params about start page - hash at end of URL will change according to currently viewed page
	var shortParams = "";
	Object.keys(x_urlParams).forEach(function(key, index) {
		shortParams += index==0 ? '?' : '&';
		shortParams += key + '=' + x_urlParams[key];
	});
	
	// change URL params without reloading the page
	window.history.pushState('window.location.href', "", shortParams);

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
            if (x_browserInfo.mobile == true) {
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

	// url parameter to turn responsive text on / off
	if (x_urlParams.responsiveTxt != undefined && (x_urlParams.responsiveTxt == "true" || x_urlParams.responsiveTxt == "false")) {
		x_params.responsive = x_urlParams.responsiveTxt;
	}

	// url parameters to change default theme used
	if (x_urlParams.theme != undefined && (x_params.themeurl == undefined || x_params.themeurl != 'true')) {
        x_params.theme = x_urlParams.theme;
    }

	// url parameters to change to remove background images or use a special theme selected via the accessibility options
	// these will only be present if this is a standalone page opening in a new window or lightbox - ensure that if the parent project that opened this was using a special theme / no bg images then this should too
	if (x_urlParams.specialTheme != undefined) {
		XENITH.ACCESSIBILITY.specialTheme = x_urlParams.specialTheme;
	}
	if (x_urlParams.removeBg != undefined) {
		XENITH.ACCESSIBILITY.removeBg = x_urlParams.removeBg;
	}
	if (x_params.responsive == "true") {
		XENITH.ACCESSIBILITY.responsiveTxt = true;
	} else {
		XENITH.ACCESSIBILITY.responsiveTxt = null;
	}
	
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
	if (typeof x_embed == "undefined")
	{
		x_embed = false;
		x_embed_activated = false;
	}
	if (x_embed && !x_embed_activated)
	{
		// Activate overlay
		$("#x_embed_overlay")
			.switchClass("embed-overlay-inactive", "embed-overlay")
			.click(function(){
				window.location = x_embed_activation_url;
			})
			.append("<span><i class='far fa-play-circle fa-2x'></i></span>");
	}
	
	x_getThemeInfo(x_params.theme);
}

function x_getThemeInfo(thisTheme, themeChg) {
	// what icons / images will be used on interface buttons?
	// some older themes use images for interface buttons (not FontAwesome icons) - it's only these themes that can fall back to use the defaultFA (all others should have FA icons set in theme)
	// these themes should have imgbtns: true in the theme info file
	if (thisTheme == undefined || thisTheme == "default") {
		x_params.theme = "default";
		x_setUpThemeBtns({imgbtns: 'true'}, themeChg);
	} else if (xot_offline) {
		const temp = themeinfo.split('\n'),
			themeInfo = {};

		for (let i=0; i<temp.length; i++) {
			if (temp[i].split(':').length > 1) {
				themeInfo[temp[i].split(':')[0]] = temp[i].split(':')[1].trim();
			}
		}

		x_setUpThemeBtns(themeInfo, themeChg);

	} else {
		$.ajax({
			type: "GET",
			url: x_themePath + thisTheme + '/' + thisTheme + '.info',
			dataType: "text",
			success: function (text) {
				const temp = text.split('\n'),
					themeInfo = {};
				
				for (let i=0; i<temp.length; i++) {
					if (temp[i].split(':').length > 1) {
						themeInfo[temp[i].split(':')[0]] = temp[i].split(':')[1].trim();
					}
				}
				
				x_setUpThemeBtns(themeInfo, themeChg);
			},
			error: function(err) {
				if (err.status == 404)
				{
					// Fall back to default
					x_params.theme = "default";
					x_setUpThemeBtns({ imgbtns: 'true' }, themeChg);
				}
				else
				{
					x_setUpThemeBtns({}, themeChg);
				}
			}
		});
	}
}

function x_setUpThemeBtns(themeInfo, themeChg) {
	let themeIcons = x_params.themeIcons;
	if (themeIcons != 'true' || themeInfo.imgbtns != 'true') {
		themeIcons = false;
	}

	for (let i=0; i<x_btnIcons.length; i++) {
		x_btnIcons[i].customised = false;
		x_btnIcons[i].btnImgs = false;
		x_btnIcons[i].iconClass = x_btnIcons[i].defaultIconClass;
		
		const tempName = x_btnIcons[i].name == 'home' ? 'toc' : x_btnIcons[i].name;
		
		if (x_params[x_btnIcons[i].custom] == 'true') {
			// a custom icon has individually been selected in editor for this button
			x_btnIcons[i].iconClass = x_params[x_btnIcons[i].name + 'Icon'];
			x_btnIcons[i].customised = true;

		} else if (themeIcons == 'true' || (themeInfo.imgbtns == 'true' && XENITH.SIDEBAR.btnIndex(tempName) != -1)) {
			// it's an old theme where all button images are to be overridden with the default FontAwesome icons
			// either because update theme icons is checked or button is on sidebar
			x_btnIcons[i].iconClass = x_btnIcons[i].defaultFA;
			x_btnIcons[i].customised = true;
		} else if (themeInfo.imgbtns == 'true') {
			x_btnIcons[i].btnImgs = true;
		}
		
	}

	if (themeChg !== true) {
		x_getLangData(x_params.language); // x_setUp() function called in here after language file loaded
		
	} else {
		// theme has been changed sometime after the project has already loaded
		// change classes on interface buttons as new theme may use a different type of btn (FontAwesome / image)
		var btns = [ { btn: $x_helpBtn, name: 'help' }, { btn: $x_introBtn, name: 'intro' }, { btn: $x_colourChangerBtn, name: 'accessibility' }, { btn: $x_nextBtn, name: 'next' }, { btn: $x_saveSessionBtn, name: 'saveSession' }, { btn: $x_glossaryBtn, name: 'glossary' } ];

		for (let i=0; i<btns.length; i++) {
			if (btns[i].btn != undefined) {
				const btnIcon = x_btnIcons.filter(function(icon){return icon.name === btns[i].name;})[0];
				btns[i].btn.button({ icons: { primary: btnIcon.iconClass } });
				if (btnIcon.customised == true) { btns[i].btn.addClass("customIconBtn"); } else { btns[i].btn.removeClass("customIconBtn");  };
				if (btnIcon.btnImgs == true) { btns[i].btn.addClass("imgIconBtn"); } else { btns[i].btn.removeClass("imgIconBtn"); };
			}
		}
		
		// now do btns where icon works slightly differently
		if ($x_cssBtn != undefined) {
			let btnIcon;
			if (x_fillWindow == false) {
				btnIcon = x_btnIcons.filter(function(icon){return icon.name === 'max';})[0];
			} else {
				btnIcon = x_btnIcons.filter(function(icon){return icon.name === 'min';})[0];
			}
			$x_cssBtn.button({ icons: { primary: btnIcon.iconClass } });
			if (btnIcon.customised == true) { $x_cssBtn.addClass("customIconBtn"); } else { $x_cssBtn.removeClass("customIconBtn");  };
			if (btnIcon.btnImgs == true) { $x_cssBtn.addClass("imgIconBtn"); } else { $x_cssBtn.removeClass("imgIconBtn"); };
		}
		
		if ($x_prevBtn != undefined) {
			const btnIcon = x_btnIcons.filter(function(icon){return icon.name === 'prev';})[0];
			if ((x_params.navigation == "Historic" || x_params.navigation == "LinearWithHistoric") && btnIcon.customised === false) {
				btnIcon.iconClass = "x_prev_hist";
			}
			$x_prevBtn.button({ icons: { primary: btnIcon.iconClass } });
			if (btnIcon.customised == true) { $x_prevBtn.addClass("customIconBtn"); } else { $x_prevBtn.removeClass("customIconBtn");  };
			if (btnIcon.btnImgs == true) { $x_prevBtn.addClass("imgIconBtn"); } else { $x_prevBtn.removeClass("imgIconBtn"); };
		}
		
		if ($x_menuBtn != undefined) {
			let btnIcon = x_btnIcons.filter(function(icon){return icon.name === 'toc';})[0];
			if (x_params.navigation == "Historic") {
				btnIcon = x_btnIcons.filter(function(icon){return icon.name === 'home';})[0];
			}
			$x_menuBtn.button({ icons: { primary: btnIcon.iconClass } });
			if (btnIcon.customised == true) { $x_menuBtn.addClass("customIconBtn"); } else { $x_menuBtn.removeClass("customIconBtn");  };
			if (btnIcon.btnImgs == true) { $x_menuBtn.addClass("imgIconBtn"); } else { $x_menuBtn.removeClass("imgIconBtn"); };
		}
	}
}

// browser back / fwd button will trigger this - manually make page change to match #pageX
window.onhashchange = function() {
	// ignore if triggered by the skip link
	if (window.location.hash != "#pageContents") {
		if (x_params.forcePage1 != 'true') {
			var temp = getDeepLink(window.location.hash);
			if (temp.length > 1) {
				x_deepLink = temp[1];
			}

			var pageInfo = getHashInfo(temp[0]);

			if (pageInfo !== false) {
				x_navigateToPage(false, {type: "index", "ID": pageInfo}, false);
			}
		}

		// force lightbox to close
		// catch error  - in case we're in an iframe, i.e. bootstrap or LMS LTI link
		try {
			if (parent.window.$.featherlight.current()) {
				parent.window.$.featherlight.current().close();
			}
		} catch (e) {}
	}
}

// Get the page info from the URL (called on project load & when page changed via browser fwd/back btns)
function getHashInfo(urlHash) {
	if (urlHash.length > 0) {
		var pageLink = urlHash[0] == '#' ? urlHash.substring(1) : urlHash,
			thisPage;
		
		if (pageLink.substring(0,4) == "page" && pageLink != "pageContents") { // numeric page number e.g. URL/play_123#page5
			var tempNum = Number(pageLink.substring(4));
			if (tempNum < 1 || tempNum > x_normalPages.length) {
				thisPage = false;
			} else {
				thisPage = x_normalPages[tempNum-1];
			}
			
		} else { // ID created by author OR numeric page number e.g. URL/play_123#customID OR URL/play_123#page5 OR URL/play_123#5
			const validPage = x_lookupPage("pageID", pageLink);
			const validChapter = x_lookupPage("chapterID", pageLink);
			if (validPage !== false) {
				thisPage = validPage;
				
			} else if (validChapter !== false) {
				thisPage = validChapter;

			} else if ($.isNumeric(pageLink)) {
				var tempNum = Number(pageLink);
				if (tempNum < 1 || tempNum > x_normalPages.length) {
					thisPage = false;
				} else {
					thisPage = x_normalPages[tempNum-1];
				}
			} else {
				thisPage = false;
			}
		}
		return thisPage;
		
	} else {
		return false;
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
	// Fix annoying characters that can cause issues
	// At this time the ascii character STX (soft hyphen) -> replace with '-'
	text = text.replace(/\u0002/g, "-");

    var split_up = text.split(/<\!\[CDATA\[|\]\]>/),
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
        langxmlstr = langxmlstr.substr(langxmlstr.indexOf("<"), langxmlstr.lastIndexOf(">") + 1);
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
            else return eval(url);
        }
        else return eval(url);
    }
    else return url;
}

function x_GetTrackingTextFromHTML(html, fallback)
{
    var div = $('<div>').html(html);
    var txt = $.trim(div.text());
    if (txt == "") {
        var img = div.find("img");
        if (img != undefined && img.length > 0) txt = img[0].attributes['alt'].value;
    }
    if (txt == "") txt = fallback;

    return txt;
}

// Gets the trackinglabel of the current page.
// This is either the page's name or (if set) a custom label.
function x_GetTrackingLabelOfPage() {
	var trackinglabel = $('<div>').html(x_currentPageXML.getAttribute("name")).text();
	if (x_currentPageXML.getAttribute("trackinglabel") != undefined && x_currentPageXML.getAttribute("trackinglabel") != "")
	{
		trackinglabel = x_currentPageXML.getAttribute("trackinglabel");
	}
	return trackinglabel;
}

// setup functions load interface buttons and events
function x_setUp() {

	$(".skip-link").html(x_getLangInfo(x_languageData.find("skip")[0], "label", "Skip to main content"));
	
	// prevent flashes of css body tag colours before the main interface has loaded
	$('head').append('<style id="preventFlash">body, #x_mainHolder { background: white !important; }; </style>');
	
	x_params.dialogTxt = x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "dialog", "") != "" && x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "dialog", "") != null ? " (" + x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "dialog", "") + ")" : "";
	x_params.newWindowTxt = x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "newWindow", "") != "" && x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "newWindow", "") != null ? " (" + x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "newWindow", "") + ")" : "";

	if (x_normalPages.length == 0) {
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
		$x_colourChangerBtn		= $("#x_colourChangerBtn");
		$x_saveSessionBtn = $("#x_saveSessionBtn");
		$x_prevBtn		= $("#x_prevBtn");
		$x_pageNo		= $("#x_pageNo");
		$x_nextBtn		= $("#x_nextBtn");
		$x_background	= $("#x_background");

		x_setProjectTxtSize();

		if (x_params.authorSupport == "true") {
			var msg = x_getLangInfo(x_languageData.find("authorSupport")[0], "label", "") != "" && x_getLangInfo(x_languageData.find("authorSupport")[0], "label", "") != null ? x_getLangInfo(x_languageData.find("authorSupport")[0], "label", "") : "Author Support is ON: text shown in red will not appear in live projects.";
			$x_headerBlock.prepend('<div id="x_authorSupportMsg" class="alert"><p>' + msg + '</p></div>');
		}

		$x_headerBlock.find('h2').append('<span id="x_pageTitle"></span>');

		// calculate author set variables
		if (x_params.variables != undefined) {
			XENITH.VARIABLES.init(x_params.variables);
		}
		
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
	if (x_params.embed != true && x_params.displayMode != 'full screen' && x_params.displayMode != 'fill window') {
		$x_cssBtn = $('<button id="x_cssBtn"></button>').prependTo($x_footerL);

		const maxBtnIcon = x_btnIcons.filter(function(icon){return icon.name === 'max';})[0];
		
		$x_cssBtn
			.button({
				icons:	{
					primary: maxBtnIcon.iconClass
				},
				// label can now be set in editor but fall back to language file if not set
				label: x_params.maxLabel != undefined && x_params.maxLabel != "" ? x_params.maxLabel : x_getLangInfo(x_languageData.find("sizes").find("item")[3], false, "Full screen"),
				text:	false
			})
			.addClass('x_maximise')
            .attr("aria-label", $x_cssBtn.attr("title"))
			.click(function() {
				// Post flag to containing page for iframe resizing
				if (window && window.parent && window.parent.postMessage) {
					window.parent.postMessage((String)(!x_fillWindow), "*");
				}

				if (x_fillWindow == false) {
					// maximise
					x_setFillWindow();
					
				} else {
					// minimise
					if (XENITH.ACCESSIBILITY.responsiveTxt === true) {
						// turn off responsive text
						XENITH.ACCESSIBILITY.changeResponsiveTxt(false, false);
					}

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

					$(this)
						.button({
							icons:	{ primary: x_btnIcons.filter(function(icon){return icon.name === 'max';})[0].iconClass },
							label:	x_params.maxLabel != undefined && x_params.maxLabel != "" ? x_params.maxLabel : x_getLangInfo(x_languageData.find("sizes").find("item")[3], false, "Full screen")
						})
						.addClass('x_maximise').removeClass("x_minimise");
					
					x_fillWindow = false;
					x_updateCss();
				}
				$(this)
					.blur()
					.removeClass("ui-state-focus")
					.removeClass("ui-state-hover");
			});
		
		if (maxBtnIcon.customised == true) {
			$x_cssBtn.addClass("customIconBtn");
		}
		if (maxBtnIcon.btnImgs == true) {
			$x_cssBtn.addClass("imgIconBtn");
		}
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
	param = (typeof param !== 'undefined') ?  param : "language";

	switch(param) {
        case "language":
			if (x_params.kblanguage != undefined) {
				x_insertCSS(x_templateLocation + "models_html5/language.css", function() {x_cssSetUp("glossary")});
			} else {
				x_cssSetUp("glossary");
			}
            break;
        case "glossary":
			if (x_params.glossary != undefined) {
				x_insertCSS(x_templateLocation + "models_html5/glossary.css", function() {x_cssSetUp("saveSession")});
			} else {
				x_cssSetUp("saveSession");
			}
            break;
		case "saveSession":
			x_insertCSS(x_templateLocation + "models_html5/saveSession.css", function() {x_cssSetUp("responsive")});
			break;
		case "responsive":
            if (x_params.responsive == "true") {
				// adds default responsiveText.css - in some circumstances this will be immediately disabled
				if (x_params.displayMode == "default" || $.isArray(x_params.displayMode)) { // immediately disable responsivetext.css after loaded
					x_insertCSS(x_templateLocation + "common_html5/css/responsivetext.css", function () {x_cssSetUp("theme")}, true);
				} else {
					x_insertCSS(x_templateLocation + "common_html5/css/responsivetext.css", function () {x_cssSetUp("theme")});
                }
			} else {
				x_cssSetUp("theme");
			}
            break;
		case "theme":
			if (x_params.theme != undefined) {
				if (!xot_offline) {
					$.getScript(x_themePath + x_params.theme + '/' + x_params.theme + '.js') // most themes won't have this js file
						.done(function() {
							x_cssSetUp("themeCss");
						}).fail(function() {
							x_cssSetUp("themeCss");
						});
				}
			} else {
				x_cssSetUp("projectStylesheet");
			}
			break;
		case "themeCss":
			if (x_params.theme != undefined) {
				x_insertCSS(x_themePath + x_params.theme + '/' + x_params.theme + '.css', function () {
					x_cssSetUp("responsivetheme");
				}, false, "theme_css", true);
			} else {
				x_cssSetUp("projectStylesheet");
			}
			break;
		case "responsivetheme":
			if (x_params.responsive == "true" && x_params.theme != "default") {
				// adds theme responsivetext.css - in some circumstances this will be immediately disabled
				if (x_params.displayMode == "default" || $.isArray(x_params.displayMode)) { // immediately disable responsivetext.css after loaded
					x_insertCSS(x_themePath + x_params.theme + "/responsivetext.css", function () {x_cssSetUp("projectStylesheet")}, true, "theme_responsive_css", true);
				} else {
					x_insertCSS(x_themePath + x_params.theme + "/responsivetext.css", function () {x_cssSetUp("projectStylesheet")}, false, "theme_responsive_css", true);
				}
			} else {
				x_cssSetUp("projectStylesheet");
			}
			break;
		case "projectStylesheet":
			if (x_params.stylesheet != undefined && x_params.stylesheet != "") {
				x_insertCSS(x_evalURL(x_params.stylesheet), function () {x_cssSetUp("projectCss")}, false, "lo_sheet_css");
			} else {
				x_cssSetUp("projectCss")
			}
			break;
		case "projectCss":
			if (x_params.styles != undefined || x_params.lightboxColour != undefined || x_params.lightboxOpacity != undefined) {
				let lightboxStyle = '';
				const loStyles = x_params.styles != undefined ? x_params.styles : '';

				if (x_params.lightboxColour != undefined || x_params.lightboxOpacity != undefined) {
					lightboxColour = x_params.lightboxColour != undefined ? x_params.lightboxColour.substr(x_params.lightboxColour.length - 6) : '000000';
					lightboxOpacity = x_params.lightboxOpacity != undefined ? x_params.lightboxOpacity / 100 : '0.8';
					lightboxStyle = '.featherlight:last-of-type { background:' + x_hexToRgb(lightboxColour, lightboxOpacity) + ';}';
				}

				$x_head.append('<style id="lo_css">' + lightboxStyle + ' ' + loStyles + '</style>');
			}
			x_continueSetUp1();
			break;
    }
}

function x_KeepAlive()
{
	const now = new Date().getTime();
	let url = "website_code/php/keepalive.php" + "?t=" + now;
	if (typeof sessionParam !== 'undefined')
	{
		url = "website_code/php/keepalive.php" + sessionParam + "&t=" + now;
	}

	setTimeout(function(){
		$.ajax({
			type: "GET",
			url: url,
			dataType: "json",
			success: function (data) {
				x_KeepAlive();
			}
		})
	}, 600000);
}

// clunky fix for issue where Firefox triggers css loaded event (which then triggers x_continueSetUp1) everytime the responsive stylesheet is enabled when changing from small view to full screen
var setUpComplete = false;
function x_continueSetUp1() {
	if (setUpComplete == false) {
		XENITH.ACCESSIBILITY.init();

		if (XENITH.PAGEMENU.menuPage) {
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
			XENITH.PAGEMENU.init("dialog");
		}

		// add project help button to footer bar that opens file (or URL) in new window or lightbox
		var trimmedNfo = $.trim(x_params.nfo);
		if (x_params.nfo != undefined && trimmedNfo != '') {
			
			const helpIcon = x_btnIcons.filter(function(icon){return icon.name === 'help';})[0];
			$x_helpBtn = $('<button id="x_helpBtn"></button>').prependTo($x_footerL);
			
			$x_helpBtn
				.button({
					icons: {
						primary: helpIcon.iconClass
					},
					// label can now be set in editor but fall back to language file if not set
					label: x_params.helpLabel != undefined && x_params.helpLabel != "" ? x_params.helpLabel : x_getLangInfo(x_languageData.find("helpButton")[0], "label", "Help"),
					text:	false
				})
				.attr("aria-label", $x_helpBtn.attr("title") + (x_params.helpTarget != 'lightbox' ? x_params.newWindowTxt : x_params.dialogTxt))
				.click(function() {
					if (x_params.helpTarget != 'lightbox') {
						window.open(x_evalURL(x_params.nfo), "_blank");
					} else {
						$.featherlight({iframe: x_evalURL(x_params.nfo), iframeWidth: $x_mainHolder.width()*0.8, iframeHeight: $x_mainHolder.height()*0.8});
					}
					
					$(this)
						.blur()
						.removeClass("ui-state-focus")
						.removeClass("ui-state-hover");
				});
			
			if (helpIcon.customised == true) {
				$x_helpBtn.addClass("customIconBtn");
			}
			if (helpIcon.btnImgs == true) {
				$x_helpBtn.addClass("imgIconBtn");
			}
		}
		
		if (x_params.glossary != undefined) XENITH.GLOSSARY.init();
		
		// add project intro button to footer bar that opens lightbox
		if (x_getIntroInfo('project') != false) {
			
			const introInfo = x_getIntroInfo('project');
			const introIcon = x_btnIcons.filter(function(icon){return icon.name === 'intro';})[0];
			$x_introBtn = $('<button id="x_introBtn"></button>').prependTo($x_footerL);
		
			$x_introBtn
				.button({
					icons: {
						primary: introIcon.iconClass
					},
					// label can be set in editor but fall back to language file if not set
					label: x_params.introLabel != undefined && x_params.introLabel != "" ? x_params.introLabel : x_getLangInfo(x_languageData.find("projectIntroButton")[0], "label", "Introduction"),
					text: false
				})
				.attr("aria-label", $x_introBtn.attr("title") + x_params.dialogTxt)
				.click(function() {
					const $thisBtn = $(this);
					let lb;
					
					// set up close btn
					const $introStartBtn = $('<button id="x_introStartBtn"></button>')
						.button({ label: $.trim(x_params.introBtnTxt) })
						.click(function() {
							$.featherlight.current().close();
						});
					
					// there are different types of content that might appear in project intro lightbox
					if (introInfo.type == 'img') {
						lb = $.featherlight({
							image: introInfo.info.img,
							afterOpen: function() {

								this.$content.attr('alt', introInfo.info.tip);

								const $holder = this.$content.parent('.featherlight-content');

								// include project title
								if (x_params.introTitle == 'true') {
									$('<h1 id="x_introH1" class="x_introImgH1"></h1>')
										.prependTo($holder)
										.html(x_params.name);
								}
								if (x_params.introCaption != undefined && x_params.introCaption != '') {
									var $img = $(this.$content[0]);
									$img.wrap('<figure></figure>');
									$img.parent('figure').append('<figcaption>' + x_params.introCaption + '</figcaption>');
								}

								// include start button to close lightbox
								if (x_params.introBtn == 'true' && x_params.introBtnTxt != undefined && $.trim(x_params.introBtnTxt)) {
									$introStartBtn
										.appendTo($holder)
										.addClass('x_introImgBtn');
								}

							}
						});
						
					} else if (introInfo.type == 'video') {

						lb = $.featherlight('<div id="pageIntroVideo"></div>');

						$('.featherlight-content').addClass('pageIntroVideo');

						if (introInfo.info.video.indexOf("www.youtube.com") != -1 || introInfo.info.video.indexOf("//youtu") != -1) {
							$('.featherlight-content').addClass('max youTube');
						}

						$('#pageIntroVideo')
							.attr('title', introInfo.info.tip)
							.mediaPlayer({
								type: 'video',
								source: introInfo.info.video,
								width: '100%',
								height: '100%',
								pageName: 'introVideo'
							});

					} else if (introInfo.type == 'url' || introInfo.type == 'file') {

						lb = $.featherlight({
							iframe: x_evalURL(introInfo.info),
							iframeMaxWidth: $x_mainHolder.width()*0.8,
							iframeMaxHeight: $x_mainHolder.height()*0.8
						});

					} else if (introInfo.type == 'text') {

						const $introHolder = $('<div id="x_pageIntroHolder"><div id="x_pageIntroTxt"><div id="x_pageIntroTxtInner"></div></div></div>');

						$introHolder.find('#x_pageIntroTxtInner').html(introInfo.info);

						// include project title
						if (x_params.introTitle == 'true') {
							$('<h1 id="x_introH1"></h1>')
								.prependTo($introHolder.find('#x_pageIntroTxt'))
								.html(x_params.name);
						}

						// include start button to close lightbox
						if (x_params.introBtn == 'true' && x_params.introBtnTxt != undefined && $.trim(x_params.introBtnTxt)) {
							$introStartBtn.appendTo($introHolder.find('#x_pageIntroTxt'));
						}

						lb = $.featherlight($introHolder, { variant: 'lightbox' + (x_browserInfo.mobile != true || x_params.introWidth == 'Full' ? x_params.introWidth : 'Auto' ) });
					}

					// open page intro after project intro has closed if it's also set to auto-open
					if (lb != undefined && $x_pageIntroBtn != undefined && x_getIntroInfo(x_currentPageXML) != false && x_currentPageXML.getAttribute("introShow") != 'never') {
						lb.beforeClose = function() {
							if ($thisBtn.data('autoOpen') == true) {
								$x_pageIntroBtn.click();
								$thisBtn.data('autoOpen', false);
							}
						};
					}
				});

			if (introIcon.customised == true) {
				$x_introBtn.addClass("customIconBtn");
			}
			if (introIcon.btnImgs == true) {
				$x_introBtn.addClass("imgIconBtn");
			}
		}

		// media is deprecated but might still be in old projects
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


		// if any of the pages in this project have an intro - add a button to the footer bar that will open intro when clicked
		let pageIntro = false;
		for (let i=0; i<x_pages.length; i++) {
			if (pageIntro != true && x_getIntroInfo(x_pages[i]) != false) {
				pageIntro = true;
				break;
			}
		}

		// add page intro button to footer bar that opens lightbox if any of the pages in this project have the introduction optional property added
		if (pageIntro == true) {

			const introIcon = x_btnIcons.filter(function(icon){return icon.name === 'pageIntro';})[0];

			$x_pageIntroBtn = $('<button id="x_pageIntroBtn"></button>').appendTo($('#x_headerBlock h2'));

			if (x_params.pageIntroBg != 'icon') {
				$x_pageIntroBtn.addClass('pageIntroBg');
			}

			$x_pageIntroBtn
				.button({
					icons: {
						primary: introIcon.iconClass
					},
					// label can be set in editor but fall back to language file if not set
					label: x_params.pageIntroLabel != undefined && x_params.pageIntroLabel != "" ? x_params.pageIntroLabel : x_getLangInfo(x_languageData.find("pageIntroButton")[0], "label", "Page Introduction"),
					text: false
				})
				.attr("aria-label", $x_pageIntroBtn.attr("title") + x_params.dialogTxt)
				.click(function() {
					const thisPageIntro = x_getIntroInfo(x_currentPageXML);

					// set up close btn
					const $introStartBtn = $('<button id="x_introStartBtn"></button>')
						.button()
						.click(function() {
							$.featherlight.current().close();
						});

					// there are different types of content that might appear in page intro lightbox
					if (thisPageIntro.type == 'img') {
						$.featherlight({
							image: thisPageIntro.info.img,
							afterOpen: function() {
								this.$content.attr('alt', thisPageIntro.info.tip);

								const $holder = this.$content.parent('.featherlight-content');

								// include page title
								if (x_currentPageXML.getAttribute('introTitle') == 'true') {
									$('<h1 id="x_introH1" class="x_introImgH1"></h1>')
										.prependTo($holder)
										.html(x_currentPageXML.getAttribute('name'));
								}

								if (x_currentPageXML.getAttribute('introCaption') != undefined && x_currentPageXML.getAttribute('introCaption') != '') {
									var $img = $(this.$content[0]);
									$img.wrap('<figure></figure>');
									$img.parent('figure').append('<figcaption>' + x_currentPageXML.getAttribute('introCaption') + '</figcaption>');
								}

								// include start button to close lightbox
								if (x_currentPageXML.getAttribute('introBtn') == 'true' && x_currentPageXML.getAttribute('introBtnTxt') != undefined && $.trim(x_currentPageXML.getAttribute('introBtnTxt'))) {
									$introStartBtn
										.appendTo($holder)
										.addClass('x_introImgBtn')
										.button({ label: $.trim(x_currentPageXML.getAttribute('introBtnTxt')) });
								}
							}
						});

					} else if (thisPageIntro.type == 'video') {

						$.featherlight($('<div id="pageIntroVideo"></div>'));

						$('.featherlight-content').addClass('pageIntroVideo');

						if (thisPageIntro.info.video.indexOf("www.youtube.com") != -1 || thisPageIntro.info.video.indexOf("//youtu") != -1) {
							$('.featherlight-content').addClass('max youTube');
						}

						$('#pageIntroVideo')
							.attr('title', thisPageIntro.info.tip)
							.mediaPlayer({
								type: 'video',
								source: thisPageIntro.info.video,
								width: '100%',
								height: '100%',
								pageName: 'introVideo'
							});

					} else if (thisPageIntro.type == 'url' || thisPageIntro.type == 'file') {

						$.featherlight({
							iframe: x_evalURL(thisPageIntro.info),
							iframeMaxWidth: $x_mainHolder.width()*0.8,
							iframeMaxHeight: $x_mainHolder.height()*0.8
						});

					} else if (thisPageIntro.type == 'text') {

						const $introHolder = $('<div id="x_pageIntroHolder"><div id="x_pageIntroTxt"><div id="x_pageIntroTxtInner"></div></div></div>');

						$introHolder.find('#x_pageIntroTxtInner').html(thisPageIntro.info);

						// include page title
						if (x_currentPageXML.getAttribute('introTitle') == 'true') {
							$('<h1 id="x_introH1"></h1>')
								.prependTo($introHolder.find('#x_pageIntroTxt'))
								.html(x_currentPageXML.getAttribute('name'));
						}

						// include start button to close lightbox
						if (x_currentPageXML.getAttribute('introBtn') == 'true' && x_currentPageXML.getAttribute('introBtnTxt') != undefined && $.trim(x_currentPageXML.getAttribute('introBtnTxt'))) {
							$introStartBtn
								.appendTo($introHolder.find('#x_pageIntroTxt'))
								.button({ label: $.trim(x_currentPageXML.getAttribute('introBtnTxt')) });
						}

						$.featherlight($introHolder, { variant: 'lightbox' + (x_browserInfo.mobile != true || x_currentPageXML.getAttribute('introWidth') == 'Full' ? x_currentPageXML.getAttribute('introWidth') : 'Auto' ) });
					}
				});
		}

		// default logo used is logo.png in modules/xerte/parent_templates/Nottingham/common_html5/
		// it's overridden by logo in theme folder
		// default & theme logos can also be overridden by images uploaded via Icon optional property
		// Also make sure that the logo is set up before the progress bar is initialised

		var $logo = $('#x_headerBlock img.x_icon');
		$logo[x_params.icHide === 'true'  || $logo.attr('src') === '' ? 'hide' : 'show']();
		//$('#x_headerBlock img.x_icon').data('defaultLogo', $('#x_headerBlock .x_icon').attr('src'));

		// the theme logo is being used - add a class that will allow for the different size windows to display different logos
		if (($logo.attr('src') || '').indexOf('themes/') > -1) $logo.addClass('themeLogo');

		var icPosition = "x_floatLeft";
		if (x_params.icPosition != undefined && x_params.icPosition != "") {
			icPosition = (x_params.icPosition === 'right') ? "x_floatRight" : "x_floatLeft";
		}
		// If the theme places the icon to the right, add the appropriate class
		if ($logo.css('float') == 'right') {
			icPosition = "x_floatRight";
		}
		$logo.addClass(icPosition);

		if (x_params.icTip != undefined && x_params.icTip != "") {
			$logo.attr('alt', x_params.icTip);
		} else {
			$logo.attr('aria-hidden', 'true');
		}

		XENITH.RESOURCES.init();
		XENITH.PROGRESSBAR.init();

		// hide page counter
		if (x_params.pageCounter == "true") {
			$x_pageNo.remove();
		}

		XENITH.ACCESSIBILITY.buildBtn();


		// ignores x_params.allpagestitlesize if added as optional property as the header bar will resize to fit any title
		// add link to LO title?
		if (x_params.homePageLink != undefined && x_params.homePageLink === 'true') {
			$("#x_headerBlock h1").prepend(
				$("<a>")
					.html(x_params.name)
					.attr("href", "#")
					.addClass("x_homePageLink")
					.attr("title", x_getLangInfo(x_languageData.find("homeLink")[0], "description", "Go to Home page"))
					.attr("aria-label", x_getLangInfo(x_languageData.find("homeLink")[0], "description", "Go to Home page"))
					.on("click", x_goHome)
				);
		}
		else {
			$("#x_headerBlock h1").prepend(x_params.name);
		}

		// strips code out of page title
		var div = $("<div>").html(x_params.name);
		var strippedText = div.text();
		if (strippedText != "") {
			document.title = strippedText;
		}

		const prevIcon = x_btnIcons.filter(function(icon){return icon.name === 'prev';})[0];
		if ((x_params.navigation == "Historic" || x_params.navigation == "LinearWithHistoric") && prevIcon.customised === false) {
			prevIcon.iconClass = "x_prev_hist";
		}

		let shownInFeatherLight = false;
		try{
			shownInFeatherLight = parent.window.$.featherlight.current();
		}
		catch(e)
		{
			// Do nothing
		}
		$x_prevBtn
			.button({
				icons: {
					primary: prevIcon.iconClass
				},
				// label can now be set in editor but fall back to language file if not set
				label: x_params.prevLabel != undefined && x_params.prevLabel != "" ? x_params.prevLabel : x_getLangInfo(x_languageData.find("backButton")[0], "label", "Back"),
				text:	false
			})
			.attr("aria-label", $("#x_prevBtn").attr("title"))
			.click(function() {
				var pageIndex = $.inArray(x_currentPage, x_normalPages);
				if (pageIndex > -1) {
					if (x_params.navigation != "Historic" && x_params.navigation != "LinearWithHistoric") {
						// linear back
						if (pageIndex > 0) {
							x_changePage(x_normalPages[pageIndex -1]);
						}

					} else {
						var prevPage = x_pageHistory[x_pageHistory.length-2];
						x_pageHistory.splice(x_pageHistory.length - 2, 2);

						// check if history is empty and if so allow normal back navigation and change to normal back button
						if (prevPage == undefined && x_currentPage > 0) {
							x_changePage(x_normalPages[pageIndex -1]);
						} else {
							x_changePage(prevPage);
						}
					}
				} else if (pageIndex == -1) {
					// historic back (standalone page)
					if (history.length > 1 && (x_params.forcePage1 != 'true' || shownInFeatherLight)) {
						history.go(-1);
					} else {
						x_changePage(x_normalPages[0]);
					}
				}

				$(this)
					.removeClass("ui-state-focus")
					.removeClass("ui-state-hover");
			});

		if (prevIcon.customised == true) {
			$x_prevBtn.addClass("customIconBtn");
		}
		if (prevIcon.btnImgs == true) {
			$x_prevBtn.addClass("imgIconBtn");
		}

		const nextIcon = x_btnIcons.filter(function(icon){return icon.name === 'next';})[0];

		$x_nextBtn
			.button({
				icons: {
					primary: nextIcon.iconClass
				},
				// label can now be set in editor but fall back to language file if not set
				label: x_params.nextLabel != undefined && x_params.nextLabel != "" ? x_params.nextLabel : x_getLangInfo(x_languageData.find("nextButton")[0], "label", "Next"),
				text:	false
			})
			.attr("aria-label", $("#x_nextBtn").attr("title"))
			.click(function() {
				// if it's a standalone page then nothing will happen
				var pageIndex = $.inArray(x_currentPage, x_normalPages);
				if (pageIndex != -1) {
					x_changePage(x_normalPages[pageIndex+1]);
				}

				$(this)
					.removeClass("ui-state-focus")
					.removeClass("ui-state-hover");
			});

		if (nextIcon.customised == true) {
			$x_nextBtn.addClass("customIconBtn");
		}
		if (nextIcon.btnImgs == true) {
			$x_nextBtn.addClass("imgIconBtn");
		}

		if ($x_menuBtn.length > 0) {
			// icon & label can new be set up in editor but fall back to default if not set
			let	menuIcon = x_btnIcons.filter(function(icon){return icon.name === 'toc';})[0];
			let menuLabel = x_params.tocLabel != undefined && x_params.tocLabel != "" ? x_params.tocLabel : x_getLangInfo(x_languageData.find("tocButton")[0], "label", "Table of Contents");

			if (x_params.navigation == "Historic") {
				menuIcon = x_btnIcons.filter(function(icon){return icon.name === 'home';})[0];
				menuLabel = x_params.homeLabel != undefined && x_params.homeLabel != "" ? x_params.homeLabel : x_getLangInfo(x_languageData.find("homeButton")[0], "label", "Home");
				$x_menuBtn.addClass("x_home");
			}

			$x_menuBtn
				.button({
					icons: {
						primary: menuIcon.iconClass
					},
					label:	menuLabel,
					text:	false
				})
				.attr("aria-label", $("#x_menuBtn").attr("title") + (x_params.navigation == "Linear" || x_params.navigation == undefined ? x_params.dialogTxt : ""))
				.click(function() {
					if (x_params.navigation == "Linear" || x_params.navigation == "LinearWithHistoric" || x_params.navigation == undefined) {
						if (x_params.tocTarget == "lightbox") {

							$.featherlight(
								'<div id="tocMenuLightBox"></div>',
								{ variant: 'lightbox' + (x_browserInfo.mobile != true ? 'Medium' : 'Auto') }
							);
							XENITH.PAGEMENU.build($("#tocMenuLightBox"));

						} else {
							XENITH.PAGEMENU.buildDialog();
						}
					} else x_goHome();

					$(this)
						.blur()
						.removeClass("ui-state-focus")
						.removeClass("ui-state-hover");
				});

			if (menuIcon.customised == true) {
				$x_menuBtn.addClass("customIconBtn");
			}
			if (menuIcon.btnImgs == true) {
				$x_menuBtn.addClass("imgIconBtn");
			}
		}

		if (x_params["hideSaveSession"] !== "true" && (XTTrackingSystem().indexOf("SCORM") >= 0 || XTTrackingSystem() === "xAPI" || (typeof lti_enabled != "undefined" && lti_enabled))) {
			x_dialogInfo.push({type:'saveSession', built:false});

			// labels can now be set in editor but fall back to language file if not set
			var tooltip = x_params.saveSessionLabel != undefined && x_params.saveSessionLabel != "" ? x_params.saveSessionLabel : x_getLangInfo(x_languageData.find("saveSession")[0], "tooltip", "Save Session");
			if (typeof lti_enabled != "undefined" && lti_enabled)
			{
				tooltip = x_params.closeSessionLabel != undefined && x_params.closeSessionLabel != "" ? x_params.closeSessionLabel : x_getLangInfo(x_languageData.find("saveSession")[0], "tooltip_ltionly", "Close Session");
			}

			const saveSessionIcon = x_btnIcons.filter(function(icon){return icon.name === 'saveSession';})[0];

			$x_saveSessionBtn
				.button({
					icons: {
						primary: saveSessionIcon.iconClass
					},
					label: tooltip,
					text: false
				})
				.attr("aria-label", $x_saveSessionBtn.attr("title") + x_params.dialogTxt)
				.click(function () {
					x_openDialog(
						"saveSession",
						tooltip,
						x_getLangInfo(x_languageData.find("saveSession").find("closeButton")[0], "description", "Close"),
						null,
						null,
						function () {
							$x_saveSessionBtn
								.blur()
								.removeClass("ui-state-focus")
								.removeClass("ui-state-hover");
						}
					);
				});

			if (saveSessionIcon.customised == true) {
				$x_saveSessionBtn.addClass("customIconBtn");
			}
			if (saveSessionIcon.btnImgs == true) {
				$x_saveSessionBtn.addClass("imgIconBtn");
			}
		}
		else
		{
			$x_saveSessionBtn.remove();
			$x_saveSessionBtn = undefined;
		}
		// If this LO is being tracked and is part of the install (not SCORM) keep session open
		if (XTTrackingSystem() === "xAPI" || (typeof lti_enabled != "undefined" && lti_enabled)) {
			x_KeepAlive();
		}

		// create side bar
		XENITH.SIDEBAR.build();

		//add show/hide footer tools
		if (x_params.footerTools != "none" && x_params.hideFooter != "true" && $x_footerL.find('button').length > 0) {

			// labels can now be set in editor but fall back to language file if not set
			var hideMsg = x_params.hideToolsLabel != undefined && x_params.hideToolsLabel != "" ? x_params.hideToolsLabel : x_getLangInfo(x_languageData.find("footerTools")[0], "hide", "Hide footer tools"),
				showMsg = x_params.showToolsLabel != undefined && x_params.showToolsLabel != "" ? x_params.showToolsLabel : x_getLangInfo(x_languageData.find("footerTools")[0], "show", "Hide footer tools");

			const hideIcon = x_btnIcons.filter(function(icon){return icon.name === 'hideTools';})[0];
			const showIcon = x_btnIcons.filter(function(icon){return icon.name === 'showTools';})[0];

			// add a div for the show/hide chevron
			$('#x_footerBlock .x_floatLeft').before('<div id="x_footerShowHide" ><button id="x_footerChevron"><i class="' + hideIcon.iconClass + '" aria-hidden="true"></i></button></div>');
			$('#x_footerChevron').prop('title', hideMsg);
			$("#x_footerChevron").attr("aria-label", hideMsg);

			// chevron to show/hide function
			$('#x_footerChevron').click(function(){
				$('#x_footerBlock .x_floatLeft').fadeToggle( "slow", function(){
						if($(this).is(':visible')){
							$('#x_footerChevron').html('<div class="chevron" id="chevron" title="Hide footer tools"><i class="' + hideIcon.iconClass + '" aria-hidden="true"></i></div>');
							$('#x_footerChevron').prop('title', hideMsg);
							$("#x_footerChevron").attr("aria-label", hideMsg);
						}else{
							$('#x_footerChevron').html('<div class="chevron" id="chevron"><i class="' + showIcon.iconClass + '" aria-hidden="true"></i></div>');
							$('#x_footerChevron').prop('title', showMsg);
							$("#x_footerChevron").attr("aria-label", showMsg);
						}
					});
				return(false);
			});
			if (x_params.footerTools == "hideFooterTools" || x_browserInfo.mobile) {
				$('#x_footerBlock .x_floatLeft').hide();
				$('#x_footerChevron').html('<div class="chevron" id="chevron"><i class="' + showIcon.iconClass + '" aria-hidden="true"></i></div>');
				$('#x_footerChevron').prop('title', showMsg);
			}
		}

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

		if (x_browserInfo.touchScreen == true) {
			// Set start orientation
			if (window.orientation == 0 || window.orientation == 180) {
				x_browserInfo.orientation = "portrait";
			} else {
				x_browserInfo.orientation = "landscape";
			}

			$x_pageHolder.bind("touchstart", function(e) {
				XENITH.GLOSSARY.touchStartHandler();
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
					var lo_objectfit =  (x_params.backgroundFit != undefined ? x_params.backgroundFit : "fill");
					if (x_params.backgroundopacity != undefined) {
						alpha = x_params.backgroundopacity;
					}
					if (x_params.backgroundGrey == "true") {
						// uses a jquery plugin as just css way won't work in all browsers
						x_insertCSS(x_templateLocation + "common_html5/js/gray-gh-pages/css/gray.css", function() {
							$x_background.append('<img id="x_mainBg" class="grayscale" alt="" src="' + x_evalURL(x_params.background) + '"/>');
							$("#x_mainBg").css({
								"opacity"	:Number(alpha/100),
								"object-fit"    : lo_objectfit,
								"filter"	:"alpha(opacity=" + alpha + ")"
							});
							// grey function called on image when unhidden later as it won't work properly otherwise
						});
					} else {
						$x_background.append('<img id="x_mainBg" alt="" src="' + x_evalURL(x_params.background) + '"/>');
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
}

// returns intro info - could be text, image, url or file
function x_getIntroInfo(xml) {
	function getInfo(attr) {
		if (xml == 'project') {
			return x_params[attr];
		} else {
			if (attr == 'intro') {
				return xml.getAttribute('pageIntro');
			} else {
				return xml.getAttribute(attr);
			}
		}
	}

	if (xml == 'menu') {
		return false;
	} else if (getInfo('introType') == 'image' && getInfo('introImg') != undefined && $.trim(getInfo('introImg')) != '') {
		return {type: 'img', info: {img: getInfo('introImg'), tip: getInfo('introTip')}};
	} else if (getInfo('introType') == 'video' && getInfo('introVideo') != undefined && $.trim(getInfo('introVideo')) != '') {
		return {type: 'video', info: {video: getInfo('introVideo'), tip: getInfo('introTip')}};
	} else if (getInfo('introType') == 'url' && getInfo('introURL') != undefined && $.trim(getInfo('introURL')) != '') {
		return {type: 'url', info: getInfo('introURL')};
	} else if (getInfo('introType') == 'file' && getInfo('introFile') != undefined && $.trim(getInfo('introFile')) != '') {
		return {type: 'file', info: getInfo('introFile')};
	} else if (getInfo('intro') != undefined && $.trim(getInfo('intro')) != '') {
		return {type: 'text', info: getInfo('intro')};
	} else {
		return false;
	}
}

function x_goHome() {
	// home page can be changed from page 1 (except for menu pages where home page will always be TOC)
	if (!XENITH.PAGEMENU.menuPage && x_params.homePage != undefined && x_params.homePage != "") {
		x_navigateToPage(false, {type:'linkID', ID:x_params.homePage});
	} else {
		x_changePage(0);
	}
}

function x_continueSetUp2() {
	// store language data for mediaelement buttons - use fallbacks in mediaElementText array if no lang data
	var mediaElementText = [{
		name: "stopButton",
		label: "Stop",
		description: "Stop Media Button"
	}, {name: "playPauseButton", label: "Play/Pause", description: "Play/Pause Media Button"}, {
		name: "muteButton",
		label: "Mute Toggle",
		description: "Toggle Mute Button"
	}, {name: "fullscreenButton", label: "Fullscreen", description: "Fullscreen Movie Button"}, {
		name: "captionsButton",
		label: "Captions/Subtitles",
		description: "Show/Hide Captions Button"
	}];

	for (var i = 0, len = mediaElementText.length; i < len; i++) {
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
		$x_head.append('<script>' + x_params.script + '</script>');
	}

	// Setup beforeunload
	window.onbeforeunload = XTTerminate;

	XTInitialise(x_params.category); // initialise here, because of XTStartPage in next function
	// Set course, module and resume options AFTER XTInitialise
	// Display warning if this is a SCORM object and the tracking mode is NOT 'normal'
	if (XTTrackingSystem().indexOf('SCORM') >= 0 && XTGetMode() != 'normal')
	{
		var scorm_alert_default = "Please note: SCORM mode is '{0}'. This means that your progress, interactions and results from this viewing will not be tracked or saved. For tracking you should start a new attempt.";
		var scorm_alert_lang = x_getLangInfo(x_languageData.find("scormTrackingAlert")[0], "warning", scorm_alert_default);
		scorm_alert_lang = scorm_alert_lang.replace("{0}", XTGetMode());
		alert(scorm_alert_lang);
	}
	if (x_params.course != undefined && x_params.course != "") {
		XTSetOption('course', x_params.course);
	}
	if (x_params.module != undefined && x_params.module != "") {
		XTSetOption('module', x_params.module);
	}
	// Restart if we're NOT navigating to a standalone page
	var standAlonePage = x_startPage.type == 'index' && x_pageInfo[x_startPage.ID] != undefined
		&& x_pageInfo[x_startPage.ID].standalone != undefined && x_pageInfo[x_startPage.ID].standalone;
	if (XTTrackingSystem() === 'xAPI' && !standAlonePage) {
		var callStartPage = false;
		if (x_params.restartOptions == undefined)
		{
			x_params.restartOptions = 'ask';
		}
		switch (x_params.restartOptions) {
			case 'ask':
				var canResume = XTCanResume();
				if (canResume.canResume) {
					x_dialogInfo.push({type: 'resumeSession', built: false});
					x_openDialog(
						"resumeSession",
						x_getLangInfo(x_languageData.find("resumeSession")[0], "label", "Resume Session"),
						x_getLangInfo(x_languageData.find("resumeSession").find("closeButton")[0], "description", "Close Resume Session Dialog"),
						null,
						null,
						function () {
							setUpComplete = true;
							// use this function in theme files to execute code after interface has been completely set up
							try { x_interfaceComplete(); } catch (e){}
							x_navigateToPage(true, x_startPage);
						}
					);
				} else {
					XTSetOption('resume', false);
					callStartPage = true;
				}
				break;
			case 'restart':
				XTSetOption('resume', true);
				callStartPage = true;
				break;
			case 'do_not_restart':
				XTSetOption('resume', false);
				callStartPage = true;
				break;
		}
		if (callStartPage)
		{
			setUpComplete = true;
			// use this function in theme files to execute code after interface has been completely set up
			try { x_interfaceComplete(); } catch (e){}
			x_navigateToPage(true, x_startPage);
		}
	} else {
		setUpComplete = true;
		// use this function in theme files to execute code after interface has been completely set up
		try { x_interfaceComplete(); } catch (e){}
		x_navigateToPage(true, x_startPage);
	}
}

// function sets the default text size
function x_setProjectTxtSize() {
	if (XENITH.ACCESSIBILITY.responsiveTxt === true) {
		// Use default font size
		$x_body.css("font-size", "10pt");
	} else {
		$x_body.css("font-size", Number(x_params.textSize) - 2 + "pt");
	}
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
    window.open('','','width=300,height=450').document.write('<p style="font-family:sans-serif; font-size:12px">' + text + '</p>');
}

// function called after interface first setup (to load 1st page) and for links to other pages in the text on a page
function x_navigateToPage(force, pageInfo, addHistory) { // pageInfo = {type, ID}
    var page,
		inclHistory = false;

	// if it's first page then we've already found x_deepLink
	if (x_firstLoad == false || addHistory == false) {
		var deepLinkInfo = getDeepLink(pageInfo.ID);
		pageInfo.ID = deepLinkInfo[0];

		if (deepLinkInfo.length > 1) {
			x_deepLink = deepLinkInfo[1];
		} else {
			x_deepLink = '';
		}
	}

	if (pageInfo.type == "linkID" || pageInfo.type == "pageID") {
		// relative links added from WYSIWYG xerte page links button
		if (String(pageInfo.ID).indexOf('[') > -1 && (pageInfo.ID).indexOf(']') > -1) {
			var pageIndex = $.inArray(x_currentPage, x_normalPages);

			switch ((pageInfo.ID).substring(1, pageInfo.ID.length-1)) {
				case "next":
					// won't change if this is a standalone page
					if (pageIndex != -1 && pageIndex < x_normalPages.length-1)
						page = x_normalPages[pageIndex + 1];
					break;
				case "previous":
					if (pageIndex != -1 && pageIndex > 0) {
						page = x_normalPages[pageIndex - 1];
					} else {
						// ** it's a standalone page - do historic back
					}
					break;
				case "first":
					if (pageIndex !== 0) {
						page = x_normalPages[0];
					}
					break;
				case "last":
					if (pageIndex < x_normalPages.length-1) {
						page = x_normalPages[x_normalPages.length-1]
					}
					break;
			}
		}
		else {
			// could be the linkID generated automatically in XML or a custom ID added in editor
			page = x_lookupPage(pageInfo.type, pageInfo.ID);

			// id was a deeplink so info about page & deeplink has been returned
			if ($.isArray(page)) {
				x_deepLink = page.slice(1, page.length);
				page = page[0];
			}

			if (page !== false) {
				if (page != x_currentPage) {
					inclHistory = true;
				} else {
					x_doDeepLink();
				}
			} else {
				x_deepLink = '';
				if (force == true) {
					inclHistory = true;
				}
			}
		}
	}
	else if (pageInfo.type == "index") {
		page = pageInfo.ID;
		inclHistory = true;

	} else {
		page = parseInt(pageInfo.ID);
		if (page > 0 && page <= x_pages.length) {
			page = page-1;
			inclHistory = true;
		}
		else {
			x_deepLink = '';
			if (force == true) {
				page = 0;
				inclHistory = true;
			}
		}
	}

	var resumeLO = XTStartPage();


	// this is a resumed tracked LO, go to the page saved by the LO - unless it's currently trying to show a standalone page in a lightbox
	if (force && resumeLO >= 0 && (x_pageInfo[page].standalone != true || x_pages[page].getAttribute('linkTarget') == 'new' || x_pages[page].getAttribute('linkTarget') == 'same')) {
		x_changePage(resumeLO, addHistory);

	} else if (inclHistory == true) {
		x_changePage(page, addHistory);

	} else {
		x_changePage(page);
	}
}

// function returns page no. of page with matching linkID / pageID & whether it's from array of normal pages or standalone pages
function x_lookupPage(type, id) {
	if (type == "chapterID") {
		return x_checkChapters(type, id);
	} else {
		const response = x_checkPages(type, id, x_pageInfo);
		if (response === false) {
			return x_checkChapters(type, id);
		} else {
			return response;
		}
	}
}

// checks through the chapters array for chapter with matching ID
function x_checkChapters(type, id) {
	for (var i=0; i<x_chapters.length; i++)	{
		if (x_chapters[i][type] == id) {
			for (let j=0; j<x_pages.length; j++) {
				// found the chapter - return the index of 1st page within the chapter
				if (x_pages[j].getAttribute("chapterIndex") == i) {
					return j;
					break;
				}
			}
		}
	}
	return false;
}

// checks through the pageArray specified for a page with matching ID
function x_checkPages(type, id, pageArray) {
	// check through an array of pages for a matching ID
    for (var i=0, len = pageArray.length; i<len; i++) {
        if (
			(type == "linkID" && pageArray[i].linkID && pageArray[i].linkID == id) ||
			(type == "pageID" && pageArray[i].pageID && pageArray[i].pageID == id) ||
			// added this to catch any broken links because the HTML editor always creates links of linkID type even when there was a pageID
			(type == "linkID" && pageArray[i].pageID && pageArray[i].pageID == id) ||
			(type == "pageID" && pageArray[i].linkID && pageArray[i].linkID == id)
		) return i;
    }

	// Now check the children of each page
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
				if (ids[i] == id) {
					tempArray.push(j);
					return true;
				}
			}
		}
		return false;
	}

	for (var i=0; i<pageArray.length; i++) {
		tempArray = tempArray.splice();
		tempArray.push(i);
		if (pageArray[i].type != 'menu') {
			var result = checkChildIDs(pageArray[i].childIDs);
			if (result === true) {
				return tempArray;
				break;
			}
		}
	}

	return false;
}

function x_setMaxWidth() {
	if (x_params.maxWidth != undefined && x_params.maxWidth != "") {
		var workingPages = ['QRcode','accNav','adaptiveContent','annotatedDiagram','audioRecord','audioSlideshow','bleedingImage','bullets','buttonNav','buttonQuestion','buttonSequence','cMcq','categories','chart','columnPage','connectorHotspotImage','connectorMenu','crossword','customHotspots','decision','delicious','dialog','dictation','documentation','dragDropLabel','embedDiv','flashCards','flickr','gapFill','glossary','grid','hangman','hotSpotQuestion','hotspotImage','imageSequence','imageViewer','interactiveTable','interactiveText','inventory','language','links','list','map','mcq','media360','mediaLesson','memory','menu','modelAnswer','modelAnswerResults','modify','morphImages','nav','newWindow','opinion','orient','pdf','perspectives','quiz','results','resumeSession','rss','rssdownload','saveSession','scenario','showGraph','SictTimeline','slideshow','stopTracking','summary','tabNav','tabNavExtra','table','text','textCorrection','textDrawing','textGraphics','textHighlight','textMatch','textSWF','textVideo','thumbnailViewer','timeline','topXQ','transcriptReader','videoSynch','wiki','wordsearch','youtube','youtuberss','interactiveVideo'];
		var styleString = '<style>';
		for (var i=0; i<workingPages.length; i++) {
			if (i>0) { styleString += ', '; }
			styleString += '.x_' + workingPages[i] + '_page #x_pageDiv';
		}
		styleString += '{max-width: '+x_params.maxWidth+'px;margin: 0 auto;}</style>';
		$('head').append(styleString);
	}
}

// function called on page change to remove old page and load new page model
// check if there are any warnings that need to be given before proceeding
function x_changePage(x_gotoPage, addHistory) {
	if (x_currentPage === -1 || XENITH.RESOURCES.checkCompletion(x_gotoPage, addHistory)) {
		x_changePageApproved(x_gotoPage, addHistory);
	}
}

// function called on page change to remove old page and load new page model
// If x_currentPage == -1, than do not try to exit tracking of the page
function x_changePageApproved(x_gotoPage, addHistory) {
	x_gotoPage = Number(x_gotoPage);

	var standAlonePage = x_pageInfo[x_gotoPage].standalone,
		pageHash = x_pageInfo[x_gotoPage].pageID != undefined && x_pageInfo[x_gotoPage].pageID != '' ? x_pageInfo[x_gotoPage].pageID : (standAlonePage ? x_pageInfo[x_gotoPage].linkID : 'page' + (x_normalPages.indexOf(x_gotoPage)+1));

	// add the deep link at the end of the URL
	if (x_deepLink != '') {
		pageHash += '|' + ($.isNumeric(x_deepLink) ? Number(x_deepLink) + 1 : x_deepLink);
	}

	// if this page is already shown in a lightbox then don't try to open another lightbox - load in the existing one
	// catch error - when in iframe, i.e. in bootstrap or LMS LTI
	try {
		if (standAlonePage && x_pages[x_gotoPage].getAttribute('linkTarget') == 'lightbox' &&
			parent.window.$ && parent.window.$.featherlight && parent.window.$.featherlight.current()) {
			standAlonePage = false;
			addHistory = false;
		}
	}
	catch(e) {}

	if (x_params.forcePage1 == 'true') {
		addHistory = false;
	}

	// normal page change, or a standalone page being opened in same window
	if ((x_gotoPage == 0 && XENITH.PAGEMENU.menuPage) || !standAlonePage || x_pages[x_gotoPage].getAttribute('linkTarget') == 'same' || x_firstLoad) {
		if ($x_body.width() == 0 && $x_body.height() == 0) {
			// don't load page yet as it probably won't load properly (possibly because it's being loaded in an iframe on non-active tab on a navigator)
			x_pageLoadPause = x_gotoPage;

		} else {
			// make sure correct hash is used in url history
			if (addHistory !== false) {
				window.history.pushState('window.location.href',"",'#' + pageHash);
			}

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

	// standalone page opening in new window
	} else if (x_pages[x_gotoPage].getAttribute('linkTarget') == 'new') {
		let url = window.location.href.split('#')[0];

		// is project being shown with any of the accessibility options changed?
		// if so, make sure page opening in new window also keeps this theme
		url += XENITH.ACCESSIBILITY.specialTheme !== false ? (url.indexOf("?") > -1 ? "&" : "?") + "specialTheme=" + XENITH.ACCESSIBILITY.specialTheme : "";
		url += XENITH.ACCESSIBILITY.removeBg !== false ? (url.indexOf("?") > -1 ? "&" : "?") + "removeBg=" + XENITH.ACCESSIBILITY.removeBg : "";
		url += XENITH.ACCESSIBILITY.responsiveTxt != undefined ? (url.indexOf("?") > -1 ? "&" : "?") + "responsiveTxt=" + XENITH.ACCESSIBILITY.responsiveTxt : "";

		url += '#' + pageHash;
		window.open(url);

		XENITH.PROGRESSBAR.update(x_gotoPage, "NewWindow");

		x_pageInfo[x_gotoPage].viewedNewWindow = true;

	// standalone page opening in lightbox
	} else {
		let url = window.location.href.split('#')[0];

		// is project being shown with any of the accessibility options changed?
		// if so, make sure page opening in lightbox also keeps this theme
		url += XENITH.ACCESSIBILITY.specialTheme !== false ? (url.indexOf("?") > -1 ? "&" : "?") + "specialTheme=" + XENITH.ACCESSIBILITY.specialTheme : "";
		url += XENITH.ACCESSIBILITY.removeBg !== false ? (url.indexOf("?") > -1 ? "&" : "?") + "removeBg=" + XENITH.ACCESSIBILITY.removeBg : "";
		url += XENITH.ACCESSIBILITY.responsiveTxt != undefined ? (url.indexOf("?") > -1 ? "&" : "?") + "responsiveTxt=" + XENITH.ACCESSIBILITY.responsiveTxt : "";

		url += '#' + pageHash;
		$.featherlight.defaults.beforeClose = x_closeStandAlonePage;
		$.featherlight({iframe: url, iframeWidth: $x_mainHolder.width()*0.8, iframeHeight: $x_mainHolder.height()*0.8});

		XENITH.PROGRESSBAR.update(x_gotoPage, "LightBox");

		x_pageInfo[x_gotoPage].viewedLightBox = true;
	}

	// if side bar and on mobile, close sidebar when page changed (as it covers whole of page)
	if (x_browserInfo.mobile === true && !x_firstLoad) {
		XENITH.SIDEBAR.close();
	}
}

function x_closeStandAlonePage(event) {
	$.featherlight.defaults.beforeClose = $.noop;

	var standAlonePage = this.$content[0].contentWindow.x_currentPage
	var template_id = this.$content[0].contentWindow.x_TemplateId;
	if (template_id == x_TemplateId) {
		// Tom Reijnders @2022-10-06
		// We're going to do some juggling with variables/code from the standalone page
		// Assumptions:
		// 1. The standalone page is using the same template as the main page
		// 2. Therefore the standalone page is using the same x_pageInfo array as the main page
		// 3. The XTInitialise code made sure that the iframe state variable is actually pointing to the main state variable
		//    i.e. when calling the leavePage inside the iframe, it's updating the main state variable
		// 4. It is necessary to call the leavePage from the iframe in case the pagetype has not been yet in the main page
		var pageObj, pageObjType;

		if (x_pageInfo[standAlonePage].type == "text") {
			pageObjType = 'simpleText';
		} else {
			pageObjType = x_pageInfo[standAlonePage].type
		}
		pageObj = eval('this.$content[0].contentWindow.' + pageObjType);
		if (typeof pageObj.leavePage === 'function') {
			pageObj.leavePage();
		}

		XTExitPage(standAlonePage);
	}
}

function x_endPageTracking(pagechange, x_gotoPage) {
    if (pagechange == undefined) {
		pagechange = false;
	}
	if (x_gotoPage == undefined) {
		x_gotoPage = -1;
	}
	// End page tracking of x_currentPage
    if (x_currentPage != -1 && !XENITH.PAGEMENU.isThisMenu() && (!pagechange || x_currentPage != x_gotoPage) && x_pageInfo[x_currentPage].passwordPass != false)
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

function x_changePageStep2(x_gotoPage) {
	// Check if saveSession button is styled
	if (typeof x_varSaveSessionBtnIsStyled == "undefined") {
		x_varSaveSessionBtnIsStyled = x_saveSessionBtnIsStyled();
		if (!x_varSaveSessionBtnIsStyled) {
			if ($('#savesessionbtn_css').length == 0) {
				$x_head.append('<style type="text/css" id="savesessionbtn_css">#x_saveSessionBtn:after {content: "\\f0c7"; font-family: "Font Awesome 5 Free"; font-weight: 900; } #x_saveSessionBtn { font-size: 1.9em; width:1.1em; }  .ui-button .ui-icon.x_saveSession { background-image: none; } #x_footerBlock .x_floatLeft button, #x_footerBlock .x_floatRight button { padding: 0; } #x_saveSessionBtn span { display: none; }</style>');
			}
		}
	}

	x_setMaxWidth();
    var prevPage = x_currentPage;

    // disable onload of #special_theme_css & special_theme_responsive_css
    $('#special_theme_css, #special_theme_responsive_css').bind('load', function()
    {
        // Do nothing
    })

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
        $(".x_pageNarration").remove(); // narration audio player
        $("body div.me-plugin:not(#x_pageHolder div.me-plugin)").remove();
        $(".x_popupDialog").parent().detach();
        $("#x_pageTimer").remove();
		$x_helperText.empty();
        $(document).add($x_pageHolder).off(".pageEvent"); // any events in page models added to document or pageHolder should have this namespace so they can be removed on page change - see hangman.html for example

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

	// if it's a standalone page then it's possible that the header or footer bar are hidden
	var headerHidden = false, footerHidden = false;
	if (x_pageInfo[x_currentPage].standalone == true) {
		if (x_currentPageXML.getAttribute('headerHide') == 'true') {
			headerHidden = true;
			$x_headerBlock.hide().height(0);
		}
		if (x_currentPageXML.getAttribute('footerHide') == 'true') {
			footerHidden = true;
			// more complex than just hiding all of footer bar in one go as narration may be in there which still needs to show
			$('#x_footerBlock > div').each(function () {
				$(this).hide().height(0);
			});
		}
	}

	if (headerHidden == false && x_params.hideHeader != "true") {
		$x_headerBlock.show().height('auto');
	}
	if (footerHidden == false && x_params.hideFooter != "true") {
		$x_footerBlock.show().height('auto');
	}

    // change page title and add narration / timer before the new page loads so $x_pageHolder margins can be sorted - these often need to be right so page layout is calculated correctly
    if (XENITH.PAGEMENU.isThisMenu()) {
        pageTitle = x_getLangInfo(x_languageData.find("toc")[0], "label", "Table of Contents");

		x_changePageStep3();

    } else {
		// if page is in a chapter then there is the option to include the chapter title before the page title on the header bar
		const chapterTitle = x_currentPageXML.getAttribute("chapterIndex") != undefined && x_chapters[x_currentPageXML.getAttribute("chapterIndex")].includeInHeader == "true" ? (x_chapters[x_currentPageXML.getAttribute("chapterIndex")].headerName != undefined && x_chapters[x_currentPageXML.getAttribute("chapterIndex")].headerName.trim() != "" ? x_chapters[x_currentPageXML.getAttribute("chapterIndex")].headerName : x_chapters[x_currentPageXML.getAttribute("chapterIndex")].name) + ": " : "";
        pageTitle = chapterTitle + x_currentPageXML.getAttribute("name");

		// add screen reader info for this page type (if exists)
		var screenReaderInfo = x_pageInfo[x_currentPage].type != "nav" ? x_pageInfo[x_currentPage].type : x_currentPageXML.getAttribute("type") == "Acc" ? "accNav" : x_currentPageXML.getAttribute("type") == "Button" ? "buttonNav" : x_currentPageXML.getAttribute("type") == "Col" ? "columnPage" : x_currentPageXML.getAttribute("type") == "Slide" ? "slideshow" : "tabNav";
		if (x_getLangInfo(x_languageData.find("screenReaderInfo").find(screenReaderInfo)[0], "description", undefined) != undefined) {
			$x_helperText.html('<div>' + x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "label", "Screen Reader Information") + ': <p>' + x_getLangInfo(x_languageData.find("screenReaderInfo").find(screenReaderInfo)[0], "description", "") + '</p></div>');
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

		// is page password protected? if so, don't finish page setup until after a valid password entered
		var pswds = [];
		if ($.trim(x_currentPageXML.getAttribute('password')).length > 0) {
			var temp = $.trim(x_currentPageXML.getAttribute('password')).split(',');

			for (var i=0; i<temp.length; i++) {
				if (temp[i] != '') {
					pswds.push(x_currentPageXML.getAttribute('passwordCase') != 'true' ? $.trim(temp[i].toLowerCase()) : $.trim(temp[i]));
				}
			}
		}

		if (pswds.length > 0) {
			x_passwordPage(pswds);
		} else {
			x_addCountdownTimer();
			x_addNarration('x_changePageStep3', '');
		}
    }
}

function x_passwordPage(pswds) {
	if (x_pageInfo[x_currentPage].passwordPass != true) {

		if (x_params.authorSupport == "true") {

			x_pageInfo[x_currentPage].passwordPass = true;

			pageTitle += ' <span class="alert">' + x_getLangInfo(x_languageData.find("password")[0], "pageSupport", "In live projects, an access code must be entered to view this page") + ': ' + pswds + '</span>';

			x_addCountdownTimer();
			x_addNarration('x_changePageStep3', '');

		} else {

			// check page text for anything that might need replacing / tags inserting (e.g. glossary words, links...)
			if (x_currentPageXML.getAttribute("disableGlossary") == "true") {
				x_findText(x_currentPageXML, true, ["glossary"]); // exclude glossary
			} else {
				x_findText(x_currentPageXML);
			}

			x_pageInfo[x_currentPage].passwordPass = false;

			$("#x_headerBlock h2 #x_pageTitle").html(pageTitle);
			$(document).prop('title', $('<p>' + pageTitle +' - ' + x_params.name + '</p>').text());

			x_updateCss(false);

			$("#x_pageDiv").show();
			$x_pageDiv.css("height", "100%");
			let paddingBlock = $x_pageDiv.innerHeight() - $x_pageDiv.height(); // padding top and bottom
			$x_pageDiv.css("height", "calc(100% - " + paddingBlock + "px)");
			$x_pageDiv.append('<div id="x_page' + x_currentPage + '"></div>');

			var $pswdBlock = $('#x_page' + x_currentPage);
			$pswdBlock.css('height', '100%');
			$pswdBlock.html('<div class="x_pswdBlock" style="height: 100%"><div class="x_pswdInfo"></div><div class="x_pswdInput"></div><div class="x_pswdError" aria-live="assertive"></div></div>');
			$pswdBlock.find('.x_pswdInfo').append(x_currentPageXML.getAttribute('passwordInfo'));
			let type = x_currentPageXML.getAttribute('passwordType');
			if(type == "vault"){
					$pswdBlock.find('.x_pswdInput').html('<div class="vault"><div class="vault-door-frame"><div class="vault-door"></div></div></div>');
					$pswdBlock.find('.vault-door')
							.html('<div class="vault-door-dial"><div class="vault-door-dial-inside"></div><div class="vault-door-dial-rod"></div><div class="vault-door-dial-rod rotated"></div></div>');
					$pswdBlock.find('.vault-door-dial')
							.append('<input type="text" id="x_pagePswd" name="x_pagePswd" aria-label="' + x_getLangInfo(x_languageData.find("password")[0], "label", "Password") + '">');
					$pswdBlock.find('.vault-door').append('<button id="x_pagePswdBtn">' + (x_currentPageXML.getAttribute('passwordSubmit') != undefined && x_currentPageXML.getAttribute('passwordSubmit') != '' ? x_currentPageXML.getAttribute('passwordSubmit') : 'Submit') + '</button>');

			}else if(type == "vaultnumeric") {
					$pswdBlock.find('.x_pswdInput').html('<div class="vault numeric"><div class="vault-door-frame"><div class="vault-door"></div></div></div>');
					$pswdBlock.find('.vault-door')
							.append('<input type="text" id="x_pagePswd" name="x_pagePswd" style="grid-area: input;" aria-label="' + x_getLangInfo(x_languageData.find("password")[0], "label", "Password") + '">')
							.append('<button class="numberbtn" style="grid-area: one;">1</button><button class="numberbtn" style="grid-area: two;">2</button><button class="numberbtn" style="grid-area: three;">3</button><button class="numberbtn" style="grid-area: four;">4</button><button class="numberbtn" style="grid-area: five;">5</button><button class="numberbtn" style="grid-area: six;">6</button><button class="numberbtn" style="grid-area: seven;">7</button><button class="numberbtn" style="grid-area: eight;">8</button><button class="numberbtn" style="grid-area: nine;">9</button><button class="numberbtn" style="grid-area: zero;">0</button><button id="resetbtn" style="grid-area: reset;">AC</button><button style="grid-area: unused;" disabled> </button>')
							.append('<button id="x_pagePswdBtn" style="grid-area: button;">' + (x_currentPageXML.getAttribute('passwordSubmit') != undefined && x_currentPageXML.getAttribute('passwordSubmit') != '' ? x_currentPageXML.getAttribute('passwordSubmit') : 'Submit') + '</button>');

					$pswdBlock.find('.numberbtn').on('click', function(){
							let number = $(this).text();
							let $input = $('#x_pagePswd');
							$input.val(function(){
									return this.value + number;
							});
							$input[0].selectionStart = $input[0].selectionEnd = $input.val().length;
					});
					$pswdBlock.find('#resetbtn').on('click', function(){
							$('#x_pagePswd').val('');
					});
			}else if((type == "standard" || type == null) || type == "centered"){
					let pswdInput = $pswdBlock.find('.x_pswdInput').append('<input type="text" class="old" id="x_pagePswd" name="x_pagePswd" aria-label="' + x_getLangInfo(x_languageData.find("password")[0], "label", "Password") + '"><button class="old" id="x_pagePswdBtn">' + (x_currentPageXML.getAttribute('passwordSubmit') != undefined && x_currentPageXML.getAttribute('passwordSubmit') != '' ? x_currentPageXML.getAttribute('passwordSubmit') : 'Submit') + '</button>');
					if(type == "standard" || type == null){
							pswdInput.add($pswdBlock.find(".x_pswdBlock")).addClass('old');
					} else {
						$pswdBlock.find(".x_pswdBlock").addClass('centered');
					}
			}

			$pswdBlock.find('#x_pagePswdBtn')
				.button()
				.on('click', function() {
					var pswdEntered = x_currentPageXML.getAttribute('passwordCase') != 'true' ? $pswdBlock.find('#x_pagePswd').val().toLowerCase() : $pswdBlock.find('#x_pagePswd').val();

					if ($.inArray(pswdEntered, pswds) >= 0) {
						// correct password - remember this so it doesn't need to be re-entered on return to page
						x_pageInfo[x_currentPage].passwordPass = true;
						$x_pageDiv.css("height", "");
						$pswdBlock.remove();
						x_addCountdownTimer();
						x_addNarration('x_changePageStep3', '');
					} else {
						$pswdBlock.find('.x_pswdError').html(x_currentPageXML.getAttribute('passwordError'));
					}
				});

			$pswdBlock.find('#x_pagePswd').keypress(function (e) {
				if (e.which == 13) {
					$pswdBlock.find('#x_pagePswdBtn').click();
				} else {
					$pswdBlock.find('.x_pswdError').html('');
				}
			});

			// Queue reparsing of MathJax - fails if no network connection
			try { MathJax.Hub.Queue(["Typeset",MathJax.Hub]); } catch (e){};

			x_setUpPage();
		}

	} else {
		x_addCountdownTimer();
		x_addNarration('x_changePageStep3', '');
	}
}

function x_changePageStep3() {
    $("#x_headerBlock h2 #x_pageTitle").html(pageTitle);
	$(document).prop('title', $('<p>' + pageTitle +' - ' + x_params.name + '</p>').text());

	// enable page intro button depending on whether this info exists for the current page
	if ($x_pageIntroBtn != undefined) {
		if (!XENITH.PAGEMENU.isThisMenu() && x_getIntroInfo(x_currentPageXML) != false) {
			$x_pageIntroBtn.show();
		} else {
			$x_pageIntroBtn.hide();
		}
	}

	XENITH.RESOURCES.showHideBtn();

    x_updateCss(false);

	$("#x_pageDiv").show();

    // x_currentPage has already been viewed so is already loaded
    if (x_pageInfo[x_currentPage].built != false) {
        // Start page tracking -- NOTE: You HAVE to do this before pageLoad and/or Page setup, because pageload could trigger XTSetPageType and/or XTEnterInteraction
		// Use a clean text version of the page title
        var label = $('<div>').html(pageTitle).text();
        if (!XENITH.PAGEMENU.isThisMenu()) {
			if (x_currentPageXML.getAttribute("trackinglabel") != null && x_currentPageXML.getAttribute("trackinglabel") != "")
			{
				label = x_currentPageXML.getAttribute("trackinglabel");
			}
			XTEnterPage(x_currentPage, label, x_currentPageXML.getAttribute("grouping"));
		}

        var builtPage = x_pageInfo[x_currentPage].built;
        $x_pageDiv.append(builtPage);
        builtPage.hide();
        builtPage.fadeIn();

		// get short page type var
		var pt = x_pageInfo[x_currentPage].type;
		if (pt == "text") pt = 'simpleText'; // errors if you just call text.pageChanged()

		if (!XENITH.PAGEMENU.isThisMenu() && x_currentPageXML.getAttribute("script") != undefined && x_currentPageXML.getAttribute("script") != "" && x_currentPageXML.getAttribute("run") == "all") {
			$("#x_pageScript").remove();
			$("#x_page" + x_currentPage).append('<script id="x_pageScript">' +  x_currentPageXML.getAttribute("script") + '</script>');
		}

		// show page background & hide main background
		if ($(".pageBg#pageBg" + x_currentPage).length > 0) {
			$(".pageBg#pageBg" + x_currentPage).show();
			if (!XENITH.PAGEMENU.isThisMenu() && x_currentPageXML.getAttribute("bgImageDark") != undefined && x_currentPageXML.getAttribute("bgImageDark") != "" && x_currentPageXML.getAttribute("bgImageDark") != "0") {
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

        // calls function in current page model (if it exists) which does anything needed to reset the page (if it needs to be reset)
        if (typeof window[pt].pageChanged === "function") window[pt].pageChanged();

		// calls function in current theme (if it exists)
		if (typeof customPageChanged == 'function') {
			customPageChanged(pt);
		}

        // calls function in any customHTML that's been loaded into page
        if ($(".customHTMLHolder").length > 0) {
			if (typeof customHTML.pageChanged === "function") {
				customHTML.pageChanged();
			}
        }

		// updates variables as their values might have changed
		if (!XENITH.PAGEMENU.isThisMenu() && x_currentPageXML.getAttribute('varUpdate') != 'false') {
			// variables on screen
			if (XENITH.VARIABLES && XENITH.VARIABLES.exist() && $('.x_var').length > 0) {
				XENITH.VARIABLES.updateVariable();
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

		// any custom header styles will be disabled if a custom theme (via accessibility options) is in use
		XENITH.ACCESSIBILITY.disableBespokeCSS();

		x_focusPageContents(false);

		// show page introduction immediately if set to always auto open
		if (!XENITH.PAGEMENU.isThisMenu() && $x_pageIntroBtn != undefined && x_currentPageXML.getAttribute("introShow") == 'always') {
			$x_pageIntroBtn.click();
		}

		XENITH.SIDEBAR.pageLoad();

    // x_currentPage hasn't been viewed previously - load model file
    } else {
		// get short page type var
		var pt = x_pageInfo[x_currentPage].type;
		if (pt == "text") pt = 'simpleText';
		// calls function in current theme (if it exists)
		if (typeof customLoadCss == 'function') {
			customLoadCss(pt);
		}
		function loadModel() {
			$x_pageDiv.append('<div id="x_page' + x_currentPage + '"></div>');
			$("#x_page" + x_currentPage).css("visibility", "hidden");

			if (!XENITH.PAGEMENU.isThisMenu()) {
				// check page text for anything that might need replacing / tags inserting (e.g. glossary words, links...)
				if (x_currentPageXML.getAttribute("disableGlossary") == "true") {
					x_findText(x_currentPageXML, true, ["glossary"]); // exclude glossary
				} else {
					x_findText(x_currentPageXML);
				}
			}

			// Start page tracking -- NOTE: You HAVE to do this before pageLoad and/or Page setup, because pageload could trigger XTSetPageType and/or XTEnterInteraction
            var label = $('<div>').html(pageTitle).text();
            if (!XENITH.PAGEMENU.isThisMenu() && x_currentPageXML.getAttribute("trackinglabel") != null && x_currentPageXML.getAttribute("trackinglabel") != "")
            {
                label = x_currentPageXML.getAttribute("trackinglabel");
            }
			var grouping = null
				if (!XENITH.PAGEMENU.isThisMenu() && x_currentPageXML.getAttribute("grouping") != null && x_currentPageXML.getAttribute("grouping") != "")
				{
				grouping = x_currentPageXML.getAttribute("grouping");
			}
			XTEnterPage(x_currentPage, label, grouping);

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
		if (!XENITH.PAGEMENU.isThisMenu() && x_currentPageXML.getAttribute("bgImage") != undefined && x_currentPageXML.getAttribute("bgImage") != "") {
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
    try { MathJax.Hub.Queue(["Typeset",MathJax.Hub]); } catch (e){};

	if (x_pageInfo[x_currentPage].built != false) {
		x_doDeepLink();
	}
}

function x_focusPageContents(firstLoad) {
	if (self == top || !firstLoad) {
		//focus pageContents after page load (if not shown in iframe) and after page change (always - even if in iframe)
		$('#pageContents').attr('tabIndex', 0).focus();

		// ensure page is still scrolled to the top
		$x_pageDiv.parent().scrollTop(0);

		//#pageContents:focus is set to none in default theme
		//uncomment the line below to see the focus outline
		//or use a theme where this isn't hidden
		//$('#pageContents:focus').css('outline','solid');
		if(x_pageInfo[x_currentPage].type=="adaptiveContent"){
			$('#adaptiveContentMain').attr('tabIndex', 0).focus();
		}
	}
}

//skip to main contents link but this code needs checking
// and language string needs to be added to replace default English text
$('[href^="#"][href!="#"]').click(function() {
	$($(this).attr('href')).attr('tabIndex', -1).focus();
});

// trigger that page contents have updated
function x_pageContentsUpdated() {
	// Queue reparsing of MathJax - fails if no network connection
    try { MathJax.Hub.Queue(["Typeset",MathJax.Hub]); } catch (e){};
	
	// lightbox image links might also need to be added
	x_setUpLightBox();

	// update codesnippet code blocks
	let codeblocks = $("pre code").each(function(){
		hljs.highlightBlock(this);
	});
}

// by default images can be clicked to open larger version in lightbox viewer - this can be overridden with optional properties at LO & page level
function x_setUpLightBox() {
	if (x_currentPageXML != undefined && (x_params.lightbox != "false" || x_currentPageXML.getAttribute("lightbox") == "true") && x_currentPageXML.getAttribute("lightbox") != "false") {
		
		// use the x_noLightBox class in page models to force images to not open in lightboxes
		$("#pageContents img:not(.x_noLightBox), .x_popupDialog img:not(.x_noLightBox)").each(function( index ) {
			var $this = $(this);
			if ($this.closest('a').length == 0) {
				if (!$this.parent().hasClass('lightboxWrapper') && $this.parents('.ui-draggable').length == 0) {
					var imgPath = $(this).prop('src');
					$(this).wrap('<a data-featherlight="image" href="' + imgPath + '" class="lightboxWrapper">');
				}
			}
		});
		
		$.featherlight.prototype.afterContent = function () {
			if (this.$currentTarget != undefined) {
				
				var caption = this.$currentTarget.find('img').attr('alt');
				
				if (this.$currentTarget[0].nodeName === 'A' && this.$currentTarget.attr('data-image-alt') != undefined) {
					this.$content.attr('alt', this.$currentTarget.attr('data-image-alt'));
					caption = this.$content.attr('alt');
				}

				if (caption != undefined && caption != '') {
					this.$instance.find('.featherlight-content img').attr('alt', caption);

					// by default no caption is shown in the lightbox because many people still leave the alt text fields with default 'Enter description for accessibility here' text
					// captions can be turned on at LO or page level
					if ((x_params.lightboxCaption != "false" && x_params.lightboxCaption != undefined && x_currentPageXML.getAttribute("lightboxCaption") != "false") || (x_currentPageXML.getAttribute("lightboxCaption") != "false" && x_currentPageXML.getAttribute("lightboxCaption") != undefined)) {
						this.$instance.find('.caption').remove();
						var before = x_currentPageXML.getAttribute("lightboxCaption") == "above" || (x_params.lightboxCaption == "above" && x_currentPageXML.getAttribute("lightboxCaption") == undefined) ? true : false;
						
						if (caption != undefined && caption != '') {
							var $img = $(this.$content[0]);
							$img.wrap('<figure></figure>');
							if (before == true) {
								$img.parent('figure').prepend('<figcaption class="lightBoxCaption">' + caption + '</figcaption>');
							} else {
								$img.parent('figure').append('<figcaption class="lightBoxCaption">' + caption + '</figcaption>');
							}
						}
					}
				}
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

	// Activate highlighting
	let codeblocks = $("pre code").each(function(){
		hljs.highlightBlock(this);
	});

	x_setUpPage();
}

// get deep link info
function getDeepLink(info) {
	if (String(info).indexOf('|') >= 0) {
		info = String(info);
		
		var temp = info.split('|'),
			deep;
		
		if ($.isNumeric(temp[1].trim())) {
			deep = parseInt(temp[1].trim() - 1);
		} else {
			deep = temp[1].trim();
		}
		
		return [temp[0].trim(), deep];
	}
	else {
		return [info];
	}
}

// function calls a function in the page models to do the deeplink
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
	
	const pageIndex = $.inArray(x_currentPage, x_normalPages);
	const srOnly = '<span class="sr-only">' + x_getLangInfo(x_languageData.find("vocab").find("page")[0], false, "Page") + " " + (pageIndex+1) + " " + x_getLangInfo(x_languageData.find("vocab").find("of")[0], false, "of") + " " + x_normalPages.length + '</span>';
	const notSr = '<span aria-hidden="true">' + (pageIndex+1) + " / " + x_normalPages.length + '</span>';

	if (pageIndex != -1) {
		$x_pageNo.html(srOnly + notSr);
	} else {
		// standalone page
		$x_pageNo
			.html('')
			.attr("title", '');
	}

	if ($x_menuBtn.length > 0) {
		if (XENITH.PAGEMENU.isThisMenu()) {
			$x_menuBtn
				.button("disable")
				.removeClass("ui-state-focus")
				.removeClass("ui-state-hover");
		} else {
			$x_menuBtn.button("enable");
		}
	}
	
    if (pageIndex != 0 || ((x_params.navigation == "Historic" || x_params.navigation == "LinearWithHistoric") && x_pageHistory.length > 1)) {
        $x_prevBtn.button("enable");
		
    } else {
        $x_prevBtn
            .button("disable")
            .removeClass("ui-state-focus")
            .removeClass("ui-state-hover");
    }

    if (pageIndex != -1 && pageIndex < x_normalPages.length-1) {
        $x_nextBtn.button("enable");
    } else {
        $x_nextBtn
            .button("disable")
            .removeClass("ui-state-focus")
            .removeClass("ui-state-hover");
    }

	// navigation buttons can be disabled on a page by page basis
	if (!XENITH.PAGEMENU.isThisMenu() && (x_currentPageXML.getAttribute("home") != undefined || x_currentPageXML.getAttribute("back") != undefined || x_currentPageXML.getAttribute("next") != undefined)) {
		if ($x_menuBtn.length > 0 && x_currentPageXML.getAttribute("home") == "false") {
			$x_menuBtn.button("disable");
		}
		if (x_currentPageXML.getAttribute("back") == "false") {
			$x_prevBtn.button("disable");
		}
		if (x_currentPageXML.getAttribute("next") == "false") {
			$x_nextBtn.button("disable");
		}
		if (x_currentPageXML.getAttribute("save") == "false") {
			if ($("#x_saveSessionBtn").length > 0) {
				$x_saveSessionBtn.button("disable");
			}
		}
	} else if (!XENITH.PAGEMENU.isThisMenu() && x_currentPageXML.getAttribute("navSetting") != undefined) {
		// fallback to old way of doing things (navSetting - this should still work for projects that contain it but will be overridden by the navBtns group way of doing it where each button can be turned off individually)
		if ($x_menuBtn.length > 0 && x_currentPageXML.getAttribute("navSetting") != "all") {
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
		// project intro can be set to never auto-open, always auto-open or only auto-open when project loaded on first page
		if ($x_introBtn != undefined && (x_params.introShow == 'always' || (x_params.introShow == 'first' && x_currentPage == 0))) {
			// don't auto-open if stand-alone page
			if (x_pageInfo[x_currentPage].standalone != true) {
				$x_introBtn
					.data('autoOpen', true)
					.click();
			}
		}

		// show the video splash screen before the project is shown
		if (x_params.splashVideo != undefined && x_params.splashVideo != "" && x_params.splashVideo.toLowerCase().indexOf(".mp4") != -1 && (x_params.splashShow == "always" || $.inArray(x_currentPage, x_normalPages) == 0)) {
			// splash videos always auto-play with hidden controls and are closed when the video is finished
			$.featherlight('<div id="splashVideo"></div>', { openSpeed: 0, closeSpeed: 400 });

			$('#splashVideo').parents('.featherlight-content').addClass('splashVideo');

			$('#splashVideo')
				.mediaPlayer({
					type: 'video',
					source: x_params.splashVideo,
					width: '100%',
					height: '100%',
					pageName: 'splashVideo',
					autoPlay: 'true',
					autoNavigate: 'true',
					muted: 'true'
				});

			$('#splashVideo .mejs-container .mejs-controls, #splashVideo .mejs-overlay-button, #splashVideo .mejs-overlay-loading').hide();

			// customise the background colour of the splash video lightbox
			if (x_params.splashBg != undefined && x_params.splashBg != '') {
				const customStyle = 'background: ' + formatColour(x_params.splashBg);
				const customHeaderStyle = '<style id="customSplashStyle">.featherlight:has(.featherlight-content.splashVideo), .featherlight .featherlight-content.splashVideo { ' + customStyle + '}</style>';
				$('head').append(customHeaderStyle);
			}
		}

		$x_mainHolder.css("visibility", "visible");
		x_updateCss2(true);
		XENITH.SIDEBAR.show();

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
		$('#preventFlash').remove();

		x_firstLoad = false;
    }
}

// function called from each model when fully loaded to trigger fadeIn
function x_pageLoaded() {
    x_pageInfo[x_currentPage].built = $("#x_page" + x_currentPage);
    x_pageInfo[x_currentPage].viewed = true;
	
	// calls function in current theme (if it exists)
	var pt = x_pageInfo[x_currentPage].type;
	if (pt == "text") pt = 'simpleText'; // errors if you just call text.pageChanged()
	if (typeof customPageChanged == 'function') {
		customPageChanged(pt);
	}
	
	// Do deeplinking here so model has appropriate data at hand
	x_doDeepLink();

    // Resolve all text box added <img> and <a> src/href tags to proper urls
    $("#x_page" + x_currentPage).find("img,a").each(function() {
        var $this = $(this),
            val = $this.attr("src") || $this.attr("href"),
            attr_name = $this.attr("src") ? "src" : "href";

        $this.attr(attr_name, x_evalURL(val));
    });

	if (!XENITH.PAGEMENU.isThisMenu()) {
		x_setUpLightBox();
		
		// plugin files are loaded after page is loaded
		if (plugins[pt] != undefined) {
			if (plugins[pt].script != undefined && plugins[pt].script != "" && $("#x_pagePluginScript").length == 0) {
				$("#x_page" + x_currentPage).append('<script id="x_pagePluginScript">' +  plugins[pt].script + '</script>');
				// calls function in current page model (if it exists) which does anything needed to reset the page (if it needs to be reset)
				if (typeof window[pt].initPlugin === "function") window[pt].initPlugin();
			}
			if (plugins[pt].css != undefined && plugins[pt].css != "" && $("#x_pagePluginCSS").length == 0) {
				$("#x_page" + x_currentPage).append('<style type="text/css" id="x_pagePluginCSS">' +  plugins[pt].css + '</style>');
			}
		}
		
		// script & style optional properties for each page added after page is otherwise set up
		if (x_currentPageXML.getAttribute("script") != undefined && x_currentPageXML.getAttribute("script") != "") {
			$("#x_page" + x_currentPage).append('<script id="x_pageScript">' +  x_currentPageXML.getAttribute("script") + '</script>');
		}
		if (x_currentPageXML.getAttribute("styles") != undefined && x_currentPageXML.getAttribute("styles") != "" && $("#x_pageCSS").length == 0) {
			$("#x_page" + x_currentPage).append('<style type="text/css" id="x_pageCSS">' +  x_currentPageXML.getAttribute("styles") + '</style>');
		}
	}

	// Check if page headerBgColour/headerTextColour has been set
	if (!XENITH.PAGEMENU.isThisMenu() && ((x_currentPageXML.getAttribute("headerBgColor") != undefined && x_currentPageXML.getAttribute("headerBgColor") != "") || (x_currentPageXML.getAttribute("headerTextColor") != undefined && x_currentPageXML.getAttribute("headerTextColor") != ""))) {
		const bgCol = x_currentPageXML.getAttribute("headerBgColor");
		const textCol = x_currentPageXML.getAttribute("headerTextColor");
		let customHeaderStyle = '';
		if (bgCol != undefined && bgCol != "") {
			customHeaderStyle += 'background: ' + formatColour(bgCol) + ';';
			customHeaderStyle += 'background-color: ' + formatColour(bgCol) + ';';
		}
		if (textCol != undefined && textCol != "") {
			customHeaderStyle += 'color: ' + formatColour(x_currentPageXML.getAttribute('headerTextColor')) + ';';
		}
		customHeaderStyle = '<style id="customHeaderStyle">#x_headerBlock {' + customHeaderStyle + '}</style>';
		$('#x_page' + x_currentPage).append(customHeaderStyle);
	}

	// any custom header styles will be disabled if a custom theme (via accessibility options) is in use
	XENITH.ACCESSIBILITY.disableBespokeCSS();

	XENITH.VARIABLES.handleSubmitButton();

    $("#x_page" + x_currentPage)
        .hide()
        .css("visibility", "visible")
        .fadeIn();

	// Trigger featherlight
	var config = $.featherlight.defaults;
    $(config.selector, config.context).featherlight();

	XENITH.PROGRESSBAR.update();
	
	var pagesLoaded = $(x_pageInfo).filter(function(i){ return this.built != false; }).length;
	x_focusPageContents(pagesLoaded <= 1 ? true : false);
	
	// show page introduction immediately on page load if set to auto open - unless the project intro is also set to auto-open at this time
	if ($x_pageIntroBtn != undefined && x_getIntroInfo(x_currentPageXML) != false && x_currentPageXML.getAttribute("introShow") != 'never') {
		var projectIntroOpening = x_firstLoad == true && (x_params.introShow == 'always' || (x_params.introShow == 'first' && x_currentPage == 0)) ? true : false;
		if (projectIntroOpening != true) {
			$x_pageIntroBtn.click();
		}
	}

	XENITH.SIDEBAR.pageLoad(true);
}

//convert picker color to #value
function formatColour(col) {
	return (col.length > 3 && col.substr(0,2) == '0x') ? '#' + col.substr(2) : col;
}

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
				
				// manually add a transcript button to the end of the narration bar
				if (x_currentPageXML.getAttribute("narrationTranscript") != undefined && x_currentPageXML.getAttribute("narrationTranscript") != '') {
					x_addAudioTranscript($("#x_footerBlock #x_pageNarration"), x_currentPageXML.getAttribute("narrationTranscript"));
				}
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

// function adds transcript button to the end of audio bars, e.g. page narration - but also called from page models
function x_addAudioTranscript($audioHolder, transcriptTxt, decode) {
	if (decode == true) {
		transcriptTxt = $("<div/>").html(transcriptTxt).text();
	}
	
	$audioHolder.addClass('audioTranscript');
	
	const transcriptLabel = x_getLangInfo(x_languageData.find('mediaElementControls').find('transcriptButton')[0], 'label', 'Transcript');
	
	$('<div class="audioTranscriptBtn mejs-button"><button class="fas fa-comment-dots" type="button" aria-controls="mep_0" title="' + transcriptLabel + '" aria-label="' + transcriptLabel + '"><span class="sr-only">' + transcriptLabel + '</span></button></div>')
		.appendTo($audioHolder.find('.mejs-container .mejs-controls'))
		.click(function() {
			$.featherlight(transcriptTxt);
		});
}

// function adds timer bar above main controls on interface - optional property that can be added to any interactivity page
function x_addCountdownTimer() {
    var x_timerLangInfo = [
		x_currentPageXML.getAttribute("timerText") != null && x_currentPageXML.getAttribute("timerText") != "" ? x_currentPageXML.getAttribute("timerText") : x_getLangInfo(x_languageData.find("timer").find("remaining")[0], "name", "Time remaining"),
		x_currentPageXML.getAttribute("timerLabel") != null && x_currentPageXML.getAttribute("timerLabel") != "" ? x_currentPageXML.getAttribute("timerLabel") : x_getLangInfo(x_languageData.find("timer").find("timeUp")[0], "name", "Time up"),
		x_getLangInfo(x_languageData.find("timer").find("seconds")[0], "name", "seconds")
	];

    var x_countdownTicker = function () {
        x_countdownTimer--;

		var pageType = x_pageInfo[x_currentPage].type;
		pageType = (pageType === 'text') ? 'simpleText' : pageType

        if (x_countdownTimer > 0) {
            $("#x_footerBlock #x_pageTimer .x_time").html(x_timerLangInfo[0] + ": " + x_formatCountdownTimer());

         	// If page model wants timer tick to know then pass value
        	if (typeof window[ pageType ].onTimerTick === "function") window[ pageType ].onTimerTick(x_countdownTimer);
        }
        else {
            window.clearInterval(x_timer);
			$("#x_footerBlock #x_pageTimer .x_time").html("");
            $("#x_footerBlock #x_pageTimer .x_timeUp").html(x_timerLangInfo[1]);

        	// If page model wants to know then pass event
        	if (typeof window[ pageType ].onTimerZero === "function") window[ pageType ].onTimerZero();

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
        $("#x_footerBlock div:first").before('<div id="x_pageTimer"><span role="timer" class="x_time"></span><span class="x_timeUp" aria-live="assertive"></span></div>');
        x_countdownTimer = parseInt(x_currentPageXML.getAttribute("timer"));
        $("#x_footerBlock #x_pageTimer .x_time").html(x_timerLangInfo[0] + ": " + x_formatCountdownTimer());
        x_timer = setInterval(x_countdownTicker, 1000);
    }
}

// function adds individual page backgrounds & sets up all the attributes of it (opacity, size etc.)
function x_loadPageBg(loadModel) {
	// vertical/horizontal align & max/min height optional properties are only in title page xwd
	var vConstrain = x_currentPageXML.getAttribute("bgImageVConstrain"),
		hConstrain = x_currentPageXML.getAttribute("bgImageHConstrain"),
		alpha = x_currentPageXML.getAttribute("bgImageAlpha") != undefined && x_currentPageXML.getAttribute("bgImageAlpha") != "" ? x_currentPageXML.getAttribute("bgImageAlpha") : 100;

	var $pageBg = $('<img id="pageBg' + x_currentPage + '" class="pageBg" alt=""/>');
    var objectfit =  (x_currentPageXML.getAttribute("backgroundFit") != undefined ? x_currentPageXML.getAttribute("backgroundFit") : "fill");
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
	}
	else $("#x_bgDarken").hide();

	if (x_currentPageXML.getAttribute("bgImageGrey") == "true") {
		if ($("#pageBg" + x_currentPage).length < 1) { // IE where the greyscale is done differently - make sure the div that has replaced the original pageBg is given the pageBg id
			$(".grayscale:not(#x_mainBg):not([id])").addClass("pageBg").attr("id", "pageBg" + x_currentPage);
			$pageBg = $("#pageBg" + x_currentPage);
			$pageBg.css("visibility", "visible");
		}
		$("#pageBg").gray().fadeIn();
	}
	$("#x_mainBg").hide();
}

// function sorts out css that's dependant on screensize
function x_updateCss(updatePage, updateSidebar) {
	if (updatePage != false) {

		if (updateSidebar !== false && XENITH.SIDEBAR.sideBarType != undefined) {
			XENITH.SIDEBAR.setWidth(true);
		}
		
		// adjust width of narration controls - to get this to work consistently across browsers and with both html5/flash players the audio needs to be reset
		if ($("#x_pageNarration").length > 0) {
			if ($("#x_pageNarration audio").css("display") == "none") { // flash
				var audioRefNum = $("#x_pageNarration .mejs-audio").attr("id").substring(4);
				$("body div#me_flash_" + audioRefNum + "_container").remove();
			}
			
			if ($("#x_pageNarration").length > 0) {
				var audioBarW = 0;
				$("#x_pageNarration .mejs-inner .mejs-controls").children().each(function() {
					audioBarW += $(this).outerWidth();
				});
				
				// if (audioBarW - $("#x_pageNarration").parents("#x_footerBlock").width() < -7 || audioBarW - $("#x_pageNarration").parents("#x_footerBlock").width() > 7) {
				// 	$x_window.resize();
				// }
			}
			
		}
	}

	x_updateCss2(updatePage);
}

// function isn't called until the narration bar has loaded
function x_updateCss2(updatePage) {
	$x_pageHolder.css("margin-bottom", $x_footerBlock.outerHeight());
    $x_background.css("margin-bottom", $x_footerBlock.outerHeight());
	
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

                if (load != undefined && type !== "menu" && type !== "colourChanger") {
                    x_dialogInfo[i].built.children(".x_popupDialog").html(load);
					x_dialogInfo[i].built.find('.ui-dialog-title').html(title);
                }

				x_setDialogSize(x_dialogInfo[i].built.children(".x_popupDialog"), position);

                if (type == "language") {
                    language.turnOnKeyEvents();
                } else if (type == "menu") {
					XENITH.PAGEMENU.tickViewed();
					XENITH.PAGEMENU.showCurrent();
				}

            } else {
                $x_body.append('<div id="x_' + type + '" class="x_popupDialog" tabindex="0"></div>');

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

					if (type == "menu") {
						XENITH.PAGEMENU.build($("#tocMenuDialog"));
					} else if (type == "colourChanger") {
						XENITH.ACCESSIBILITY.build($("#colourChangerDialog"));
					}

                    x_setDialogSize($x_popupDialog, position);
                }

                x_dialogInfo[i].built = $x_popupDialog.parent();
            }
			
			x_pageContentsUpdated();
			
            break;
        }
    }
}

function x_setDialogSize($x_popupDialog, position) {
    var width = $x_mainHolder.width()/2,
        height = undefined,
        left = $x_mainHolder.width()/4 + $x_mainHolder.position.left,
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

    window.open('','','width=300,height=450,scrollbars=yes').document.write('<p style="font-family:sans-serif; font-size:12px">' + text + '</p>');

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

// function finds attributes/nodeValues where text may need replacing for things like links / glossary words
function x_findText(pageXML, exclude, list) {
    var attrToCheck = ["text", "instruction", "instructions", "answer", "description", "prompt", "question", "option", "hint", "feedback", "summary", "intro", "txt", "goals", "audience", "prereq", "howto", "passage", "displayTxt", "side1", "side2", "passwordInfo", "passwordError"],
        i, len;
	if (pageXML.nodeName == "mcqStepOption") { attrToCheck.push("name"); } // don't include name normally as it's generally only used in titles

    for (i=0, len = pageXML.attributes.length; i<len; i++) {
        if ($.inArray(pageXML.attributes[i].name, attrToCheck) > -1) {
            x_insertText(pageXML.attributes[i], exclude, list);
        }
		
		if (pageXML.attributes[i].name == 'data') {
			x_insertText(pageXML.attributes[i], true, ['glossary'], true);
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
function x_insertText(node, exclude, list, data) {
	// Decode node.value in order to make sure it works for for foreign characters like é
	// But keep html tags, so use textarea
	// cf. http://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it (3rd answer)
	var temp=document.createElement("pre");
	temp.innerHTML=node.nodeValue;
	var tempText = temp.innerHTML;

	// if exclude == true then we don't look at those in list - if exclude == false then we only look at those in list
	list = list == undefined ? [] : list;
	
	// check text for variables - if found replace with variable value
	// also handle case where comma decimal separator has been requested
	if (XENITH.VARIABLES && XENITH.VARIABLES.exist() && (exclude == undefined || (exclude == false && list.indexOf("variables") > -1) || (exclude == true && list.indexOf("variables") == -1))) {
		tempText = XENITH.VARIABLES.replaceVariables(tempText, x_params.decimalseparator, data);
	}
	
	// check text for global variables - if found replace with variable value
	if (x_params.globalVars == 'true' && (exclude == undefined || (exclude == false && list.indexOf("globalVars") > -1) || (exclude == true && list.indexOf("globalVars") == -1))) {
		tempText = XENITH.GLOBALVARS.replaceGlobalVars(tempText);
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

	tempText = XENITH.GLOSSARY.insertText(tempText, exclude, list);

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
            return 'href="#" onclick="x_navigateToPage(false, {type:\'page\',ID:\'' + p1 + '\'}); return false;">';
        else
            return 'href="#" onclick="x_navigateToPage(false, {type:\'linkID\',ID:\''+ p1 +'\'}); return false;">';
    });
    node.nodeValue = tempText;
}

// function maximises LO size to fit window
function x_setFillWindow(updatePage) {
	x_fillWindow = true;

    if (XENITH.ACCESSIBILITY.responsiveTxt === true && updatePage !== false) {
		XENITH.ACCESSIBILITY.changeResponsiveTxt(true, false);
    }

    $x_mainHolder.css({
		"width"     :"100%",
        "height"    :"100%"
    });

    $x_body.css("overflow", "hidden");
    x_updateCss(updatePage);
    window.scrolling = false;
	
    $("#x_cssBtn")
		.button({
			icons:  {
				primary: x_btnIcons.filter(function(icon){return icon.name === 'min';})[0].iconClass
			},
			// label can now be set in editor but fall back to language file if not set
			label: x_params.minLabel != undefined && x_params.minLabel != "" ? x_params.minLabel : x_getLangInfo(x_languageData.find("sizes").find("item")[0], false, "Default")
		})
		.addClass('x_minimise').removeClass("x_maximise");
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
				else
				{
					if (disable == true) {
						$(this).prop("disabled", true);
					}
				}
            }
            func();
			css.onload = null; // in FF this continues to be called every time theme is changed (via accessibility options) so force it to only trigger onload once - calling multiple times causes issues such as duplicated narration bar
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

	if (element != null) {
        // update element e.g. page model css files which will be replaced with the new page model's css file
        if (donotreplace != true) {
            var parent = element.parentNode;
            parent.replaceChild(css, element);
        } else {
			// this has already loaded and we don't need to load again
            if (func != undefined) func();
        }
    }
    else {
        // Create element
		if (id == "page_model_css" && $("#theme_css").length > 0) {
			$(css).insertBefore($("#theme_css"));
		} else {
			document.getElementsByTagName("head")[0].appendChild(css);
		}
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
			}
			else return value;
		}
		else return value;
	}
	else {
		// convert to , as it is to be shown on page
		if ($.isNumeric(value) && x_params.decimalseparator !== undefined && x_params.decimalseparator === 'comma') {
			return String(value).replace('.', ',');
		}
		else return value;
	}
}

// ___ FUNCTIONS CALLED FROM PAGE MODELS ___

// function called from model pages to scale images - scale, firstScale & setH are optional
function x_scaleImg(img, maxW, maxH, scale, firstScale, setH, enlarge) {
    var $img = $(img);
    if (scale != false && $img.width() > 0 && $img.height() > 0) {
        var imgW = $img.width(),
            imgH = $img.height();

        if (firstScale == true || $img.data("origSize") == undefined) { // store orig dimensions - will need them if resized later so it doesn't get larger than orignial size
            $img.data("origSize", [imgW, imgH]);
        } else if ($img.data("origSize") != undefined) { // use orig dimensions rather than current dimensions (so it can be scaled up if previously scaled down)
            imgW = $img.data("origSize")[0];
            imgH = $img.data("origSize")[1];
        }

        if (enlarge === false) {
            maxW = Math.min(maxW, imgW);
            maxH = Math.min(maxH, imgH);
        }

        if (imgW > maxW || imgH > maxH || firstScale != true || enlarge !== false) {
            var scaleW = maxW / imgW,
                scaleH = maxH / imgH,
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

// function returns the full height available for elements within the page e.g. panels
function x_getAvailableHeight(excludePadding, excludeHeight, mobile) {
	// get space available on page, excluding margins, borders & padding on parents
	let availableH;
	if (x_browserInfo.mobile === false) {
		availableH = $x_pageHolder.height() - ($x_pageDiv.outerHeight(true) - $x_pageDiv.height());

	} else if (mobile === true) {
		// often height on mobiles will be auto so only return a height for mobile view when requested
		availableH = $x_mobileScroll.height() - $x_headerBlock.outerHeight(true) - $x_footerBlock.outerHeight(true) - ($x_pageDiv.outerHeight(true) - $x_pageDiv.height());
	}

	if (availableH != undefined) {
		// minus the padding/margin/border of some extra elements
		// e.g. if this is used to resize a panel then take padding of panel into consideration
		if (excludePadding != undefined) {
			for (let i=0; i<excludePadding.length; i++) {
				availableH -= (excludePadding[i].outerHeight(true) - excludePadding[i].height());
			}
		}

		// minus the height of some extra elements
		// e.g. if there's a button below a panel, exclude the height of to ensure the panel takes up the correct available space
		if (excludeHeight != undefined) {
			for (let i=0; i<excludeHeight.length; i++) {
				if ($.isNumeric(excludeHeight[i])) {
					// a number has been passed instead of an element - minus this
					availableH -= excludeHeight[i];
				} else {
					availableH -= excludeHeight[i].outerHeight(true);
				}
			}
		}

		availableH = Math.floor(availableH);
	}

	return availableH;
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

// function converts hex colour to rgb
function x_hexToRgb(hex, opa) {
	var bigint = parseInt(hex, 16);
	var r = (bigint >> 16) & 255;
	var g = (bigint >> 8) & 255;
	var b = bigint & 255;
	
	return "rgba(" + r + "," + g + "," + b + "," + opa + ")";
}

// function randomises the order of items in an array
function x_shuffleArray(array) { 
    return array.sort(function() {return Math.random()-0.5})
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

// Based somewhat on these regexps for YouTube and Vimeo (check there for updates)
//   https://stackoverflow.com/questions/19377262/regex-for-youtube-url
//   https://stackoverflow.com/questions/5008609/vimeo-video-link-regex
function x_fixYouTubeVimeo(url) {
	var path = url.trim();
	let result = url.match(/(^|<iframe.+?src=["'])((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?.*?(<\/iframe>|$)$/);
	if (result) return "www.youtube.com/watch?v=" + result[7] + (result[8] !== undefined ? result[8] : "");
	result = url.match(/(^|<iframe.+?src=["'])(?:http|https)?:?\/?\/?(?:www\.)?(?:player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|video\/|)(\d+)(?:|\/\?).*?(<\/iframe>|$)/);
	if (result) return "vimeo.com/" + result[2];
	return url;
}

// strip html tags and return just text which is appropriate for screen reader
function x_getAriaText(text) {
	return $('<p>' + text + '</p>').text();
}

// Script to check whether saveSession button is styled in theme
function x_saveSessionBtnIsStyled() {
	// In offline the line below with r.rules causes a CORS error.
	// Offline doesn't use save session anyway, so return true
	if (xot_offline)
		return true;
	if (x_params.theme == undefined || x_params.theme == "default") // old projects might not have a theme so fall back to using default
		return true;
	var files = $.map(document.styleSheets, function(s) {
		// All css files in the themes folders except responsivetext.css
		return s.href && s.href.indexOf('/themes/Nottingham/')>0 && s.href.indexOf('responsivetext')<0 ? s : null;
	});

	try {
		var isStyled = files.reduce(function (a, r) {
			return [].slice.call(r.rules).reduce(function (a, r) {
				return (r.cssText && r.cssText.indexOf('x_saveSession') > 0) || a;
			}, false) || a;
		}, false);
	}
	catch (e)
	{
		console.log("Error checking whether saveSession button is styled in theme: " + e);
		return false;
	}
	return isStyled;
}


// video has loaded to intro lightbox - make sure it's sized correctly (MP4 only)
function x_introMediaMetadata($video, wh) {
	$video.data({
		width: wh[0],
		height: wh[1]
	});
	
	$video.closest(".mejs-video").css({
		"maxWidth": wh[0] + 'px',
		"maxHeight": wh[1] + 'px'
	});
	
	// resize if the media is the wrong size for its holder
	// this is done by manually triggering the window resize event (mediaelement.js listens to this event)
	$('.featherlight-content').addClass('max');
	$x_window.resize();
	$('.featherlight-content').removeClass('max');
}


// ================== ****** ==================


// ***** VARIABLES *****
var XENITH = (function ($, parent) { var self = parent.VARIABLES = {};

    // Declare local variables
	var 	variables = [],
			variableInfo = [],
			variableErrors = [],
			dynamicCalcs = [],
			dynamicID = 1,

	// function starts the calculation of variables set by author via the variables optional property
	init = function (variableData) {

		// clears arrays if they have previously been calculated
		variables.splice(0, variables.length);
		variableInfo.splice(0, variableInfo.length);
		variableErrors.splice(0, variableErrors.length);

		var i, j, k, temp, thisVar,
			toCalc = [];

		variableInfo = variableData.split("||");

		// get array of data for all uniquely named variables & sort them so empty strings etc. become undefined
		for (i=0; i<variableInfo.length; i++) {
			var temp = variableInfo[i].split("|");
			thisVar = {name:$.trim(temp[0]), data:temp.slice(1), requires:[]}; // data = [fixed value, [random], min, max, step, decimal place, significant figure, trailing zero, [exclude], default]
			if (thisVar.name != "" && variableInfo.filter(function(a){ return a.name == thisVar.name }).length == 0) {
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

				variableInfo.splice(i, 1, thisVar);
				toCalc.push(i);

			} else {
				variableInfo.splice(i, 1);
				i--;
			}
		}
		calcVariables(toCalc);
	},

	// Check if we have any variables to deal with
	exist = function () {
		return variables.length > 0;
	},

	calcVariables = function (toCalc) {
		var lastLength, checkDefault,
			thisVar, i;

		// goes through all variables and attempts to calculate their value
		// may loop several times if variables require other variable values to be ready before calculating their value
		// stops when no. var values calculated is no longer increasing - either all done or some vars can't be calculated (circular calculations or referencing non-existant vars)
		while (toCalc.length > 0 && (toCalc.length != lastLength || checkDefault == true)) {
			lastLength = toCalc.length;

			for (i=0; i<toCalc.length; i++) {
				thisVar = calcVar(variableInfo[toCalc[i]], false, checkDefault);
				if (thisVar.ok == true) {
					thisVar.requiredBy = [];
					variables.push(thisVar);
					toCalc.splice(i,1);
					i--;
					if (thisVar.default == true) {
						checkDefault = false;
					}
				} else if (thisVar.ok == false) {
					variableErrors.push(thisVar);
					toCalc.splice(i,1);
					i--;
				}

				if (i + 1 == toCalc.length && toCalc.length == lastLength) {
					checkDefault = checkDefault == true ? false : true;
				}
			}
		}

		for (i=0; i<toCalc.length; i++) {
			thisVar = variableInfo[toCalc[i]];
			thisVar.info = x_getLangInfo(x_languageData.find("authorVarsInfo").find("error")[0], "unable", "Unable to calculate") + ": " + x_getLangInfo(x_languageData.find("authorVarsInfo").find("info")[0], "undef", "References an undefined variable");
			variableErrors.push(thisVar);
			toCalc.splice(i,1);
			i--;
		}

		if ($("#x_authorSupportMsg").length > 0 && (variables.length > 0 || variableErrors.length > 0)) {
			$('.x_varMsg').remove();
			$("#x_authorSupportMsg p").append('<span class="x_varMsg"></br>' + '<a onclick="XENITH.VARIABLES.showVariables()" href="javascript:void(0)" style="color:red">' + x_getLangInfo(x_languageData.find("authorVars")[0], "label", "View variable data") + '</a></span>');
		}
	},

	// function calculates the value of any author set variables
	calcVar = function (thisVar, recalc, checkDefault) {
		thisVar.ok = undefined;

		// calculate min / max / step values
		var data = {min:thisVar.data[2], max:thisVar.data[3], step:thisVar.data[4]},
			exclude = [], index;

		for (var key in data) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				// check for use of other variables & keep track of which are required
				if (data[key] != undefined && ((thisVar.data[0] == undefined && thisVar.data[1].length == 0) || key != "step")) {
					var info = getVarValues(data[key], thisVar.name);
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
				var info = getVarValues(exclude[i], thisVar.name);
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
					var info = getVarValues(thisVar.value, thisVar.name);
					thisVar.value = info[0];
					if (info[1].length > 0) { thisVar.requires = thisVar.requires.concat(info[1].filter(function (item) { return thisVar.requires.indexOf(item) < 0; })); }
					thisVar.ok = info[2];

				} else if (thisVar.data[1].length > 0) {
					// RANDOM FROM LIST
					thisVar.type = "random";

					index = Math.floor(Math.random()*thisVar.data[1].length);
					thisVar.value = thisVar.data[1][index];

					// check for use of other variables & keep track of which are required
					var info = getVarValues(thisVar.value, thisVar.name);
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
					thisVar = calcVar(thisVar, true);
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
	},

	getVariable = function(name) {
		for (var i=0; i<variables.length; i++)
		{
			if (variables[i].name == name)
				return variables[i].value;
		}
		return null;
	},

	// function updates a variable update
	setVariable = function (name, value) {
		var dependants;

		for (var i=0; i<variables.length; i++) {
			if (variables[i].name == name) {
				variables[i].value = x_checkDecimalSeparator(value, true);
				dependants = variables[i].requiredBy;
				break;
			}
		}

		return dependants;
	},

	// function updates all variables on screen with the current value
	updateVariable = function () {

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
				for (var j=0; j<variables.length; j++) {

					if (variables[j].name == varName) {
						$thisVarSpan.html(x_checkDecimalSeparator(variables[j].value));
						break;
					}
				}
			}
		}
	},

	// function gets values of other variables needed for calculation and evals the value when everything's ready
	getVarValues = function (thisValue, thisName) {
		var requires = [];

		if (thisValue.indexOf("[" + thisName + "]") != -1) {
			return [thisValue, requires, false];
		}

		if (String(thisValue).indexOf("[") != -1) {
			for (var i=0; i<variables.length; i++) {
				if (thisValue.indexOf("[" + variables[i].name + "]") != -1) {
					// keeps track of what other variables reference this so they can be recalculated together if needed
					if (variables[i].requiredBy.indexOf(thisName) == -1) {
						variables[i].requiredBy.push(thisName);
					}
					requires.push(variables[i].name);

					RegExp.esc = function(str) {
						return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
					};
					var regExp = new RegExp(RegExp.esc("[" + variables[i].name + "]"), "g");
					thisValue = thisValue.replace(regExp, variables[i].value);
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
	},

	// function displays author set variables in popup when in author support mode
	showVariables = function () {
		var varHeadings = ["Name", "Fixed Value", "Random", "Min", "Max", "Step", "DP", "SF", "Trailing Zeros", "Exclude", "Default"];
		var pageText = '<html><body><style>table, tr, td, th { border: 1px solid black; text-align: left; } th { background-color: LightGray; } table { border-collapse: collapse; min-width: 100%; } th, td { padding: 1em; width: ' + (100/(varHeadings.length+1)) + '%; } .alert { color: red; } td:nth-child(1), td:nth-child(2) { font-weight: bold; } </style><table>',
			cells, temp, infoTxt;

		for (var i=0; i<varHeadings.length; i++) {
			pageText += '<th>' + x_getLangInfo(x_languageData.find("authorVars").find("item")[i], false, varHeadings[i]) + '</th>';
			if (i == 0) {
				pageText += '<th>' + x_getLangInfo(x_languageData.find("authorVars").find("item")[varHeadings.length], false, "Value") + '</th>';
			}
		}

		for (var i=0; i<variables.length; i++) {
			cells = "";
			for (var j=0; j<variables[i].data.length; j++) {
				temp = variables[i].data[j] === undefined ? "" : variables[i].data[j];
				cells += '<td>' + temp + '</td>';
			}
			infoTxt = variables[i].info == undefined ? "" : '<br/><span class="alert">' + variables[i].info + '</span>';
			pageText += '<tr><td>' + variables[i].name + '</td><td>' + variables[i].value + infoTxt + '</td>' + cells + '</tr>';
		}

		for (var i=0; i<variableErrors.length; i++) {
			cells = "";
			for (var j=0; j<variableErrors[i].data.length; j++) {
				temp = variableErrors[i].data[j] === undefined ? "" : variableErrors[i].data[j];
				cells += '<td>' + temp + '</td>';
			}
			pageText += '<tr style="background-color: LightGray;"><td>' + variableErrors[i].name + '</td><td>' + variableErrors[i].info + '</td>' + cells + '</tr>';
		}

		pageText += '</table></body></html>';

		window.open('','','width=300,height=450').document.write('<p style="font-family:sans-serif; font-size:12px">' + pageText + '</p>');
	},

	replaceVariables = function (tempText, decimalSeparator, dataInfo) {
		tempText = tempText.replace(
			new RegExp('\\[\\{(.*?)\\}(?:\\s|&nbsp;)*(?:(?:\\,(?:\\s|&nbsp;)*?(\\d+?)?))?\\]|<span class="x_var x_dyn_(.*?)">(?:.*?)</span>', 'g'),
			function (match, contents, round, id) {
				if (contents) {
					id = dynamicID++;
					dynamicCalcs[id] = [contents, round];
				}

				var result = variables.reduce(function(accumulator, variable) {
					return accumulator.replace(new RegExp('\\[' + variable.name + '\\]', 'g'), x_checkDecimalSeparator(variable.value));
				}, dynamicCalcs[id][0]);
				round = dynamicCalcs[id][1];

				try {
					var ev = eval( result );
					result = Math.round(
						ev * (round = Math.pow(10, round ? round  : 16))
					) / round;
				}
				catch (e) {}

				$('.x_dyn_' + id).html(x_checkDecimalSeparator(result));
				return '<span class="x_var x_dyn_' + id + '">' + result + '</span>';
			}
		);

		for (var k=0; k<variables.length; k++) {
			if (dataInfo == true) {
				// we're looking at the data for chart, documetaion, grid and table pages - these are treated differently to normal text
				// replace with the variable text
				var regExp = new RegExp('\\[' + variables[k].name + '\\]', 'g');
				tempText = tempText.replace(regExp, x_checkDecimalSeparator(variables[k].value));
			} else {
				// if it's first attempt to replace vars on this page look at vars in image, iframe, a & mathjax tags first
				// these are simply replaced with no surrounding tag so vars can be used as image sources etc.
				var tags = ['img', '.mathjax', 'iframe', 'a'];

				for (var p=0; p<tags.length; p++) {
					var thisTag = tags[p];

					if (tempText.indexOf('[' + variables[k].name + ']') != -1) {
						var $tempText = $(tempText).length == 0 ? $('<span>' + tempText + '</span>') : $(tempText);
						for (var m=0; m<$tempText.find(thisTag).length; m++){
							var tempTag = $tempText.find(thisTag)[m].outerHTML,
								regExp2 = new RegExp('\\[' + variables[k].name + '\\]', 'g');
							tempTag = tempTag.replace(regExp2, x_checkDecimalSeparator(variables[k].value));
							$($tempText.find(thisTag)[m]).replaceWith(tempTag);
						}
						tempText = $tempText.map(function(){ return this.outerHTML; }).get().join('');
					}
				}

				// replace with the variable text (this looks at both original variable mark up (e.g. [a]) & the tag it's replaced with as it might be updating a variable value that's already been inserted)
				var regExp = new RegExp('\\[' + variables[k].name + '\\]|<span class="x_var x_var_' + variables[k].name + '">(.*?)</span>', 'g');
				tempText = tempText.replace(regExp, '<span class="x_var x_var_' + variables[k].name + '">' + x_checkDecimalSeparator(variables[k].value) + '</span>');

				// replace with a text input field which the end user can use to set the value of the variable
				regExp = new RegExp('\\[=' + variables[k].name + '\\]', 'g');
				tempText = tempText.replace(regExp, '<input type="text" name="' + variables[k].name + '" class="x_varInput">');

				// this format of the text input field has specified a default value
				regExp = new RegExp('\\[=' + variables[k].name + ':(.*?)\\]', 'g');

				var matches = tempText.match(regExp);
				if (matches != null) {
					for (var m=0; m<matches.length; m++) {
						tempText = tempText.replace(matches[m], '<input type="text" name="' + variables[k].name + '" class="x_varInput" placeholder="' + matches[m].substring(matches[m].indexOf(':')+1, matches[m].length-1) + '">');
					}
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

		return tempText;
	},

	handleSubmitButton = function () {
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
						var temp = setVariable($('.x_varInput')[i].name, $('.x_varInput')[i].value);
						if (temp.length > 0) {
							$.merge(dependants, temp);
						}
					}
				}

				// as well as updating any variables that have been directly changed there may be dependants of those variables to change too
				if (dependants.length > 0) {
					dependants = dependants.filter(function(a){if (!this[a]) {this[a] = 1; return a;}},{});

					for (i=0; i<dependants.length; i++) {
						for (j=0; j<variables.length; j++) {
							if (dependants[i] == variables[j].name) {
								for (k=0; k<variables[j].requiredBy.length; k++) {
									if ($.inArray(variables[j].requiredBy[k], dependants) == -1) {
										dependants.push(variables[j].requiredBy[k]);
									}
								}
							}
						}
					}

					var toCalc = [];
					for (i=0; i<variableInfo.length; i++) {
						if ($.inArray(variableInfo[i].name, dependants) > -1) {
							changed.push(variableInfo[i].name);
							toCalc.push(i);

							// clear current variable value
							for (k=0; k<variables.length; k++) {
								if (variableInfo[i].name == variables[k].name) {
									variables.splice(k,1);
									break;
								}
							}
						}
					}

					calcVariables(toCalc);
				}

				// should this page be immediately updated to show changes to the variable values?
				if (x_currentPageXML.getAttribute('varUpdate') != 'false') {
					for (i=0; i<variables.length; i++) {
						for (j=0; j<changed.length; j++) {
							if (variables[i].name == changed[j]) {
								$('.x_var_' + variables[i].name).html(x_checkDecimalSeparator(variables[i].value));

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
	};

	// make some public methods
    self.init = init;
	self.exist = exist;
	self.handleSubmitButton = handleSubmitButton;
	self.replaceVariables = replaceVariables;
	self.showVariables = showVariables;
	self.getVariable = getVariable;
	self.updateVariable = updateVariable;
	self.setVariable = setVariable;

return parent; })(jQuery, XENITH || {});


// ***** GLOSSARY *****
var XENITH = (function ($, parent) { var self = parent.GLOSSARY = {};

    // Declare local variables
	var 	x_glossary      = [],
			$x_glossaryHover,
			multiple_terms = false, // link all terms on page or just the first - default is FIRST ONLY
			ignore_space = true,  // ignore and remove all multiple whitespace within terms, including - default is IGNORE AND REMOVE
									// we always remove leading and trailing whitespace
	
	init = function () {
		
		$x_glossaryHover = $('<div id="x_glossaryHover" class="x_tooltip" role="tooltip"></div>')
			.appendTo($x_mainHolder)
			.hide();
		
		x_dialogInfo.push({type:'glossary', built:false});

		var i, len, item, word,
			items = x_params.glossary.split("||");

		for (i=0, len=items.length; i<len; i++) {
			item = items[i].split("|");
			item[0] = item[0].replace(/^(\s|&nbsp;)+|(\s|&nbsp;)+$/g, "");
			if (ignore_space) item[0] = item[0].replace(/(\s|&nbsp;)+/g, " ");
			word = { word : item[0], definition : item[1] };

			if (word.word.replace(/^(\s|&nbsp;)+|(\s|&nbsp;)+$/g, "") != "" && word.definition.replace(/^(\s|&nbsp;)+|(\s|&nbsp;)+$/g, "") != "") {
				x_glossary.push(word);
			}
		}
		if (x_glossary.length > 0) {
			x_glossary.sort(function(a, b){ // sort by size
				return a.word.length > b.word.length ? -1 : 1;
			});
			
			const glossaryIcon = x_btnIcons.filter(function(icon){return icon.name === 'glossary';})[0];
			$x_glossaryBtn = $('<button id="x_glossaryBtn"></button>').prependTo($x_footerL);
			
			$x_glossaryBtn
				.button({
					icons: {
						primary: glossaryIcon.iconClass
					},
					// label can now be set in editor but fall back to language file if not set
					label: x_params.glossaryLabel != undefined && x_params.glossaryLabel != "" ? x_params.glossaryLabel : x_getLangInfo(x_languageData.find("glossaryButton")[0], "label", "Glossary"),
					text:	false
				})
				.attr("aria-label", $x_glossaryBtn.attr("title") + x_params.dialogTxt)
				.click(function() {
					if (x_params.glossaryTarget == "lightbox") {

						$.featherlight($(), {
							contentFilters: 'ajax',
							ajax: x_templateLocation + 'models_html5/glossary.html',
							variant: 'lightbox' + (x_browserInfo.mobile != true ? 'Medium' : 'Auto' )
						});
						
					} else {
						x_openDialog(
							"glossary",
							x_getLangInfo(x_languageData.find("glossary")[0], "label", "Glossary"),
							x_getLangInfo(x_languageData.find("glossary").find("closeButton")[0], "description", "Close Glossary List Button"),
							null,
							null,
							function () {
								$x_glossaryBtn
									.blur()
									.removeClass("ui-state-focus")
									.removeClass("ui-state-hover");
							}
						);
					}
				});
			
			if (glossaryIcon.customised == true) {
				$x_glossaryBtn.addClass("customIconBtn");
			}
			if (glossaryIcon.btnImgs == true) {
				$x_glossaryBtn.addClass("imgIconBtn");
			}

			// Handle the closing of glossary bubble with escape key
			var $activeTooltip, escapeHandler = function(e) {
				e = e || window.event; //IE
				if ((e.keyCode ? e.keyCode : e.which) === 27) { // Escape
					$activeTooltip.trigger("mouseleave");
					e.stopPropagation();
				}
			};

			$x_pageDiv
				.on("mouseenter", ".x_glossary", function(e) {
					$activeTooltip = $(this);
					$activeTooltip.trigger("mouseleave");
					
					window.addEventListener('keydown', escapeHandler);

					var myText = $activeTooltip.text().replace(/(\s|&nbsp;)+/g, " ").trim(),
						myDefinition, i, len;

					for (i=0, len=x_glossary.length; i<len; i++) {
						if (myText.toLowerCase() == $('<div>' + x_glossary[i].word + '</div>').text().trim().toLowerCase()) {
							myDefinition = "<b>" + myText + ":</b><br/>"
							if (x_glossary[i].definition.indexOf("FileLocation + '") != -1) {
								myDefinition += "<img src=\"" + x_evalURL(x_glossary[i].definition) +"\">";
							} else {
								myDefinition += x_glossary[i].definition;
							}
						}
					}
					
					$x_glossaryHover
						.html(myDefinition)
						.css({
						"left"	:$activeTooltip.offset().left + 20,
						"top"	:$activeTooltip.offset().top + 20
					});
					
					// Queue reparsing of MathJax - fails if no network connection
					try { MathJax.Hub.Queue(["Typeset",MathJax.Hub]); } catch (e){};

					$x_glossaryHover.fadeIn("slow");
					
					if (x_browserInfo.touchScreen == true) {
						$x_mainHolder.on("click.glossary", function() {}); // needed so that mouseleave works on touch screen devices
					}
				})
				.on("mouseleave", ".x_glossary", function(e) {
					$x_mainHolder.off("click.glossary");
					$x_glossaryHover.hide();
					window.removeEventListener("keydown", escapeHandler);
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
	},
	
	// glossary page generation
	buildPage = function() {
			
		var x_glossary_temp = x_glossary.slice(0);
		x_glossary.sort(function(a, b){ // sort alphabetically
			return a.word.toLowerCase() < b.word.toLowerCase() ? -1 : 1;
		});

		var tableData = "<table class=\"glossary\">";
		for (var i=0; i<x_glossary.length; i++) {
			tableData += "<tr><td>" + x_glossary[i].word + "</td><td>" + x_glossary[i].definition + "</td></tr>";
		}
		tableData += "</table>";
		
		if ($("#glossaryItems").parents('.featherlight').length > 0) {
			tableData = '<div class="glossaryHolder" tabindex="0">' + tableData + '</div>';
		}
		
		$("#glossaryItems").append(tableData);
		
		x_pageContentsUpdated();
		
		// add class for shaded rows rather than using css selector as doesnt work for IE8 & below
		$("#glossaryItems .glossary tr:nth-child(even)").addClass("shaded");
		
		// lightbox
		if ($("#glossaryItems").parents('.featherlight').length > 0) {
			
			$('#glossaryItems').prepend('<h1 id="x_introH1">' + (x_params.glossaryLabel != undefined && x_params.glossaryLabel != "" ? x_params.glossaryLabel : x_getLangInfo(x_languageData.find("glossaryButton")[0], "label", "Glossary")) + '</h1>');
			
			$('#glossaryItems .glossaryHolder')
				.height($('.featherlight-content').height() - $('#x_introH1').outerHeight())
				.css('overflow', 'auto');
		}
	},

	insertText = function(tempText, exclude, list) {
		// check text for glossary words - if found replace with a link
		if (x_glossary.length > 0 && (exclude == undefined || (exclude == false && list.indexOf("glossary") > -1) || (exclude == true && list.indexOf("glossary") == -1))) {

			// Create a fragment and traverse the DOM tree, checking for terms in each node separately
			let fragment = document.createRange().createContextualFragment(tempText);
			let nodes = getTextNodes(fragment);
			let index = 'textContent' in document.body ? 'textContent' : 'innerText';
			for (var k=0, len=x_glossary.length; k<len; k++) {
				nodes.some(function(node) { // .some exits after true is returned - after first find unless multiple terms selected
					let term = ignore_space ? x_glossary[k].word.replace(/\s/g, '(?:\\s|&nbsp;)+') : x_glossary[k].word;
					let regExp = new RegExp('\\b(' + term + ')\\b', multiple_terms ? 'ig' : 'i');
					let found = regExp.test(node[index]);

					node[index] = node[index].replace(regExp, '{|{'+k+'::$1}|}');
					return found && !multiple_terms;
				});
			}
			// Need to treat single text node differently but rebuild from fragmant OLD WAY
			//let arr = Array.prototype.slice.call(fragment.childNodes);
			//tempText = arr.length === 1 && nodes.length > 0 ? nodes[0].textContent : [].map.call(fragment.childNodes, x => x.nodeType === x.TEXT_NODE ? x.textContent : x.outerHTML).join('');

			// Instead we'll just let the DOM do the heavy lifting
			let div = document.createElement("div");
			div.appendChild(fragment);
			tempText = div.innerHTML;
			$(div).remove();

			// Replace all our tokens with the glossary tag
			for (var k=0, len=x_glossary.length; k<len; k++) {
				let regExp = new RegExp('{\\|{' + k + '::(.*?)}\\|}', 'ig');
				tempText = tempText.replace(regExp, '<span class="x_glossary" aria-describedby="x_glossaryHover" tabindex="0" role="link">$1</span>');
			}
		}

		return tempText;
	},
		
	getTextNodes = function (fragment) {
		let textNodes = [];
		(function recurse(node) {

		  if (node = node.firstChild)
			  while (node != null) {
				  if (node.nodeType === Node.TEXT_NODE) {
						if (node && node.parentNode && node.parentNode.nodeName !== "A") textNodes.push(node);
				  }
				  else if (node.nodeType === Node.ELEMENT_NODE) recurse(node);
				  node = node.nextSibling;
			  }
		})(fragment);
		return textNodes;
	},
	
	touchStartHandler = function() {
		$x_mainHolder.off("click.glossary");
		if ($x_glossaryHover != undefined) {
			$x_glossaryHover.hide();
		}
	};
		
	// make some public methods
	self.init = init;
    self.buildPage = buildPage;
	self.insertText = insertText;
	self.getTextNodes = getTextNodes;
	self.touchStartHandler = touchStartHandler;

return parent; })(jQuery, XENITH || {});



// _____ GLOBAL VARIABLES _____
// allows surfacing of any global variables

var XENITH = (function ($, parent) { var self = parent.GLOBALVARS = {};

	var	replaceGlobalVars = function (tempText) {
		var matches = tempText.match(/\{(.*?)\}/g);
		if (matches != null) {
			for (var m=0; m<matches.length; m++) {
				try {
					tempText = tempText.replace(matches[m], '<span class="x_globalVar">' + eval(matches[m]) + '</span>');
				} catch (e){}
			}
		}
		return tempText;
	};

	// make some public methods
	self.replaceGlobalVars = replaceGlobalVars;

return parent; })(jQuery, XENITH || {});


// ***** TABLE OF CONTENTS MENU *****
// TOC might be shown in:
// 	- menu page (when navigation set to menu or menu with page controls)
//  - dialog (when navigation not set to menu)
//  - lightbox (when navigation not set to menu and TOC opt property used to change to 'open in' lightbox)
//  - sidebar (when sidebar opt property is used and 'display' is set to 'table of contents')
var XENITH = (function ($, parent) { var self = parent.PAGEMENU = {};
	// declare global variables
	let menuPage = false // is the 1st page a menu page?

	// Declare local variables
	let $menuHolder;
	let $menuItems;
	let pageNumOffset = 0;

	// function does some set up required before TOC will be built later
	function init(type) {
		if (type == "page") {
			// add info about menu page to page arrays (if navigation setting means a menu page exists)
			x_pages.splice(0, 0, "menu");
			x_pageInfo.splice(0, 0, {type: 'menu', built: false, viewed:false});

			// adjust normal page indexes to take into account menu page
			for (var i=0; i<x_normalPages.length; i++) {
				x_normalPages.splice(i, 1, x_normalPages[i]+1);
			}
			x_normalPages.splice(0, 0, 0);

			pageNumOffset = 1;
			XENITH.PAGEMENU.menuPage = true;

		} else {
			// prepare for TOC to be shown in dialog
			x_dialogInfo.push({type: 'menu', built: false});
		}
	}

	// function builds the TOC page menu
	function build($parent) {
		$menuHolder = $('<div id="menuHolder"></div>').appendTo($parent);
		$menuItems = $('<fieldset id="menuItems"></fieldset>').appendTo($menuHolder);
		const $menuItem = $('<button class="menuItem"/>');
		const $chapterItem = $('<h2 class="chapterItem"/>');
		let $menuItemHolder = $menuItems;
		let $currentChapter;
		let chapterNum;
		let tocNum = 0;
		let subNum = 0;

		// tick to show page / chapter has been viewed can be placed before or after the page title
		const tickHtml = '<i class="viewTick fa fa-x-tick-circle notvisited" aria-hidden="true" aria-label="' + x_getLangInfo(x_languageData.find("viewed")[0], "label", "Viewed") + '"></i>';
		let tickBefore = x_params.pageTick !== "false" && x_params.pageTickPostion == "before" ? tickHtml + " " : "";
		let tickAfter = x_params.pageTick !== "false" && x_params.pageTickPostion !== "before" ? " " + tickHtml : "";

		// create all the page buttons
		// when pages are in chapters they will be shown in a collapsible chapter accordion
		for (let i=0; i<x_normalPages.length-pageNumOffset; i++) {
			// is this page in a chapter? - if it's the first page in the chapter, make a chapter holder all pages within chapter will be collapsible within it
			if (x_pages[x_normalPages[i+pageNumOffset]].getAttribute("chapterIndex") != undefined) {
				if (chapterNum != x_pages[x_normalPages[i+pageNumOffset]].getAttribute("chapterIndex")) {
					chapterNum = x_pages[x_normalPages[i+pageNumOffset]].getAttribute("chapterIndex");
					$menuItemHolder = $('<div class="chapterHolder"/>').appendTo($menuItems);

					$currentChapter = $chapterItem.clone().appendTo($menuItemHolder);

					let pageNum = "";
					if (x_params.tocChapterNumbers == "true") {
						tocNum++;
						subNum = 0;
						pageNum = tocNum + " ";
					}
					$currentChapter.html('<a href="#">' + tickBefore + pageNum + x_chapters[chapterNum].name + tickAfter + '</a>');

					$menuItemHolder = $('<div class="chapterPageHolder"/>').appendTo($menuItemHolder);
				}
			} else {
				$menuItemHolder = $menuItems;
			}

			const $thisItem = $menuItem.clone().appendTo($menuItemHolder);

			let pageNum = "";
			if (x_params.tocNumbers != "false") {
				if (x_params.tocChapterNumbers == "true" && $menuItemHolder.hasClass("chapterPageHolder")) {
					subNum++;
					pageNum = tocNum + "." + subNum + " ";
				} else {
					tocNum++;
					pageNum = tocNum + " ";
				}
			}
			$thisItem.data("pageIndex", i);
			$thisItem.html(tickBefore + pageNum + x_pages[x_normalPages[i+pageNumOffset]].getAttribute("name") + tickAfter);
		}

		if (x_params.pageTickPostion == "before") {
			$menuHolder.find(".viewTick").addClass("beforeText");
		}

		// initiate the chapter accordions
		if ($menuItems.find(".chapterHolder").length > 0) {
			$menuItems.find(".chapterHolder").accordion({
				icons: {
					header: "fa fa-x-acc-hide",
					activeHeader: "fa fa-x-acc-show"
				},
				collapsible: true,
				active: false,
				heightStyle: "content"
			});
		}

		$("#menuItems .menuItem")
			.button()
			.click(function() {
				// change page on button click
				$this = $(this);
				$this.removeClass("ui-state-focus");
				$this.removeClass("ui-state-hover");
				x_changePage(x_normalPages[$this.data("pageIndex") + pageNumOffset]);

				// close lightbox
				if ($('#menuHolder').parents('.featherlight').length > 0) {
					$.featherlight.current().close();
				}
			});

		// 1st page is menu page so this is being loaded from a page model
		if (XENITH.PAGEMENU.menuPage === true) {
			// calls function in menu page model to finish set up of menu page
			// there are extra things that might need to be added to page which aren't required when TOC is in lightbox, dialog or sidebar
			menu.setUpMenuPage();

		} else { // menu is in dialog or lightbox
			// lightbox
			if ($('#menuHolder').parents('.featherlight').length > 0) {
				$('#menuHolder').prepend('<h1 id="x_introH1">' + (x_params.tocLabel != undefined && x_params.tocLabel != "" ? x_params.tocLabel : x_getLangInfo(x_languageData.find("toc")[0], "label", "Table of Contents")) + '</h1>');
				$menuItems.height($('#tocMenuLightBox').height() - $("#x_introH1").outerHeight());
			}
		}

		XENITH.PAGEMENU.tickViewed();

		if (XENITH.PAGEMENU.menuPage === false) {
			XENITH.PAGEMENU.showCurrent();
		}
	}

	function buildDialog() {
		x_openDialog(
			"menu",
			x_params.tocLabel != undefined && x_params.tocLabel != "" ? x_params.tocLabel : x_getLangInfo(x_languageData.find("toc")[0], "label", "Table of Contents"),
			x_getLangInfo(x_languageData.find("toc").find("closeButton")[0], "description", "Close Table of Contents"),
			null,
			'<div id="tocMenuDialog"></div>',
			function () {
				$x_menuBtn
					.blur()
					.removeClass("ui-state-focus")
					.removeClass("ui-state-hover");
			}
		);
	}

	// function highlights the current page in the TOC
	// not called when the TOC is shown on a menu page
	function showCurrent() {
		$menuItems.find(".current").removeClass("current");
		const $currentItem = $menuItems.find(".menuItem:eq(" + x_normalPages.indexOf(x_currentPage) + ")");

		// expand the chapter accordion if the current page is in a chapter
		const $thisChapter = $currentItem.parents(".chapterHolder ");
		if ($thisChapter.length > 0) {
			// if the TOC is shown in dialog or lightbox, we don't want the chapter accordion animation to be shown
			if (XENITH.SIDEBAR.sideBarType !== "toc" || x_firstLoad) {
				$thisChapter.accordion({"animate": 0});
			}

			$thisChapter.accordion({"active": 0}).find(".chapterItem").addClass("current");

			// if the TOC is shown in dialog or lightbox, reset the chapter accordion animation so it will work if chapter manually opened / closed
			if (XENITH.SIDEBAR.sideBarType !== "toc" || x_firstLoad) {
				$thisChapter.accordion({"animate": {}});
			}
		}

		// close all other chapters
		const allChapters = $menuItems.find(".chapterHolder");
		allChapters.each(function () {
			if ($thisChapter.length === 0 || !$thisChapter.is($(this))) {
				// if the TOC is shown in dialog or lightbox, we don't want the chapter accordion animation to be shown
				if (XENITH.SIDEBAR.sideBarType !== "toc") {
					$(this).accordion({"animate": 0});
				}

				$(this).accordion({"active": false});

				// if the TOC is shown in dialog or lightbox, reset the chapter accordion animation so it will work if chapter manually opened / closed
				if (XENITH.SIDEBAR.sideBarType !== "toc") {
					$(this).accordion({"animate": {}});
				}
			}
		});

		$currentItem.addClass("current");

		// focus on current page button & this will also ensure it's scrolled into view
		if (XENITH.SIDEBAR.sideBarType !== "toc") {
			$currentItem.focus();
		}
	}

	// function checks the viewed pages in the TOC
	function tickViewed() {
		if (x_params.pageTick !== "false") {
			// tick all pages which have been viewed
			$menuItems.find(".menuItem").each(function(i) {
				const tempIndex = x_normalPages[i + pageNumOffset];
				if (x_pageInfo[tempIndex].viewed) $(this).find('i').removeClass('notvisited').attr("aria-hidden", "false");
			});

			// tick all chapters that don't contain any unviewed pages
			$menuItems.find(".chapterHolder").each(function(i) {
				if ($(this).find(".menuItem .notvisited").length == 0) {
					$(this).find('.chapterItem i').removeClass('notvisited').attr("aria-hidden", "false");
				}
			});
		}
	}

	// function returns whether current page is a menu page
	function isThisMenu() {
		return x_currentPage == 0 && XENITH.PAGEMENU.menuPage === true;
	}

	// make some public methods
	self.menuPage = menuPage;
	self.init = init;
	self.build = build;
	self.buildDialog = buildDialog;
	self.showCurrent = showCurrent;
	self.tickViewed = tickViewed;
	self.isThisMenu = isThisMenu;

	return parent;

})(jQuery, XENITH || {});


// ***** SIDE BAR *****
// Side bar can contain the table of contents or the interface buttons (normally on footer bar)
var XENITH = (function ($, parent) { var self = parent.SIDEBAR = {};
	// declare global variables
	let sideBarType; // what should the sidebar contain? (toc or btns)

	// declare local variables
	let sideBar = false; // should a sidebar be built?
	const x_sideBarBtns = [];
	const sidebarBtnIcons = [
		{name: 'sideBarHideLeft',	defaultIconClass:'fa fa-angle-double-left',			custom: 'sideBarBtnIcons',	defaultFA: 'fas fa-angle-double-left'},		// side bar hide (bar on left)
		{name: 'sideBarHideRight',	defaultIconClass:'fa fa-angle-double-right',		custom: 'sideBarBtnIcons',	defaultFA: 'fas fa-angle-double-right'},	// side bar hide (bar on right)
		{name: 'sideBarShowLeft',	defaultIconClass:'fa fa-angle-double-right',		custom: 'sideBarBtnIcons',	defaultFA: 'fas fa-angle-double-right'},	// side bar show (bar on left)
		{name: 'sideBarShowRight',	defaultIconClass:'fa fa-angle-double-left',			custom: 'sideBarBtnIcons',	defaultFA: 'fas fa-angle-double-left'}		// side bar show (bar on right)
	];
	let $x_sideBar;
	let $x_sideBarHolder;
	let $x_sideBarToggleBtn;
	let openIcon, openLabel, closeIcon, closeLabel;
	const minW = 30, borderW = 1;
	let maxW = 100;
	const absoluteMaxW = 300; // the max width of the sidebar when not shown as overlay (on smaller mobile devices) - this is also checked to ensure it's not > 50% of whole screen
	let overlay;

	// determines whether a sidebar will be built and what it will contain
	function init() {
		if (x_params.sideBar == 'true') {
			if (x_params.sideBarTocList == "true") {
				// sidebar containing TOC will be built if more than one page
				if (x_normalPages.length > 1) {
					sideBar = true;
					XENITH.SIDEBAR.sideBarType = "toc";

					x_params.tocTarget = "sidebar";
					if (x_params.navigation == "Menu" || x_params.navigation == "Menu with Page Controls") {
						x_params.navigation = "Linear";
					}

					// remove the menu button from footer bar unless navigation type is historic (then the menu buttons acts as a home button which returns you to 1st page)
					if (x_params.navigation != "Historic") {
						$("#x_menuBtn").remove();
					}
				}
			} else {
				// work out what buttons will show on side bar
				// project level buttons
				if (x_params.sbToC == 'true') {
					x_sideBarBtns.push('toc');
				}
				if (x_params.sbProjectIntro == 'true' && x_params.intro != undefined && $.trim(x_params.intro) != '') {
					x_sideBarBtns.push('intro');
				}
				if (x_params.sbProjectHelp == 'true' && x_params.nfo != undefined && $.trim(x_params.nfo) != '') {
					x_sideBarBtns.push('help');
				}
				if (x_params.sbGlossary == 'true' && x_params.glossary != undefined) {
					x_sideBarBtns.push('glossary');
				}
				if (x_params.sbAccessibility == 'true' && !XENITH.ACCESSIBILITY.hidden) {
					x_sideBarBtns.push('accessibility');
				}

				// page level buttons (what the button does will change on each page)

				// does at least one page in project have some page info added?
				if (x_params.sbPageIntro == 'true') {
					for (let i=0; i<x_pages.length; i++) {
						if (x_pageInfo[i].type != "menu") {
							if (x_params.sbPageIntro == 'true' && (
								(x_pages[i].getAttribute('introType') == 'text' && $.trim(x_pages[i].getAttribute('pageIntro')) != '') ||
								(x_pages[i].getAttribute('introType') == 'image' && $.trim(x_pages[i].getAttribute('introImg')) != '') ||
								(x_pages[i].getAttribute('introType') == 'video' && $.trim(x_pages[i].getAttribute('introVideo')) != '') ||
								(x_pages[i].getAttribute('introType') == 'url' && $.trim(x_pages[i].getAttribute('introURL')) != '') ||
								(x_pages[i].getAttribute('introType') == 'file' && $.trim(x_pages[i].getAttribute('introFile')) != '')
							)) {
								x_sideBarBtns.push('pageIntro');
								break;
							}
						}
					}
				}

				// does at least one page in project have some page resources added?
				if (x_params.sbPageResources == 'true') {
					for (let i=0; i<x_pages.length; i++) {
						if (x_pageInfo[i].type != "menu" && x_pages[i].getAttribute("resources") != undefined) {
							x_sideBarBtns.push('resource');
							break;
						}
					}
				}

				// sidebar containing interface buttons will be built if more than one button
				if (x_sideBarBtns.length > 0) {
					sideBar = true;
					XENITH.SIDEBAR.sideBarType = "btns";
				}
			}
		}

		if (sideBar === true) {
			// force full screen mode
			if (x_params.displayMode != 'full screen' && x_params.displayMode != 'fill window') {
				x_params.displayMode = 'full screen';
			}
			if (x_params.fixDisplay != undefined) {
				x_params.fixDisplay = undefined;
			}

			// extend the x_btnIcons array to add all the sidebar specific buttons
			x_btnIcons =  x_btnIcons.concat(sidebarBtnIcons);

			// full screen sidebar overlay is used when viewed on smaller screens
			overlay = x_browserInfo.mobile && (XENITH.SIDEBAR.sideBarType == "toc" || (x_params.sideBarSize == 'small' && x_params.sideBarBtnTxt == 'true') || x_params.sideBarSize == 'large') ? true : false;
		}
	}

	// build the sidebar if needed
	function build() {
		if (sideBar === true) {
			// if this is a standalone page opening in a light box, don't show the side bar (this can't be in init function as it can't be established when that is called whether it is or not)
			if (x_pageInfo[x_startPage.ID] != undefined && x_pageInfo[x_startPage.ID].standalone) {
				sideBar = false;
			} else {
				// build the sidebar
				$x_sideBar = $('<div id="x_sideBar"></div>');
				$x_sideBarHolder = $('<div id="' + (XENITH.SIDEBAR.sideBarType == "toc" ? "x_sideBarTocHolder" : "x_sideBarBtnHolder" ) + '"></div>').appendTo($x_sideBar);

				// the width of the sidebar depends on the sidebar contents
				if (x_params.sideBarSize == 'large' || XENITH.SIDEBAR.sideBarType == "toc") {
					$x_sideBar.addClass('sideBarLarge');
				} else {
					$x_sideBar.addClass('sideBarSmall');

					if (x_params.sideBarBtnTxt != 'true') {
						// small sidebar buttons with no text - only need a narrow sidebar
						maxW = 60;
					}
				}

				// sidebar can be on right or left of the screen
				if (x_params.sideBarPosition == 'right') {
					$x_sideBar.insertAfter($x_mainHolder);
					$x_body.addClass('sb_right');
				} else {
					$x_sideBar.insertBefore($x_mainHolder);
					$x_body.addClass('sb_left');
				}

				// sidebar toggle button can be on the top or the side of the sidebar
				if (x_params.sideBarBtnPosition === "side") {
					if (x_params.sideBarPosition == 'right') {
						$x_sideBarToggleBtn = $('<button id="x_sideBarToggleBtn"></button>').prependTo($x_sideBar);
					} else {
						$x_sideBarToggleBtn = $('<button id="x_sideBarToggleBtn"></button>').appendTo($x_sideBar);
					}
					$x_sideBar.addClass("toggleSide");
				} else {
					$x_sideBarToggleBtn = $('<button id="x_sideBarToggleBtn"></button>').prependTo($x_sideBar);
				}

				$x_sideBar.css("visibility", "hidden");

				// sidebar open / close state
				$x_sideBar.data('state', "open");

				// set up the expand / collapse button at the top (or side) of the sidebar
				// button labels can be set in editor but fall back to language file if not set
				closeLabel = x_params.sideBarHideLabel != undefined && x_params.sideBarHideLabel != "" ? x_params.sideBarHideLabel : x_getLangInfo(x_languageData.find("sideBar")[0], "hide", "Hide side bar");
				openLabel = x_params.sideBarShowLabel != undefined && x_params.sideBarShowLabel != "" ? x_params.sideBarShowLabel : x_getLangInfo(x_languageData.find("sideBar")[0], "show", "Show side bar");
				const closeR = x_btnIcons.filter(function (icon) {return icon.name === 'sideBarHideRight';})[0];
				const closeL = x_btnIcons.filter(function (icon) {return icon.name === 'sideBarHideLeft';})[0];
				const showR = x_btnIcons.filter(function (icon) {return icon.name === 'sideBarShowRight';})[0];
				const showL = x_btnIcons.filter(function (icon) {return icon.name === 'sideBarShowLeft';})[0];
				let customisedIcon = false;

				if (x_params.sideBarPosition === 'right') {
					closeIcon = closeR.iconClass;
					openIcon = showR.iconClass;
					if (closeR.customised === true || showR.customised === true) {
						customisedIcon = true;
					}
				} else {
					closeIcon = closeL.iconClass;
					openIcon = showL.iconClass;
					if (closeL.customised === true || showL.customised === true) {
						customisedIcon = true;
					}
				}

				$x_sideBarToggleBtn
					.button({
						icons: {primary: x_params.sideBarShow == 'closed' ? openIcon : closeIcon},
						label: x_params.sideBarShow == 'closed' ? openLabel : closeLabel,
						text: false
					})
					.click(function () {
						if ($x_sideBar.data('state') == 'open') {
							XENITH.SIDEBAR.close();
						} else {
							open();
						}
					});

				if (customisedIcon === true) {
					$x_sideBarToggleBtn.addClass("customIconBtn");
				}

				// add a logo to the top of the side bar, unless the interface buttons are small with no text (not enough space)
				if (sideBarType == "toc" || (x_params.sideBarSize == 'large' || x_params.sideBarBtnTxt == 'true')) {
					if (x_params.sideBarLogo !== undefined && x_params.sideBarLogo !== "") {
						$x_sideBarHolder.prepend('<div id="x_sideBarLogo"><img src="' + x_params.sideBarLogo + '" alt="' + (x_params.sideBarTip !== undefined && x_params.sideBarTip !== "" ? x_params.sideBarTip : '') + '"></div>');
					} else if (x_sideBarLogo !== "") {
						$x_sideBarHolder.prepend('<div id="x_sideBarLogo"><img src="' + x_sideBarLogo + '" alt="' + (x_params.sideBarTip !== undefined && x_params.sideBarTip !== "" ? x_params.sideBarTip : '') + '"></div>');
					}
				}

				// add content to sidebar
				if (XENITH.SIDEBAR.sideBarType == "btns") {
					// add interface buttons
					const btnTxt = x_params.sideBarBtnTxt == 'true' ? true : false;

					if ($.inArray('toc', x_sideBarBtns) != -1) {
						$x_menuBtn
							.appendTo($x_sideBarHolder)
							.button({text: btnTxt});
					}
					if ($.inArray('intro', x_sideBarBtns) != -1) {
						$x_introBtn
							.appendTo($x_sideBarHolder)
							.button({text: btnTxt});
					}
					if ($.inArray('help', x_sideBarBtns) != -1) {
						$x_helpBtn
							.appendTo($x_sideBarHolder)
							.button({text: btnTxt});
					}
					if ($.inArray('glossary', x_sideBarBtns) != -1) {
						$x_glossaryBtn
							.appendTo($x_sideBarHolder)
							.button({text: btnTxt});
					}
					if ($.inArray('accessibility', x_sideBarBtns) != -1) {
						$x_colourChangerBtn
							.appendTo($x_sideBarHolder)
							.button({text: btnTxt});
					}
					if ($.inArray('pageIntro', x_sideBarBtns) != -1) {
						$x_pageIntroBtn
							.appendTo($x_sideBarHolder)
							.button({text: btnTxt});
					}
					if ($.inArray('resource', x_sideBarBtns) != -1) {
						$x_pageResourcesBtn
							.appendTo($x_sideBarHolder)
							.button({text: btnTxt});
					}

					XENITH.SIDEBAR.setWidth();

					// add table of contents
				} else {
					XENITH.PAGEMENU.build($x_sideBarHolder);
					XENITH.SIDEBAR.setWidth();
				}

				sideBarHolderFixDimensions();

				// collapse the sidebar when project first loads
				if (x_params.sideBarShow == 'closed' || x_browserInfo.mobile == true) {
					XENITH.SIDEBAR.close(true);
				}
			}
		}
	}

	// function shows the sidebar after the interface has finished being set up - hidden until then to avoid flashes on loading content
	function show() {
		if (sideBar === true) {
			$x_sideBar.css("visibility", "visible");
		}
	}

	// fix the dimensions of the sideBarHolder so it will scroll if needed (height) & so contents doesn't move around when animating open / closed (width)
	function sideBarHolderFixDimensions() {
		$x_sideBarHolder
			.height($x_window.height() - (x_params.sideBarBtnPosition === "side" ? 0 : $x_sideBarToggleBtn.outerHeight(true)) - ($x_sideBarHolder.outerHeight(true) - $x_sideBarHolder.height()))
			.width($x_sideBarHolder.width());
	}

	// this sets the initial open max width of sidebar & makes sure that it's still appropriate after resize of screen
	function setWidth(resize) {
		// only set the width of the sidebar if it's currently open
		if ($x_sideBar.data('state') == 'open') {

			// screen has been resized - remove fixed widths so ideal button widths can be recalculated
			if (resize) {
				$x_sideBar.width("auto");
				$x_sideBarHolder.width("auto");
			}

			if ((x_params.sideBarSize == 'small' && x_params.sideBarBtnTxt == 'true') || XENITH.SIDEBAR.sideBarType == "toc") {
				let widestBtn = 0;

				$x_sideBarHolder.find('button').each(function () {
					const visible = $(this).is(":visible");
					if (!visible) {
						$(this).parents(".chapterPageHolder").show();
					}
					widestBtn = Math.max(widestBtn, Math.ceil($(this).outerWidth()));
					if (!visible) {
						$(this).parents(".chapterPageHolder").hide();
					}
				});

				maxW = Math.min(widestBtn + ($x_sideBarHolder.outerWidth(true) - $x_sideBarHolder.width()) + (x_params.sideBarBtnPosition === "side" ? $x_sideBarToggleBtn.outerWidth(true) : 0) + 5, Math.min(absoluteMaxW, $x_window.width() / 2));
			}

			if (overlay) {
				// side bar fills screen when open on smaller screens
				maxW = '100%';
				$x_sideBar.width(maxW);
				XENITH.SIDEBAR.resize(maxW);
			} else {
				const tempW = maxW + ($x_sideBarHolder.outerWidth() - $x_sideBarHolder.width()) + (XENITH.SIDEBAR.sideBarType == "btns" ? $x_sideBarHolder.find("button").outerWidth() - $x_sideBarHolder.find("button").width() : 0);

				$x_sideBar.width(tempW + 'px');
				XENITH.SIDEBAR.resize(tempW);

				// the text may overlap sidebar - make sure sidebar expands but without text forced to be on a single line
				if ((x_params.sideBarBtnTxt == 'true' && x_params.sideBarSize == 'large') || XENITH.SIDEBAR.sideBarType == "toc") {
					let widestBtn = 0;
					$x_sideBarHolder.find('button').each(function () {
						widestBtn = Math.max(widestBtn, $(this).outerWidth());
					});

					if ($x_sideBarHolder.width() < widestBtn) {
						$x_sideBar.width('min-content');
						maxW = Math.min(Math.min(absoluteMaxW, $x_window.width() / 2), $x_sideBar.width());
						const tempW = maxW + ($x_sideBarHolder.outerWidth() - $x_sideBarHolder.width()) + (XENITH.SIDEBAR.sideBarType == "btns" ? $x_sideBarHolder.find("button").outerWidth() - $x_sideBarHolder.find("button").width() : 0);
						XENITH.SIDEBAR.resize(tempW);
					}
				}
			}

			if (resize) {
				// resizing complete - re-fix the sidebar dimensions again
				sideBarHolderFixDimensions();
			}

		} else if (resize) {
			XENITH.SIDEBAR.resize();
		}
	}

	// function finds an interface button in the sidebar button array and returns the index of it
	function btnIndex(name) {
		return $.inArray(name, x_sideBarBtns);
	}

	// expand the side bar
	function open() {
		if ($x_sideBar.data('state') == 'closed') {
			$x_sideBar.data('state', 'open');
			const tempW = maxW + (!overlay ? ($x_sideBarHolder.outerWidth() - $x_sideBarHolder.width()) + (XENITH.SIDEBAR.sideBarType == "btns" ? $x_sideBarHolder.find("button").outerWidth() - $x_sideBarHolder.find("button").width() : 0) : "");
			XENITH.SIDEBAR.resize(tempW, true, function () {
				if (!overlay) {
					XENITH.SIDEBAR.setWidth(true);
					x_updateCss(true, false);
				}
			});

			$x_sideBarToggleBtn.button({icons: {primary: closeIcon}, label: closeLabel, text: false});

			$x_sideBarHolder.show();
		}
	}

	// collapse the side bar
	function close(firstLoad) {
		if (sideBar === true) {
			if ($x_sideBar.data('state') == 'open') {
				$x_sideBar.data('state', 'closed');

				XENITH.SIDEBAR.resize(minW, (firstLoad == true ? false : true), function () {
					$x_sideBarHolder.hide();
					if (!overlay) {
						x_updateCss(true, false);
					}
				});

				$x_sideBarToggleBtn.button({icons: {primary: openIcon}, label: openLabel, text: false});
			}
		}
	}

	// resize the sidebar & main content areas
	function resize(width, animate, callback) {
		if (sideBar === true) {
			width = width == undefined ? $x_sideBar.width() : width;

			if (animate === true) {
				if (overlay === false) {
					$x_sideBar.animate({width: width});
					$x_headerBlock.add($x_pageHolder).add($x_footerBlock).add($x_background)
						.animate({'width': $x_body.width() - width + borderW});

					$x_mainHolder
						.animate({['padding-' + x_params.sideBarPosition]: (width - borderW) + 'px'}, callback);

				} else {
					// the sidebar is overlaying the whole screen so don't change the size used for the main content
					$x_sideBar.animate({width: width}, callback);
				}

			} else {
				// no animation - either because project has only just loaded or project has been resized
				$x_sideBar.width(width);

				$x_headerBlock.add($x_pageHolder).add($x_footerBlock).add($x_background)
					.width($x_body.width() - (width == "100%" ? minW : width) + borderW);

				$x_mainHolder.css('padding-' + x_params.sideBarPosition, ((width == "100%" ? minW : width) - borderW) + 'px');

				if (callback != undefined ) {
					callback();
				}
			}
		}
	}

	// function called when page loads - triggers highlight of current page in TOC & ticks page if it's a newly viewed page
	function pageLoad(firstView) {
		if (sideBar === true && XENITH.SIDEBAR.sideBarType == "toc") {
			XENITH.PAGEMENU.showCurrent();

			if (firstView === true) {
				XENITH.PAGEMENU.tickViewed();
			}
		}
	}

	// make some public methods
	self.sideBarType = sideBarType;
	self.init = init;
	self.build = build;
	self.show = show;
	self.btnIndex = btnIndex;
	self.close = close;
	self.resize = resize;
	self.setWidth = setWidth;
	self.pageLoad = pageLoad;

	return parent;

})(jQuery, XENITH || {});


// ***** PROGRESS BAR *****
// Progress bar might be shown on:
// - Footer bar (originally used progressBar in xwd but now is an option on new progressBarType - both will still work but progressBar deprecated so can no longer be added)
// - Header bar (an option in progressBarType - can be above, below or between titles)
// When in header bar, progress markers can be used to indicate pages, chapters or milestones
// Milestone is an optional property that can be added to individual pages
var XENITH = (function ($, parent) { var self = parent.PROGRESSBAR = {};
	// declare local variables
	let progressBar = false;
	let progressBarPosition = "footer";
	let progressBarPercentage;
	let progressSub = false;
	let progressBarSpacing;
	let pageDetails;
	let totalPages;

	// used when progress markers represent the ends of chapters/milestones
	let chapters;
	let chaptersCopy; // used to keep track of which pages are still to be viewed (viewed pages are removed from each chapter)
	let extraPages; // pages outside of chapters
	let milestones;
	let completeTxt;
	let incompleteTxt;

	let $pbHolder;
	let $pbContainer;
	let $pbBar;
	let $pbTxt;

	// determines whether a progress bar is needed and where it will be built
	function init() {
		// don't create a progress bar for standalone pages opening in a lightbox
		if (!x_pageInfo[x_startPage.ID].standalone || x_pages[x_startPage.ID].getAttribute('linkTarget') == "same") {

			if (((x_params.progressBar != undefined && x_params.progressBar != "") || x_params.progressBarType == 'true') && x_params.hideFooter != "true") {
				// add optional progress bar to the footer bar
				// x_params.progressBar is deprecated but will still work for older projects that still use this
				progressBar = true;
				progressBarPosition = "footer";

			} else if ((x_params.progressBarType == 'header1' || x_params.progressBarType == 'header2' || x_params.progressBarType == 'header3') && x_params.hideHeader != "true") {
				// add progress bar to the header bar
				progressBar = true;
				progressBarPosition = x_params.progressBarType;

				if (x_params.progressSub != "false") {
					// additional options are only available when progress bar is in header bar as there is more space available
					progressSub = x_params.progressSub; // pages|chapters|milestones
					progressBarSpacing = x_params.progressBarSpacing; // true = spaced evenly, false = space according to no. pages (only for chapters|milestones)
				}
			}

			if (progressBar === true) {
				// is the progress bar shown alongside some % text?
				if (x_params.progressBarPercentage === "false") {
					progressBarPercentage = false;
				} else {
					if (x_params.progressBarTxt !== undefined && x_params.progressBarTxt !== "") {
						progressBarPercentage = x_params.progressBarTxt;
					} else {
						progressBarPercentage = "{x}% " + x_getLangInfo(x_languageData.find("progressBar")[0], "label", "COMPLETE");
					}
				}

				// work out total no. pages from which progress % will be determined
				if (progressSub != false) {
					// standalone pages are always excluded when progress markers are used
					pageDetails = $(x_pageInfo).filter(function (i) {
						return this.type !== "menu" && this.standalone !== true;
					});
				} else {
					// by default stand-alone pages are excluded from being included in progress - this can be overridden with optional property
					pageDetails = $(x_pageInfo).filter(function (i) {
						return this.type !== "menu" && (this.standalone !== true || x_pages[i].getAttribute('reqProgress') === 'true');
					});
				}
				totalPages = pageDetails.length;

				XENITH.PROGRESSBAR.build();
			}
		}
	}

	// build the progress bar
	function build() {
		if (progressBarPosition == "footer") {
			$pbHolder = $('<div id="x_footerProgress"></div>').appendTo('#x_footerBlock');

			if (x_params.progressBar == "pBarNoCounter") {
				// remove page counter
				// this is only done in old projects where progress bar must be on footer as in newer projects this is unrelated to progress bar settings and is done elsewhere with x_params.pageCounter
				$x_pageNo.remove();
			}

		} else {
			$pbHolder = $('<div id="x_headerProgress">');

			if (progressBarPosition == "header1") {
				$pbHolder.insertAfter($x_headerBlock.find(".x_icon"));
				$x_headerBlock.addClass('pbAbove');
			} else if (progressBarPosition == "header2") {
				$pbHolder.appendTo($x_headerBlock);
				$x_headerBlock.addClass('pbBelow');
			} else {
				$pbHolder.insertAfter($x_headerBlock.find("h1"));
				$x_headerBlock.addClass('pbBetween');
			}
		}

		// add the x% COMPLETE text holder to the progress bar
		let leftOffset = 10;
		if (progressBarPercentage !== false) {
			$pbTxt = $('<div class="pbTxt">' + progressBarPercentage.replace("{x}", 100) + '</div>');

			if (progressBarPosition == "footer") {
				$pbTxt.appendTo($pbHolder);
			} else {
				$pbTxt.prependTo($pbHolder);
			}

			// on smaller screens the % text goes above the progress bar - on larger screens the text is next to the progress bar
			if (progressBarPosition != "footer") {
				if (x_browserInfo.mobile !== true) {
					$pbTxt.css({"width": $pbTxt.width() + parseInt($pbTxt.css("padding-left"))});
					$pbTxt.css({"margin-left": -$pbTxt.outerWidth(true)});
				}

				leftOffset = x_browserInfo.mobile !== true ? $pbTxt.outerWidth() : leftOffset;
			}
		}

		// on smaller screens the % text goes above the progress bar - on larger screens the text is next to the progress bar
		if (progressBarPosition != "footer") {
			// left logo
			if ($("#x_headerBlock .x_floatLeft.x_icon:visible").length > 0) {
				$pbHolder.css("padding-left", leftOffset + Math.round($("#x_headerBlock .x_floatLeft.x_icon").outerWidth()));
			} else {
				$pbHolder.css("padding-left", leftOffset);
			}

			// right logo
			if ($("#x_headerBlock .x_floatRight.x_icon:visible").length > 0) {
				$pbHolder.css("padding-right", Math.round($("#x_headerBlock .x_floatRight.x_icon").width()) + 10);
			}
		}

		$pbContainer = $('<div class="pbContainer"></div>');
		$pbBar = $('<div class="pbPercent pbBar">&nbsp;</div>');

		if (progressBarPosition == "footer") {
			$pbContainer.prependTo($pbHolder);
		} else {
			$pbContainer.appendTo($pbHolder);
		}

		const $pbBarContainer = $('<div class="pbBarContainer"/>');
		const $pbMarkerContainer = $('<div class="pbMarkerContainer"/>');

		if (progressBarPosition != "footer" && progressSub != false) {
			// add progress markers to the progress bar
			// these can indicate pages, chapters or milestones

			$pbBarContainer.appendTo($pbContainer);
			$pbMarkerContainer.appendTo($pbContainer);

			// progress markers will be button elements if clickable & div elements if not clickable
			const progressMarkerElement = progressSub !== false && x_params.progressBarSubLink !== "false" ? "button" : "div";

			if (progressSub == "pages") {
				// add a progress marker to indicate each page
				// these will always be evenly spaced

				for (let i=0; i<totalPages; i++) {
					$pbBar.clone().addClass("sub").appendTo($pbBarContainer)
						.css("left", (i-1)/(totalPages-1)*100 +  "%")
						.width(100 / (totalPages-1) + "%")
						.hide();

					const $progressMarker = $('<' + progressMarkerElement + ' class="progressMarker"></' + progressMarkerElement + '>');
					$progressMarker
						.data("title", x_pages[x_lookupPage("linkID", pageDetails[i].linkID)].getAttribute("name"))
						.appendTo($pbMarkerContainer).css("left", "calc(" +  (i/(totalPages-1)*100) +  "% - " + ($progressMarker.outerWidth() / 2) + "px)");
				}

			} else if (progressSub == "chapters") {
				// add a progress marker to the beginning of each chapter - this will be checked when every page in chapter is complete
				// these might be evenly spaced or spaced in proportion to how many pages are in each chapter

				// create an array of chapters - each item contains an array of page indexes for pages within that chapter
				chapters = [];
				extraPages = [];
				let chapterNames = [];
				for (let i=0; i<x_chapters.length; i++) {
					chapters.push([]);
					chapterNames.push(x_chapters[i].name);
				}

				for (let i = 0; i < x_pages.length; i++) {
					if (x_pageInfo[i].standalone != true && x_pages[i] !== "menu") {
						// ignore standalone pages when getting index of page
						const offset = i - x_normalPages.indexOf(i) + (XENITH.PAGEMENU.menuPage ? 1 : 0);
						if (x_pages[i].getAttribute("chapterIndex") !== null) {
							chapters[x_pages[i].getAttribute("chapterIndex")].push(i - offset);
						} else {
							extraPages.push(i - offset);
						}
					}
				}

				if (extraPages.length > 0) {
					// there are some pages which sit outside of chapters
					// force spacing of pages within chapters to be consistent as otherwise it's hard to know what spacing to use for non-chapter pages
					progressBarSpacing = "false";
				}

				// remove any chapters that don't contain any pages & also remove these empty chapters from chapterNames
				chapterNames = chapterNames.filter((_, index) => chapters[index].length > 0);
				chapters = chapters.filter(subArray => subArray.length > 0);

				// these copies will have items removed as pages are viewed
				chaptersCopy = JSON.parse(JSON.stringify(chapters));
				const extraPagesCopy = [...extraPages];

				if (chapters.length > 0) {
					let count = 0;
					let left;
					let width;

					for (let i=0; i<chapters.length; i++) {
						let progressMarkerPosition;
						for (let j=0; j<chapters[i].length; j++) {

							if (extraPagesCopy.length > 0 && j===0) {
								// before we look at pages within this chapter, there might be pages before this chapter starts that aren't in a chapter at all
								// add a pbBar for these
								for (let k=0; k<extraPagesCopy.length; k++) {
									if (chapters[i][j] > extraPagesCopy[k]) {
										left = (100 / totalPages * count) + "%";
										width = (100 / totalPages) + "%";

										$pbBar.clone().addClass("sub page" + extraPagesCopy[k]).appendTo($pbBarContainer)
											.css("left", left)
											.width(width)
											.hide();

										count++;

										if (k+1 === extraPagesCopy.length) {
											extraPagesCopy.splice(0,k+1);
										}

									} else {
										extraPagesCopy.splice(0,k);
										break;
									}
								}
							}

							// create a progress bar sub-item for every page within the chapter

							// by default, chapters are spaced evenly with pages evenly spaced within each chapter
							// so pages in different chapters may be shown as different widths on the progress bar
							left = ((i/chapters.length*100) + (100/chapters.length / chapters[i].length)*j) +  "%";
							width = (100/chapters.length / chapters[i].length) +  "%";
							if (progressBarSpacing == "false") {
								// space chapters according to the no. pages within them
								// so all pages are equal width but chapters may not be
								left = (100 / totalPages * count) + "%";
								width = (100 / totalPages) + "%";
								count++;
							}

							// the progress marker for chapter will indicate the 1st page in the chapter - position same as 1st page item
							if (j==0) {
								progressMarkerPosition = left;
							}

							$pbBar.clone().addClass("sub chapter" + i + "Page" + chapters[i][j]).appendTo($pbBarContainer)
								.css("left", left)
								.width(width)
								.hide();
						}

						// create a progress marker at the beginning of the chapter
						const $progressMarker = $('<' + progressMarkerElement + ' class="progressMarker"></' + progressMarkerElement + '>');
						$progressMarker
							.data("title", chapterNames[i])
							.appendTo($pbMarkerContainer)
							.css("left", "calc(" + progressMarkerPosition + " - " + ($progressMarker.outerWidth() / 2) + "px)");
					}

					if (extraPagesCopy.length > 0) {
						// there might be pages after the final chapter that aren't in a chapter at all
						// add a pbBar for these
						for (let i=0; i<extraPagesCopy.length; i++) {
							left = (100 / totalPages * count) + "%";
							width = (100 / totalPages) + "%";
							count++;

							$pbBar.clone().addClass("sub page" + extraPagesCopy[i]).appendTo($pbBarContainer)
								.css("left", left)
								.width(width)
								.hide();
						}
					}

				} else {
					// no chapters so no progress markers
					progressSub = false;
				}
			} else {
				// add a progress marker to indicate each milestone
				// these can be evenly spaced (regardless of how many pages between milestones) or every page can have an equal width

				// create an array of milestones - each containing an array of page indexes for pages leading up to that milestone
				// the last page in milestones array is the milestone page
				milestones = [];
				milestoneTitles = [];
				extraPages = []; // any pages that fall after the final milestone

				let current = [];
				for (let i=0; i<x_pages.length; i++) {
					if (x_pageInfo[i].standalone != true && x_pages[i] !== "menu") {
						// ignore standalone pages when getting index of page
						const offset = i - x_normalPages.indexOf(i) + (XENITH.PAGEMENU.menuPage ? 1 : 0);
						current.push(i - offset);
						if (x_pages[i].getAttribute("milestone") == "true") {
							milestones.push(current);
							milestoneTitles.push(x_pages[i].getAttribute("name"));
							current = [];
						} else if (i == x_pages.length-1) {
							extraPages = current;
						}
					}
				}

				if (extraPages.length > 0) {
					// there are some pages which sit after the final milestone
					// force spacing of pages between milestones to be consistent as otherwise it's hard to know what spacing to use for these extra pages at the end
					progressBarSpacing = "false";
				}

				if (milestones.length > 0) {
					let count = 0;
					let left;
					let width;

					for (let i=0; i<milestones.length; i++) {
						for (let j=0; j<milestones[i].length; j++) {
							// create a progress bar sub-item for every page

							// by default, milestones are spaced evenly with pages evenly spaced between each milestone
							// so pages between different milestones may be shown as different widths on the progress bar
							left = ((i/milestones.length*100) + (100/milestones.length / milestones[i].length)*j) +  "%";
							width = (100/milestones.length / milestones[i].length) +  "%";
							if (progressBarSpacing == "false") {
								// all pages are equal width so milestones may not be equally spaced
								left = (100 / totalPages * count) + "%";
								width = (100 / totalPages) + "%";
								count++;
							}

							$pbBar.clone().addClass("sub").appendTo($pbBarContainer)
								.css("left", left)
								.width(width)
								.hide();
						}

						// create a progress marker at each milestone page (the final page in the array)
						const $progressMarker = $('<' + progressMarkerElement + ' class="progressMarker"></' + progressMarkerElement + '>');
						let left2 = (i+1)/milestones.length*100;
						if (progressBarSpacing == "false") {
							left2 = 100 / totalPages * count;
						}
						$progressMarker
							.data("title", milestoneTitles[i])
							.appendTo($pbMarkerContainer)
							.css("left", "calc(" +  left2 +  "% - " + ($progressMarker.outerWidth() / 2) + "px)");
					}

					if (extraPages.length > 0) {
						// there might be pages after the final milestone
						// add a pbBar for these
						for (let i=0; i<extraPages.length; i++) {
							left = (100 / totalPages * count) + "%";
							width = (100 / totalPages) + "%";
							count++;

							$pbBar.clone().addClass("sub page" + extraPages[i]).appendTo($pbBarContainer)
								.css("left", left)
								.width(width)
								.hide();
						}
					}

				} else {
					// no milestones so no progress markers
					progressSub = false;
				}
			}

			if (progressSub !== false && x_params.progressBarSubLink !== "false") {
				// jump to relevant page/chapter/milestone when progress marker is clicked

				// add explanation for screen readers of what the progress markers do
				$pbBarContainer.before("<span class='sr-only'>" + x_getLangInfo(x_languageData.find("progressBar")[0], "markers", "Buttons navigate directly to pages or chapters marked on the progress bar") + "</span>");
				$("#x_headerProgress").prepend("<span class='sr-only'>" + x_getLangInfo(x_languageData.find("progressBar")[0], "title", "Progress bar") + "</span>");

				// describe what the progress marker is for
				const progressSubType = (progressSub == "pages" ? x_getLangInfo(x_languageData.find("progressBar")[0], "page", "Page") : progressSub == "chapters" ? x_getLangInfo(x_languageData.find("progressBar")[0], "chapter", "Chapter") : x_getLangInfo(x_languageData.find("progressBar")[0], "milestone", "Milestone")) + ": ";

				completeTxt = x_getLangInfo(x_languageData.find("progressBar")[0], "complete", "Complete");
				incompleteTxt = x_getLangInfo(x_languageData.find("progressBar")[0], "incomplete", "Incomplete");
				completeTxt = completeTxt != "" ? ": " + completeTxt : "";
				incompleteTxt = incompleteTxt != "" ? " (" + incompleteTxt + ")" : "";

				$pbMarkerContainer.find(".progressMarker").each(function() {
					$(this).data("title", progressSubType + $('<span>' + $(this).data("title") + '</span>').text()); // clean up text used for progress marker title
					$(this)
						.button({
							label: $(this).data("title") + incompleteTxt,
							text: false
						})
						.attr("title", $(this).data("title") + incompleteTxt)
						.click(function() {
							if (progressSub == "pages") {
								x_navigateToPage(false, {type:'linkID', ID:pageDetails[$(this).index()].linkID});
							} else if (progressSub == "chapters") {
								x_navigateToPage(false, {type:'linkID', ID:pageDetails[chapters[$(this).index()][0]].linkID});
							} else {
								x_navigateToPage(false, {type:'linkID', ID:pageDetails[milestones[$(this).index()][milestones[$(this).index()].length-1]].linkID});
							}
						});
				});

				$pbHolder.addClass("progressMarkers");

			} else {
				$pbBar.appendTo($pbContainer);
			}

		} else {
			// original, simple style progress bar
			$pbBar.appendTo($pbContainer);
		}
	}

	// a new page has been viewed - update the progress bar
	function update(page, target) {
		if (progressBar) {
			let update = true;

			if (page != undefined) {
				// page is standalone page opening in lightbox or new window - should its progress be recorded on progress bar?
				if (progressSub == false && x_pages[page].getAttribute('reqProgress') == 'true') {
					x_pageInfo[page]["built" + target] = true;
				} else {
					update = false;
				}
			}

			if (update === true) {
				// progress bar needs to be updated

				// how many pages have been viewed?
				let pagesViewed;
				if (progressSub != false) {
					// standalone pages are always excluded when progress markers are shown
					pagesViewed = $(x_pageInfo).filter(function (i) {
						return this.viewed !== false && this.standalone !== true && this.type !== "menu";
					});
				} else {
					// by default stand-alone pages are excluded from being included in progress - this can be overridden with optional property
					pagesViewed = $(x_pageInfo).filter(function (i) {
						return ((this.viewed !== false || this.builtLightBox == true || this.builtNewWindow == true) && (this.standalone != true || x_pages[i].getAttribute('reqProgress') == 'true') && this.type !== "menu");
					});
				}
				pagesViewed = pagesViewed.length;
				const progress = Math.round((pagesViewed * 100) / totalPages);

				if (progressSub == false) {
					// no progress markers so just have a simple bar moving across according to % of project viewed
					$pbBar.css({"width": progress + "%"});

				} else {
					// progress markers - progress bar is split up into sections with an associated marker
					// each section of bar (& marker) will be highlighted as that section is completed
					// sections may be not be highlighted consecutively if the pages aren't viewed in order

					if (progressSub == "pages") {
						// there is a progress marker for each page

						let count = -1;
						$(x_pageInfo).each(function (i) {
							if (this.type !== "menu" && this.standalone !== true) {
								count++;
								if (this.viewed !== false) {
									$(".progressMarker:eq(" + count + ")")
										.button({ label: $(".progressMarker:eq(" + count + ")").data("title") + completeTxt })
										.attr("title", $(".progressMarker:eq(" + count + ")").data("title") + completeTxt)
										.addClass("complete");

									if (count != 0) { // there's no bar for the first page as the first marker is at the beginning of the progress bar
										$(".pbBar:eq(" + count + ")").show();
									}
								}
							}
						});

					} else if (progressSub == "chapters") {
						// there is a progress marker at the end of each chapter

						$(x_pageInfo).each(function (index) {
							if (this.type !== "menu" && this.standalone !== true && this.viewed !== false) {
								// ignore standalone pages when getting index of page
								const offset = index - x_normalPages.indexOf(index) + (XENITH.PAGEMENU.menuPage ? 1 : 0);

								// check pages that sit outside chapters
								for (let i = 0; i < extraPages.length; i++) {
									if (extraPages[i] === index - offset) {
										$(".pbBar.page" + (index - offset)).show();
									}
								}

								// check pages that are within chapters
								for (let i = 0; i < chaptersCopy.length; i++) {
									for (let j = 0; j < chaptersCopy[i].length; j++) {
										if (chaptersCopy[i][j] === index - offset) {
											// found a viewed page within this chapter
											// update the progress bar and remove page from chapter array so it can't be recounted as newly viewed
											$(".pbBar.chapter" + i + "Page" + (index - offset)).show();
											chaptersCopy[i].splice(j, 1);

											if (chaptersCopy[i].length === 0) {
												// progress marker is shown as complete if chapter array is now empty
												$(".progressMarker:eq(" + i + ")")
													.button({ label: $(".progressMarker:eq(" + i + ")").data("title") + completeTxt })
													.attr("title", $(".progressMarker:eq(" + i + ")").data("title") + completeTxt)
													.addClass("complete");
											}
										}
									}
								}
							}
						});

					} else if (progressSub == "milestones") {
						// add a progress marker at each milestone
						let milestoneIndex = -1;
						$(x_pageInfo).each(function (i) {
							if (this.type !== "menu" && this.standalone !== true) {
								// ignore standalone pages when getting index of page
								const offset = i - x_normalPages.indexOf(i) + (XENITH.PAGEMENU.menuPage ? 1 : 0);
								if (x_pages[i].getAttribute('milestone') == "true") {
									milestoneIndex++;
								}
								if (this.viewed !== false) {
									$(".pbBar:eq(" + (i - offset) + ")").show();
									if (x_pages[i].getAttribute('milestone') == "true") {
										$(".progressMarker:eq(" + milestoneIndex + ")")
											.button({ label: $(".progressMarker:eq(" + milestoneIndex + ")").data("title") + completeTxt })
											.attr("title", $(".progressMarker:eq(" + milestoneIndex + ")").data("title") + completeTxt)
											.addClass("complete");
									}
								}
							}
						});
					}
				}

				// add class when complete to allow styling of completed bar
				if (progress === 100) {
					$pbHolder.addClass("complete");
				}

				if (progressBarPercentage !== false) {
					// update the text alongside the progress bar
					$pbTxt.html(progressBarPercentage.replace("{x}", progress));
				}
			}
		}
	}

	// make some public methods
	self.init = init;
	self.build = build;
	self.update = update;

	return parent;

})(jQuery, XENITH || {});


// ***** ACCESSIBILITY OPTIONS *****
// Controls the dialog / lightbox that displays end-user accessibility options:
// - Accessibility themes selection
// - Remove background images
// - Turn off responsive text
var XENITH = (function ($, parent) { var self = parent.ACCESSIBILITY = {};
	// declare global variables
	let hidden = false;
	let specialTheme = false;
	let removeBg = false;
	let responsiveTxt = null;

	// declare local variables
	// list of available themes
	const filterMap = [
		{name:'off', default:'Default', bg:true, theme:''},
		{name:'dark', default:'Dark mode', bg:false, theme:'darkmode'},
		{name:'light', default:'Light mode', bg:false, theme:'lightmode'},
		{name:'invert', default:'High contrast', bg:false, theme:'highcontrast'},
		{name:'blackYellow', default:'Black on yellow', bg:false, theme:'blackonyellow'}
	];
	let lbHtml;

	// creates special_theme_css & special_theme_responsive_css styles tag in HEAD ready for any future theme changes
	function init() {
		XENITH.ACCESSIBILITY.hidden = x_params.accessibilityHide === 'true' ? true : false;

		if (!XENITH.ACCESSIBILITY.hidden) {
			// insert in HEAD - either at end or before any bespoke project CSS
			const linkHtml =`<link rel="stylesheet" href="" type="text/css" id="special_theme_css" disabled="">
			<link rel="stylesheet" href="" type="text/css" id="special_theme_responsive_css" disabled="">`;

			if ($("#lo_sheet_css, lo_css").length > 0) {
				$(linkHtml).insertBefore($("#lo_sheet_css, lo_css")[0]);
			} else {
				$x_head.append(linkHtml);
			}


			if (x_params.accessibilityTarget !== "lightbox") {
				x_dialogInfo.push({type: 'colourChanger', built: false});
			}

			if (XENITH.ACCESSIBILITY.specialTheme !== false) {
				// a special theme is already set
				// this must be a standalone page opening in a new window or lightbox where the parent project that opened this had a special theme already applied
				// make sure this immediately uses the special theme
				switchTheme(XENITH.ACCESSIBILITY.specialTheme);
			}

			if (XENITH.ACCESSIBILITY.removeBg) {
				// remove background images is already on
				// this must be a standalone page opening in a new window or lightbox where the parent project that opened this had no background images forced
				// make sure this immediately does the same
				removeBgImages(true);
			}
		}
	}

	// accessibility options button on toolbar - set up or remove if not required
	function buildBtn() {
		if (!XENITH.ACCESSIBILITY.hidden) {
			const accessibilityIcon = x_btnIcons.filter(function(icon){return icon.name === 'accessibility';})[0];

			$x_colourChangerBtn
				.button({
					icons: {
						primary: accessibilityIcon.iconClass
					},
					// label can now be set in editor but fall back to language file if not set
					label: x_params.accessibilityLabel !== undefined && x_params.accessibilityLabel !== "" ? x_params.accessibilityLabel : x_getLangInfo(x_languageData.find("colourChanger")[0], "tooltip", "Change Colour"),
					text: false
				})
				.attr("aria-label", $x_colourChangerBtn.attr("title") + x_params.dialogTxt)
				.click(function() {
					if (x_params.accessibilityTarget === "lightbox") {
						if (lbHtml === undefined) {
							lbHtml = '<div id="colourChangerLightBox"></div>';

							$.featherlight(
								lbHtml,
								{ variant: 'lightbox' + (x_browserInfo.mobile != true ? 'Medium' : 'Auto') }
							);

							XENITH.ACCESSIBILITY.build($("#colourChangerLightBox"));

						} else {
							$.featherlight(
								lbHtml, // reload previously used HTML so correct theme is shown selected
								{ variant: 'lightbox' + (x_browserInfo.mobile != true ? 'Medium' : 'Auto') }
							);

							checkActive();
						}

					} else {
						buildDialog();
					}
				});

			if (accessibilityIcon.customised === true) {
				$x_colourChangerBtn.addClass("customIconBtn");
			}
			if (accessibilityIcon.btnImgs === true) {
				$x_colourChangerBtn.addClass("imgIconBtn");
			}

		} else {
			$x_colourChangerBtn.remove();
		}
	}

	function buildDialog() {
		x_openDialog(
			"colourChanger",
			x_params.accessibilityLabel != undefined && x_params.accessibilityLabel != "" ? x_params.accessibilityLabel : x_getLangInfo(x_languageData.find("colourChanger")[0], "label", "Accessibility Options"),
			x_getLangInfo(x_languageData.find("colourChanger").find("closeButton")[0], "description", "Close Accessibility Options"),
			null,
			'<div id="colourChangerDialog"></div>',
			function () {
				$x_colourChangerBtn
					.blur()
					.removeClass("ui-state-focus")
					.removeClass("ui-state-hover");
			}
		);
	}

	// function builds the accessibility options within the dialog / lightbox
	function build($parent) {
		const html = `<div id="colourChangerHolder">
			<p id="p1"></p>
			<div id="optionHolder">
				<div id="colourChangerOptions"></div>
			</div>
			<p id="p2"></p>
		</div>`;

		$parent.append(html);

		const $colourChangerHolder = $parent.find('#colourChangerHolder');

		// opened in lightbox
		if ($parent.parents('.featherlight').length > 0) {
			$colourChangerHolder.wrap('<div id="x_colourChanger"></div>');

			$('#x_colourChanger').prepend('<h1 id="x_introH1">' + (x_params.accessibilityLabel !== undefined && x_params.accessibilityLabel !== "" ? x_params.accessibilityLabel : x_getLangInfo(x_languageData.find("colourChanger")[0], "tooltip", "Accessibility Options")) + '</h1>');

			$colourChangerHolder
				.height($('.featherlight-content').height() - $('#x_introH1').outerHeight())
				.css('overflow', 'auto');
		}

		// add instruction text
		const $p1 = $colourChangerHolder.find("#p1").html(x_getLangInfo(x_languageData.find("colourChanger").find("selectTxt")[0], "label", "Select a theme for this project") + ":");
		$colourChangerHolder.find("#p2").html(x_getLangInfo(x_languageData.find("colourChanger").find("adviceTxt")[0], "label", "Accessibility advice is available in the <a target='_blank' href='https://xot.xerte.org.uk/play.php?template_id=151'>Xerte Online Toolkits guide to accessibility</a>."));

		// add warning that links opens in new window if needed
		if ($colourChangerHolder.find("#p2").find("a").length > 0 && $colourChangerHolder.find("#p2").find("a").attr("target") == "_blank") {
			$colourChangerHolder.find("#p2").find("a").append(" <i class='fa fa-solid fa-arrow-up-right-from-square'></i><span class='sr-only'> " + x_params.newWindowTxt + "</span>");
		}

		// add wcag logo and link if not hidden
		if (x_params.wcagHide !== 'true') {
			$p1.before("<a class='wcagLink' target='_blank' href='https://xot.xerte.org.uk/play.php?template_id=214#home'><img class='wcagLogo' src='" + x_templateLocation + "common_html5/wcag2.2AA-blue.png' alt='" + x_getLangInfo(x_languageData.find("colourChanger").find("wcagLogo")[0], "label", "WCAG WAI-AA logo") + "' title='" + x_getLangInfo(x_languageData.find("colourChanger").find("wcagTxt")[0], "label", "View the Xerte accessibility statement") + "'> </a>");

			if (x_params.wcagAlt !== undefined) {
				$(".wcagLogo").attr("alt",x_params.wcagAlt);
			}
			if (x_params.wcagLinkTitle !== undefined) {
				$(".wcagLogo").attr("title",x_params.wcagLinkTitle);
			}
			if (x_params.wcagLink !== "") {
				$(".wcagLink").prop("href",x_params.wcagLink);
			}
		}

		// add radio buttons & bg checkbox
		const $colourChangerOptions = $('#colourChangerOptions');
		let checked = XENITH.ACCESSIBILITY.specialTheme === false ? 0 : filterMap.findIndex(x => x.theme === XENITH.ACCESSIBILITY.specialTheme);

		for (let i=0; i<filterMap.length; i++) {
			const $radio = $('<div class="optionGroup"></div>');
			$radio.append('<input type="radio" name="colourChangerRadios" id="option' + i + '" value="' + i + '"' + (i===checked ? ' checked="checked"' : '') + '>');
			$radio.append('<label for="option' + i + '"><p>' + x_getLangInfo(x_languageData.find("colourChanger").find(filterMap[i].name)[0], "label", filterMap[i].default) + '</p></label>');
			$colourChangerOptions.append($radio);
		}

		checked = XENITH.ACCESSIBILITY.removeBg ? 'checked="checked"' : '';
		$colourChangerOptions.append('<hr/><div class="checkGroup"><input type="checkbox" id="noBg" name="noBg"' + checked + '><label for="noBg"><p> ' + x_getLangInfo(x_languageData.find("colourChanger").find("noBg")[0], "label", "Remove background images") + '</p></label></div>');

		// if responsive text is not turned on by the author, the option to turn it on / off will not be shown in the accessibility options dialog
		if (x_params.responsive === "true") {
			checked = XENITH.ACCESSIBILITY.responsiveTxt ? 'checked="checked"' : '';
			$colourChangerOptions.append('<div class="checkGroup"><input type="checkbox" id="responsiveTxt" name="responsiveTxt"' + checked + '><label for="responsiveTxt"><p> ' + x_getLangInfo(x_languageData.find("colourChanger").find("responsiveTxt")[0], "label", "Responsive text") + ' <i class="fa fa-question-circle" title="' + x_getLangInfo(x_languageData.find("colourChanger").find("responsiveTxt")[0], "tip", "When responsive text is turned on, the text size will adapt to the size of the screen you are viewing this project on. If you use the browser zoom to increase the text size then you may get a better experience if you turn responsive text off.") + '"></i></p></label></div>');
		}

		$colourChangerOptions.append('<hr/>');

		// trigger change theme on radio change
		$colourChangerOptions.find('.optionGroup input').change(function() {
			if (filterMap[this.value].theme === '') {
				// default theme
				switchTheme(x_params.theme);
				XENITH.ACCESSIBILITY.specialTheme = false;
			} else {
				// custom accessibility theme
				switchTheme(filterMap[this.value].theme);
				XENITH.ACCESSIBILITY.specialTheme = filterMap[this.value].theme;
			}

			XENITH.ACCESSIBILITY.disableBespokeCSS();

			// refresh (trigger pageChanged function) or completely rebuild pages of these types
			// as they involve things like writing text on a canvas (text might not be an appropriate colour after the theme change)
			const pageTypesRequiringRebuild = ['chart', 'textDrawing'];
			const pageTypesRequiringRefresh = ['opinion'];

			// flag built pages of these types as not built yet, so they will be rebuilt when next viewed
			for (let i=0, len=x_pageInfo.length; i<len; i++) {
				if (pageTypesRequiringRebuild.indexOf(x_pageInfo[i].type) > -1) {
					x_pageInfo[i].built = false;
				}
			}

			// rebuild current page if required
			if (pageTypesRequiringRebuild.indexOf(x_pageInfo[x_currentPage].type) > -1 ||
				pageTypesRequiringRefresh.indexOf(x_pageInfo[x_currentPage].type) > -1) {
				x_changePage(x_currentPage);
			}
		});

		// trigger show/hide background image on checkbox change
		$colourChangerOptions.find('#noBg').change(function() {
			removeBgImages(this.checked);
		});

		// trigger show/hide background image on checkbox change
		$colourChangerOptions.find('#responsiveTxt').change(function() {
			changeResponsiveTxt(this.checked, true);
		});

		if ($parent.parents('.featherlight').length > 0) {
			lbHtml = $parent;
		}
	}

	// change the theme
	function switchTheme(theme) {
		// any changes made to the project via the default theme's theme.js file will NOT be reversed
		const currentThemeURL = x_themePath + theme + '/' + theme;
		const currentResponsiveThemeURL = x_themePath + theme + '/responsivetext';

		const $special_theme_css = $("#special_theme_css");
		const $special_theme_responsive_css = $("#special_theme_responsive_css");
		const $theme_css = $("#theme_css");
		const $theme_responsive_css = $("#theme_responsive_css");

		if (theme !== x_params.theme) {
			// custom theme in use
			$theme_css.prop("disabled", true);
			$theme_responsive_css.prop("disabled", true);
			$special_theme_css.attr("href", currentThemeURL + ".css");
			$special_theme_css.prop("disabled", false);

			// only enable responsive text css files if needed responsive text is currently on
			if (checkResponsiveTxt()) {
				$special_theme_responsive_css.attr("href", currentResponsiveThemeURL + ".css");
				$special_theme_responsive_css.prop("disabled", false);
			}
		} else {
			// default theme in use
			$special_theme_css.prop("disabled", true);
			$special_theme_responsive_css.prop("disabled", true);
			$theme_css.prop("disabled", false);

			// only enable responsive text css files if needed responsive text is currently on
			if (checkResponsiveTxt()) {
				$theme_responsive_css.prop("disabled", false);
			}
		}

		x_getThemeInfo(theme, true);
	}

	// background images are removed from the project / page unless the default theme for the project is being used
	function removeBgImages (hideBg) {
		if (hideBg) {
			XENITH.ACCESSIBILITY.removeBg = true;
			$x_background.hide();
		} else {
			XENITH.ACCESSIBILITY.removeBg = false;
			$x_background.show();
		}
	}

	// responsive text can be turned on / off
	function changeResponsiveTxt (on, change) {
		let responsiveCssDisabled = true;
		if (on) {
			if (change !== false) {
				XENITH.ACCESSIBILITY.responsiveTxt = true;
			}
			// responsivetext.css may continue to be disabled if the project is being shown at a fixed size
			if ((x_params.displayMode != "default" && !$.isArray(x_params.displayMode)) || x_fillWindow == true) {
				$x_mainHolder.addClass("x_responsive");
				responsiveCssDisabled = false;
			}
		} else {
			if (change !== false) {
				XENITH.ACCESSIBILITY.responsiveTxt = false;
			}
			$x_mainHolder.removeClass("x_responsive");
		}

		// enable / disable responsivetext css files as appropriate
		for (let i=0; i<x_responsive.length; i++) {
			$(x_responsive[i]).prop("disabled", responsiveCssDisabled);
		}

		// a special theme is in use - this will affect which responsive text css files should be enabled
		if (XENITH.ACCESSIBILITY.specialTheme !== false && responsiveCssDisabled === false) {
			$("#theme_responsive_css").prop("disabled", true);
			$("#special_theme_responsive_css").prop("disabled", false);
		} else {
			$("#special_theme_responsive_css").prop("disabled", true);
		}

		x_setProjectTxtSize();

		// trigger recalculation of interface & page elements with heights / margins etc. that might be affected by turning repsonsive text on / off
		x_updateCss2();
	}

	// is responsive text currently on? not just dependant on editor setting - looks at whether it's been changed in accessibility options and whether it's turned off by default as project is being viewed at a fixed size
	function checkResponsiveTxt() {
		return XENITH.ACCESSIBILITY.responsiveTxt == true && ((x_params.displayMode != "default" && !$.isArray(x_params.displayMode)) || x_fillWindow == true);
	}

	function disableBespokeCSS() {
		$("#customHeaderStyle").prop('disabled', XENITH.ACCESSIBILITY.specialTheme !== false);

		// disable xhibit stylesheets when accessibility theme is in use as otherwise the footer buttons icons are messed up
		// perhaps we should always do this (not just for xhibit) & possibly also for #lo_css (css added via styles optional property)
		if (x_params.theme == "xhibit") {
			$("#lo_sheet_css").prop('disabled', XENITH.ACCESSIBILITY.specialTheme !== false);
		}
	}

	// when lightbox is reopened - make sure the correct theme is selected
	function checkActive() {
		let checked = XENITH.ACCESSIBILITY.specialTheme === false ? 0 : filterMap.findIndex(x => x.theme === XENITH.ACCESSIBILITY.specialTheme);
		$('#colourChangerOptions input:eq(' + checked + ')').prop("checked", true);
		$('#colourChangerOptions #noBg').prop("checked", XENITH.ACCESSIBILITY.removeBg);
		$('#colourChangerOptions #responsiveTxt').prop("checked", XENITH.ACCESSIBILITY.responsiveTxt);
	}

	// make some public methods
	self.init = init;
	self.buildBtn = buildBtn;
	self.build = build;
	self.disableBespokeCSS = disableBespokeCSS;
	self.changeResponsiveTxt = changeResponsiveTxt;
	self.checkResponsiveTxt = checkResponsiveTxt;
	self.hidden = hidden;
	self.specialTheme = specialTheme;
	self.removeBg = removeBg;
	self.responsiveTxt = responsiveTxt;

	return parent;

})(jQuery, XENITH || {});


// ***** ADDITIONAL RESOURCES *****
// Adds a button to footer or header bar containing:
// - List of additional resources associated with the page
// - These can be links, files or internal Xerte page links
// - Optional: completion checkboxes (manually triggered by students) & warning if all resources aren't completed
var XENITH = (function ($, parent) { var self = parent.RESOURCES = {};
	// declare local variables
	let resources = false;
	let resourcesInfo = [];
	let trackCompletion = false;
	let suppressWarning = [];
	let stopWarning = false;

	// function adds resources button to header / side bar if any pages in the project have some associated resources
	function init() {
		for (let i=0; i<x_pages.length; i++) {
			// has the resources optional property been added to a page & does it contain useful info?
			if (!(XENITH.PAGEMENU.menuPage && i==0) && x_pages[i].getAttribute("resources") != undefined) {
				if (x_pages[i].getAttribute("resources").replace(/[|]/g,"").trim() != "") {

					// list of file types that will not be available to view in browser - only download button available
					let fileExtensions = [".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"];
					if (x_params.resourceFileExtensions != undefined && x_params.resourceFileExtensions != "") {
						let tempArray = x_params.resourceFileExtensions.split(",");
						tempArray = tempArray.map(i => "." + i);
						fileExtensions = fileExtensions.concat(tempArray);
					}

					// returns resource type
					function getResourceType(resource) {
						if (resource.trim() == "") {
							// XOT page
							return "page";
						} else {
							resource = resource.toLowerCase();

							for (let k=0; k<fileExtensions.length; k++) {
								if (resource.endsWith(fileExtensions[k])) {
									// word /excel / ppt doc
									return "file";
								}
							}

							if (resource.endsWith(".mp3")) {
								// audio
								return "audio";
							} else if (resource.endsWith(".png") || resource.endsWith(".jpg") || resource.endsWith(".jpeg") || resource.endsWith(".gif") || resource.endsWith(".svg")) {
								// image
								return "image";
							} else if (resource.endsWith(".pdf")) {
								// pdf
								return "filePdf";
							} else if (resource.endsWith(".mp4") || resource.endsWith(".mov") || resource.endsWith(".wmv") || resource.endsWith(".webm")) {
								// video
								return "video";
							} else if (x_isYouTubeVimeo(resource) !== false) {
								// youtube or vimeo
								return "videoEmbed";
							} else if (resource.startsWith("http")) {
								// URL
								return "url";
							} else if (resource.startsWith("<iframe")) {
								return "iframe";
							} else {
								return "other";
							}
						}
					}

					const pageResourceInfo = x_pages[i].getAttribute("resources").split("||");
					const pageResources = [];
					for (let j=0; j<pageResourceInfo.length; j++) {
						const resource = pageResourceInfo[j].split("|");
						// the resource is either a link, file path (resources[1]) or a Xerte page link (resources[2])
						if (resource.length === 4 && resource[1].trim() !== "" || resource[2] !== "") {
							pageResources.push({
								"title": resource[0],
								"link": resource[1].trim() !== "" ? resource[1].trim() : resource[2],
								"type": getResourceType(resource[1]),
								"description": resource[3].trim(),
								"complete": false
							});
						}
					}

					if (pageResources.length === 0) {
						// no useful resource entries found for this page
						x_pages[i].removeAttribute("resources");
					} else {
						resources = true;
					}

					resourcesInfo.push(pageResources);

				} else {
					// resources data grid is empty (string only contains | , or whitespace)
					x_pages[i].removeAttribute("resources");
					resourcesInfo.push([]);
				}
			} else {
				resourcesInfo.push([]);
			}

			suppressWarning.push(false);
		}

		// at least one page has some associated resources
		if (resources === true) {

			trackCompletion = x_params.resourceCompletion == "true";

			// add the resources button to header bar - this will be hidden until viewing a page with associated resources
			const resourceIcon = x_btnIcons.filter(function(icon){return icon.name === 'resource';})[0];
			// add resources btn to the header bar - this might be moved to side bar later if that's where it's supposed to be
			$x_pageResourcesBtn = $('<button id="x_pageResourcesBtn"></button>').appendTo($('#x_headerBlock h2'));

			let btnLabel = !trackCompletion ? x_getLangInfo(x_languageData.find("resources")[0], "text", "{x} Resources Available") : x_getLangInfo(x_languageData.find("resources")[0], "completeText", "{y}/{x} Resources Complete");
			btnLabel = btnLabel
				.replace("{x}", "<span class='totalResourcesNum'></span>")
				.replace("{y}", "<span class='completedResourcesNum'></span>");
			btnLabel += " <span class='x_resourcesClickTxt'><span class='sr-only'>" + x_params.dialogTxt + "</span></span>";

			$x_pageResourcesBtn
				.button({
					icons: {
						primary: resourceIcon.iconClass
					},
					label: btnLabel,
					text: x_params.resourceBtn == "text" ? true : false
				})
				.click(function() {
					build();
				});

			// if no text shown on button, add a circle with no. of resources in it
			if (x_params.resourceBtn !== "text") {
				$x_pageResourcesBtn.append("<div class='resourceNumber'><div class='resourceNumberTxt'></div></div>");
			}
		}
	}

	// function builds the resources lightbox when button clicked
	function build() {
		const $resourceHolder = $("<div id='x_resources'></div>");

		if (x_params.resourceTitle != undefined && x_params.resourceTitle.trim() != "") {
			$resourceHolder.append("<h1 id='x_resourceHeader'>" + x_params.resourceTitle + "</h1>");
		}
		if (x_params.resourceText != undefined && x_params.resourceText.trim() != "") {
			$resourceHolder.append("<div id='x_resourceTxt'>" + x_params.resourceText + "</div>");
		}
		if (trackCompletion && x_params.resourceCompletionTxt != undefined && x_params.resourceCompletionTxt.trim() != "") {
			$resourceHolder.append("<div id='x_resourcePercentage'><p>" + x_params.resourceCompletionTxt.replace("{x}", "<span class='resourcePercentage'>" + 0 + "</span>") + "</p></div>");
		}

		// create a table where the resources will be listed
		const $resourceTable = $("<table id='x_resourceTable' class='horizontal'></table>").appendTo($resourceHolder);
		const $tableHeader = $("<thead><tr><th class='titleCell'>" + x_getLangInfo(x_languageData.find("resources").find("table")[0], "title", "Title") + "</th><th class='descriptionCell'>" + x_getLangInfo(x_languageData.find("resources").find("table")[0], "description", "Description") + "</th><th class='actionCell'>" + x_getLangInfo(x_languageData.find("resources").find("table")[0], "actions", "Actions") + "</th></tr></thead>").appendTo($resourceTable);

		// create a column for completion data if it's being tracked
		if (trackCompletion) {
			$tableHeader.find("tr").append("<th class='completeCell'><span id='completeCheckLabel'>" + x_getLangInfo(x_languageData.find("resources").find("table")[0], "complete", "Mark as complete") + "</span></th>");
		}

		// add a row for each resource
		const $tableBody = $("<tbody></tbody>").appendTo($resourceTable);
		const pageResources = resourcesInfo[x_currentPage];

		// returns appropriate Font Awesome icon for resource type
		function getResourceIcon(type) {
			if (type == "page") {
				return "fa-link";
			} else if (type == "audio") {
				return "fa-podcast";
			} else if (type == "image") {
				return "fa-image";
			} else if (type == "file" || type == "filePdf") {
				return "fa-file-lines";
			} else if (type == "video" || type == "videoEmbed") {
				return "fa-film";
			} else if (type == "url" || type == "iframe") {
				return "fa-globe";
			} else {
				return "fa-file";
			}
		}

		const viewBtn = "<button class='resourceViewBtn'></button>";
		const downloadBtn = "<a class='resourceDownloadBtn' download>" + x_getLangInfo(x_languageData.find("resources").find("table")[0], "downloadBtn", "Download resources") + "</a>"
		for (let i=0; i<pageResources.length; i++) {
			const thisResource = pageResources[i];
			// download button is only needed for files uploaded (not URLs or XOT page links)
			let thisDownloadBtn = thisResource.type !== "page" && thisResource.type !== "url" && thisResource.type !== "other" && thisResource.type !== "videoEmbed" && thisResource.type !== "iframe" ? downloadBtn : "";

			// there are different ways the resource may open - this window, new window, lightbox
			let target = thisResource.type == "page" ? null : thisResource.type == "iframe" ? "lightbox" : thisDownloadBtn === "" ? (x_params.resourceShowIn != undefined ? x_params.resourceShowIn : "_blank") : (x_params.resourceShowFileIn != undefined ? x_params.resourceShowFileIn : "lightbox");
			let thisViewBtn = viewBtn;
			if (thisResource.type == "file") { // word doc - can't preview so only have download btn
				target = null;
				thisViewBtn = "";
			}

			// author has turned off download file button - only do this if a view file button is available
			if (thisViewBtn !== "" && x_params.resourceDownload == "false") {
				thisDownloadBtn = "";
			}

			const resourceIcon = x_params.resourceIcons !== "false" ? "<i aria-hidden='true' class='resourceIcon fa fa-fw " + getResourceIcon(thisResource.type) + "'></i>" : "";
			const linkElement = target == "_blank" || target == "_self" || thisResource.type == "file" ? "a" : "button";
			const $resourceRow = $("<tr class='resourceRow'><td class='titleCell'><div class='resourceLinkHolder'>" + resourceIcon + "<" + linkElement + " class='resourceLink'>" + thisResource.title + "</" + linkElement + "></div></td><td class='descriptionCell'>" + thisResource.description + "</td><td class='actionCell'><div class='actionBtnHolder'>" + thisViewBtn + thisDownloadBtn + "</div></td></tr>").appendTo($tableBody);
			$resourceRow.find(".resourceDownloadBtn").attr("href", thisResource.link);
			if (trackCompletion) {
				$resourceRow.append("<td class='completeCell'><input id='resourceComplete" + i + "' name='resourceComplete" + i + "' aria-labelledby='completeCheckLabel' class='resourceComplete' type='checkbox' " + (thisResource.complete ? "checked" : "") + " /></td>");
			}

			if (target == "_blank" || target == "_self") {
				// normal link opening in this or new window
				$resourceRow.find(".resourceLink").attr({
					"href": thisResource.link,
					"target": target
				});

				// add a warning about opening in new window
				if (target == "_blank") {
					$resourceRow.find(".resourceLink").append("<span class='sr-only'> " + x_params.newWindowTxt + "</span>");
				}

			} else if (target == "lightbox") {
				// opens in a lightbox
				$resourceRow.find(".resourceLink").click(function() {
					if (thisResource.type == "iframe") {
						const $iframe = $('<div id="resourceIFrame">' + thisResource.link + '</div>');
						$iframe.find("iframe").width($x_mainHolder.width()*0.8).height($x_mainHolder.height()*0.8)
						$.featherlight($iframe);

					} else if ((thisResource.type !== "videoEmbed" && thisDownloadBtn === "") || thisResource.type == "filePdf") {
						// url or file
						$.featherlight({iframe: thisResource.link, iframeWidth: $x_mainHolder.width()*0.8, iframeHeight: $x_mainHolder.height()*0.8});

					} else if (thisResource.type == "image") {
						$.featherlight({
							image: thisResource.link,
							afterOpen: function () {
								// add alt text to image
								this.$content.attr("alt", thisResource.title);
							}
						});
					} else if (thisResource.type == "audio") {
						const $pageAudio = $('<div id="resourceAudio"></div>')
							.width($x_mainHolder.width() * 0.8)
							.css('max-width', '300px');

						$.featherlight($pageAudio);

						$('#resourceAudio')
							.attr('title', thisResource.title)
							.mediaPlayer({
								type: 'audio',
								source: thisResource.link,
								width: '100%'
							});

					} else if (thisResource.type == "video" || thisResource.type == "videoEmbed") {
						$.featherlight('<div id="resourceVideo"></div>', {afterOpen: function () {
							this.$content.parent(".featherlight-content").addClass("resourceVideo");
							if (thisResource.type == "videoEmbed") {
								this.$content.parent(".featherlight-content").addClass('max youTube');
							}
						}});

						$('#resourceVideo')
							.attr('title', thisResource.title)
							.mediaPlayer({
								type: 'video',
								source: thisResource.link,
								width: '100%',
								height: '100%',
								pageName: 'resourceVideo'
							});
					}
				})
				// add a warning about opening in lightbox
				.append("<span class='sr-only'> " + x_params.dialogTxt + "</span>");

			} else if (thisResource.type == "page") {
				// XOT page link
				// this will open in same window by default - unless it's a standalone page & it's been set to open in lightbox or new window
				$resourceRow.find(".resourceLink").click(function() {
					// don't show warning about incomplete resources on this page change
					stopWarning = true;

					// close this lightbox before moving page, otherwise standalone pages that should open in lightbox will not work (they will open in whole window)
					$.featherlight.current().close();
					x_navigateToPage(false,{type: 'linkID',ID: $(thisResource.link).attr("data-pageID")});
				});

			} else if (thisResource.type == "file") {
				// download file
				$resourceRow.find(".resourceLink")
					.attr({
						"href": thisResource.link,
						"download": ""
					})
					.prepend("<span class='sr-only'> " + x_getLangInfo(x_languageData.find("resources").find("table")[0], "downloadBtn", "Download resource") + " </span>");
			}
		}

		// set up the download & view buttons
		$resourceTable.find(".resourceViewBtn").each(function() {
			$(this).button({
				icons: {
					primary: "fa-solid fa-arrow-up-right-from-square"
				},
				label: x_getLangInfo(x_languageData.find("resources").find("table")[0], "viewBtn", "Open resource") + ": " + $(this).parents(".resourceRow").find(".resourceLink").text(),
				text: false
			}).click(function() {
				if ($(this).parents(".resourceRow").find(".resourceLink").is("button")) {
					$(this).parents(".resourceRow").find(".resourceLink").click();
				} else {
					// link - manually open
					window.open($(this).parents(".resourceRow").find(".resourceLink").attr("href"), $(this).parents(".resourceRow").find(".resourceLink").attr("target"));
				}
			});
		});

		$resourceTable.find(".resourceDownloadBtn").each(function() {
			const $temp = $(this).parents(".resourceRow").find(".resourceLink").clone();
			$temp.find(".sr-only").remove();

			$(this).button({
				icons: {
					primary: "fa-solid fa-download"
				},
				label: x_getLangInfo(x_languageData.find("resources").find("table")[0], "downloadBtn", "Download resource") + ": " + $temp.text(),
				text: false
			});
		});

		// set up the complete checkbox - users can manually check to say it's complete
		if (trackCompletion) {
			$resourceTable.find(".resourceComplete").change(function () {
				const resourceIndex = $(this).parents(".resourceRow").index();
				const checked = $(this).is(":checked");
				resourcesInfo[x_currentPage][resourceIndex].complete = checked;

				// mark all resources with an identical link (e.g. on other pages) to the same completion status as this
				for (let i=0; i<resourcesInfo.length; i++) {
					for (let j=0; j<resourcesInfo[i].length; j++) {
						if (!(x_currentPage == i && resourceIndex == j) && resourcesInfo[x_currentPage][resourceIndex].link == resourcesInfo[i][j].link) {
							resourcesInfo[i][j].complete = checked;
						}
					}
				}

				updatePercentage();
			});
		}

		// remove the description column if no resources have a description
		if ($resourceTable.find("td.descriptionCell:empty").length == $resourceTable.find("td.descriptionCell").length) {
			$resourceTable.find(".descriptionCell").remove();
		}

		$.featherlight($resourceHolder, { variant: 'lightboxAuto' });
		updatePercentage();
	}

	// function updates the percentage of resources completed
	function updatePercentage() {
		if (trackCompletion && $("#x_resourcePercentage").length > 0) {
			let completeCount = 0;
			for (let i=0; i<resourcesInfo[x_currentPage].length; i++) {
				if (resourcesInfo[x_currentPage][i].complete) {
					completeCount++;
				}
			}
			$("#x_resourcePercentage .resourcePercentage").html(Math.floor(completeCount / resourcesInfo[x_currentPage].length * 100));
			$x_pageResourcesBtn.find(".completedResourcesNum").html(completeCount);

			if (x_params.resourceBtn != "text") {
				// button has icon only - need to adjust the button title
				$x_pageResourcesBtn.attr("title", $x_pageResourcesBtn.find(".ui-button-text").text());
			}
		}
	}

	// function toggles the visibility of the show hide button on each page
	function showHideBtn() {
		if (resources == true && resourcesInfo[x_currentPage].length > 0) {
			$x_pageResourcesBtn.show();
			// update the no. resources & no. completed resources
			$x_pageResourcesBtn.find(".totalResourcesNum").html(resourcesInfo[x_currentPage].length);
			$x_pageResourcesBtn.find(".completedResourcesNum").html(resourcesInfo[x_currentPage].filter((obj) => obj.complete === true).length);
			$x_pageResourcesBtn.find(".resourceNumberTxt").html(resourcesInfo[x_currentPage].length);

			// button has icon only - need to adjust the button title
			if (x_params.resourceBtn != "text") {
				$x_pageResourcesBtn.attr("title", $x_pageResourcesBtn.find(".ui-button-text").text());
			}
		} else if (resources == true) {
			$x_pageResourcesBtn.hide();
		}
	}

	// function checks whether all resources have been completed on leaving a page and shows a warning if required
	function checkCompletion(x_gotoPage, addHistory) {
		// if there are resources on this page and the warning for incomplete resources is on, show a warning lightbox on page change if not all resources are complete
		if (resources == true && x_gotoPage !== x_currentPage && resourcesInfo[x_currentPage].length > 0 && x_params.resourceCompletion == "true" && x_params.resourceCompletionWarning === "true" && resourcesInfo[x_currentPage].filter(item => item.complete === false).length > 0 && suppressWarning[x_currentPage] == false && !stopWarning) {
			const $resourceWarning = $("<div id='x_resources'></div>");

			if (x_params.resourceCompletionWarningTitle != undefined && x_params.resourceCompletionWarningTitle.trim() != "") {
				$resourceWarning.append("<h1 id='x_resourceHeader'>" + x_params.resourceCompletionWarningTitle + "</h1>");
			}
			if (x_params.resourceCompletionWarningTxt != undefined && x_params.resourceCompletionWarningTxt.trim() != "") {
				$resourceWarning.append("<div id='x_resourceTxt'>" + x_params.resourceCompletionWarningTxt + "</div>");
			}

			// end-users can suppress the 'you have not viewed all resources' message for current page
			$resourceWarning.append("<div id='suppressWarningCheck'><input id='suppressWarning' name='suppressWarning' class='suppressWarning' type='checkbox' /><label for='suppressWarning'>" + x_getLangInfo(x_languageData.find("resources").find("warning")[0], "suppress", "Don't show this message again") + "</label></div>");
			$resourceWarning.find(".suppressWarning").change(function () {
				suppressWarning.splice(x_currentPage, 1, $(this).is(":checked"));
			});

			const continueBtn = "<button class='resourceContinueBtn'>" + x_getLangInfo(x_languageData.find("resources").find("warning")[0], "continue", "Continue anyway") + "</button>";
			const reviewBtn = "<button class='resourceReviewBtn'>" + x_getLangInfo(x_languageData.find("resources").find("warning")[0], "review", "Review the resources") + "</button>";
			$('<div id="suppressWarningBtnHolder"></div>').appendTo($resourceWarning).append(continueBtn).append(reviewBtn);

			$resourceWarning.find(".resourceContinueBtn").button().click(function() {
				// continue changing page
				$.featherlight.current().close();
				x_changePageApproved(x_gotoPage, addHistory);
			});
			$resourceWarning.find(".resourceReviewBtn").button().click(function() {
				// close this lightbox & show the resources lightbox
				$.featherlight.current().close();
				build();
			});

			$.featherlight($resourceWarning, { variant: 'lightboxAuto' });

		} else {
			stopWarning = false; // if this is a page link from a resources window then we have suppressed the warning for this page change - turn this off so it will appear if needed in future
			return true;
		}
	}

	// make some public methods
	self.init = init;
	self.showHideBtn = showHideBtn;
	self.checkCompletion = checkCompletion;

	return parent;

})(jQuery, XENITH || {});