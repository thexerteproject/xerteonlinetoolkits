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
var pageLink = "";
var authorSupport = false;
var deepLink = "";
var currentPage = 0;
var glossary = [];

function init(){
	loadContent();
};

function initMedia(){

	$('audio,video').mediaelementplayer();
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
			
			//step one - libraries?
			loadLibraries();
			
		}
	});
	
	// If we have a start page/section then extract it and clear the url
	if (window.location.hash.length > 0) {
		pageLink = window.location.hash.substring(1);
		if (pageLink.substring(0,4) == "page") {
			startPage = parseInt(pageLink.substring(4), 10) - 1;
		}
	}

}

function loadLibraries(){

	//load stylesheet and libraries...
	
	if ( $(data).find('learningObject').attr('theme') != undefined && $(data).find('learningObject').attr('theme') != "default") {
		
		$('head').append('<link rel="stylesheet" href="' + themePath + $(data).find('learningObject').attr('theme') + '/' + $(data).find('learningObject').attr('theme') + '.css' + '" type="text/css" />');
        
        $('head').append('<script src="'+ themePath + $(data).find('learningObject').attr('theme') + '/'+ $(data).find('learningObject').attr('theme')+ '.js"' + '</script>');
		
	}
	
	if ( $(data).find('learningObject').attr('stylesheet') != undefined) {
		
		$('head').append('<link rel="stylesheet" href="' + eval( $(data).find('learningObject').attr('stylesheet') ) + '" type="text/css" />');
		
	}
	
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
			parseContent(startPage);
			
		},
		
		error: function () {
			
			if (lang != "en-GB") { // no language file found - try default GB one
				getLangData("en-GB");
			} else { // hasn't found GB language file - set up anyway, will use fallback text in code
				languageData = $("");
				setup();
				parseContent(startPage);
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
			
			// add link around all examples of glossary words in text
			var insertText = function(node) {
				var temp = document.createElement("pre");
				temp.innerHTML = node;
				var tempText = temp.innerHTML;
				
				// check text for glossary words - if found replace with a link
				if (glossary.length > 0) {
					for (var k=0, len=glossary.length; k<len; k++) {
						var regExp = new RegExp('(^|[\\s>]|&nbsp;)(' + glossary[k].word + ')([\\s\\.,!?:;<]|$|&nbsp;)', 'i');
						tempText = tempText.replace(regExp, '$1{|{'+k+'::$2}|}$3');
					}
					for (var k=0, len=glossary.length; k<len; k++) {
						var regExp = new RegExp('(^|[\\s>]|&nbsp;)(\\{\\|\\{' + k + '::(.*?)\\}\\|\\})([\\s\\.,!?:;<]|$|&nbsp;)', 'i');
						tempText = tempText.replace(regExp, '$1<a class="glossary" href="#" def="' + glossary[k].definition.replace(/\"/g, "'") + '">$3</a>$4');
					}
				}
				
				return tempText;
			}
			
			var checkForText = function(data) {
				for (var i=0; i<data.length; i++) {
					if (data[i].nodeName == 'text') {
						if ($(data[i]).attr('disableGlossary') != 'true') {
							data[i].childNodes[0].data = insertText(data[i].childNodes[0].data);
						}
						
					} else {
						checkForText(data[i].childNodes);
					}
				}
			}
			
			checkForText($(data).find('page'));
			
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
	}
	
	
	if (window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1, window.location.pathname.length).indexOf("preview") != -1 && $(data).find('learningObject').attr('authorSupport') == 'true' ) {
		
		authorSupport = true;
		
	}

	//add all the pages to the pages menu: this links back to the same page
	$(data).find('page').each( function(index, value){
		
		if ($(this).attr('hidePage') != 'true' || authorSupport == true) {
			
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
	
	var bgImg = ''; 
	
	//set the header image, if defined
	if ($(data).find('learningObject').attr('header') != undefined && $(data).find('learningObject').attr('header') != ''){
		$('#overview').css({filter:''}); //for IE8
		
		bgImg = "url(" + eval( $(data).find('learningObject').attr('header'))+ ")";
		
		$('#overview').css('background-image', bgImg);
		
		if ($(data).find('learningObject').attr('headerRepeat') != undefined && $(data).find('learningObject').attr('headerRepeat') != "") {
			$('#overview').css('background-repeat', $(data).find('learningObject').attr('headerRepeat'));
			
			bgImg += ' ' + $(data).find('learningObject').attr('headerRepeat');
		}
		
		if ($(data).find('learningObject').attr('headerPos') != undefined && $(data).find('learningObject').attr('headerPos') != "") {
			$('#overview').css('background-position', $(data).find('learningObject').attr('headerPos') + ' top');
			
			bgImg += ' ' + $(data).find('learningObject').attr('headerPos');
		}
		
		bgImg += ', ';
	} 
	
	if ($(data).find('learningObject').attr('headerColour') != undefined && $(data).find('learningObject').attr('headerColour') != ''){
	
		var col = $(data).find('learningObject').attr('headerColour');
		
		//one or two?
		if (col.indexOf(',') != -1){
			col = col.split(',');
		} else {
			col = [col,col];
		}
		col[0] = formatColour(col[0]);
		col[1] = formatColour(col[1]);
		
		$('#overview').css('background', col[0]);
		$('#overview').css('background', bgImg + '-moz-linear-gradient(45deg,  ' + col[0] + ' 0%, ' + col[1] + ' 100%)');
		$('#overview').css('background', bgImg + '-webkit-gradient(linear, left bottom, right top, color-stop(0%,' + col[0] + '), color-stop(100%,' + col[1] + '))');
		$('#overview').css('background', bgImg + '-webkit-linear-gradient(45deg,  ' + col[0] + ' 0%,' + col[1] + ' 100%)');
		$('#overview').css('background', bgImg + '-o-linear-gradient(45deg,  ' + col[0] + ' 0%,' + col[1] + ' 100%)');
		$('#overview').css('background', bgImg + '-ms-linear-gradient(45deg,  ' + col[0] + ' 0%,' + col[1] + ' 100%)');
		$('#overview').css('background', bgImg + 'linear-gradient(45deg,  ' + + ' 0%,' + col[1]+ ' 100%)');
		$('#overview').css('filter', 'progid:DXImageTransform.Microsoft.gradient( startColorstr=' + col[0] + ', endColorstr=' + col[1] + ',GradientType=1 )');
		
	}
	
		
	if ($(data).find('learningObject').attr('headerTextColour') != undefined && $(data).find('learningObject').attr('headerTextColour') != ''){
	
		$('#overview').css('color', formatColour($(data).find('learningObject').attr('headerTextColour')));
		
	}
    
    if ($(data).find('learningObject').attr('headerHide') != undefined && $(data).find('learningObject').attr('headerHide') != 'false'){
	
		$(".jumbotron").remove();
		
	}
	
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
	
    //---------------Optional Navbar properties--------------------
    
    //Hide the Navbar position if defined
    if ($(data).find('learningObject').attr('navbarHide') != undefined && $(data).find('learningObject').attr('navbarHide') != 'false'){
	
		$(".navbar-inner").remove();
		
	}
    
    //Position the Navbar position if defined
    if ($(data).find('learningObject').attr('navbarPos') != undefined && $(data).find('learningObject').attr('navbarPos') == 'below'){
	
		$('#overview').after('<div id="pageLinks"></div>');
        $('.navbar').appendTo('#pageLinks');

	}
    
    //Change navbar background colour
    if ($(data).find('learningObject').attr('navbarColour') != undefined && $(data).find('learningObject').attr('navbarColour') != ''){
	
		var navbarcol = $(data).find('learningObject').attr('navbarColour');
        
        //one or two?
		if (navbarcol.indexOf(',') != -1){
			navbarcol = navbarcol.split(',');
		} else {
			navbarcol = [navbarcol,navbarcol];
		}
		navbarcol[0] = formatColour(navbarcol[0]);
		navbarcol[1] = formatColour(navbarcol[1]);
		
		$('.navbar-inverse .navbar-inner').css('background', navbarcol[0]);
		$('.navbar-inverse .navbar-inner').css('background', bgImg + '-moz-linear-gradient(45deg,  ' + navbarcol[0] + ' 0%, ' + navbarcol[1] + ' 100%)');
		$('.navbar-inverse .navbar-inner').css('background', bgImg + '-webkit-gradient(linear, left bottom, right top, color-stop(0%,' + navbarcol[0] + '), color-stop(100%,' + navbarcol[1] + '))');
		$('.navbar-inverse .navbar-inner').css('background', bgImg + '-webkit-linear-gradient(45deg,  ' + navbarcol[0] + ' 0%,' + navbarcol[1] + ' 100%)');
		$('.navbar-inverse .navbar-inner').css('background', bgImg + '-o-linear-gradient(45deg,  ' + navbarcol[0] + ' 0%,' + navbarcol[1] + ' 100%)');
		$('.navbar-inverse .navbar-inner').css('background', bgImg + '-ms-linear-gradient(45deg,  ' + navbarcol[0] + ' 0%,' + navbarcol[1] + ' 100%)');
		$('.navbar-inverse .navbar-inner').css('background', bgImg + 'linear-gradient(45deg,  ' + + ' 0%,' + navbarcol[1]+ ' 100%)');
		$('.navbar-inverse .navbar-inner').css('filter', 'progid:DXImageTransform.Microsoft.gradient( startColorstr=' + navbarcol[0] + ', endColorstr=' + navbarcol[1] + ',GradientType=1 )');
        
    }
    
    //Change navbar text/link colour
    var navbarTextColour = $('.nav li a').css('color');
    if ($(data).find('learningObject').attr('navbarTextColour') != undefined && $(data).find('learningObject').attr('navbarTextColour') != '') {
			navbarTextColour = formatColour($(data).find('learningObject').attr('navbarTextColour'));
			$('.nav li a').css('color', navbarTextColour);
		}

  	//Change navbar text/link Hover colour
  	var navbarTextHoverColour;
  	if ($(data).find('learningObject').attr('navbarTextHoverColour') != undefined && $(data).find('learningObject').attr('navbarTextHoverColour') != '') {
  		navbarTextHoverColour = formatColour($(data).find('learningObject').attr('navbarTextHoverColour'));
    	$('.nav li a').hover(function(){
      	$(this).css('color', navbarTextHoverColour);
    	},
    	function(){
      	$(this).css('color', navbarTextColour);
    	});
		}
    
    //---------------Optional footer properties--------------------
    
    // remove footer
    if ($(data).find('learningObject').attr('footerHide') != undefined && $(data).find('learningObject').attr('footerHide') != 'false'){
	
		$('.footer').remove();
		
	}
    
    //add custom footer
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
        
        //convert img paths
        $('#customFooter img').each(function() {
        	if ($(this).attr('src').substring(0, 16) == "FileLocation + '") {
						$(this).attr('src', eval($(this).attr('src')));
					}
				});
        
    }
    
    //Change footer background colour
    if ($(data).find('learningObject').attr('footerColour') != undefined && $(data).find('learningObject').attr('footerColour') != ''){
	
		var footercol = $(data).find('learningObject').attr('footerColour');
        
        if (footercol.indexOf(',') != -1){
			footercol = footercol.split(',');
		} else {
			footercol = [footercol,footercol];
		}
		footercol[0] = formatColour(footercol[0]);
		footercol[1] = formatColour(footercol[1]);
        $('.footer').css('background', footercol[0]);
        
    }
	
	// script optional property added before any content loads
	var script = $(data).find('learningObject').attr('script');
	if (script != undefined && script != "") {
		$("head").append('<script>' +  script + '</script>');
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


// this is the format of links added through the wysiwyg editor button
function x_navigateToPage(force, pageInfo) { // pageInfo = {type, ID}
	var pages = $(data).find('page');

	var links = ['[first]', '[last]', '[previous]', '[next]'];
	var linkLocations = [0, pages.length-1, Math.max(0,currentPage-1), Math.min(currentPage+1,pages.length-1)];

	// First look for the fixed links
	if ($.inArray(pageInfo.ID, links) > -1) {
		parseContent(linkLocations[$.inArray(pageInfo.ID, links)]);
		goToSection('top');
	}
	else { // Then look them up by ID
		for (var i=0; i<pages.length; i++) {
			if (pages[i].getAttribute("linkID") == pageInfo.ID) {
				parseContent(i);
				goToSection('top');
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

function goToSection(pageId) {
	if (document.getElementById(pageId) == null || document.getElementById(pageId) == undefined) return;
	document.location = '#' + pageId;
}

function parseContent(pageIndex){

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
		
		var msg = languageData.find("hiddenPage")[0] != undefined && languageData.find("hiddenPage")[0].getAttribute('label') != null ? languageData.find("hiddenPage")[0].getAttribute('label') : "This page will be hidden in live projects";
		var extraTitle = page.attr('hidePage') == 'true' ? ' <span class="alertMsg">(' + msg + ')</span>' : '';
		
		$('#pageSubTitle').html( page.attr('subtitle') + extraTitle);
		
		$('#overview').removeClass('hide');// show the header
        $('#topnav').removeClass('hide');// show the topnavbar
		
		//create the sections
		page.find('section').each( function(index, value){
			
			if ($(this).attr('hidePage') != 'true' || authorSupport == true) {
				
				var sectionIndex = index;	
				
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
				
				//add the section header
				var msg = languageData.find("hiddenSection")[0] != undefined && languageData.find("hiddenSection")[0].getAttribute('label') != null ? languageData.find("hiddenSection")[0].getAttribute('label') : "This section will be hidden in live projects";
				var extraTitle = $(this).attr('hidePage') == 'true' ? '<p class="alertMsg">' + msg + '</p>' : '';
				
				var links = '';
				
				if ($(this).attr('links') != undefined && $(this).attr('links') != "none") {
					links = '<div class="sectionSubLinks ' + $(this).attr('links') + '"></div>';
				}
				
				var section = $('<section id="page' + (pageIndex+1) + 'section' + (index+1) + '"><div class="page-header"><h1>' + $(this).attr('name') + '</h1>' + extraTitle + links + '</div></section>');

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
						//section.append('<p><b>' + $(this).attr('name') + '</b></p><p><audio src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none" width="100%"></audio></p>')
						section.append('<p><audio src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none" width="100%"></audio></p>')
					}
					
					if (this.nodeName == 'video'){
						//section.append('<p><b>' + $(this).attr('name') + '</b></p><p><video style="max-width: 100%" class="fullPageVideo" src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none"></video></p>');
						section.append('<p><video style="max-width: 100%" class="fullPageVideo" src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none"></video></p>');
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
				section.append( $('<p><br><a class="btn btn-mini pull-right" href="#">Top</a></p>'));

				//add the section to the document
				$('#mainContent').append(section);
				
				// Resolve all text box added <img> and <a> src/href tags to proper urls
				$('#mainContent').find('img,a').each(function() {
					var $this = $(this),
						val = $this.attr('src') || $this.attr('href'),
						attr_name = $this.attr('src') ? 'src' : 'href';

					if (val.substring(0, 16) == "FileLocation + '") {
						$this.attr(attr_name, eval(val));
					}
				});
				
			}
		});
		
		//finish initialising the piece now we have the content loaded
		initMedia();
		
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
}

function makeNav(node,section,type, sectionIndex, itemIndex){

	var sectionIndex = sectionIndex;
	
	var itemIndex = itemIndex;

	var tabDiv = $( '<div class="tabbable"/>' );
	
	if (type == 'tabs'){
	
		var tabs = $( '<ul class="nav nav-tabs" id="tab' + sectionIndex + '_' + itemIndex + '"/>' );
		
	}
	
	if (type == 'pills'){
	
		var tabs = $( '<ul class="nav nav-pills" id="tab' + sectionIndex + '_' + itemIndex + '"/>' );
	}
		
	var content = $( '<div class="tab-content"/>' );
	
	var iframeKaltura = [],
		pdf = [];
	
	node.children().each( function(index, value){
		if (index == 0){

			tabs.append( $('<li class="active"><a href="#tab' + sectionIndex + '_' + itemIndex + '_' + index + '" data-toggle="tab">' + $(this).attr('name') + '</a></li>') );
			
			var tab = $('<div id="tab' + sectionIndex + '_' + itemIndex + '_' + index + '" class="tab-pane active"/>')
			
		} else {
		
			tabs.append( $('<li><a href="#tab' + sectionIndex + '_' + itemIndex + '_' + index + '" data-toggle="tab">' + $(this).attr('name') + '</a></li>') );
			
			var tab = $('<div id="tab' + sectionIndex + '_' + itemIndex + '_' + index + '" class="tab-pane"/>')
			
		}
		
		var i = index;
		
		$(this).children().each( function(index, value){
			
			if ($(this).attr('showTitle') == 'true' || ($(this).attr('showTitle') == undefined && (this.nodeName == 'audio' || this.nodeName == 'video'))) {
				tab.append('<p><b>' + $(this).attr('name') + '</b></p>');
			}
			
			if (this.nodeName == 'text'){
				tab.append( '<p>' + $(this).text() + '</p>');
				
				if ($(this).text().indexOf("<iframe") != -1 && $(this).text().indexOf("kaltura_player") != -1) {
					iframeKaltura.push(i);
				}
			}
			
			if (this.nodeName == 'image'){
				tab.append('<p><img class="img-polaroid" src="' + eval( $(this).attr('url')) + '" title="' + $(this).attr('alt') + '" alt="' + $(this).attr('alt') + '"/></p>');
			}

			if (this.nodeName == 'audio'){
				tab.append('<p><audio src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none" width="100%"></audio></p>')
			}
			
			if (this.nodeName == 'video'){
				tab.append('<p><video style="max-width: 100%" class="fullPageVideo" src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none"></video></p>');
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
	
	setTimeout( function(){
		var $first = $('#tab' + sectionIndex + '_' + itemIndex + ' a:first');
		$first
			.tab("show")
			.parents(".tabbable").find(".tab-content .tab-pane.active iframe[id*='kaltura_player']").data("refresh", true);
		
		// hacky fix for issue with UoN mediaspace videos embedded on navigators
		var $iframeTabs = $(),
			$pdfTabs = $();
		
		for (var i=0; i<iframeKaltura.length; i++) {
			$iframeTabs = $iframeTabs.add($('a[data-toggle="tab"]:eq(' + iframeKaltura[i] + ')'));
		}
		
		$iframeTabs.on('shown.bs.tab', function (e) {
			var iframeRefresh = $(e.target).parents(".tabbable").find(".tab-content .tab-pane.active iframe[id*='kaltura_player']");
			if (iframeRefresh.data("refresh") != true) {
				iframeRefresh[0].src = iframeRefresh[0].src;
				iframeRefresh.data("refresh", true);
			}
		});
		
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
		
	}, 0);
	
}

function makeAccordion(node,section, sectionIndex, itemIndex){

	var accDiv = $( '<div class="accordion" id="acc' + sectionIndex + '_' + itemIndex + '">' );
	
	node.children().each( function(index, value){

		var group = $('<div class="accordion-group"/>');
		
		var header = $('<div class="accordion-heading"><a class="accordion-toggle" data-toggle="collapse" data-parent="#acc' + sectionIndex + '_' + itemIndex + '" href="#collapse' + sectionIndex + '_' + itemIndex + '_' + index + '">' + $(this).attr('name') + '</a></div>');
		
		group.append(header);
		
		if (index == 0){
		
			var outer = $('<div id="collapse' + sectionIndex + '_' + itemIndex + '_' + index + '" class="accordion-body collapse in"/>');
			
		} else {
		
			var outer = $('<div id="collapse' + sectionIndex + '_' + itemIndex + '_' + index + '" class="accordion-body collapse"/>');
			
		}
		
		
		var inner = $('<div class="accordion-inner">');
		
		$(this).children().each( function(index, value){
						
			if (this.nodeName == 'text'){
				inner.append( '<p>' + $(this).text() + '</p>');
			}
			
			if (this.nodeName == 'image'){
				inner.append('<p><img class="img-polaroid" src="' + eval( $(this).attr('url')) + '" title="' + $(this).attr('alt') + '" alt="' + $(this).attr('alt') + '"/></p>');
			}

			if (this.nodeName == 'audio'){
				inner.append('<p><b>' + $(this).attr('name') + '</b></p><p><audio src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none" width="100%"></audio></p>')
			}
			
			if (this.nodeName == 'video'){
				inner.append('<p><b>' + $(this).attr('name') + '</b></p><p><video style="max-width: 100%" class="fullPageVideo" src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none"></video></p>');
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
	
}


function makeCarousel(node, section, sectionIndex, itemIndex){

	var sectionIndex = sectionIndex;
	
	var itemIndex = itemIndex;
	
	var carDiv = $('<div id="car' + sectionIndex + '_' + itemIndex + '" class="carousel slide"/>');
	
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
		
		$(this).children().each( function(index, value){
						
			if (this.nodeName == 'text'){
				pane.append( '<p>' + $(this).text() + '</p>');
			}
			
			if (this.nodeName == 'image'){
				pane.append('<p><img class="img-polaroid" src="' + eval( $(this).attr('url')) + '" title="' + $(this).attr('alt') + '" alt="' + $(this).attr('alt') + '"/></p>');
			}

			if (this.nodeName == 'audio'){
				pane.append('<p><b>' + $(this).attr('name') + '</b></p><p><audio src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none" width="100%"></audio></p>')
			}
			
			if (this.nodeName == 'video'){
				pane.append('<p><b>' + $(this).attr('name') + '</b></p><p><video style="max-width: 100%" class="fullPageVideo" src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none"></video></p>');
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
	
	xotLink = xotLink.slice(0,xotLink.indexOf('#resume='));
	
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
	
	var warning = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1, window.location.pathname.length).indexOf("preview") != -1 && (xotLink.indexOf('preview_') != -1 || xotLink.indexOf('preview.php?') != -1) ? '<p class="alertMsg">' + (languageData.find("errorEmbed")[0] != undefined && languageData.find("errorEmbed")[0].getAttribute('label') != null ? languageData.find("errorEmbed")[0].getAttribute('label') : "You have embedded an XOT project preview. You must make the project public and embed the public facing URL.") + '</p>' : '',
		xotWidth = $this.attr('width') != undefined && ($.isNumeric($this.attr('width')) || $.isNumeric($this.attr('width').split('%')[0])) ? $this.attr('width') : '100%',
		xotHeight = $this.attr('height') != undefined && ($.isNumeric($this.attr('height')) || $.isNumeric($this.attr('height').split('%')[0])) ? $this.attr('height') : 600;
	
	return warning + '<iframe width="' + xotWidth + '" height="' + xotHeight + '" src="' + xotLink + '" frameborder="0" style="float:left; position:relative; top:0px; left:0px; z-index:0;"></iframe>';
	
}
