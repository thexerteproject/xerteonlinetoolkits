// all elements, variables and functions for interface are called "x_id" - do not make new id's prefixed with "x_" in page models
var x_languageData	= [],
	x_params		= new Object(), // all attributes of learningObject that aren't undefined
	x_pages,		// xml info about all pages in this LO
	x_pageInfo		= [],	// holds info about pages (type, built, linkID, pageID, savedData) - use savedData if any input from page needs to be saved for use on other pages or on return to this page
	x_currentPage	= -1,
	x_currentPageXML,
	x_glossary		= [],
	x_specialChars	= [],
	x_inputFocus	= false,
	x_dialogInfo	= [], // (type, built)
	x_browserInfo	= {iOS:false, touchScreen:false, mobile:false, orientation:"portrait"}, // holds info about browser/device
	x_pageHistory	= [], // keeps track of pages visited for historic navigation
	x_firstLoad		= true,
	x_fillWindow	= false,
	x_volume		= 1,
	x_audioBarH		= 30,
	x_mediaText		= [],
	x_timer;		// use as reference to any timers in page models - they are cancelled on page change

var $x_window, $x_body, $x_head, $x_mainHolder, $x_mobileScroll, $x_headerBlock, $x_pageHolder, $x_pageDiv, $x_footerBlock, $x_footerL, $x_menuBtn, $x_prevBtn, $x_pageNo, $x_nextBtn, $x_background, $x_glossaryHover;


$(document).ready(function() {
	$x_mainHolder = $("#x_mainHolder");
	$x_mainHolder.css("visibility", "hidden");
	
	if (navigator.userAgent.match(/iPhone/i) != null || navigator.userAgent.match(/iPod/i) != null || navigator.userAgent.match(/iPad/i) != null) {
		x_browserInfo.iOS = true;
	}
	
	x_browserInfo.touchScreen = !!("ontouchstart" in window);
	if (x_browserInfo.touchScreen == true) {
		x_fillWindow = true;
		if (window.orientation == 0 || window.orientation == 180) {
			x_browserInfo.orientation = "portrait";
		} else {
			x_browserInfo.orientation = "landscape";
		}
		
		var mobileTimer = false;
		if (x_browserInfo.iOS == true) {
			// zooming is disabled until 2nd gesture - can't find way around this (otherwise page zooms automatically on orientation change which messes other things up)
			var $viewport = $("#viewport")
			$viewport.attr("content", "width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0");
			$(window)
				.on("gesturestart", function() {
					clearTimeout(mobileTimer);
					$viewport.attr("content", "width=device-width, minimum-scale=1.0, maximum-scale=10.0");
					})
				.on("touchend",function () {
					clearTimeout(mobileTimer);
					mobileTimer = setTimeout(function () {
						$viewport.attr("content", "width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0");
					},1000);
					});
		}
	}
	
	// get xml data and sort it
	$.ajax({
		type: "GET",
		url: x_projectXML,
		dataType: "text",
		success: function(text) {
			// replace all line breaks in attributes with ascii code - otherwise these are replaced with spaces when parsed to xml
			var indexAttr = [],	 // contains objects [startIndex, endIndex] of attributes
				indexCData = [], // contains objects [startIndex, endIndex] of CDATA
				start = true,
				pos = text.indexOf('<![CDATA['),
				i;
			
			while(pos > -1) { // find all CDATA and ignore them when searching for attributes
				if (start == true) {
					var cData = new Object();
					cData.start = pos;
					indexCData.push(cData);
					start = false;
					pos = text.indexOf(']]>', pos+1);
				} else {
					indexCData[indexCData.length - 1].end = pos;
					start = true;
					pos = text.indexOf('<![CDATA[', pos+1);
				}
			}
			start = true;
			pos = text.indexOf('"');
			while(pos > -1) {
				var attribute = true;
				for (i=0; i<indexCData.length; i++) {
					if (indexCData[i].start < pos && indexCData[i].end > pos) {
						attribute = false; // ignore as in CDATA
					}
				}
				if (attribute == true) {
					if (start == true) {
						start = false;
						var attr = new Object();
						attr.start = pos;
						indexAttr.push(attr);
					} else {
						start = true;
						indexAttr[indexAttr.length-1].end = pos;
					}
				}
				pos = text.indexOf('"', pos+1);
			}
			
			var newString = "";
			for (i=0; i<indexAttr.length; i++) {
				if (i == 0) {
					newString += text.substring(0, indexAttr[i].start);
				} else {
					newString += text.substring(indexAttr[i - 1].end, indexAttr[i].start);
				}
				newString += text.substring(indexAttr[i].start, indexAttr[i].end).replace(/(\n|\r|\r\n)/g, "&#10;");
				if (i == indexAttr.length - 1) {
					newString += text.substring(indexAttr[i].end, text.length);
				}
			}
			
			var xmlData = $($.parseXML(newString)).find("learningObject");
			for (i=0; i<xmlData[0].attributes.length; i++) {
				x_params[xmlData[0].attributes[i].name] = xmlData[0].attributes[i].value;
			}
			
			x_pages = xmlData.children();
			x_pages.each(function() {
                var linkID = $(this)[0].getAttribute("linkID"),
					pageID = $(this)[0].getAttribute("pageID"),
					page = new Object();
				
				page.type = $(this)[0].nodeName;
				page.built = false;
                if (linkID != undefined) {
					page.linkID = linkID;
				}
                if (pageID != undefined && pageID != "Unique ID for this page") { // ** this shouldn't use fixed english string
					page.pageID = pageID;
				}
				x_pageInfo.push(page);
			});
			
			if (x_params.navigation == undefined) {
				x_params.navigation = "Linear";
			}
			if (x_params.navigation != "Linear" && x_params.navigation != "Historic" && x_params.navigation != undefined) { // 1st page is menu
				x_pages.splice(0, 0, "menu");
				var page = new Object();
				page.type = "menu";
				page.built = false;
				x_pageInfo.splice(0, 0, page);
			}
			
			x_getLangData(x_params.language);
			
            // Setup nr of pages for tracking
            XTSetOption('nrpages', x_pageInfo.length);
            if (x_params.trackingMode != undefined) {
                XTSetOption('tracking-mode', x_params.trackingMode);
            }
		},
		error: function() {
			// can't have translation for this as if it fails to load we don't know what language file to use?
			$("body").append("<p>The project data has not loaded.</p>");
		}
	});

});


// function gets data from language file
function x_getLangData(lang) {
	if (lang == undefined || lang == "undefined") {
		lang = "en-GB";
	}
	$.ajax({
		type: "GET",
		url: "languages/engine_" + lang + ".xml",
		dataType: "xml",
		success: function(xml) {
			x_languageData = $(xml).find("language");
			x_setUp();
		},
		error: function() {
			if (lang != "en-GB") { // no language file found - try default GB one
				x_getLangData("en-GB");
			} else { // hasn't found GB language file - set up anyway, will use fallback text in code
				x_languageData = $("");
				x_setUp();
			}
		}
	});
}


// function sets up interface buttons and events
function x_setUp() {
	$x_head			= $("head");
	$x_body			= $("body");
	$x_window		= $(window);
	$x_mobileScroll	= $("#x_mobileScroll");
	$x_headerBlock	= $("#x_headerBlock");
	$x_pageHolder	= $("#x_pageHolder");
	$x_pageDiv		= $("#x_pageDiv");
	$x_footerBlock	= $("#x_footerBlock");
	$x_footerL		= $("#x_footerBlock .x_floatLeft");
	$x_menuBtn		= $("#x_menuBtn");
	$x_prevBtn		= $("#x_prevBtn");
	$x_pageNo		= $("#x_pageNo");
	$x_nextBtn		= $("#x_nextBtn");
	$x_background	= $("#x_background");
	
	$x_body.css("font-size", Number(x_params.textSize) - 2 + "pt");
	
	if (screen.width <= 550) {
		x_browserInfo.mobile = true;
		x_insertCSS(x_templateLocation + "common_html5/css/mobileStyles.css");
	} else {
		x_insertCSS(x_templateLocation + "common_html5/css/desktopStyles.css");
		
		if (x_browserInfo.touchScreen == false) {
			$x_footerL.prepend('<button id="x_cssBtn"></button>');
			$("#x_cssBtn")
				.button({
					icons:	{primary: "x_maximise"},
					label: 	x_getLangInfo(x_languageData.find("sizes").find("item")[3], false, "Full screen"),
					text:	false
				})
				.click(function() {
					if (x_fillWindow == false) {
						x_setFillWindow();
					} else {
						$x_mainHolder.css({
							"width"		:"",
							"height"	:""
							});
						$x_body.css("overflow", "auto");
						$(this).button({
							icons:	{primary: "x_maximise"},
							label:	x_getLangInfo(x_languageData.find("sizes").find("item")[3], false, "Full screen")
						});
						x_fillWindow = false;
						x_updateCss();
					}
					$(this)
						.blur()
						.removeClass("ui-state-focus")
						.removeClass("ui-state-hover");
				});
			
			if (x_params.displayMode == "full screen" || x_params.displayMode == "fill window") {
				x_fillWindow = true;
			}
		}
		
		if (x_fillWindow == true) {
			x_setFillWindow(false);
		}
	}
	
	
	if (x_params.stylesheet != undefined) {
		x_insertCSS(eval(x_params.stylesheet));
	}
	
	
	if (x_pageInfo[0].type == "menu") {
		$x_pageNo.hide();
		if (x_params.navigation == "Menu") {
			$x_prevBtn.hide();
			$x_nextBtn.hide();
			$x_footerBlock.find(".x_floatRight button:eq(0)").css("border-right", "0px");
		}
	} else if (x_params.navigation == "Historic") {
		$x_pageNo.hide();
	} else {
		var dialog = new Object();
		dialog.type = "menu";
		dialog.built = false;
		x_dialogInfo.push(dialog);
	}
	
	
	if (x_params.nfo != undefined) {
		$x_footerL.prepend('<button id="x_helpBtn"></button>');
		$("#x_helpBtn")
			.button({
				icons: {
					primary: "x_help"
				},
				label:	x_getLangInfo(x_languageData.find("helpButton")[0], "label", "Help"),
				text:	false
			})
			.click(function() {
				window.open(eval(x_params.nfo), "_blank");
				$(this)
					.blur()
					.removeClass("ui-state-focus")
					.removeClass("ui-state-hover");
			});
	}
	
	
	if (x_params.glossary != undefined) {
		var dialog = new Object();
		dialog.type = "glossary";
		dialog.built = false;
		x_dialogInfo.push(dialog);
		
		var items = x_params.glossary.split("||");
		for (var i=0; i<items.length; i++) {
			var	item = items[i].split("|"),
				word = new Object();
			word.word = item[0];
			word.definition = item[1];
			if (word.word.replace(/^\s+|\s+$/g, "") != "" && word.definition.replace(/^\s+|\s+$/g, "") != "") {
				x_glossary.push(word);
			}
		}
		if (x_glossary.length > 0) {
			x_glossary.sort(function(a, b){ // sort alphabetically
				var word1 = a.word.toLowerCase(), word2 = b.word.toLowerCase();
				if (word1 < word2) {
					return -1;
				} else if (word1 > word2) {
					return 1;
				} else {
					return 0;
				}
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
				.click(function() {
					x_openDialog("glossary", x_getLangInfo(x_languageData.find("glossary")[0], "label", "Glossary"), x_getLangInfo(x_languageData.find("glossary").find("closeButton")[0], "description", "Close Glossary List Button"));
					$(this)
						.blur()
						.removeClass("ui-state-focus")
						.removeClass("ui-state-hover");
				});
			
			$x_pageDiv
				.on("mouseenter", ".x_glossary", function(e) {
					var $this = $(this),
						myText = $this.text(),
						myDefinition;
					
					for (var i=0; i<x_glossary.length; i++) {
						if (myText.toLowerCase() == x_glossary[i].word.toLowerCase()) {
							myDefinition = "<b>" + myText + ":</b><br/>" + x_glossary[i].definition;
						}
					}
					$x_mainHolder.append('<div id="x_glossaryHover" class="x_tooltip">' + myDefinition + '</div>');
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
					$x_glossaryHover.remove();
				})
				.on("mousemove", ".x_glossary", function(e) {
					var leftPos,
						topPos = e.pageY + 20;
					
					if (x_browserInfo.mobile == false) {
						leftPos = e.pageX + 20;
						if (e.pageX + 250 > $x_mainHolder.width()) {
							leftPos = e.pageX - 220;
						}
						if (topPos > $x_pageHolder.height()) {
							topPos = $(this).offset().top - $x_glossaryHover.height() - 10;
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
					$x_mainHolder.off("click.glossary");
					$x_glossaryHover.remove();
				});
		}
	}
	
	
	if (x_params.media != undefined) {
		$x_footerL.prepend('<button id="x_mediaBtn"></button>');
		$("#x_mediaBtn")
			.button({
				icons: {
					primary: "x_media"
				},
				label:	x_getLangInfo(x_languageData.find("mediaButton")[0], "label", "Media"),
				text:	false
			})
			.click(function() {
				$(this)
					.blur()
					.removeClass("ui-state-focus")
					.removeClass("ui-state-hover");
				
				// get info about how to display captions - if none are found the code in the mediaViewer folder will look for details in tt file - otherwise it will use defaults
				var	captionDetails = "",
					nodeNames = ["mediaTiming", "mediaPosition", "mediaAlign", "mediaColour", "mediaHighlight", "mediaHighlightColour"];
				for (var i=0; i<nodeNames.length; i++) {
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
				
				window.open("mediaViewer/media.htm?media=../" + eval(x_params.media) + ",transcript=../" + eval(x_params.mediaTranscript) + ",img=../" + eval(x_params.mediaImage) + ",caption=" + captionDetails, "_blank", 'MediaViewer', 'height=100,width=100,toolbar=0,menubar=0');
			});
	}
	
	
	if (x_params.ic != undefined && x_params.ic != "") {
		$x_headerBlock.prepend('<img src="' + eval(x_params.ic) + '" class="x_floatLeft" />');
	}
	
	// ignores x_params.allpagestitlesize if added as optional property as the header bar will resize to fit any title
	$("#x_headerBlock h1").html(x_params.name);
	
	
	var prevIcon = "x_prev";
	if (x_params.navigation == "Historic") {
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
		.click(function() {
			if (x_params.navigation != "Historic") {
				x_changePage(x_currentPage -1);
			} else {
				var prevPage = x_pageHistory[x_pageHistory.length-2];
				x_pageHistory.splice(x_pageHistory.length - 2, 2);
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
		.click(function() {
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
	}
	
	$x_menuBtn
		.button({
			icons: {
				primary: menuIcon
			},
			label:	menuLabel,
			text:	false
		})
		.click(function() {
			if (x_params.navigation == "Linear" || x_params.navigation == undefined) {
				x_openDialog("menu", x_getLangInfo(x_languageData.find("toc")[0], "label", "Table of Contents"), x_getLangInfo(x_languageData.find("toc").find("closeButton")[0], "description", "Close Table of Contents"));
			} else {
				x_changePage(0);
			}
			$(this)
				.blur()
				.removeClass("ui-state-focus")
				.removeClass("ui-state-hover");
		});
	
	
	if (x_params.kblanguage != undefined) {
		$.ajax({
			type: "GET",
			url: x_templateLocation + "common_html5/charPad.xml",
			dataType: "xml",
			success: function(xml) {
				var dialog = new Object();
				dialog.type = "language";
				dialog.built = false;
				x_dialogInfo.push(dialog);
				
				var $charPadData = $(xml).find("data").find("language[name='" + x_params.kblanguage + "']"),
					specCharsLower = $charPadData.find("char[case='lower']").text().split(""),
					specCharsUpper = $charPadData.find("char[case='upper']").text().split("");
				
				for (var i=0; i<specCharsLower.length; i++) {
					var specChar = new Object();
					specChar.lower = specCharsLower[i];
					specChar.upper = specCharsUpper[i];
					x_specialChars.push(specChar);
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
			},
			error: function() {
				delete x_params["kblanguage"];
			}
		});
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
		x_updateCss();
	});
	
	
	// ** swipe to change page on touch screen devices - taken out as caused problems with drag and drop activities - need to be able to disable it for these activities
	if (x_browserInfo.touchScreen == true) {
		/*
		var numTouches = 0;
		var mouseDown = [0, 0]; // [x, y]
		var mouseUp = [0, 0];
		*/
		
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
					x_updateCss();
				}
			}
		});
	}
	
	
	if (x_params.background != undefined && x_params.background != "") {
		var alpha = 30;
		if (x_params.backgroundopacity != undefined) {
			alpha = x_params.backgroundopacity;
		}
		$x_background.append('<img id="x_mainBg" src="' + eval(x_params.background) + '"/>');
		$("#x_mainBg").css({
			"opacity"	:Number(alpha/100),
			"filter"	:"alpha(opacity=" + alpha + ")"
		});
	}
	
	
	// store language data for mediaelement buttons - use fallbacks in mediaElementText array if no lang data
	var mediaElementText = [{name:"stopButton", label:"Stop", description:"Stop Media Button"},{name:"playPauseButton", label:"Play/Pause", description:"Play/Pause Media Button"},{name:"muteButton", label:"Mute Toggle", description:"Toggle Mute Button"},{name:"fullscreenButton", label:"Fullscreen", description:"Fullscreen Movie Button"},{name:"captionsButton", label:"Captions/Subtitles", description:"Show/Hide Captions Button"}];
	
	for (var i=0; i<mediaElementText.length; i++) {
		var mediaTextObj = new Object();
		mediaTextObj.label = x_getLangInfo(x_languageData.find("mediaElementControls").find(mediaElementText[i].name)[0], "label", mediaElementText[i].label[0]);
		mediaTextObj.description = x_getLangInfo(x_languageData.find("mediaElementControls").find(mediaElementText[i].name)[0], "description", mediaElementText[i].description[0]);
		x_mediaText.push(mediaTextObj);
	}
	
	
    x_navigateToPage(true, x_startPage);
}


// function called after interface first setup (to load 1st page) and for links to other pages in the text on a page
function x_navigateToPage(force, pageInfo) { // pageInfo = {type, ID}
    var page;
	if (pageInfo.type == "resume" && (parseInt(pageInfo.ID) > 0)  && (parseInt(pageInfo.ID) <= x_pages.length)) {
        x_changePage(parseInt(pageInfo.ID) - 1);
		
    } else if (pageInfo.type == "linkID" || pageInfo.type == "pageID") {
        page = x_lookupPage(pageInfo.type, pageInfo.ID);
        if (page != null) {
            x_changePage(page);
        } else if (force == true) {
            x_changePage(0);
        }
		
    } else {
        page = parseInt(pageInfo.ID);
        if (page > 0 && page <= x_pages.length) {
            x_changePage(page-1);
        } else if (force == true) {
			x_changePage(0);
        }
    }
}


// function returns page no. of page with matching linkID / pageID
function x_lookupPage(pageType, pageID) {
    var i, len = x_pageInfo.length;
    for (i=0; i<len; i++) {
        if ((pageType == "linkID" && x_pageInfo[i].linkID && x_pageInfo[i].linkID == pageID) ||
			(pageType == "pageID" && x_pageInfo[i].pageID && x_pageInfo[i].pageID == pageID)) {
            break;
        }
    }
	
    if (i != len) {
        return i;
    } else {
        return null;
    }
}


// function called on page change to remove old page and load new page model
// If x_currentPage == -1, than do not try to exit tracking of the page
function x_changePage(x_gotoPage) {
	var prevPage = x_currentPage;
	
    // End page tracking of x_currentPage
    if (x_currentPage != -1 &&  (x_currentPage != 0 || x_pageInfo[0].type != "menu") && x_currentPage != x_gotoPage) {
        XTExitPage(x_currentPage, x_currentPageXML.getAttribute("name"));
    }
    x_currentPage = x_gotoPage;
	x_currentPageXML = x_pages[x_currentPage];
	
	
	if ($x_pageDiv.children().length > 0) {
		// remove everything specific to previous page that's outside $x_pageDiv
		$("#pageBg").remove();
		$("#x_pageNarration").remove(); // narration flash / html5 audio player
		$("body div.me-plugin:not(#x_pageHolder div.me-plugin)").remove();
		$(".x_popupDialog").parent().detach();
		$("#x_pageTimer").remove();
		$(document).add($x_pageHolder).off(".pageEvent"); // any events in page models added to document or pageHolder should have this namespace so they can be removed on page change - see hangman.html for example
		
		// stop any swfs on old page before detaching it so that any audio stops playing (problem in IE only)
		if ($x_pageDiv.find("object").length > 0) {
			var	$obj = $x_pageDiv.find("object"),
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
	
	if (x_params.navigation == "Historic") {
		x_pageHistory.push(x_currentPage);
	}
	
	// change page title and add narration / timer before the new page loads so $x_pageHolder margins can be sorted - these often need to be right so page layout is calculated correctly
    if (x_pageInfo[0].type == "menu" && x_currentPage == 0) {
        pageTitle = x_getLangInfo(x_languageData.find("toc")[0], "label", "Table of Contents");
    } else {
        pageTitle = x_currentPageXML.getAttribute("name");
		x_addNarration();
		x_addCountdownTimer();
    }
	$("#x_headerBlock h2").html(pageTitle);
	
	x_updateCss(false);
	
	
	// x_currentPage has already been viewed so is already loaded
    if (x_pageInfo[x_currentPage].built != false) {
        // Start page tracking -- NOTE: You HAVE to do this before pageLoad and/or Page setup, because pageload could trigger XTSetPageType and/or XTEnterInteraction
        XTEnterPage(x_currentPage, pageTitle);

        var builtPage = x_pageInfo[x_currentPage].built;
		$x_pageDiv.append(builtPage);
		builtPage.hide();
		builtPage.fadeIn();
		
		x_setUpPage();
		
		// calls function in current page model which does anything needed to reset the page (if it needs to be reset)
		if (x_pageInfo[x_currentPage].type == "text") {
			simpleText.pageChanged(); // errors if you just call text.pageChanged()
		} else {
			eval(x_pageInfo[x_currentPage].type).pageChanged();
		}
		// calls function in any customHTML that's been loaded into page
		if ($(".customHTMLHolder").length > 0) {
			try { customHTML.pageChanged(); } catch(e) {};
		}
		
		// checks if size has changed since last load - if it has, call function in current page model which does anything needed to adjust for the change
		var prevSize = builtPage.data("size");
		if (prevSize[0] != $x_mainHolder.width() || prevSize[1] != $x_mainHolder.height()) {
			if (x_pageInfo[x_currentPage].type == "text") {
				simpleText.sizeChanged();
			} else {
				eval(x_pageInfo[x_currentPage].type).sizeChanged();
			}
			// calls function in any customHTML that's been loaded into page
			if ($(".customHTMLHolder").length > 0) {
				try { customHTML.sizeChanged(); } catch(e) {};
			}
		}
		
	// x_currentPage hasn't been viewed previously - load model file
	} else {
		$x_pageDiv.append('<div id="x_page' + x_currentPage + '"></div>');
		$("#x_page" + x_currentPage).css("visibility", "hidden");
		
		if (x_currentPage != 0 || x_pageInfo[0].type != "menu") {
			x_findText(x_currentPageXML); // check page text for anything that might need replacing / tags inserting (e.g. glossary words, links...)
		}
		
        // Start page tracking -- NOTE: You HAVE to do this before pageLoad and/or Page setup, because pageload could trigger XTSetPageType and/or XTEnterInteraction
        XTEnterPage(x_currentPage, pageTitle);

		$("#x_page" + x_currentPage).load(x_templateLocation + "models_html5/" + x_pageInfo[x_currentPage].type + ".html", x_loadPage);
	}
	
	x_updateHash();
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
	
    // Queue reparsing of MathJax
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	
	x_setUpPage();
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
	} else if (x_params.navigation != "Historic" || (x_params.navigation == "Historic" && x_pageHistory.length <= 1)) {
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
	
	if (x_pageInfo[0].type != "menu" || (x_pageInfo[0].type == "menu" && x_currentPage != 0)) {
		if (x_currentPageXML.getAttribute("navSetting") != undefined) {
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
	}
	
	
	if (x_firstLoad == true) {
		$x_mainHolder.css("visibility", "visible");
		x_firstLoad = false;
	}
}


// function called from each model when fully loaded to trigger fadeIn
function x_pageLoaded() {
	x_pageInfo[x_currentPage].built = $("#x_page" + x_currentPage);
	
	$("#x_page" + x_currentPage)
		.hide()
		.css("visibility", "visible")
		.fadeIn();
}


// function adds / reloads narration bar above main controls on interface
function x_addNarration() {
	if (x_currentPageXML.getAttribute("narration") != null && x_currentPageXML.getAttribute("narration") != "") {
		$("#x_footerBlock div:first").before('<div id="x_pageNarration"></div>');
		$("#x_footerBlock #x_pageNarration").mediaPlayer({
			type		:"audio",
			source		:x_currentPageXML.getAttribute("narration"),
			width		:"100%",
			autoPlay	:x_currentPageXML.getAttribute("playNarration"),
			autoNavigate:x_currentPageXML.getAttribute("narrationNavigate")
		});
	}
}


// function adds timer bar above main controls on interface - optional property that can be added to any interactivity page
function x_addCountdownTimer() {
	var x_timerLangInfo = [x_getLangInfo(x_languageData.find("timer").find("remaining")[0], "name", "Time remaining"), x_getLangInfo(x_languageData.find("timer").find("timeUp")[0], "name", "Time up"), x_getLangInfo(x_languageData.find("timer").find("seconds")[0], "name", "seconds")];
	
	var x_countdownTicker = function () {
		x_countdownTimer--;
		if (x_countdownTimer > 0) {
			$("#x_footerBlock #x_pageTimer").html(x_timerLangInfo[0] + ": " + x_formatCountdownTimer());
			
		} else {
			window.clearInterval(x_timer);
			$("#x_footerBlock #x_pageTimer").html(x_timerLangInfo[1]);
		}
	};
	
	var x_formatCountdownTimer = function () {
		var dd = function (x) { return (x<10 ? "0"+x : x); };
		
		var hours	= Math.floor(x_countdownTimer / 3600),
			minutes	= Math.floor(x_countdownTimer / 60),
			seconds	= x_countdownTimer % 60;

		if (hours > 0) {
			return hours + ":" + dd(minutes) + ":" + dd(seconds);
		} else if (minutes > 0) {
			return dd(minutes) + ":" + dd(seconds);
		} else {
			return seconds + " " + x_timerLangInfo[2];
		}
	};
	
	var x_countdownTimer;
	if (x_currentPageXML.getAttribute("timer") != null && x_currentPageXML.getAttribute("timer") != "") {
		clearInterval(x_timer);
		$("#x_footerBlock div:first").before('<div id="x_pageTimer"></div>');
		x_countdownTimer = parseInt(x_currentPageXML.getAttribute("timer"));
		$("#x_footerBlock #x_pageTimer").html(x_timerLangInfo[0] + ": " + x_formatCountdownTimer());
		x_timer = window.setInterval(x_countdownTicker, 1000);
	}
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
			x_addNarration();
		}
	}
	
	$x_pageHolder.css("margin-bottom", $x_footerBlock.height());
	$x_background.css("margin-bottom", $x_footerBlock.height());
	if (x_browserInfo.mobile == false) {
		$x_pageHolder.css("margin-top", $x_headerBlock.height());
		$x_background.css("margin-top", $x_headerBlock.height());
	}
	$x_pageHolder.height($x_mainHolder.height() - parseInt($x_pageHolder.css("margin-bottom")) - parseInt($x_pageHolder.css("margin-top"))); // fix for Opera - css in other browsers do this automatically
	
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
function x_openDialog(type, title, close, position, load) {
	var index = -1;
	for (var i=0; i<x_dialogInfo.length; i++) {
		if (x_dialogInfo[i].type == type) {
			index = i;
			break;
		}
	}
	if (index != -1) {
		$(".x_popupDialog").parent().detach();
		if (x_dialogInfo[index].built != false) {
			$x_body.append(x_dialogInfo[index].built);
			
			if (load != undefined) {
				x_dialogInfo[index].built.children(".x_popupDialog").html(load);
			}
			
			if (type != "language") {
				x_setDialogSize(x_dialogInfo[index].built.children(".x_popupDialog"), position);
			} else {
				x_dialogInfo[index].built.show(); // don't reset size / position for language dialogs
				language.turnOnKeyEvents();
			}
			
		} else {
			$x_body.append('<div id="x_' + type + '" class="x_popupDialog"></div>');
			
			var $x_popupDialog = $("#x_" + type);
			$x_popupDialog
				.dialog({
					closeOnEscape:	true,
					title:			title,
					closeText:		close,
					close: function() {$x_popupDialog.parent().detach();}
					})
				.parent().hide();
			
			if (load == undefined) { // load dialog contents from a file in the models_html5 folder called [type].html
				$x_popupDialog.load(x_templateLocation + "models_html5/" + type + ".html", function() {x_setDialogSize($x_popupDialog, position)});
				
			} else {
				$x_popupDialog.html(load);
				x_setDialogSize($x_popupDialog, position);
			}
			
			x_dialogInfo[index].built = $x_popupDialog.parent();
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
		"width"	:width
	});
	$x_popupDialog.parent().css({
		"left"	:left,
		"top"	:top
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
function x_findText(pageXML) {
	var	attrToCheck = ["text", "instruction", "instructions", "answer", "description", "prompt", "hint", "feedback", "summary", "intro", "txt", "goals", "audience", "prereq", "howto"],
		i, j;
	
	for (i=0; i<pageXML.attributes.length; i++) {
		for (j=0; j<attrToCheck.length; j++) {
			if (pageXML.attributes[i].name == attrToCheck[j]) {
				x_insertText(pageXML.attributes[i]);
				break;
			}
		}
	}
	
	for (i=0; i<pageXML.childNodes.length; i++) {
		if (pageXML.childNodes[i].nodeValue == null) {
			x_findText(pageXML.childNodes[i]); // it's a child node of node - check through this too
		} else {
			if (pageXML.childNodes[i].nodeValue.replace(/^\s+|\s+$/g, "") != "") { // not blank
				x_insertText(pageXML.childNodes[i]);
			}
		}
	}
}


// function adds glossary links, LaTeX, page links to text found in x_findText function
function x_insertText(node) {
	var tempText = node.nodeValue;
	
	// check text for glossary words - if found replace with a link
	if (x_glossary.length > 0) {
		for (var k=0; k<x_glossary.length; k++) {
			var regExp = new RegExp('(^|\\s)(' + x_glossary[k].word + ')([\\s\\.,!?]|$)', 'i');
			tempText = tempText.replace(regExp, '$1<a class="x_glossary" href="#" title="' + x_glossary[k].definition + '">$2</a>$3');
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
    tempText = tempText.replace(regExp, 'href="#" onclick="x_navigateToPage(false, {type : \'linkID\', ID : \'$1\'});return false;">');
	
	node.nodeValue = tempText;
}


// function maximises LO size to fit window
function x_setFillWindow(updatePage) {
	$x_mainHolder.css({
		"width"		:"100%",
		"height"	:"100%"
	});
	
	$x_body.css("overflow", "hidden");
	x_updateCss(updatePage);
	window.scrolling = false;
	
	$("#x_cssBtn").button({
		icons:	{primary: "x_minimise"},
		label: 	x_getLangInfo(x_languageData.find("sizes").find("item")[0], false, "Default")
	});
	
	x_fillWindow = true;
}


// function applies CSS file to page - can't do this using media attribute in link tag or the jQuery way as in IE the page won't update with new styles
function x_insertCSS(href) {
	var css = document.createElement("link");
	css.rel = "stylesheet";
	css.href = href;
	css.type = "text/css";
	document.getElementsByTagName("head")[0].appendChild(css);
}



// ___ FUNCTIONS CALLED FROM PAGE MODELS ___

// function called from model pages to scale images - scale, firstScale & setH are optional
function x_scaleImg(img, maxW, maxH, scale, firstScale, setH) {
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
		
		if (imgW > maxW || imgH > maxH || firstScale != true) {
			if (imgW > maxW) {
				var scale = maxW / imgW;
				imgW = imgW * scale;
				imgH = imgH * scale;
			}
			if (imgH > maxH) {
				var scale = maxH / imgH;
				imgH = imgH * scale;
				imgW = imgW * scale;
			}
			imgW = Math.round(imgW);
			imgH = Math.round(imgH);
			$img.css("width", imgW + "px"); // set width only to constrain proportions
			
			if (setH == true) {
				$img.css("height", imgH + "px"); // in some places the height also needs to be set - normally it will keep proportions right just by changing the width
			}
		}
	}
	
	$img.css("visibility", "visible"); // kept hidden until resize is done
}


// function called from model pages - swaps line breaks in xml text attributes and CDATA to br tags
function x_addLineBreaks(text) {
	if (text.indexOf("<math>") == -1 && text.indexOf("<table>") == -1) {
		return text.replace(/(\n|\r|\r\n)/g, "<br />");
		
	} else { // ignore any line breaks inside these tags as they don't work correctly with <br>
		var newText = text;
		if (newText.indexOf("<math>") != -1) { // math tag found
			var tempText = "",
				mathNum = 0;
			
			while (newText.indexOf("<math>", mathNum) != -1) {
				var text1 = newText.substring(mathNum, newText.indexOf("<math>", mathNum)),
					tableNum = 0;
				while (text1.indexOf("<table>", tableNum) != -1) { // check for table tags before/between math tags
					tempText += text1.substring(tableNum, text1.indexOf("<table>", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
					tempText += text1.substring(text1.indexOf("<table>", tableNum), text1.indexOf("</table>", tableNum) + 8);
					tableNum = text1.indexOf("</table>", tableNum) + 8;
				}
				tempText += text1.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
				tempText += newText.substring(newText.indexOf("<math>", mathNum), newText.indexOf("</math>", mathNum) + 7);
				mathNum = newText.indexOf("</math>", mathNum) + 7;
			}
			
			var text2 = newText.substring(mathNum),
				tableNum = 0;
			while (text2.indexOf("<table>", tableNum) != -1) { // check for table tags after math tags
				tempText += text2.substring(tableNum, text2.indexOf("<table>", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
				tempText += text2.substring(text2.indexOf("<table>", tableNum), text2.indexOf("</table>", tableNum) + 8);
				tableNum = text2.indexOf("</table>", tableNum) + 8;
			}
			tempText += text2.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
			newText = tempText;
			
		} else if (newText.indexOf("<table>") != -1) { // no math tags - so just check table tags
			var tempText = "",
				tableNum = 0;
			while (newText.indexOf("<table>", tableNum) != -1) {
				tempText += newText.substring(tableNum, newText.indexOf("<table>", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
				tempText += newText.substring(newText.indexOf("<table>", tableNum), newText.indexOf("</table>", tableNum) + 8);
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
	var initObject;
	if (initObj != undefined && initObj != "") {
		if (initObj.substring(0,1) == "{") { // object - just doing eval or parseJSON won't work
			var	temp = initObj.replace("{", "").replace("}", "").split(","),
				initObject = new Object();
			for (var i=0; i<temp.length; i++) {
				initObject[$.trim(temp[i].split(":")[0])] = eval($.trim(temp[i].split(":")[1]));
			}
		} else {
			initObject = initObj;
		}
	} else {
		initObject = undefined;
	}
	return initObject;
}