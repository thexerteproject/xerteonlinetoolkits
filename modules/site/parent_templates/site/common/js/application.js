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
	
	if ( $(data).find('learningObject').attr('stylesheet') != undefined){
	
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
	
	if (window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1, window.location.pathname.length).indexOf("preview") != -1 && $(data).find('learningObject').attr('authorSupport') == 'true' ) {
		
		authorSupport = true;
		
	}

	//add all the pages to the pages menu: this links bak to the same page
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
	
	//set the header image, if defined
	if ($(data).find('learningObject').attr('header') != undefined){
	
		$('#overview').css({filter:''}); //for IE8
		
		$('#overview').css('background-image', "url(" + eval( $(data).find('learningObject').attr('header'))+ ")");
	} 
	
	if ($(data).find('learningObject').attr('headerColour') != undefined){
	
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
		$('#overview').css('background', '-moz-linear-gradient(45deg,  ' + col[0] + ' 0%, ' + col[1] + ' 100%)');
		$('#overview').css('background', '-webkit-gradient(linear, left bottom, right top, color-stop(0%,' + col[0] + '), color-stop(100%,' + col[1] + '))');
		$('#overview').css('background', '-webkit-linear-gradient(45deg,  ' + col[0] + ' 0%,' + col[1] + ' 100%)');
		$('#overview').css('background', '-o-linear-gradient(45deg,  ' + col[0] + ' 0%,' + col[1] + ' 100%)');
		$('#overview').css('background', '-ms-linear-gradient(45deg,  ' + col[0] + ' 0%,' + col[1] + ' 100%)');
		$('#overview').css('background', 'linear-gradient(45deg,  ' + + ' 0%,' + col[1]+ ' 100%)');
		$('#overview').css('filter', 'progid:DXImageTransform.Microsoft.gradient( startColorstr=' + col[0] + ', endColorstr=' + col[1] + ',GradientType=1 )');
		
	}
	
	if ($(data).find('learningObject').attr('headerTextColour') != undefined){
	
		$('#overview').css('color', formatColour($(data).find('learningObject').attr('headerTextColour')));
		
	}
	
	// default logos used are logo.png & logoL.png in modules/site/parent_templates/site/common/img/ - these can be overridden by images uploaded via Header Logo optional properties
	$('#overview div.logoR, #overview div.logoL').hide();
	
	if ($(data).find('learningObject').attr('logoR') != undefined){
		$('#overview .logoR img').attr('src', eval( $(data).find('learningObject').attr('logoR')));
	}
	
	$.ajax({
		url: $('#overview .logoR img').attr('src'),
		success: function() {
			$('#overview').addClass('logoR');
			$('#overview div.logoR').show();
		}
	});
	
	if ($(data).find('learningObject').attr('logoL') != undefined){
		$('#overview .logoL img').attr('src', eval( $(data).find('learningObject').attr('logoL')));
	}
	
	$.ajax({
		url: $('#overview .logoL img').attr('src'),
		success: function() {
			$('#overview').addClass('logoL');
			$('#overview div.logoL').show();
		}
	});
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
	
	var iframeKaltura = [];
	
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
				tab.append('<object id="pdfDoc"' + new Date().getTime() + ' data="' + eval( $(this).attr('url')) + '" type="application/pdf" width="100%" height="600"><param name="src" value="' + eval( $(this).attr('url')) + '"></object>');
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
		var $iframeTabs = $();
		
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

