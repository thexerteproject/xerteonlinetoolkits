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
 
$(document).ready(init);

var data;
var languageData;
var startPage = 0;
var startSection;
var theme = "default";
var pageLink = "";
var authorSupport = false;
var deepLink = "";
var currentPage = 0;
var glossary = [];
var defaultHeaderCss;
var urlParams = {};
var categories;


function init(){
	loadContent();
};

// called after all content loaded to set up mediaelement.js players
function initMedia($media){
	
	$media.mediaelementplayer({
		pauseOtherPlayers: true,
		enableAutosize: true,
		classPrefix: 'mejs-', // use the class naming format used in old version just in case some themes or projects use the old classes
		
		success: function (mediaElement, domObject) {
			
			var $mediaElement = $(mediaElement);
			
			// iframe scaling to maintain aspect ratio
			if ($mediaElement.find('video').length > 0 && $mediaElement.find('video').attr('type') != 'video/mp4') {
				iframeInit($mediaElement);
				
				// the vimeo video won't play with the media element controls so remove these so default vimeo controls can be used
				if ($mediaElement.find('video').attr('type') == 'video/vimeo') {
					$mediaElement.parents('.mejs-container').find('.mejs-iframe-overlay, .mejs-layers, .mejs-controls').remove();
				}
			}
			
			// stops mp4 videos being shown larger than original
			mediaElement.addEventListener("loadedmetadata", function(e) {
				var $video = $(e.detail.target);
				$video.add($video.parents('.mejs-container')).css({
					'max-width': e.detail.target.videoWidth,
					'max-height': e.detail.target.videoHeight
				});
			});
		},
		error: function(mediaElement) {
			console.log('mediaelement problem is detected: ', mediaElement);
		}
	});
}

// function manually sets height of any media shown in iframes (e.g. youtube/vimeo) to maintain aspect ratios
function iframeInit($mediaElement) {
	if ($mediaElement.find('iframe').length > 0) {
		iframeResize($mediaElement.find('iframe'));
	} else {
		// try again if iframe's not ready yet
		setTimeout(function() {
			iframeInit($mediaElement);
		}, 200);
	}
}

// resize iframe height to keep aspect ratio
function iframeResize($iframe) {
	if ($iframe.parents('.navigator.carousel').length > 0) {
		$iframe.height(($iframe.parents('.navigator.carousel').width() / Number($iframe.parents('.vidHolder').data('iframeRatio')[0])) * Number($iframe.parents('.vidHolder').data('iframeRatio')[1]));
		$iframe.parents('.mejs-container').height('auto');
	} else {
		$iframe.height(($iframe.width() / Number($iframe.parents('.vidHolder').data('iframeRatio')[0])) * Number($iframe.parents('.vidHolder').data('iframeRatio')[1]));
		$iframe.parents('.mejs-container').height('auto');
	}
}

function initSidebar(){
	var $window = $(window)
	
	//TOC
	$('.bs-docs-sidenav').affix
	(
		{
			offset: 
			{
				top: function () { return $window.width() <= 980 ? 290 : 210 },
				bottom: 270
			}
		}
	)
}

function loadContent(){

	$.ajax({
	
		type: "GET",
		url: projectXML,
		dataType: "xml", 
		success: function(xml) {
		
			if (typeof data == 'string'){
			
				//in IE we need to turn the string into xml
				data = $.parseXML(xml);
				
			} else {
			
				data = xml;
				
			}
			
			//step one - css	
			cssSetUp('theme');
			
		}
	});

	// sort any parameters in url - these will override those in xml
    var tempUrlParams = window.location.search.substr(1, window.location.search.length).split("&");
    for (i = 0; i < tempUrlParams.length; i++) {
        urlParams[tempUrlParams[i].split("=")[0]] = tempUrlParams[i].split("=")[1];
    }

    // If we have a start page/section then extract it and clear the url
    if (window.location.hash.length > 0) {
        pageLink = window.location.hash.substring(1);
		
        if (pageLink.substring(0,4) == "page") {
            startPage = parseInt(pageLink.substring(4), 10) - 1;
		}
		
		if (pageLink.indexOf('section') > -1) {
			startSection = parseInt(pageLink.substring(pageLink.indexOf('section') + 7), 10);
		}
 	}
	
	// some iframes will need height manually set to keep aspect ratio correct so keep track of window resize
	$(window).resize(function() {
		
		$.featherlight.close();
		
		if (this.resizeTo) {
			clearTimeout(this.resizeTo);
		}
		this.resizeTo = setTimeout(function() {
			$(this).trigger("resizeEnd");
		}, 200);
	});

	$(window).on("resizeEnd", function() {
		$('.vidHolder iframe').each(function() {
			iframeResize($(this))
		});
	});
}

function cssSetUp(param) {
	param = (typeof param !== 'undefined') ?  param : "theme";

	switch(param) {
        case 'theme':
            if ($(data).find('learningObject').attr('theme') != undefined)
            {
                theme = $(data).find('learningObject').attr('theme');
            }

            // See if we have a theme definition in the url
            if (urlParams.theme != undefined && ($(data).find('learningObject').attr('themeurl') == undefined || $(data).find('learningObject').attr('themeurl') != 'true'))
            {
                theme = urlParams.theme;
            }

			if ( theme != undefined && theme != "default") {
				$('head').append('<script src="'+ themePath + theme + '/'+ theme+ '.js"' + '</script>');
				insertCSS(themePath + theme + '/' + theme + '.css', function() {cssSetUp('stylesheet')});
			} else {
				cssSetUp('stylesheet');
			}
            break;
        case 'stylesheet':
			if ( $(data).find('learningObject').attr('stylesheet') != undefined) {
				insertCSS(eval( $(data).find('learningObject').attr('stylesheet') ), function() { loadLibraries(); });
			} else {
				loadLibraries();
			}
            break;
	}
	
}

function insertCSS(href, func) {
	
	var css = document.createElement("link");
	var element = null;
	var donotreplace = false;
	css.rel = "stylesheet";
	css.type = "text/css";
	css.href = href;
	
	// don't continue until css has loaded as otherwise css priorities can be messed up
	if (func != undefined) {
		
		css.onload = function(){
			func();
		};

		css.onerror = function(){
			func();
		};
		
	}
	
	document.getElementsByTagName("head")[0].appendChild(css);
}	

function loadLibraries() {
	
	if ( $(data).find('learningObject').attr('styles') != undefined){
	
		$('head').append('<style type="text/css">' +  $(data).find('learningObject').attr('styles') + '</style>');
	
	}
	
	var lang = $(data).find('learningObject').attr('language');

	if ( $(data).find('learningObject').attr('libs') != undefined){
	
		var libs = $(data).find('learningObject').attr('libs').split('||');
		
		var libCount = libs.length;
		var loaded = 0;
		
		for (var i = 0; i< libCount; i++){
		
			$.getScript(libs[i], function(data, success, jqxhr){
			
				loaded++;
				
				if (loaded == libs.length){
					
					//step two
					getLangData(lang)
					
				}
				
			});
		
		}
		
	} else {
		
		getLangData(lang)
		
	}

}

function getLangData(lang) {
	
	if (lang == undefined || lang == "undefined" || lang == "") {
		lang = "en-GB";
	}
	
	$.ajax({
		type: "GET",
		url: "languages/engine_" + lang + ".xml",
		dataType: "xml",
		
		success: function (xml) {
			
			languageData = $(xml).find("language");
			
			//step three
			setup();
			
			// step four
			parseContent(startPage, true);
			
		},
		
		error: function () {
			
			if (lang != "en-GB") { // no language file found - try default GB one
				getLangData("en-GB");
			} else { // hasn't found GB language file - set up anyway, will use fallback text in code
				languageData = $("");
				setup();
				parseContent(startPage, true);
			}
			
		}
	});
}

function formatColour(col) {
	return (col.length > 3 && col.substr(0,2) == '0x') ? '#' + col.substr(2) : col;
}

function setup(){
	
	if ($(data).find('learningObject').attr('glossary') != undefined) {
		
		// get list of glossary words & definitions
		var i, len, item, word,
			items = $(data).find('learningObject').attr('glossary').split("||");

		for (i=0, len=items.length; i<len; i++) {
			item = items[i].split("|"),
			word = {word:item[0], definition:item[1]};

			if (word.word.replace(/^\s+|\s+$/g, "") != "" && word.definition.replace(/^\s+|\s+$/g, "") != "") {
				glossary.push(word);
			}
		}
		
		if (glossary.length > 0) {
			glossary.sort(function(a, b){ // sort by size
				return a.word.length > b.word.length ? -1 : 1;
			});
			
			// show definition on hover
			if ($(data).find('learningObject').attr('glossaryHover') == undefined || $(data).find('learningObject').attr('glossaryHover') == "true") {
				
				x_checkForText($(data).find('page'), 'glossary');
				
				// add events to control what happens when you rollover glossary words
				$("body > .container")
					.on("mouseenter", ".glossary", function(e) {
						$(this).trigger("mouseleave");
						
						var $this = $(this),
							myText = $this.text(),
							myDefinition, i, len;
						
						for (i=0, len=glossary.length; i<len; i++) {
							if (myText.toLowerCase() == glossary[i].word.toLowerCase()) {
								myDefinition = "<b>" + myText + ":</b><br/>"
								myDefinition += glossary[i].definition;
							}
						}
						
						$(this).parents('.container').append('<div id="glossaryHover" class="glossaryTip">' + myDefinition + '</div>');
						
						$("#glossaryHover").css({
							"left"	:$(this).offset().left + 20,
							"top"	:$(this).offset().top + 20
						});
						$("#glossaryHover").fadeIn("slow");
					})
					.on("mouseleave", ".glossary", function(e) {
						$(this).parent('.container').off("click.glossary");
						
						if ($("#glossaryHover") != undefined) {
							$("#glossaryHover").remove();
						}
					})
					.on("mousemove", ".glossary", function(e) {
						$("#glossaryHover").css({
							"left": e.pageX + 20,
							"top": e.pageY + 20
						});
					})
					.on("focus", ".glossary", function(e) { // called when link is tabbed to
						$(this).trigger("mouseenter");
					})
					.on("focusout", ".glossary", function(e) {
						$(this).trigger("mouseleave");
					});
			}
			
			// show glossary in its own page
			if ($(data).find('learningObject').attr('glossaryPage') != undefined && $(data).find('learningObject').attr('glossaryPage') != 'none') {
				
				glossary.sort(function(a, b){ // sort alphabetically
					if(a.word < b.word) return -1;
					if(a.word > b.word) return 1;
					return 0;
				})
				
				var charList = [],
					glossaryTxt = [];
				
				for (var i=0; i<glossary.length; i++) {
					if (charList.length == 0 || charList[charList.length - 1] != glossary[i].word[0]) {
						charList += glossary[i].word[0];
						glossaryTxt.push('<h3>' + glossary[i].word + '</h3><div>' + glossary[i].definition + '</div>');
					} else {
						glossaryTxt.splice(glossaryTxt.length - 1, 1, glossaryTxt[glossaryTxt.length - 1] + '<h3>' + glossary[i].word + '</h3><div>' + glossary[i].definition + '</div>');
					}
				}
				
				var $glossaryPage = $('<page name="Glossary" subtitle=""></page>');
				for (var i=0; i<charList.length; i++) {
					var cDataSection = data.createCDATASection(glossaryTxt[i]);
					var $section = $('<section name="' + charList[i] + '"><text></text></section>');
					$section.find('text').append(cDataSection);
					
					if ($(data).find('learningObject').attr('glossaryMenu') != undefined && $(data).find('learningObject').attr('glossaryMenu') != '') {
						$section.attr('menu', $(data).find('learningObject').attr('glossaryMenu'));
					}
					$glossaryPage.append($section);
				}
				
				if ($(data).find('learningObject').attr('glossaryPage') == "first") {
					$glossaryPage.prependTo($(data).find('learningObject'));
				} else {
					$glossaryPage.appendTo($(data).find('learningObject'));
				}
			}
		}
	}
	
	// if project is being viewed as https then force any iframe src to be https too
	if (window.location.protocol == "https:") {
		
		x_checkForText($(data).find('page'), 'iframe');	
		
	}	
	
	if (window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1, window.location.pathname.length).indexOf("preview") != -1 && $(data).find('learningObject').attr('authorSupport') == 'true' ) {
		
		authorSupport = true;
		
	}

	//add all the pages to the pages menu: this links back to the same page
	$(data).find('page').each( function(index, value){
		// work out whether the page is hidden or not - can be simply hidden or hidden between specific dates/times
		var hidePage = checkIfHidden($(this).attr('hidePage'), $(this).attr('hideOnDate'), $(this).attr('hideOnTime'), $(this).attr('hideUntilDate'), $(this).attr('hideUntilTime'), 'Page');
		if ($.isArray(hidePage)) {
			$(this).attr('hidePageInfo', hidePage[1]);
			hidePage = hidePage[0];
		}
		$(this).attr('hidePage', hidePage);
		
		if (hidePage == false || authorSupport == true) {
			var name = $(this).attr('name');
			
			// remove size & background color styles from links on nav bar
			if ($('<p>' + name + '</p>').children().length > 0) {
				name = $(name);
				name.css({ 'font-size': '', 'background-color': 'transparent' });
				name.find('[style*="font-size"]').css('font-size', '');
				name.find('[style*="background-color"]').css('background-color', 'transparent');
			}
			
			var $link = $('<li class=""><a href="javascript:parseContent(' + index + ')"></a></li>').appendTo('#nav');
			$link.find('a').append(name);
			
		}
		
	});
	
	// set up print functionality - all this does is add a print button to the toolbar which triggers browser's print dialog
	if ($(data).find('learningObject').attr('print') == 'true') {
		
		var altTxt = languageData.find("print")[0] != undefined && languageData.find("print")[0].getAttribute('printBtn') != null ? languageData.find("print")[0].getAttribute('printBtn') : "Print page";
		
		$('<li id="printIcon"><a href="#" aria-label="' + altTxt + '"><i class="fa fa-print text-white ml-3" aria-hidden="true" title="' + altTxt + '"></i></a></li>')
			.appendTo('#nav')
			.click(function() {
				window.print();
			});
	}
	
	// set up search functionality
	if ($(data).find('learningObject').attr('search') == 'true' || $(data).find('learningObject').attr('category') == 'true') {
		
		var $searchHolder = $('<div id="searchHolder"></div>'),
			$searchInner = $('<div id="searchInner"></div>');
		
		// text search - not working yet
		/*if ($(data).find('learningObject').attr('search') == 'true') {
			var freeSearchType = $(data).find('learningObject').attr('searchType') != undefined ? $(data).find('learningObject').attr('searchType') : 'meta';
			
			$('<div id="textSearch"><input class="form-control" type="text" placeholder="Search" aria-label="Search"></div>')
				.appendTo($searchInner);
		}*/
		
		// category search
		if ($(data).find('learningObject').attr('category') == 'true' && $(data).find('learningObject').attr('categoryInfo') != '') {
			categories = $(data).find('learningObject').attr('categoryInfo').split('||');
			for (var i=0; i<categories.length; i++) {
				var categoryInfo = categories[i].split('|');
				
				if (categoryInfo.length == 2) {
					var title = categoryInfo[0].trim(),
						opts = categoryInfo[1].split('\n');
					
					for (var j=0; j<opts.length; j++) {
						opts.splice(j, 1, opts[j].trim());
						
						if (opts[j].length == 0) {
							opts.splice(j, 1);
							j--;
						} else {
							var stripTags = $("<div/>").html(opts[j]).text().trim();
							if (stripTags.length > 0) {
								var optInfo = stripTags.split('(');
								if (optInfo.length > 1 && optInfo[1].trim().length > 0) {
									opts.splice(j, 1, { id: optInfo[0].trim(), name: optInfo[1].trim().slice(0, -1) });
								} else {
									opts.splice(j, 1, { id: optInfo[0].replace(/ /g, "_"), name: optInfo[0] });
								}
							} else {
								opts.splice(j, 1);
								j--;
							}
						}
					}
					
					if (title.length > 0 && opts.length > 0) {
						categories.splice(i, 1, { name: title, options: opts});
					} else {
						categories.splice(i, 1);
						i--;
					}
				} else {
					categories.splice(i, 1);
					i--;
				}
			}
			
			// some categories exist - create menu
			if (categories.length > 0) {
				var $categorySearch = $('<div id="categorySearch"></div>');
				
				for (var i=0; i<categories.length; i++) {
					var $optGroup = $('<div id="cat' + i + '" class="catBlock"><div class="catContents"><h2 class="catName">' + categories[i].name + ':</h2></div></div>').appendTo($categorySearch);
					
					for (var j=0; j<categories[i].options.length; j++) {
						$optGroup.find('.catContents').append('<div class="inputGroup"><input type="checkbox" name="' + categories[i].name + '" id="cat' + i + '_' + j + '" value="cat' + i + '_' + j + '"><label for="cat' + i + '_' + j + '">' + categories[i].options[j].name + '</label></div>');
					}
				}
				
				$categorySearch.appendTo($searchInner);
				
				// work out what categories each page / section falls under
				$(data).find('page').each(function(index, value) {
					var $page = $(this);
					
					if ($page.attr('hidePage') != false) {
						if ($page.attr('filter') != undefined && $page.attr('filter') != '') {
							var catIds = [],
								categoryInfo = $page.attr('filter').split(',');
							
							for (var i=0; i<categoryInfo.length; i++) {
								var category = categoryInfo[i].trim(),
									found = false;
								
								for (var j=0; j<categories.length; j++) {
									for (var k=0; k<categories[j].options.length; k++) {
										if (category.toLowerCase() == categories[j].options[k].id.toLowerCase()) {
											catIds.push('cat' + j + '_' + k);
											found = true;
											break;
										}
									}
									
									if (found == true) {
										break;
									}
								}
							}
							
							$page.attr('filter', catIds);
						}
						
						$page.children().each(function(index, value) {
							var $section = $(this);
							
							if ($section.attr('filter') != undefined && $section.attr('filter') != '') {
								var catIds = [],
									categoryInfo = $section.attr('filter').split(',');
								
								for (var i=0; i<categoryInfo.length; i++) {
									var category = categoryInfo[i].trim(),
										found = false;
									
									for (var j=0; j<categories.length; j++) {
										for (var k=0; k<categories[j].options.length; k++) {
											if (category.toLowerCase() == categories[j].options[k].id.toLowerCase()) {
												catIds.push('cat' + j + '_' + k);
												found = true;
												break;
											}
										}
										
										if (found == true) {
											break;
										}
									}
								}
								
								$section.attr('filter', catIds);
							}
						});
					}
				});
			}
		}
		
		if ($searchInner.children().length > 0) {
			$searchInner
				.prepend('<h1 class="searchTitle"></h1><div class="searchIntro"></div>')
				.find('.searchTitle').html((languageData.find("search")[0] != undefined && languageData.find("search")[0].getAttribute('title') != null ? languageData.find("search")[0].getAttribute('title') : "Search") + ':');
			
			if ($(data).find('learningObject').attr('categoryTxt') != '' && $(data).find('learningObject').attr('categoryTxt') != undefined) {
				$searchInner.find('.searchIntro').html($(data).find('learningObject').attr('categoryTxt'));
			} else {
				$searchInner.find('.searchIntro').remove();
			}
			
			$searchHolder
				.append($searchInner)
				.append('<div id="searchResults" class=""></div></li></ul>')
				.find('#searchInner').append('<button id="searchBtn" type="button" class="searchBtn btn btn-primary">' + (languageData.find("search")[0] != undefined && languageData.find("search")[0].getAttribute('goBtn') != null ? languageData.find("search")[0].getAttribute('goBtn') : "Go") + '</button>');
			
			$('<li id="searchIcon"><a href="#"><i class="fa fa-search text-white ml-3" aria-hidden="true"></i>' + (languageData.find("search")[0] != undefined && languageData.find("search")[0].getAttribute('searchBtn') != null ? languageData.find("search")[0].getAttribute('searchBtn') : "Search") + '</a></li>')
				.appendTo('#nav')
				.click(function() {
					$searchHolder
						.css({
							width: $('.container').width() * 0.80,
							height: $(window).height() * 0.80
						});
					
					$.featherlight($searchHolder, {
						persist: true,
						afterClose: function(e) {
							// if closed because of link to a page section then this stops it jumping back to top of page afterwards
							if (e == true) {
								this._previouslyActive = sectionJump;
							}
							
							// clear checkboxes if search wasn't carried out or returned no results
							if ($searchHolder.find('#noSearchResults').length > 0 || $searchHolder.find('#searchResults .result').length == 0) {
								
								$searchHolder.find('#categorySearch input').prop("checked", false);
								
								$searchHolder.find('#searchResults')
									.empty()
									.hide();
							}
						}
					});
				});
			
			$searchHolder.find('#searchBtn')
				.button()
				.click(function() {
						
					var $searchLightbox = $('#searchHolder'),
						results = [], // the pages / sections which match search terms
						catsUsed = [],
						numResults = 0;
					
					// text search
					/*if ($searchLightbox.find('#textSearch input').length > 0 && $searchLightbox.find('#textSearch input').val().trim() != '') {
						//$searchLightbox.find('#textSearch input').val());
					}*/
					
					if ($searchLightbox.find('#categorySearch').length > 0) {
						
						$searchLightbox.find('#categorySearch input:checked').each(function() {
							var lookingFor = $(this).attr('value'),
								thisCat = lookingFor.substring(3).split('_');
							
							if ($.inArray(lookingFor.substring(3).split('_')[0], catsUsed) == -1) {
								catsUsed.push(lookingFor.substring(3).split('_')[0]);
							}
							
							$(data).find('page').each(function(index, value) {
								var $page = $(this),
									pageIndex = index;
								
								if (results.length < $(data).find('page').length) {
									results.push( { match: [], sections: [] } );
								}
								
								if ($page.attr('hidePage') != false) {
									if ($page.attr('filter') != undefined && $page.attr('filter').split(',').length > 0) {
										var indexInArray = $.inArray(lookingFor, $page.attr('filter').split(','));
										
										if (indexInArray > -1) {
											results[pageIndex].match.push(lookingFor);
											numResults++;
										}
									}
									
									$page.children().each(function(index, value) {
										var $section = $(this);
										
										if (results[pageIndex].sections.length < $page.children().length) {
											results[pageIndex].sections.push( { match: [] } );
										}
										
										if ($section.attr('hidePage') != false && $section.attr('filter') != undefined && $section.attr('filter').split(',').length > 0) {
											var indexInArray = $.inArray(lookingFor, $section.attr('filter').split(','));
											
											if (indexInArray > -1) {
												results[pageIndex].sections[index].match.push(lookingFor);
												numResults++;
											}
										}
									});
								}
							});
						});
					}
					
					var $searchResults = $('#searchResults').empty();
					
					if (numResults != 0) {
						
						$searchResults
							.append('<h1 class="searchTitle">' + (languageData.find("search")[0] != undefined && languageData.find("search")[0].getAttribute('resultTitle') != null ? languageData.find("search")[0].getAttribute('resultTitle') : "Results") + ':</h1>')
							.append('<button id="newSearchBtn" type="button" class="searchBtn btn btn-primary">' + (languageData.find("search")[0] != undefined && languageData.find("search")[0].getAttribute('newBtn') != null ? languageData.find("search")[0].getAttribute('newBtn') : "New Search") + '</button>');
						
						// create the list of results - ordered into list according to those matching the most filter categories
						function createResultDivs(pageOrSection, index) {
							var title = $(data).find('page').eq(index[0]).attr('name') + (index.length > 1 ? ': ' + $(data).find('page').eq(index[0]).children().eq(index[1]).attr('name') : ''),
								faIcon = index.length == 1 ? 'fa-file' : 'fa-tag',
								catMatches = '',
								uniqueCats = [];
							
							for (var k=0; k<pageOrSection.match.length; k++) {
								var info = pageOrSection.match[k].substring(3).split('_');
								catMatches += categories[info[0]].options[info[1]].name + ', ';
								
								if ($.inArray(info[0], uniqueCats) == -1) {
									uniqueCats.push(info[0]);
								}
							}
							catMatches = catMatches.substring(0, catMatches.length - 2);
							
							var linkAction;
							if (index.length == 1) {
								linkAction = "x_navigateToPage(false, { type:'linkID', ID:'" + $(data).find('page').eq(index[0]).attr('linkID') + "' }); $.featherlight.close(true); return false;";
							} else {
								linkAction = "x_navigateToPage(false, { type:'linkID', ID:'" + $(data).find('page').eq(index[0]).children().eq(index[1]).attr('linkID') + "' }); $.featherlight.close(true); return false;";
							}
							
							var matchType = uniqueCats.length == catsUsed.length ? 'fullMatch' : 'partialMatch',
								$resultDiv = $('<div class="result ' + matchType + '"><a href="#" onclick="' + linkAction + '"><i class="fa ' + faIcon + ' text-white ml-3" aria-hidden="true"></i>' + title + '</a>' + '<div class="matchList"><i>' + (languageData.find("search")[0] != undefined && languageData.find("search")[0].getAttribute('matchTitle1') != null ? languageData.find("search")[0].getAttribute('matchTitle1') : "Matches") + ': ' + catMatches + '</i></div></div>');
							
							$resultDiv
								.data({
									'match': pageOrSection.match,
									'numCats': uniqueCats.length
								});
							
							if ($searchResults.find('.result').length > 0) {
								
								$searchResults.find('.result').each(function(k) {
									if (uniqueCats.length > $(this).data('numCats')) {
										$resultDiv.insertBefore($(this));
										return false;
									} else if ($searchResults.find('.result').length - 1 == k) {
										$searchResults.append($resultDiv);
									}
								});
								
							} else {
								$searchResults.append($resultDiv);
							}
						}
						
						for (var i=0; i<results.length; i++) {
							if (results[i].match.length > 0) {
								createResultDivs(results[i], [i]);
							}
							
							for (var j=0; j<results[i].sections.length; j++) {
								if (results[i].sections[j].match.length > 0) {
									createResultDivs(results[i].sections[j], [i,j]);
								}
							}
						}
						
						// add headings to show which are full/partial matches
						if ($searchResults.find('.fullMatch').length > 0) {
							$('<h2 id="fullMatch" class="searchResultInfo">' + (languageData.find("search")[0] != undefined && languageData.find("search")[0].getAttribute('matchTitle2') != null ? languageData.find("search")[0].getAttribute('matchTitle2') : "Best matches") + ':</h2>').insertBefore($searchResults.find('.fullMatch').eq(0));
						}
						
						if ($searchResults.find('.partialMatch').length > 0) {
							var $partialMatch = $('<h2 id="partialMatch" class="searchResultInfo"></h2>').insertBefore($searchResults.find('.partialMatch').eq(0));
							
							if ($searchResults.find('#fullMatch').length == 0) {
								$partialMatch.html((languageData.find("search")[0] != undefined && languageData.find("search")[0].getAttribute('noMatch2') != null ? languageData.find("search")[0].getAttribute('noMatch2') : 'No pages or sections completely match your criteria. Partial matches are listed below') + ':');
								
							} else {
								$searchResults.find('.partialMatch').hide();
								
								function showPartialResults() {
									$searchResults.find('.partialMatch').show();
								}
								
								$partialMatch
									.html('<a href="#">' + (languageData.find("search")[0] != undefined && languageData.find("search")[0].getAttribute('showMatch') != null ? languageData.find("search")[0].getAttribute('showMatch') : "Show partial matches") + '</a>')
									.find('a').click(function() {
										$searchResults.find('.partialMatch').show();
										$partialMatch.html((languageData.find("search")[0] != undefined && languageData.find("search")[0].getAttribute('matchTitle3') != null ? languageData.find("search")[0].getAttribute('matchTitle3') : "Partial matches") + ':');
									});
							}
						}
						
						$searchResults.find('#newSearchBtn').click(function() {
							$('#searchHolder').find('#searchInner').show();
							$('#searchResults').hide();
						});
						
						$searchLightbox.find('#searchInner').hide();
						$searchResults.show();
						
					} else {
						$searchResults
							.append('<p id="noSearchResults">' + (languageData.find("search")[0] != undefined && languageData.find("search")[0].getAttribute('noMatch1') != null ? languageData.find("search")[0].getAttribute('noMatch1') : "No pages or sections match your selection.") + '</p>')
							.show();
					}
				});
		}
	}
	
	// --------------- Optional Header properties --------------------
	
	if ($(data).find('learningObject').attr('headerHide') != undefined && $(data).find('learningObject').attr('headerHide') != 'false') {
	
		$(".jumbotron").remove();
		
	} else {
		
		// default logos used are logo_left.png & logo.png in modules/site/parent_templates/site/common/img/
		// they are overridden by any logos in theme folders
		// they can also be overridden by images uploaded via Header Logo optional properties
		$('#overview div.logoR, #overview div.logoL').hide();
		$('#overview div.logoR').data('defaultLogo', $('#overview .logoR img').attr('src'));
		$('#overview div.logoL').data('defaultLogo', $('#overview .logoL img').attr('src'));
		
		var checkExists = function(logoClass, type, fallback) {
			$.ajax({
				url: $('#overview .' + logoClass + ' img').attr('src'),
				success: function() {
					$('#overview').addClass(logoClass);
					$('#overview div.' + logoClass).show();
					
					// the theme logo is being used - add a class that will allow for the different size windows to display different logos
					if (type == 'theme') {
						$('#overview .' + logoClass + ' img.' + logoClass).addClass('themeLogo');
					}
				},
				error: function() {
					if ($(data).find('learningObject').attr(logoClass + 'Hide') == 'true') {
						$('#overview .' + logoClass + ' img').removeAttr('src');
					} else {
						if (fallback == 'theme') {
							$('#overview .' + logoClass + ' img').attr('src', themePath + $(data).find('learningObject').attr('theme') + '/logo' + (logoClass == 'logoL' ? '_left' : '') + '.png');
							checkExists(logoClass, 'theme', 'default');
						} else if (fallback == 'default') {
							$('#overview .' + logoClass + ' img').attr('src', $('#overview div.' + logoClass).data('defaultLogo'));
							checkExists(logoClass);
						}
					}
				}
			});
		}
		
		var type, fallback;
		if ($(data).find('learningObject').attr('logoR') != undefined && $(data).find('learningObject').attr('logoR') != '') {
			$('#overview .logoR img').attr('src', eval( $(data).find('learningObject').attr('logoR')));
			type = 'LO';
			fallback = $(data).find('learningObject').attr('theme') != undefined && $(data).find('learningObject').attr('theme') != "default" ? 'theme' : 'default';
		} else if ($(data).find('learningObject').attr('logoRHide') != 'true' && $(data).find('learningObject').attr('theme') != undefined && $(data).find('learningObject').attr('theme') != 'default') {
			type = 'theme';
			$('#overview .logoR img').attr('src', themePath + $(data).find('learningObject').attr('theme') + '/logo.png');
		}
		if ((type == undefined || type == 'theme') && $(data).find('learningObject').attr('logoRHide') == 'true') {
			$('#overview .logoR img').removeAttr('src');
		} else {
			checkExists('logoR', type, fallback);
		}
		
		var type, fallback;
		if ($(data).find('learningObject').attr('logoL') != undefined && $(data).find('learningObject').attr('logoL') != '') {
			$('#overview .logoL img').attr('src', eval( $(data).find('learningObject').attr('logoL')));
			type = 'LO';
			fallback = $(data).find('learningObject').attr('theme') != undefined && $(data).find('learningObject').attr('theme') != "default" ? 'theme' : 'default';
		} else if ($(data).find('learningObject').attr('logoLHide') != 'true' && $(data).find('learningObject').attr('theme') != undefined && $(data).find('learningObject').attr('theme') != 'default') {
			type = 'theme';
			$('#overview .logoL img').attr('src', themePath + $(data).find('learningObject').attr('theme') + '/logo_left.png');
		}
		if ((type == undefined || type == 'theme') && $(data).find('learningObject').attr('logoLHide') == 'true') {
			$('#overview .logoL img').removeAttr('src');
		} else {
			checkExists('logoL', type, fallback);
		}
		
		// apply all the header css optional properties
		var $jumbotron = $(".jumbotron");
		if ($(data).find('learningObject').attr('headerColour') != undefined && $(data).find('learningObject').attr('headerColour') != '' && $(data).find('learningObject').attr('headerColour') != '0x') {
			if ($(data).find('learningObject').attr('headerColour').indexOf('rgb(') >= 0) {
				$jumbotron.css('background-color', formatColour($(data).find('learningObject').attr('headerColour')));
			} else {
				// gradients can be entered in colour picker in format '#FF0000,#FFFF00'
				var tempCol = $(data).find('learningObject').attr('headerColour');
				tempCol = tempCol.split(',');
				if (tempCol.length == 1) {
					tempCol.push(tempCol[0]);
				}
				tempCol[0] = formatColour(tempCol[0]);
				tempCol[1] = formatColour(tempCol[1]);
				$jumbotron.css('background', tempCol[0]);
				$jumbotron.css('background', '-moz-linear-gradient(45deg,  ' + tempCol[0] + ' 0%, ' + tempCol[1] + ' 100%)');
				$jumbotron.css('background', '-webkit-gradient(linear, left bottom, right top, color-stop(0%,' + tempCol[0] + '), color-stop(100%,' + tempCol[1] + '))');
				$jumbotron.css('background', '-webkit-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
				$jumbotron.css('background', '-o-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
				$jumbotron.css('background', '-ms-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
				$jumbotron.css('background', 'linear-gradient(45deg,  ' + + ' 0%,' + tempCol[1]+ ' 100%)');
				$jumbotron.css('filter', 'progid:DXImageTransform.Microsoft.gradient( startColorstr=' + tempCol[0] + ', endColorstr=' + tempCol[1] + ',GradientType=1 )');
			}
		}
		if ($(data).find('learningObject').attr('header') != undefined && $(data).find('learningObject').attr('header') != '') {
			$jumbotron.css('background-image', "url('" + eval($(data).find('learningObject').attr('header')) + "')");
		}
		if ($(data).find('learningObject').attr('headerPos') != undefined) {
			$jumbotron.css('background-position', $(data).find('learningObject').attr('headerPos'));
		}
		if ($(data).find('learningObject').attr('headerRepeat') != undefined) {
			$jumbotron.css('background-repeat', $(data).find('learningObject').attr('headerRepeat'));
		}
		if ($(data).find('learningObject').attr('headerTextColour') != undefined && $(data).find('learningObject').attr('headerTextColour') != '' && $(data).find('learningObject').attr('headerTextColour') != '0x') {
			$jumbotron.find('#pageTitle, #pageSubTitle').css('color', formatColour($(data).find('learningObject').attr('headerTextColour')));
		}
		
	}
	
	// store initial header css as it might be needed later if page level header optional property is used
	var $jumbotron = $(".jumbotron");
	defaultHeaderCss = {
		header: $jumbotron.css('background-image'),
		headerPos: $jumbotron.css('background-position'),
		headerRepeat: $jumbotron.css('background-repeat'),
		headerColour: $jumbotron.css('background-color'),
		headerTextColour: $jumbotron.find('#pageTitle').css('color')
	};
	
    // --------------- Optional Navigation Bar properties --------------------
    
    if ($(data).find('learningObject').attr('navbarHide') != undefined && $(data).find('learningObject').attr('navbarHide') != 'false'){
	
		$(".navbar-inner").remove();
		
	} else {
	
		// nav bar can be moved below header bar
		if ($(data).find('learningObject').attr('navbarPos') != undefined && $(data).find('learningObject').attr('navbarPos') == 'below'){
		
			$('#overview').after('<div id="pageLinks"></div>');
			$('.navbar').appendTo('#pageLinks');

		}
		
		// apply all the nav bar css optional properties
		if ($(data).find('learningObject').attr('navbarColour') != undefined && $(data).find('learningObject').attr('navbarColour') != '' && $(data).find('learningObject').attr('navbarColour') != '0x') {
			var $navBar = $('.navbar-inverse .navbar-inner');
			
			if ($(data).find('learningObject').attr('navbarColour').indexOf('rgb(') >= 0) {
				$navBar.css('background-color', formatColour($(data).find('learningObject').attr('navbarColour')));
			} else {
				// gradients can be entered in colour picker in format '#FF0000,#FFFF00'
				var tempCol = $(data).find('learningObject').attr('navbarColour');
				tempCol = tempCol.split(',');
				if (tempCol.length == 1) {
					tempCol.push(tempCol[0]);
				}
				tempCol[0] = formatColour(tempCol[0]);
				tempCol[1] = formatColour(tempCol[1]);
				$navBar.css('background', tempCol[0]);
				$navBar.css('background', '-moz-linear-gradient(45deg,  ' + tempCol[0] + ' 0%, ' + tempCol[1] + ' 100%)');
				$navBar.css('background', '-webkit-gradient(linear, left bottom, right top, color-stop(0%,' + tempCol[0] + '), color-stop(100%,' + tempCol[1] + '))');
				$navBar.css('background', '-webkit-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
				$navBar.css('background', '-o-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
				$navBar.css('background', '-ms-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
				$navBar.css('background', 'linear-gradient(45deg,  ' + + ' 0%,' + tempCol[1]+ ' 100%)');
				$navBar.css('filter', 'progid:DXImageTransform.Microsoft.gradient( startColorstr=' + tempCol[0] + ', endColorstr=' + tempCol[1] + ',GradientType=1 )');
			}
		}
		
		var navBarText = $('.nav li a').css('color');
		if ($(data).find('learningObject').attr('navbarTextColour') != undefined && $(data).find('learningObject').attr('navbarTextColour') != '' && $(data).find('learningObject').attr('navbarTextColour') != '0x') {
			navBarText = formatColour($(data).find('learningObject').attr('navbarTextColour'));
			$('.nav li a').css('color', navBarText);
		}
		if ($(data).find('learningObject').attr('navbarTextHoverColour') != undefined && $(data).find('learningObject').attr('navbarTextHoverColour') != '' && $(data).find('learningObject').attr('navbarTextHoverColour') != '0x') {
			var navBarTextHover = formatColour($(data).find('learningObject').attr('navbarTextHoverColour'));
			$('.nav li a').hover(
				function() { $(this).css('color', navBarTextHover); },
				function() { $(this).css('color', navBarText); }
			);
		}
	}
	
	// --------------- Optional Footer properties --------------------    
	
    if ($(data).find('learningObject').attr('footerHide') != undefined && $(data).find('learningObject').attr('footerHide') != 'false'){
	
		$('.footer').remove();
		
	} else {
    
		// add & position custom footer
		if ($(data).find('learningObject').attr('customFooter') != undefined && $(data).find('learningObject').attr('customFooter') != ''){
			var customFooterContent=$(data).find('learningObject').attr('customFooter');
			
			if ($(data).find('learningObject').attr('footerPos') != undefined && $(data).find('learningObject').attr('footerPos') == 'above'){
			
			$('.footer .container .row-fluid').before('<div id="customFooter">'+customFooterContent+'</div>');
			$("#customFooter").css({"margin-bottom": "10px"});
			} 

			if ($(data).find('learningObject').attr('footerPos') != undefined && $(data).find('learningObject').attr('footerPos') == 'below'){
			
			$('.footer .container .row-fluid').append('<div id="customFooter">'+customFooterContent+'</div>');
			$("#customFooter").css({"margin-top": "40px"});
			} 
			
			if ($(data).find('learningObject').attr('footerPos') != undefined && $(data).find('learningObject').attr('footerPos') == 'replace'){
			$('.footer .container').remove();
			$('.footer').append('<div id="customFooter">'+customFooterContent+'</div>');
				$("#customFooter").css({"margin-left": "10px"});
			} 
			
			// convert img paths
			$('#customFooter img').each(function() {
				if ($(this).attr('src').substring(0, 16) == "FileLocation + '") {
							$(this).attr('src', eval($(this).attr('src')));
						}
					});
			
		}
		
		// Change footer background colour
		if ($(data).find('learningObject').attr('footerColour') != undefined && $(data).find('learningObject').attr('footerColour') != ''){
			var $footer = $('.footer');
			if ($(data).find('learningObject').attr('footerColour').indexOf('rgb(') >= 0) {
				$footer.css('background-color', formatColour($(data).find('learningObject').attr('footerColour')));
			} else {
				// gradients can be entered in colour picker in format '#FF0000,#FFFF00'
				var tempCol = $(data).find('learningObject').attr('footerColour');
				tempCol = tempCol.split(',');
				if (tempCol.length == 1) {
					tempCol.push(tempCol[0]);
				}
				tempCol[0] = formatColour(tempCol[0]);
				tempCol[1] = formatColour(tempCol[1]);
				$footer.css('background', tempCol[0]);
				$footer.css('background', '-moz-linear-gradient(45deg,  ' + tempCol[0] + ' 0%, ' + tempCol[1] + ' 100%)');
				$footer.css('background', '-webkit-gradient(linear, left bottom, right top, color-stop(0%,' + tempCol[0] + '), color-stop(100%,' + tempCol[1] + '))');
				$footer.css('background', '-webkit-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
				$footer.css('background', '-o-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
				$footer.css('background', '-ms-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
				$footer.css('background', 'linear-gradient(45deg,  ' + + ' 0%,' + tempCol[1]+ ' 100%)');
				$footer.css('filter', 'progid:DXImageTransform.Microsoft.gradient( startColorstr=' + tempCol[0] + ', endColorstr=' + tempCol[1] + ',GradientType=1 )');
			}
			
		}
		
		
		// Hide or show the social media buttons
		$(".addthis_sharing_toolbox").hide();
		setTimeout(function () {
			var count_hidden = count_undef = 0,
					value, social = [
						'facebook',
						'twitter',
						['google', 'google_plusone_share'],
						'linkedin',
						'scoopit',
						['pinterest', 'pinterest_share'],
						'email',
						'yammer',
						['addthis', 'compact']
					];

			$(social).each(function(i, item) {
				value = $.isArray(item) ? $(data).find('learningObject').attr(item[0]) : $(data).find('learningObject').attr(item);
				
				if (value == undefined) {
					count_undef++;
				}
				else if (value == 'false') {
					$(".at-svc-" + ($.isArray(item) ? item[1] : item)).hide();
					count_hidden++;
				}
			});

			if (
				(count_hidden > 0 && count_hidden < social.length) ||
				(count_hidden == 0 && count_undef == 0) ||
				count_undef == social.length
			) {
				$(".addthis_sharing_toolbox").show();
			}
		}, 2000);
		
	}
	
	// script optional property added before any content loads
	var script = $(data).find('learningObject').attr('script');
	if (script != undefined && script != "") {
		$("head").append('<script>' +  script + '</script>');
	}
	
}

// add link around all examples of glossary words in text
function x_insertGlossaryText(node) {
	var temp = document.createElement("pre");
	temp.innerHTML = node;
	var tempText = temp.innerHTML;
	
	if (glossary.length > 0) {
		for (var k=0, len=glossary.length; k<len; k++) {
			var regExp = new RegExp('(^|[\\s\(>]|&nbsp;)(' + glossary[k].word + ')([\\s\\.,!?:;\)<]|$|&nbsp;)', 'i');
			tempText = tempText.replace(regExp, '$1{|{'+k+'::$2}|}$3');
		}
		for (var k=0, len=glossary.length; k<len; k++) {
			var regExp = new RegExp('(^|[\\s\(>]|&nbsp;)(\\{\\|\\{' + k + '::(.*?)\\}\\|\\})([\\s\\.,!?:;\)<]|$|&nbsp;)', 'i');
			tempText = tempText.replace(regExp, '$1<a class="glossary" href="#" def="' + glossary[k].definition.replace(/\"/g, "'") + '">$3</a>$4');
		}
	}
	
	return tempText;
}

// check through text nodes for text that needs replacing with something lese (e.g. glossary)
function x_checkForText(data, type) {
	for (var i=0; i<data.length; i++) {
		if (data[i].childNodes.length > 0) {
			if (data[i].nodeName == 'text') {
				if (type == 'glossary') {
					if ($(data[i]).attr('disableGlossary') != 'true') {
						data[i].childNodes[0].data = x_insertGlossaryText(data[i].childNodes[0].data);
					}
				} else if (type == 'iframe') {
					function changeProtocol(iframe) {
						if (/src="http:/.test(iframe)){
							iframe = iframe.replace(/src="http:/g, 'src="https:').replace(/src='http:/g, "src='https:");
						}
						return iframe;
					}
					data[i].childNodes[0].data = data[i].childNodes[0].data.replace(/(<iframe([\s\S]*?)<\/iframe>)/g, changeProtocol);
				}
				
			} else {
				x_checkForText(data[i].childNodes, type);
			}
		}
	}
}

// this is the format of links added through the wysiwyg editor button
function x_navigateToPage(force, pageInfo) { // pageInfo = {type, ID}
	var pages = $(data).find('page');

	var links = ['[first]', '[last]', '[previous]', '[next]'];
	var linkLocations = [0, pages.length-1, Math.max(0,currentPage-1), Math.min(currentPage+1,pages.length-1)];

	// First look for the fixed links
	if ($.inArray(pageInfo.ID, links) > -1) {
		parseContent(linkLocations[$.inArray(pageInfo.ID, links)]);
		goToSection('topnav');
	}
	else { // Then look them up by ID
		for (var i=0; i<pages.length; i++) {
			if (pages[i].getAttribute("linkID") == pageInfo.ID) {
				parseContent(i);
				goToSection('topnav');
				break;
			}
			if (pages[i].childNodes.length > 0) {
				for (var j=0; j<pages[i].childNodes.length; j++) {
					if (pages[i].childNodes[j].getAttribute && pages[i].childNodes[j].getAttribute("linkID") == pageInfo.ID) {
						parseContent(i);
						goToSection('page' + (i+1) + 'section' + (j+1));
						break;
					}
				}
			}
		}
	}
}

var sectionJump;
function goToSection(pageId) {
	sectionJump = document.getElementById(pageId);
	var top = sectionJump.offsetTop;
	window.scrollTo(0, top);
}

function parseContent(pageIndex, checkSection){
	//clear out existing content
	$('#mainContent').empty();
	$('#toc').empty();
	
	// check if pageIndex exists & is unhidden
	var pageFound = true;
	
	if ($(data).find('page').length > 0) {
		if (pageIndex > $(data).find('page').length - 1) {
			pageIndex = 0;
		}
		
	} else {
		// project contains no pages
		pageFound = false;
	}
	
	var count = 0;
	while ($(data).find('page').eq(pageIndex).attr('hidePage') == 'true' && authorSupport == false && count != $(data).find('page').length) {
		// page is hidden
		pageIndex = pageIndex == $(data).find('page').length - 1 ? 0 : pageIndex + 1;
		count++;
	}
	
	if ($(data).find('page').eq(pageIndex).attr('hidePage') == 'true' && authorSupport == false) {
		pageFound = false;
	}
	
	if (pageFound == true) {
		// store current page
		currentPage = pageIndex;
	
		//which page is this from the document?
		var page = $(data).find('page').eq(pageIndex);
		
		//set the main page title and subtitle
		$('#pageTitle').html(page.attr('name'));
		
		if ($(".jumbotron").length > 0) {
			setHeaderFormat(page.attr('header'), page.attr('headerPos'), page.attr('headerRepeat'), page.attr('headerColour'), page.attr('headerTextColour'));
		}
		
		var extraTitle = authorSupport == true && page.attr('hidePageInfo') != undefined && page.attr('hidePageInfo') != '' ? ' <span class="alertMsg">' + page.attr('hidePageInfo') + '</span>' : '';
		
		$('#pageSubTitle').html( page.attr('subtitle') + extraTitle);
		
		$('#overview').removeClass('hide');// show the header
        $('#topnav').removeClass('hide');// show the topnavbar
		
		//create the sections
		page.find('section').each( function(index, value){
			
			// work out whether the section is hidden or not - can be simply hidden or hidden between specific dates/times
			var hidePage = checkIfHidden($(this).attr('hidePage'), $(this).attr('hideOnDate'), $(this).attr('hideOnTime'), $(this).attr('hideUntilDate'), $(this).attr('hideUntilTime'), 'Section');
			if ($.isArray(hidePage)) {
				$(this).attr('hidePageInfo', hidePage[1]);
				hidePage = hidePage[0];
			}
			
			if (hidePage == false || authorSupport == true) {
				
				var sectionIndex = index;	
				
				if ($(this).attr('menu') != 'headings' && $(this).attr('menu') != 'neither') {
					//add a TOC entry
					var tocName = $(this).attr('name');
				
					// remove size & background color styles from links on toc
					if ($('<p>' + tocName + '</p>').children().length > 0) {
						tocName = $(tocName);
						tocName.css({ 'font-size': '', 'background-color': 'transparent' });
						tocName.find('[style*="font-size"]').css('font-size', '');
						tocName.find('[style*="background-color"]').css('background-color', 'transparent');
					}
					
					var $link = $('<li' + (index==0?' class="active"':'') +'><a href="#page' + (pageIndex+1) + 'section' + (index+1) + '"></a></li>').appendTo('#toc');
					$link.find('a').append(tocName);
				}
				
				//add the section header
				var extraTitle = authorSupport == true && $(this).attr('hidePageInfo') != undefined && $(this).attr('hidePageInfo') != '' ? ' <span class="alertMsg">' + $(this).attr('hidePageInfo') + '</span>' : '',
					links = $(this).attr('links') != undefined && $(this).attr('links') != "none" ? '<div class="sectionSubLinks ' + $(this).attr('links') + '"></div>' : '',
					subHeadings = ($(this).attr('menu') != 'menu' && $(this).attr('menu') != 'neither') ? '<h1>' + $(this).attr('name') + '</h1>' : '';
				
				var pageHeader = subHeadings + extraTitle + links != '' ? '<div class="page-header">' + subHeadings + extraTitle + links + '</div>' : '';
				
				var section = $('<section id="page' + (pageIndex+1) + 'section' + (index+1) + '">' + pageHeader + '</section>');

				//add the section contents
				$(this).children().each( function(index, value){
					
					if (($(this).attr('name') != '' && $(this).attr('name') != undefined && $(this).attr('showTitle') == 'true') || ($(this).attr('showTitle') == undefined && (this.nodeName == 'audio' || this.nodeName == 'video'))) {
						
						if ($(this).attr('showTitle') == 'true') {
							var subLinkName = $(this).attr('name');
							
							// remove size & background color styles from links on toc
							if ($('<p>' + subLinkName + '</p>').children().length > 0) {
								subLinkName = $(subLinkName);
								subLinkName.css({ 'font-size': '', 'background-color': 'transparent' });
								subLinkName.find('[style*="font-size"]').css('font-size', '');
								subLinkName.find('[style*="background-color"]').css('background-color', 'transparent');
							}
							
							var $link = $('<span class="subLink"> ' + (section.find('.sectionSubLinks .subLink').length > 0 && section.find('.sectionSubLinks').hasClass('hlist') ? '| ' : '') + '<a href="#page' + (pageIndex+1) + 'section' + (index+1) + 'content' + index + '"></a> </span>').appendTo(section.find('.sectionSubLinks'));
							$link.find('a').append(subLinkName);
							
						}
						
						section.append( '<h2 id="page' + (pageIndex+1) + 'section' + (index+1) + 'content' + index + '">' + $(this).attr('name') + '</h2>');
					}
					
					var itemIndex = index;
					
					if (this.nodeName == 'text'){
						section.append( '<p>' + $(this).text() + '</p>');
					}
					
					if (this.nodeName == 'script'){
					
						section.append( '<script>' + $(this).text() + '</script>');
					}
					
					if (this.nodeName == 'markup'){
					
						if ( $(this).attr('url') != undefined ){
						
							section.append( $('<div/>').load( eval( $(this).attr('url') ) ));
						
						} else {
						
							section.append( $(this).text() );
						}
						
					}
					
					if (this.nodeName == 'link'){
					
						var url = $(this).attr('url');
						var winName = $(this).attr('windowName') != undefined ? $(this).attr('windowName') : 'win' + new Date().getTime() ;
						var options = '';
						options += $(this).attr('width') != undefined ? 'width=' + $(this).attr('width') + ',' : '';
						options += $(this).attr('height') != undefined ? 'height=' + $(this).attr('height') + ',' : '';
						options += $(this).attr('scrollbars') != undefined ? 'scrollbars=' + $(this).attr('scrollbars') + ',' : '';
						options += $(this).attr('location') != undefined ? 'location=' + $(this).attr('location') + ',' : '';
						options += $(this).attr('status') != undefined ? 'status=' + $(this).attr('status') + ',' : '';
						options += $(this).attr('titlebar') != undefined ? 'titlebar=' + $(this).attr('titlebar') + ',' : '';
						options += $(this).attr('toolbar') != undefined ? 'toolbar=' + $(this).attr('toolbar') + ',' : '';
						options += $(this).attr('resizable') != undefined ? 'resizable=' + $(this).attr('resizable') + ',' : '';
						
						section.append( '<p><a href="javascript:window.open(\'' + url + '\', \'' + winName + '\', \'' + options + '\');void(0)">' + $(this).attr('name') + '</a></p>' );
						
					}
					
					if (this.nodeName == 'canvas'){
					
						var style;
						
						if ( $(this).attr('style') != undefined){
						
							style = ' style="' + $(this).attr('style') + '" ';
						
						} else {
						
							style = '';
							
						}
						
						var cls;
						
						if ( $(this).attr('class') != undefined){
						
							cls = ' class="' + $(this).attr('class') + '" ';
						
						} else {
						
							cls = '';
							
						}
						
						section.append( '<p><canvas id="' + $(this).attr('id') + '" width="' + $(this).attr('width') + '" height="' + $(this).attr('height') + '"' + style + cls + '/></p>');
						
					}
					
					if (this.nodeName == 'image'){
						section.append('<p><img class="img-polaroid" src="' + eval( $(this).attr('url')) + '" title="' + $(this).attr('alt') + '" alt="' + $(this).attr('alt') + '"/></p>');
					}
					
					if (this.nodeName == 'audio'){
						section.append('<p><audio src="' + eval( $(this).attr('url') ) + '" type="audio/mp3" id="player1" controls="controls" preload="none" width="100%"></audio></p>')
					}
					
					if (this.nodeName == 'video'){
						var videoInfo = setUpVideo($(this).attr('url'), $(this).attr('iframeRatio'), pageIndex + '_' + sectionIndex + '_' + itemIndex);
						section.append('<p>' + videoInfo[0] + '</p>');
						
						if (videoInfo[1] != undefined) {
							section.find('.vidHolder').last().data('iframeRatio', videoInfo[1]);
						}
					}
					
					if (this.nodeName == 'pdf'){
						section.append('<object id="pdfDoc"' + new Date().getTime() + ' data="' + eval( $(this).attr('url')) + '" type="application/pdf" width="100%" height="600"><param name="src" value="' + eval( $(this).attr('url')) + '"></object>');
					}
					
					if (this.nodeName == 'xot'){
						section.append(loadXotContent($(this)));
					}
					
					if (this.nodeName == 'navigator'){
					
						if ($(this).attr('type') == 'Tabs'){
							makeNav( $(this), section, 'tabs', sectionIndex, itemIndex );
						}
						
						if ($(this).attr('type') == 'Accordion'){
							makeAccordion( $(this), section, sectionIndex, itemIndex );
						}
						
						if ($(this).attr('type') == 'Pills'){
							makeNav( $(this), section, 'pills', sectionIndex, itemIndex);
						}
						
						if ($(this).attr('type') == 'Carousel'){
							makeCarousel(  $(this), section, sectionIndex, itemIndex );
						}
					}

				});
				
				if (section.find('.sectionSubLinks a').length == 0) {
					
					section.find('.sectionSubLinks').remove();
					
				}
				
				//a return to top button
				if ($(this).attr('menu') != 'menu' && $(this).attr('menu') != 'neither') {
					
					section.append( $('<p><br><a class="btn btn-mini pull-right" href="#">Top</a></p>'));
					
				}

				//add the section to the document
				$('#mainContent').append(section);
				
				// Resolve all text box added <img> and <a> src/href tags to proper urls
				$('#mainContent').find('img,a').each(function() {
					var $this = $(this),
						val = $this.attr('src') || $this.attr('href'),
						attr_name = $this.attr('src') ? 'src' : 'href';

					if (val != undefined && val.substring(0, 16) == "FileLocation + '") {
						$this.attr(attr_name, eval(val));
					}
				});
				
			}
		});
		
		//finish initialising the piece now we have the content loaded
		initMedia($('audio,video:not(.navigator video)'));
		$('.vidHolder.iframe').each(function() {
			iframeInit($(this));
		});
		
		initSidebar();

		// Queue reparsing of MathJax - fails if no network connection
		try { MathJax.Hub.Queue(["Typeset",MathJax.Hub]); } catch (e){}

		//$('body').scrollSpy('refresh'); //seems to cause a bunch of errors with tabs
		$('#toc a:first').tab('show');
		
		//an event for user defined code to know when loading is done
		$(document).trigger('contentLoaded');
		
		//force facebook / twitter objects to initialise
		//twttr.widgets.load(); // REMOVED??
		
		//FB.XFBML.parse(); // REMOVED??
		
	} else {
		console.log("project contains no (unhidden) pages");
	}
	
	if (checkSection == true && startSection != undefined) {
		goToSection('page' + (startPage+1) + 'section' + startSection);
	}
}

// LO level header background settings will be overridden by individual page ones (& returned to LO settings if page contains no background properties)
function setHeaderFormat(header, headerPos, headerRepeat, headerColour, headerTextColour) {
	
	var $overview = $('#overview'),
		bgImg = '';
	
	if (header != undefined && header != '') {
		
		if (header != 'none') {
			
			bgImg = "url('" + eval(header) + "')";
			
		}
		
	} else {
		
		bgImg = defaultHeaderCss.header;
		
	}
	
	// bgImg could be a colour gradient & not image - only do repeat & position if it's an image
	if (bgImg.indexOf('url(') >= 0) {
		
		if (headerRepeat != undefined && headerRepeat != "") {
			
			bgImg += ' ' + headerRepeat;
			
		} else if (defaultHeaderCss.headerRepeat) {
			
			bgImg += ' ' + defaultHeaderCss.headerRepeat;
			
		} else {
			
			bgImg += ' repeat';
			
		}
		
		if (headerPos != undefined && headerPos != "") {
			
			bgImg += ' ' + headerPos;
			
		} else if (defaultHeaderCss.headerPos) {
			
			bgImg += ' ' + defaultHeaderCss.headerPos;
			
		} else {
			
			bgImg += ' 0% 0%';
			
		}
		
	}
	
	var col = '';
	
	if (headerColour != undefined && headerColour != '') {
		
		col = headerColour;
		
	} else if (defaultHeaderCss.headerColour != undefined && defaultHeaderCss.headerColour != '' && defaultHeaderCss.headerColour != '0x') {
		
		col = defaultHeaderCss.headerColour;
		
	}
	
	if (col != '' && col != '0x' && col != 'rgba(0, 0, 0, 0)') {
		
		if (col.indexOf('rgb(') >= 0) {
			
			$overview.css('background', formatColour(col) + ' ' + bgImg );
			
		} else {
			
			// gradients can be entered in colour picker in format '#FF0000,#FFFF00'
			var tempCol = col.split(',');
			if (tempCol.length == 1) {
				tempCol.push(tempCol[0]);
			}
			tempCol[0] = formatColour(tempCol[0]);
			tempCol[1] = formatColour(tempCol[1]);
			bgImg += ', ';
			
			$overview.css('background', tempCol[0]);
			$overview.css('background', bgImg + '-moz-linear-gradient(45deg,  ' + tempCol[0] + ' 0%, ' + tempCol[1] + ' 100%)');
			$overview.css('background', bgImg + '-webkit-gradient(linear, left bottom, right top, color-stop(0%,' + tempCol[0] + '), color-stop(100%,' + tempCol[1] + '))');
			$overview.css('background', bgImg + '-webkit-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
			$overview.css('background', bgImg + '-o-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
			$overview.css('background', bgImg + '-ms-linear-gradient(45deg,  ' + tempCol[0] + ' 0%,' + tempCol[1] + ' 100%)');
			$overview.css('background', bgImg + 'linear-gradient(45deg,  ' + + ' 0%,' + tempCol[1]+ ' 100%)');
			$overview.css('filter', 'progid:DXImageTransform.Microsoft.gradient( startColorstr=' + tempCol[0] + ', endColorstr=' + tempCol[1] + ',GradientType=1 )');
		}
		
	} else {
		
		$overview.css({
			'filter': '',
			'background': bgImg
		});
		
	}
	
	var txtCol = '';
	
	if (headerTextColour != undefined && headerTextColour != '' && headerTextColour != '0x') {
		
		txtCol = headerTextColour;
		
	} else {
		
		txtCol = defaultHeaderCss.headerTextColour;
		
	}
	
	$overview.find('#pageTitle, #pageSubTitle').css('color', formatColour(txtCol));
	
}

function makeNav(node,section,type, sectionIndex, itemIndex){
	
	var sectionIndex = sectionIndex;
	
	var itemIndex = itemIndex;

	var tabDiv = $( '<div class="navigator tabbable"/>' );
	
	if (type == 'tabs'){
	
		var tabs = $( '<ul class="nav nav-tabs" id="tab' + sectionIndex + '_' + itemIndex + '"/>' );
		
	}
	
	if (type == 'pills'){
	
		var tabs = $( '<ul class="nav nav-pills" id="tab' + sectionIndex + '_' + itemIndex + '"/>' );
	}
		
	var content = $( '<div class="tab-content"/>' );
	
	var iframe = [],
		pdf = [],
		video = [];
	
	node.children().each( function(index, value){
		if (index == 0){

			tabs.append( $('<li class="active"><a href="#tab' + sectionIndex + '_' + itemIndex + '_' + index + '" data-toggle="tab">' + $(this).attr('name') + '</a></li>') );
			
			var tab = $('<div id="tab' + sectionIndex + '_' + itemIndex + '_' + index + '" class="tab-pane active"/>')
			
		} else {
		
			tabs.append( $('<li><a href="#tab' + sectionIndex + '_' + itemIndex + '_' + index + '" data-toggle="tab">' + $(this).attr('name') + '</a></li>') );
			
			var tab = $('<div id="tab' + sectionIndex + '_' + itemIndex + '_' + index + '" class="tab-pane"/>')
			
		}
		
		var i = index;
		
		$(this).children().each( function(x, value){
			
			if ($(this).attr('showTitle') == 'true' || ($(this).attr('showTitle') == undefined && (this.nodeName == 'audio' || this.nodeName == 'video'))) {
				tab.append('<p><b>' + $(this).attr('name') + '</b></p>');
			}
			
			if (this.nodeName == 'text'){
				tab.append( '<p>' + $(this).text() + '</p>');
				
				if ($(this).text().indexOf("<iframe") != -1 && $(this).text().indexOf("kaltura_player") != -1) {
					iframe.push(i);
				}
			}
			
			if (this.nodeName == 'image'){
				tab.append('<p><img class="img-polaroid" src="' + eval( $(this).attr('url')) + '" title="' + $(this).attr('alt') + '" alt="' + $(this).attr('alt') + '"/></p>');
			}

			if (this.nodeName == 'audio'){
				tab.append('<p><audio src="' + eval( $(this).attr('url') ) + '" type="audio/mp3" id="player1" controls="controls" preload="none" width="100%"></audio></p>')
			}
			
			if (this.nodeName == 'video'){
				var videoInfo = setUpVideo($(this).attr('url'), $(this).attr('iframeRatio'), currentPage + '_' + sectionIndex + '_' + itemIndex + '_' + index);
				tab.append('<p>' + videoInfo[0] + '</p>');
				
				if (videoInfo[1] != undefined) {
					tab.find('.vidHolder').last().data('iframeRatio', videoInfo[1]);
				}
				
				video.push(tab.find('video'));
				video.push(tab.find('.vidHolder.iframe'));
			}
			
			if (this.nodeName == 'link'){
			
				var url = $(this).attr('url');
				var winName = $(this).attr('windowName') != undefined ? $(this).attr('windowName') : 'win' + new Date().getTime() ;
				var options = '';
				options += $(this).attr('width') != undefined ? 'width=' + $(this).attr('width') + ',' : '';
				options += $(this).attr('height') != undefined ? 'height=' + $(this).attr('height') + ',' : '';
				options += $(this).attr('scrollbars') != undefined ? 'scrollbars=' + $(this).attr('scrollbars') + ',' : '';
				options += $(this).attr('location') != undefined ? 'location=' + $(this).attr('location') + ',' : '';
				options += $(this).attr('status') != undefined ? 'status=' + $(this).attr('status') + ',' : '';
				options += $(this).attr('titlebar') != undefined ? 'titlebar=' + $(this).attr('titlebar') + ',' : '';
				options += $(this).attr('toolbar') != undefined ? 'toolbar=' + $(this).attr('toolbar') + ',' : '';
				options += $(this).attr('resizable') != undefined ? 'resizable=' + $(this).attr('resizable') + ',' : '';
				
				tab.append( '<p><a href="javascript:window.open(\'' + url + '\', \'' + winName + '\', \'' + options + '\');void(0)">' + $(this).attr('name') + '</a></p>' );
				
			}
			
			if (this.nodeName == 'pdf'){
				
				tab.append('<object id="pdfDoc"' + new Date().getTime() + ' data="' + eval( $(this).attr('url')) + '#page=1&view=fitH" type="application/pdf" width="100%" height="600"><param name="src" value="' + eval( $(this).attr('url')) + '#page=1&view=fitH"></object>');
				pdf.push(tab.find('object'));
				
			}
			
			if (this.nodeName == 'xot'){
				tab.append(loadXotContent($(this)));
			}
			
		});
		
		content.append(tab);
	});
	
	tabDiv.append(tabs);
	
	tabDiv.append(content);
	
	section.append(tabDiv);
	
	setTimeout( function() {
		
		var $first = $('#tab' + sectionIndex + '_' + itemIndex + ' a:first');
		$first
			.tab("show")
			.parents(".tabbable").find(".tab-content .tab-pane.active iframe[id*='kaltura_player']").data("refresh", true);
		
		var $iframeTabs = $(),
			$pdfTabs = $(),
			$videoTabs = $();
		
		// fix for issue where firefox doesn't zoom pdfs correctly if not on 1st pane of navigators
		for (var i=0; i<pdf.length; i++) {
			$pdfTabs = $pdfTabs.add($(pdf[i]).parents('.tabbable').find('ul a[data-toggle="tab"]:eq(' + $(pdf[i]).parents('.tab-pane').index() + ')'));
		}
		
		$pdfTabs.on('shown.bs.tab', function (e) {
			if ($.browser.mozilla || $.browser.msie) {
				var $pdfRefresh = $(e.target).parents(".tabbable").find(".tab-content .tab-pane.active object[id*='pdfDoc']");
				if ($pdfRefresh.parent().data("refresh") != true) {
					$pdfRefresh.parent().data("refresh", true);
					$pdfRefresh.attr("data", $pdfRefresh.attr("data"));
				}
			}
		});
		
		// fix for issue where videos don't load correct height if not on 1st pane of navigators
		for (var i=0; i<iframe.length; i++) {
			$iframeTabs = $iframeTabs.add($('a[data-toggle="tab"]:eq(' + iframe[i] + ')'));
		}
		
		for (var i=0; i<video.length; i++) {
			$videoTabs = $videoTabs.add($(video[i]).parents('.tabbable').find('ul a[data-toggle="tab"]:eq(' + $(video[i]).parents('.tab-pane').index() + ')'));
		}
		
		$videoTabs.on('shown.bs.tab', function (e) {
			var $thisPane = $('#' + $(e.target).attr('href').substring(1));
			$thisPane.find(".vidHolder iframe").parents('.vidHolder').each(function() {
				iframeInit($(this));
			});
		});
		
		initMedia(tabDiv.find(".vidHolder video"));
		
		tabDiv.find('.vidHolder.iframe').each(function() {
			iframeInit($(this));
		});
		
	}, 0);
	
}

function makeAccordion(node,section, sectionIndex, itemIndex){
	
	var accDiv = $( '<div class="navigator accordion" id="acc' + sectionIndex + '_' + itemIndex + '">' );
	
	node.children().each( function(index, value){

		var group = $('<div class="accordion-group"/>');
		
		var header = $('<div class="accordion-heading"><a class="accordion-toggle" data-toggle="collapse" data-parent="#acc' + sectionIndex + '_' + itemIndex + '" href="#collapse' + sectionIndex + '_' + itemIndex + '_' + index + '">' + $(this).attr('name') + '</a></div>');
		
		group.append(header);
		
		if (index == 0){
			
			var outer = $('<div id="collapse' + sectionIndex + '_' + itemIndex + '_' + index + '" class="accordion-body collapse ' + (node[0].getAttribute('collapse') == 'true' ? "" : "in") + '"/>');
			
		} else {
		
			var outer = $('<div id="collapse' + sectionIndex + '_' + itemIndex + '_' + index + '" class="accordion-body collapse"/>');
			
		}
		
		
		var inner = $('<div class="accordion-inner">');
		
		$(this).children().each( function(i, value){
						
			if (this.nodeName == 'text'){
				inner.append( '<p>' + $(this).text() + '</p>');
			}
			
			if (this.nodeName == 'image'){
				inner.append('<p><img class="img-polaroid" src="' + eval( $(this).attr('url')) + '" title="' + $(this).attr('alt') + '" alt="' + $(this).attr('alt') + '"/></p>');
			}

			if (this.nodeName == 'audio'){
				inner.append('<p><b>' + $(this).attr('name') + '</b></p><p><audio src="' + eval( $(this).attr('url') ) + '" type="audio/mp3" id="player1" controls="controls" preload="none" width="100%"></audio></p>')
			}
			
			if (this.nodeName == 'video'){
				var videoInfo = setUpVideo($(this).attr('url'), $(this).attr('iframeRatio'), currentPage + '_' + sectionIndex + '_' + itemIndex + '_' + index);
				inner.append('<p><b>' + $(this).attr('name') + '</b></p><p>' + videoInfo[0] + '</p>');
				
				if (videoInfo[1] != undefined) {
					inner.find('.vidHolder').last().data('iframeRatio', videoInfo[1]);
				}
			}
			
			if (this.nodeName == 'link'){
			
				var url = $(this).attr('url');
				var winName = $(this).attr('windowName') != undefined ? $(this).attr('windowName') : 'win' + new Date().getTime() ;
				var options = '';
				options += $(this).attr('width') != undefined ? 'width=' + $(this).attr('width') + ',' : '';
				options += $(this).attr('height') != undefined ? 'height=' + $(this).attr('height') + ',' : '';
				options += $(this).attr('scrollbars') != undefined ? 'scrollbars=' + $(this).attr('scrollbars') + ',' : '';
				options += $(this).attr('location') != undefined ? 'location=' + $(this).attr('location') + ',' : '';
				options += $(this).attr('status') != undefined ? 'status=' + $(this).attr('status') + ',' : '';
				options += $(this).attr('titlebar') != undefined ? 'titlebar=' + $(this).attr('titlebar') + ',' : '';
				options += $(this).attr('toolbar') != undefined ? 'toolbar=' + $(this).attr('toolbar') + ',' : '';
				options += $(this).attr('resizable') != undefined ? 'resizable=' + $(this).attr('resizable') + ',' : '';
				
				inner.append( '<p><a href="javascript:window.open(\'' + url + '\', \'' + winName + '\', \'' + options + '\');void(0)">' + $(this).attr('name') + '</a></p>' );
				
			}
			
			if (this.nodeName == 'pdf'){
				inner.append('<object id="pdfDoc"' + new Date().getTime() + ' data="' + eval( $(this).attr('url')) + '" type="application/pdf" width="100%" height="600"><param name="src" value="' + eval( $(this).attr('url')) + '"></object>');
			}
			
			if (this.nodeName == 'xot'){
				inner.append(loadXotContent($(this)));
			}
		});
		
		outer.append(inner);
		
		group.append(outer);
		
		accDiv.append(group);
	});
	
	section.append(accDiv);
	
	setTimeout( function() {
		initMedia(accDiv.find('.vidHolder video'));
	}, 0);
	
}


function makeCarousel(node, section, sectionIndex, itemIndex){
	
	var video = [];

	var sectionIndex = sectionIndex;
	
	var itemIndex = itemIndex;
	
	var carDiv = $('<div id="car' + sectionIndex + '_' + itemIndex + '" class="navigator carousel slide"/>');
	
	if (node.attr('autoPlay') == 'true') {
		
		if ($.isNumeric(node.attr('delaySecs')) && node.attr('delaySecs') != '4') {
			
			carDiv.carousel({ interval: Number(node.attr('delaySecs')) * 1000 });
			
		}
		
		carDiv.carousel('cycle');
		
	}
	
	var indicators = $('<ol class="carousel-indicators"/>');
	
	var items = $('<div class="carousel-inner"/>');
	
	
	node.children().each( function(index, value){
	
		var pane;
	
		if (index == 0){
		
			indicators.append( $('<li data-target="#car' + sectionIndex + '_'  + itemIndex + '" data-slide-to="' + index + '" class="active"></li>') );
			
			pane = $('<div class="active item">');
			
		} else {
		
			indicators.append( $('<li data-target="#car' + sectionIndex + '_'  + itemIndex + '" data-slide-to="' + index + '"></li>') );
			
			pane = $('<div class="item">');
		}
		
		$(this).children().each( function(i, value){
						
			if (this.nodeName == 'text'){
				pane.append( '<p>' + $(this).text() + '</p>');
			}
			
			if (this.nodeName == 'image'){
				pane.append('<p><img class="img-polaroid" src="' + eval( $(this).attr('url')) + '" title="' + $(this).attr('alt') + '" alt="' + $(this).attr('alt') + '"/></p>');
			}

			if (this.nodeName == 'audio'){
				pane.append('<p><b>' + $(this).attr('name') + '</b></p><p><audio src="' + eval( $(this).attr('url') ) + '" type="audio/mp3" id="player1" controls="controls" preload="none" width="100%"></audio></p>')
			}
			
			if (this.nodeName == 'video'){
				var videoInfo = setUpVideo($(this).attr('url'), $(this).attr('iframeRatio'), currentPage + '_' + sectionIndex + '_' + itemIndex + '_' + index);
				pane.append('<p><b>' + $(this).attr('name') + '</b></p><p>' + videoInfo[0] + '</p>');
				
				if (videoInfo[1] != undefined) {
					pane.find('.vidHolder').last().data('iframeRatio', videoInfo[1]);
				}
				
				video.push(pane.find('video'));
			}
			
			if (this.nodeName == 'link'){
			
				var url = $(this).attr('url');
				var winName = $(this).attr('windowName') != undefined ? $(this).attr('windowName') : 'win' + new Date().getTime() ;
				var options = '';
				options += $(this).attr('width') != undefined ? 'width=' + $(this).attr('width') + ',' : '';
				options += $(this).attr('height') != undefined ? 'height=' + $(this).attr('height') + ',' : '';
				options += $(this).attr('scrollbars') != undefined ? 'scrollbars=' + $(this).attr('scrollbars') + ',' : '';
				options += $(this).attr('location') != undefined ? 'location=' + $(this).attr('location') + ',' : '';
				options += $(this).attr('status') != undefined ? 'status=' + $(this).attr('status') + ',' : '';
				options += $(this).attr('titlebar') != undefined ? 'titlebar=' + $(this).attr('titlebar') + ',' : '';
				options += $(this).attr('toolbar') != undefined ? 'toolbar=' + $(this).attr('toolbar') + ',' : '';
				options += $(this).attr('resizable') != undefined ? 'resizable=' + $(this).attr('resizable') + ',' : '';
				
				pane.append( '<p><a href="javascript:window.open(\'' + url + '\', \'' + winName + '\', \'' + options + '\');void(0)">' + $(this).attr('name') + '</a></p>' );
				
			}
			
			if (this.nodeName == 'pdf'){
				pane.append('<object id="pdfDoc"' + new Date().getTime() + ' data="' + eval( $(this).attr('url')) + '" type="application/pdf" width="100%" height="600"><param name="src" value="' + eval( $(this).attr('url')) + '"></object>');
			}
			
			if (this.nodeName == 'xot'){
				pane.append(loadXotContent($(this)));
			}
			
		});
		
		items.append(pane);
		
	});
	
	carDiv.append(indicators);
	carDiv.append(items);
	carDiv.append( $('<a class="carousel-control left" href="#car' + sectionIndex + '_'  + itemIndex + '" data-slide="prev">&lsaquo;</a>') );
	carDiv.append( $('<a class="carousel-control right" href="#car' + sectionIndex + '_'  + itemIndex + '" data-slide="next">&rsaquo;</a>') );
	
	section.append(carDiv);
	
	setTimeout( function(){
		
		// fix for issue where videos don't load correct height if not on 1st pane of carousel
		carDiv.bind('slide.bs.carousel', function (e) {
			$(e.target).find('.vidHolder iframe').each(function() {
				iframeResize($(this));
			});
		});
		
		initMedia(carDiv.find('.vidHolder video'));
		
	}, 0);
}

function findAnchor(name){

	var anchorID = name;
	var pIndex;
	var sIndex;
	
	$(data).find('page').each( function(index, value, name){
	
		pIndex = index;

		$(this).find('section').each( function(index,value, name){

			if ( $(this).text().indexOf('<a id="' + anchorID) != -1){
			
				sIndex = index;
				
				window.location.hash = 'page' + (pIndex + 1) + 'section' + (sIndex + 1);
				
				startHash = window.location.hash;
				
				parseContent(pIndex);
						
			}
					
		});
	
	});
	
}

function loadXotContent($this) {
	// get link & store url parameters to add back in later if not overridden
	var xotLink = $this.attr('link'),
		params = [],
		separator = xotLink.indexOf('.php?template_id') == -1 ? '?' : '&';
	
	xotLink = xotLink.indexOf('#resume=') != -1 ? xotLink.slice(0,xotLink.indexOf('#resume=')) : xotLink;
	
	if (xotLink.indexOf(separator) != -1) {
		params = xotLink.split(separator);
		if (separator == '?') {
			params.splice(1, 1, params[1].split('&'));
		}
		xotLink = params[0];
		params.splice(0,1);
		
		for (var i=0; i<params.length; i++) {
			params[i] = params[i].split('=');
		}
	}
	
	var hide = '';
	if ($this.attr('header') == 'true') { hide = 'top'; }
	if ($this.attr('footer') == 'true') { hide = hide == 'top' ? 'both' : 'bottom'; }
	xotLink += separator + 'hide=' + (hide != '' ? hide : 'none');
	separator = '&';
	
	if ($this.attr('pageNum') != undefined && $.isNumeric($this.attr('pageNum'))) {
		xotLink += separator + 'page=' + $this.attr('pageNum');
	}
	
	// the embed url parameter makes it responsive, full screen & hides minimise/maximise button (these can be overridden by manually adding other params to the url entered in editor)
	xotLink += separator + 'embed=true';
	
	// add back any url params that haven't been overridden
	for (var i=0; i<params.length; i++) {
		if (xotLink.indexOf(separator + params[i][0] + '=') == -1) {
			xotLink += separator + params[i][0] + '=' + params[i][1];
		}
	}
	
	// if project is being viewed as https then force iframe src to be https too
	if (window.location.protocol == "https:" && xotLink.indexOf("http:") == 0) {
		xotLink = "https:" + xotLink.substring(xotLink.indexOf("http:") + 5);
	}
	
	var warning = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1, window.location.pathname.length).indexOf("preview") != -1 && (xotLink.indexOf('preview_') != -1 || xotLink.indexOf('preview.php?') != -1) ? '<p class="alertMsg">' + (languageData.find("errorEmbed")[0] != undefined && languageData.find("errorEmbed")[0].getAttribute('label') != null ? languageData.find("errorEmbed")[0].getAttribute('label') : "You have embedded an XOT project preview. You must make the project public and embed the public facing URL.") + '</p>' : '',
		xotWidth = $this.attr('width') != undefined && ($.isNumeric($this.attr('width')) || $.isNumeric($this.attr('width').split('%')[0])) ? $this.attr('width') : '100%',
		xotHeight = $this.attr('height') != undefined && ($.isNumeric($this.attr('height')) || $.isNumeric($this.attr('height').split('%')[0])) ? $this.attr('height') : 600;
	
	return warning + '<iframe width="' + xotWidth + '" height="' + xotHeight + '" src="' + xotLink + '" frameborder="0" style="float:left; position:relative; top:0px; left:0px; z-index:0;"></iframe>';
	
}

var checkIfHidden = function(hidePage, hideOnDate, hideOnTime, hideUntilDate, hideUntilTime, type) {
	hidePage = hidePage == "true" ? true : false;
	
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
		if (hideOnDate != undefined && hideOnDate != '') {
			var dateInfo = getDateInfo(hideOnDate, hideOnTime);
			hideOn = dateInfo[0];
			
			if (hideOn != false) {
				if (hideOn.year > now.year || (hideOn.year == now.year && hideOn.month > now.month) || (hideOn.year == now.year && hideOn.month == now.month && hideOn.day > now.day) || (hideOn.year == now.year && hideOn.month == now.month && hideOn.day == now.day && hideOn.time > now.time)) {
					hidePage = false;
				}
				
				hideOnString = '{from}: ' + dateInfo[1] + ' ' + hideOnTime;
			}
		}
		
		// is it hidden until a certain date? if so, have we passed that date/time?
		if (hideUntilDate != undefined && hideUntilDate != '') {
			var dateInfo = getDateInfo(hideUntilDate, hideUntilTime);
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
				
				hideUntilString = '{until}: ' + dateInfo[1] + ' ' + hideUntilTime;
			}
		}
		
		// put together the message that will appear in author support
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
		
		var langData = languageData.find('hidden' + type)[0];
		infoString = infoString
			.replace('{from}', langData != undefined && langData.getAttribute('from') != "" && langData.getAttribute('from') != null ? langData.getAttribute('from') : 'Hide from')
			.replace('{until}', langData != undefined && langData.getAttribute('until') != "" && langData.getAttribute('until') != null ? langData.getAttribute('until') : 'Hide until')
			.replace('{hidden}', langData != undefined && langData.getAttribute('hidden') != "" && langData.getAttribute('hidden') != null ? langData.getAttribute('hidden') : 'This page is currently hidden in live projects')
			.replace('{shown}', langData != undefined && langData.getAttribute('shown') != "" && langData.getAttribute('shown') != null ? langData.getAttribute('shown') : 'This page is currently shown in live projects');
		
		return [hidePage, infoString];
		
	} else {
		return false;
	}
}

// adds html for videos - whether they are mp4s,youtube,vimeo (all played using mediaelement.js) or iframe embed code
function setUpVideo(url, iframeRatio, id) {
	
	function getAspectRatio(iframeRatio) {
		var iframeRatio = iframeRatio != "" && iframeRatio != undefined ? iframeRatio : '16:9';
		iframeRatio = iframeRatio.split(':');
		
		// iframe ratio can be one entered in editor or fallback to 16:9
		if (!$.isNumeric(iframeRatio[0]) || !$.isNumeric(iframeRatio[1])) {
			iframeRatio = [16,9];
		}
		
		return iframeRatio;
	}
	
	// iframe
	if (url.substr(0,7) == "<iframe") {
		
		// remove width & height attributes from iframe
		var iframe = $(url)
						.removeAttr('width')
						.removeAttr('height')
						.prop('outerHTML');
		
		return ['<div class="vidHolder iframe">' + iframe + '</div>', getAspectRatio(iframeRatio)];
	
	// mp4 / youtube / vimeo
	} else {
		
		var mimeType = 'mp4',
			vidSrc = url;
		
		// is it from youtube or vimeo?
		if (vidSrc.indexOf("www.youtube.com") != -1 || vidSrc.indexOf("//youtu") != -1) {
			mimeType = "youtube";
			iframeRatio = getAspectRatio(iframeRatio);
			
		} else if (vidSrc.indexOf("vimeo.com") != -1) {
			mimeType = "vimeo";
			iframeRatio = getAspectRatio(iframeRatio);
			
		} else {
			vidSrc = eval(vidSrc);
		}
		
		mimeType = 'video/' + mimeType;
		
		return ['<div class="vidHolder"><video src="' + vidSrc + '" type="' + mimeType + '" id="player' + id + '" controls="controls" preload="metadata" style="max-width: 100%" width="100%" height="100%"></video></div>', iframeRatio];
	}
}