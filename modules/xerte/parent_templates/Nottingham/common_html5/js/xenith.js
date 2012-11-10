// all elements, variables and functions for interface are called "x_id" - do not use id's prefixed with "x_" in page models
var x_languageData	= [];
var x_params		= new Object(); // all attributes of learningObject that aren't undefined  ** all code for x_params data is written except authorSupport - remember to use when making the Connectors pages **
var x_pages;		// xml info about all pages in this LO
var x_pageInfo		= [];	// holds info about pages (type, built, linkID, pageID)
var x_currentPage	= 0;
var x_currentPageXML;
var x_glossary		= [];
var x_specialChars	= [];
var x_inputFocus	= false;
var x_dialogInfo	= []; // (type, built)
var x_browserInfo	= {iOS:false, touchScreen:false, mobile:false, orientation:"portrait"}; // holds info about browser/device

var x_firstLoad		= true;
var x_fillWindow	= false;
var x_volume		= 1;
var x_audioBarH		= 30;
var x_timer;		// use as reference to any timers in page models - they are cancelled on page change

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
				.bind("gesturestart", function() {
					clearTimeout(mobileTimer);
					$viewport.attr("content", "width=device-width, minimum-scale=1.0, maximum-scale=10.0");
					})
				.bind("touchend",function () {
					clearTimeout(mobileTimer);
					mobileTimer = setTimeout(function () {
						$viewport.attr("content", "width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0");
					},1000);
					});
		}
	}
	
	// get xml data and sorts it
	$.ajax({
		type: "GET",
		url: x_projectXML,
		dataType: "text",
		success: function(text) {
			// replace all line breaks in attributes with ascii code - otherwise these are replaced with spaces when parsed to xml
			var indexAttr = [];	 // contains objects [startIndex, endIndex] of attributes
			var indexCData = []; // contains objects [startIndex, endIndex] of CDATA
			var start = true;
			var pos = text.indexOf('<![CDATA[');
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
				for (var i=0; i<indexCData.length; i++) {
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
			for (var i=0; i<indexAttr.length; i++) {
				if (i == 0) {
					newString += text.substring(0, indexAttr[i].start);
				} else {
					newString += text.substring(indexAttr[i - 1].end, indexAttr[i].start);
				}
				newString += text.substring(indexAttr[i].start, indexAttr[i].end).replace(/\n/g, "&#10;");
				if (i == indexAttr.length - 1) {
					newString += text.substring(indexAttr[i].end, text.length);
				}
			}
			
			var xmlData = $($.parseXML(newString)).find("learningObject");
			for (var i=0; i<xmlData[0].attributes.length; i++) {
				x_params[xmlData[0].attributes[i].name] = xmlData[0].attributes[i].value;
			}
			
			x_pages = xmlData.children();
			x_pages.each(function() {
                var linkID = $(this)[0].getAttribute("linkID");
                var pageID = $(this)[0].getAttribute("pageID");
				var page = new Object();
				page.type = $(this)[0].nodeName;
				page.built = false;
                if (linkID != undefined) page.linkID = linkID;
                if (pageID != undefined && pageID != "Unique ID for this page") page.pageID = pageID;
				x_pageInfo.push(page);
			});
			if (x_params.navigation != "Linear" && x_params.navigation != undefined) { // 1st page is menu
				x_pages.splice(0, 0, "menu");
				var page = new Object();
				page.type = "menu";
				page.built = false;
				x_pageInfo.splice(0, 0, page);
			}
			
			x_getLangData(x_params.language);
		},
		error: function() {
			// can't have translation for this as if it fails to load we don't know what language file to use?
			$("body").append("<p>The project data has not loaded.");
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
	
	$x_body.css("font-size", Number(x_params.textSize) + "pt");
	
	if (screen.width <= 550) {
		x_browserInfo.mobile = true;
		x_insertCSS(x_templateLocation + "common_html5/css/mobileStyles.css");
	} else {
		x_insertCSS(x_templateLocation + "common_html5/css/desktopStyles.css");
		
		if (x_browserInfo.touchScreen == false) {
			$x_footerL.prepend('<button id="x_cssBtn"></button>');
			$("#x_cssBtn")
				.button({
					icons:			{primary: "x_maximise"},
					label: 			x_getLangInfo(x_languageData.find("sizes").find("item")[3], false, "Full screen"),
					text: false
				})
				.click(function() {
					if (x_fillWindow == false) {
						x_setFillWindow(true);
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
						x_updateCss(true);
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
		x_insertCSS(x_params.stylesheet);
	}
	
	if (x_pageInfo[0].type == "menu") {
		$x_pageNo.hide();
		if (x_params.navigation == "Menu") {
			$x_prevBtn.hide();
			$x_nextBtn.hide();
			$x_footerBlock.find(".x_floatRight button:eq(0)").css("border-right", "0px");
		}
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
				label: 			x_getLangInfo(x_languageData.find("helpButton")[0], "label", "Help"),
				text: false
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
			var item = items[i].split("|");
			var word = new Object();
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
					label: 			x_getLangInfo(x_languageData.find("glossaryButton")[0], "label", "Glossary"),
					text: false
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
					var $this = $(this);
					var myText = $this.text();
					var myDefinition;
					for (var i=0; i<x_glossary.length; i++) {
						if (myText.toLowerCase() == x_glossary[i].word.toLowerCase()) {
							myDefinition = "<b>" + myText + ":</b><br/>" + x_glossary[i].definition;
						}
					}
					$x_mainHolder.append('<div id="x_glossaryHover">' + myDefinition + '</div>');
					$x_glossaryHover = $("#x_glossaryHover");
					$x_glossaryHover.css({
						"left"	:$(this).offset().left + 20,
						"top"	:$(this).offset().top + 20
						});
					$x_glossaryHover.fadeIn("slow");
					if (x_browserInfo.touchScreen == true) {
						$x_mainHolder.bind("click", function() {}); // needed so that mouseleave works on touch screen devices
					}
					})
				.on("mouseleave", ".x_glossary", function(e) {
					$x_mainHolder.unbind("click");
					$x_glossaryHover.remove();
					})
				.on("mousemove", ".x_glossary", function(e) {
					var leftPos;
					var topPos = e.pageY + 20;
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
					$x_mainHolder.unbind("click");
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
				label: 			x_getLangInfo(x_languageData.find("mediaButton")[0], "label", "Media"),
				text: false
			})
			.click(function() {
				$(this)
					.blur()
					.removeClass("ui-state-focus")
					.removeClass("ui-state-hover");
				
				var mediaFile = x_params.media;
				var mediaTranscript = x_params.mediaTranscript;
				var mediaImage = x_params.mediaImage;
				// ** TO DO - ADD MEDIA/TRANSCRIPT PLAYER **
				alert("open media window " + mediaFile + " " + mediaTranscript + " " + mediaImage);
			});
	}
	
	if (x_params.ic != undefined && x_params.ic != "") {
		$x_headerBlock.prepend('<img src="' + eval(x_params.ic) + '" class="x_floatLeft" />');
	}
	// ignores x_params.allpagestitlesize if added as optional property as the header bar will resize to fit any title
	$("#x_headerBlock h1").html(x_params.name);
	
	$x_prevBtn
		.button({
			icons: {
				primary: "x_prev"
			},
			label: 			x_getLangInfo(x_languageData.find("backButton")[0], "label", "Back"),
			text: false
		})
		.click(function() {
			x_currentPage--;
			x_changePage();
			$(this)
				.removeClass("ui-state-focus")
				.removeClass("ui-state-hover");
		});
	
	$x_nextBtn
		.button({
			icons: {
				primary: "x_next"
			},
			label: 			x_getLangInfo(x_languageData.find("nextButton")[0], "label", "Next"),
			text: false
		})
		.click(function() {
			x_currentPage++;
			x_changePage();
			$(this)
				.removeClass("ui-state-focus")
				.removeClass("ui-state-hover");
		});
	
	$x_menuBtn
		.button({
			icons: {
				primary: "x_info"
			},
			label: 			x_getLangInfo(x_languageData.find("tocButton")[0], "label", "Table of Contents"),
			text: false
		})
		.click(function() {
			if (x_params.navigation == "Linear" || x_params.navigation == undefined) {
				x_openDialog("menu", x_getLangInfo(x_languageData.find("toc")[0], "label", "Table of Contents"), x_getLangInfo(x_languageData.find("toc").find("closeButton")[0], "description", "Close Table of Contents"));
			} else {
				x_currentPage = 0;
				x_changePage();
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
				
				var $charPadData = $(xml).find("data").find("language[name='" + x_params.kblanguage + "']");
				var specCharsLower = $charPadData.find("char[case='lower']").text().split("");
				var specCharsUpper = $charPadData.find("char[case='upper']").text().split("");
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
						if ($("#x_language").length == 0) { // language dialog isn't already open
							x_openDialog("language", x_getLangInfo(x_languageData.find("kbLanguage")[0], "label", "Special Characters"), x_getLangInfo(x_languageData.find("kbLanguage").find("closeButton")[0], "description", "Close special character list button"), "top");
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
	
	$x_window.bind("resizeEnd", function() {
		x_updateCss(true);
	});
	
	// ** swipe to change page on touch screen devices - taken out as caused problems with drag and drop activities - need to be able to disable it for these activities **
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
			$x_mainHolder.unbind("click");
			$x_glossaryHover.remove();
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
							x_currentPage++;
							x_changePage();
						}
					} else if (dif[0] <= -75) {
						if (x_currentPage != 0) {
							x_currentPage--;
							x_changePage();
						}
					}
				}
			}
			*/
		});
		
		// call x_updateCss function on orientation change (resize event should trigger this but it's inconsistent)
		$x_window.bind("orientationchange", function() {
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
	
	if (x_params.background != undefined) {
		var alpha = 50;
		if (x_params.backgroundopacity != undefined) {
			alpha = x_params.backgroundopacity;
		}
		$x_background.append('<img id="x_mainBg" src="' + eval(x_params.background) + '"/>');
		$("#x_mainBg").css({
			"opacity"	:Number(alpha/100),
			"filter"	:"alpha(opacity=" + alpha + ")"
			});
	}
	
	x_changePage();
}

// function called on page change to load page model - x_currentPage should be changed to index of page to load before calling this function
function x_changePage() {
	x_currentPageXML = x_pages[x_currentPage];
	$("#pageBg").remove();
	if ($x_pageDiv.children().length > 0) {
		$("#x_pageDiv div:lt(" + $x_pageDiv.children().length + ")")
			.data("size", [$x_mainHolder.width(), $x_mainHolder.height()]) // save current LO size so when page is next loaded we can check if it has changed size and if anything needs updating
			.detach();
	}
	
	if (x_pageInfo[x_currentPage].built != false) { // x_currentPage has already been viewed so is already loaded
		var builtPage = x_pageInfo[x_currentPage].built;
		$x_pageDiv.append(builtPage);
		builtPage.hide();
		builtPage.fadeIn();
		x_setUpPage();
		if (x_pageInfo[x_currentPage].type != "menu") {
			// calls function in current page model which does anything needed to reset the page (if it needs to be reset)
			if (x_pageInfo[x_currentPage].type == "text") {
				simpleText.pageChanged(); // errors if you just call text.pageChanged()
			} else {
				eval(x_pageInfo[x_currentPage].type).pageChanged();
			}
			
			// checks if size has changed since last load
			var prevSize = builtPage.data("size");
			if (prevSize[0] != $x_mainHolder.width() || prevSize[1] != $x_mainHolder.height()) {
				if (x_pageInfo[x_currentPage].type == "text") {
					simpleText.sizeChanged();
				} else {
					eval(x_pageInfo[x_currentPage].type).sizeChanged();
				}
			}
		}
	} else { // x_currentPage hasn't been viewed previously - load model file
		$x_pageDiv.append('<div id="x_page' + x_currentPage + '"></div>');
		$("#x_page" + x_currentPage).css("visibility", "hidden");
		if ((x_currentPage != 0 || x_pageInfo[0].type != "menu") && x_glossary.length > 0) {
			x_findGlossaryWords(x_currentPageXML);
		}
		$("#x_page" + x_currentPage).load(x_templateLocation + "models_html5/" + x_pageInfo[x_currentPage].type + ".html", x_loadPage);
	}
}

// function called on page model load
function x_loadPage(response, status, xhr) {
	if (status == "error") {
		$("#x_pageDiv div").html(x_getLangInfo(x_languageData.find("errorPage")[0], "label", "No template is currently available for this page type"));
		x_pageLoaded();
	} else {
		x_pageInfo[x_currentPage].built = $("#x_pageDiv div:first");
	}
	x_setUpPage();
}

// function called when page model loaded/appended - sets page title, narration bar etc.
function x_setUpPage() {
	var pageTitle;
	$("#x_pageNarration").remove(); // remove narration flash / html5 audio player
	$("body div.me-plugin:not(#x_pageHolder div.me-plugin)").remove();
	$(".x_popupDialog").parent().detach(); // remove any open dialogs
	
	$x_pageDiv.parent().scrollTop(0);
	$("#x_pageDiv div").scrollTop(0);
	$x_mobileScroll.scrollTop(0);
	
	$x_pageNo
		.html((x_currentPage+1) + " / " + x_pageInfo.length)
		.attr("title", x_getLangInfo(x_languageData.find("vocab").find("page")[0], false, "Page") + " " + (x_currentPage+1) + " " + x_getLangInfo(x_languageData.find("vocab").find("of")[0], false, "of") + " " + x_pageInfo.length);
	
	if (x_pageInfo[0].type == "menu" && x_currentPage == 0) {
		pageTitle = x_getLangInfo(x_languageData.find("toc")[0], "label", "Table of Contents");
		$x_menuBtn
			.button("disable")
			.removeClass("ui-state-focus")
			.removeClass("ui-state-hover");
	} else {
		pageTitle = x_currentPageXML.getAttribute("name");
		if (x_pageInfo[0].type == "menu") {
			$x_menuBtn.button("enable");
		}
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
	
	$("#x_headerBlock h2").html(pageTitle);
	
	if (x_currentPage > 0) {
		$x_prevBtn.button("enable");
	} else {
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
	
	if (x_firstLoad == true) {
		$x_mainHolder.css("visibility", "visible");
		x_firstLoad = false;
		x_updateCss(true);
	} else {
		x_updateCss(false);
	}
}

// function called from each model when fully loaded to trigger fadeIn
function x_pageLoaded() {
	$("#x_page" + x_currentPage)
		.hide()
		.css("visibility", "visible")
		.fadeIn();
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

// function sets up some css that's dependant on screensize
function x_updateCss(updatePage) {
	// adjust width of narration controls
	if ($("#x_pageNarration").length > 0) {
		// ** need to change the narration bar width here **
	}
	if ($("audio,video").length > 0) {
		$("audio,video").each(function() {
			var $this = $(this);
			if ($this.is(":hidden")) { // flash
				// ** TO FIX ** - need to pause audio but mediaElement errors "this.pluginApi.pauseMedia is not a function"
				//$this.parents(".mejs-inner").find(".mejs-pause button").trigger("click");
			}
		});
	}
	
	// change margins as resize may mean header bar is thicker / thinner
	$x_pageHolder.css("margin-bottom", $x_footerBlock.height());
	$x_background.css("margin-bottom", $x_footerBlock.height());
	if (x_browserInfo.mobile == false) {
		$x_pageHolder.css("margin-top", $x_headerBlock.height());
		$x_background.css("margin-top", $x_headerBlock.height());
	}
	
	if (updatePage == true) {
		// calls function in current page model which does anything needed on size change
		if (x_pageInfo[x_currentPage].type == "text") {
			simpleText.sizeChanged(); // errors if you just call text.pageChanged()
		} else {
			eval(x_pageInfo[x_currentPage].type).sizeChanged();
		}
	}
	
	$(".x_popupDialog").parent().detach();
}

function x_openDialog(type, title, close, position) {
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
			if (position == undefined) {
				x_setDialogSize(x_dialogInfo[index].built.children(".x_popupDialog"));
			} else {
				x_dialogInfo[index].built.show();
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
				.load(x_templateLocation + "models_html5/" + type + ".html", function() {x_setDialogSize($x_popupDialog, position)});
			
			$x_popupDialog.parent().hide();
			x_dialogInfo[index].built = $x_popupDialog.parent();
		}
	}
}

function x_setDialogSize($x_popupDialog, position) {
	var width = $x_mainHolder.width()/2;
	var left = $x_mainHolder.width()/4;
	var top = $x_mainHolder.height()/4;
	
	if (x_browserInfo.mobile == true) {
		width = $x_mainHolder.width()-20;
		left = 10;
		top = $x_mainHolder.height()/4;
	} else if (position == "top") {
		width = $x_mainHolder.width()/4;
		left = $x_mainHolder.width() - width - 10;
		top = $x_headerBlock.height() + 5;
	}
	
	$x_popupDialog.dialog({
		"width"	:width
	});
	$x_popupDialog.parent().css({
		"left"	:left,
		"top"	:top
	});
	$x_popupDialog.parent().show();
	if ($x_popupDialog.height() > $x_mainHolder.height()/2) {
		$x_popupDialog.height($x_mainHolder.height()/2);
	}
}

// function finds every instance of a word from the glossary
function x_findGlossaryWords(pageXML) {
	var attrToCheck = ["text", "instruction", "instructions", "answer", "description", "prompt", "hint", "feedback", "summary", "intro", "txt", "goals", "audience", "prereq", "howto"];
	for (var i=0; i<pageXML.attributes.length; i++) {
		for (var j=0; j<attrToCheck.length; j++) {
			if (pageXML.attributes[i].name == attrToCheck[j]) {
				x_insertGlossaryTag(pageXML.attributes[i]);
				break;
			}
		}
	}
	for (var i=0; i<pageXML.childNodes.length; i++) {
		if (pageXML.childNodes[i].nodeValue == null) {
			x_findGlossaryWords(pageXML.childNodes[i]); // it's a child node of node - check through this too
		} else {
			if (pageXML.childNodes[i].nodeValue.replace(/^\s+|\s+$/g, "") != "") { // not blank
				x_insertGlossaryTag(pageXML.childNodes[i]);
			}
		}
	}
}

// function makes every glossary word found into a link
function x_insertGlossaryTag(node) {
	var temp = node.nodeValue;
	for (var k=0; k<x_glossary.length; k++) {
		var regExp = new RegExp('(^|\\s)(' + x_glossary[k].word + ')([\\s\\.,!?]|$)', 'i');
		temp = temp.replace(regExp, '$1<a class="x_glossary" href="#" title="' + x_glossary[k].definition + '">$2</a>$3');
	}
	node.nodeValue = temp;
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

// function called from model pages to scale images - scale, firstScale & setH are optional
function x_scaleImg(img, maxW, maxH, scale, firstScale, setH) {
	var $img = $(img);
	if (scale != false) {
		var imgW = $img.width();
		var imgH = $img.height();
		if (firstScale == true) { // store orig dimensions - will need them if resized later so it doesn't get larger than orignial size
			$img.data("origSize", [imgW, imgH]);
		} else if ($img.data("origSize") != undefined) { // use orig dimensions rather than current dimensions (so it can be scaled up if previously scaled down)
			imgW = $img.data("origSize")[0];
			imgH = $img.data("origSize")[1];
		}
		if (imgW > maxW || imgH > maxH || firstScale == false) {
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
				$img.css("height", imgH + "px"); // in some places the height also needs to be set
			}
		}
	}
	$img.css("visibility", "visible"); // kept hidden until resize is done
}

// function swaps line breaks in xml text attributes and CDATA to br tags
function x_addLineBreaks(text) {
	return text.replace(/\n/g, "<br />");
}

function x_addPageLinks(pageText, returnMethod) {
    var regExp = new RegExp('href="asfunction:_level0\.engine\.fnTextCon,([a-z0-9]+)" target="_blank"','ig');
    if (returnMethod.length > 0) {
        return pageText.replace(regExp, 'href="#" onclick="x_navigateToPage(\'$1\');' + returnMethod + ';return false;"');
    }
    else {
        return pageText.replace(regExp, 'href="#" onclick="x_navigateToPage(\'$1\');return false;"');

    }
}

function x_navigateToPage(strPage) {
    if (isNaN(strPage)) {
        var page = x_lookupPage(strPage);
        if (page != null)
        {
            x_currentPage = page;
            x_changePage();
        }
        else {
            console.log("'" + strPage + "' was not found!")
        }
    }
    else {
        x_currentPage = parseInt(strPage);
        x_changePage();
    }
}

function x_lookupPage(strPageIdentifier) {
    var i, len = x_pageInfo.length;
    for (i = 0; i < len; i++) {
        if (x_pageInfo[i].pageID && x_pageInfo[i].pageID == strPageIdentifier || x_pageInfo[i].linkID && x_pageInfo[i].linkID == strPageIdentifier) {
            break;
        }
    }

    if (i != len) {
        return i;
    }
    else {
        return null;
    }
}