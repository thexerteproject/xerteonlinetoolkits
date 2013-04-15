
$(document).ready(init);

var data;

function init()
{	
	loadContent();
};

function initMedia()
{
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
			
			//add all the pages to the pages menu: this links bak to the same page
			$(data).find('page').each( function(index, value){
			
				$('#nav').append('<li class=""><a href="javascript:parseContent(' + index + ')">' + $(this).attr('name') + '</a></li>');
				
			});
			
			//set the header image, if defined
			if ($(data).find('learningObject').attr('header') != undefined){
				$('#overview').css({filter:''}); //for IE8
				$('#overview').css('background-image', "url(" + eval( $(data).find('learningObject').attr('header'))+ ")");
			}
			
			//done with one time stuff, now parse the first page
			parseContent(0);
		}
		
	});
	
}

function parseContent(index){

	//clear out existing content
	$('#mainContent').empty();
	$('#toc').empty();

	//which page is this from the document?
	var page = $(data).find('page').eq(index);
	
	//set the main page title and subtitle			
	$('#pageTitle').text( page.attr('name') );
	$('#pageSubTitle').text( page.attr('subtitle') );
	
	
	//create the sections
	page.find('section').each( function(index, value){
	
				
		//add a TOC entry
		$('#toc').append('<li><a href="#section' + index + '">' + $(this).attr('name') + '</a></li>');
		
		//add the section header
		var section = $('<section id="section' + index + '"><div class="page-header"><h1>' + $(this).attr('name') + '</h1></div></section>');

		//add the section contents
		$(this).children().each( function(index, value){
		
			//for all nodes append the text
			if (this.nodeName == 'text'){
				section.append( '<p>' + $(this).text() + '</p>');
			}
			
			if (this.nodeName == 'script'){
				section.append( '<script>' + $(this).text() + '</script>');
			}
			
			if (this.nodeName == 'image'){
				section.append('<p><img class="img-polaroid" src="' + eval( $(this).attr('url')) + '" title="' + $(this).attr('alt') + '" alt="' + $(this).attr('alt') + '"/></p>');
			}
			
			if (this.nodeName == 'audio'){
				section.append('<p><b>' + $(this).attr('name') + '</b></p><p><audio src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none" width="100%"></audio></p>')
			}
			
			if (this.nodeName == 'video'){
				section.append('<p><b>' + $(this).attr('name') + '</b></p><p><video style="max-width: 100%" class="fullPageVideo" src="' + eval( $(this).attr('url') ) + '" type="video/mp4" id="player1" controls="controls" preload="none"></video></p>');
			}
			
			if (this.nodeName == 'navigator'){
			
				if ($(this).attr('type') == 'Tabs'){
					makeTabSet( $(this), section );
				}
				
				if ($(this).attr('type') == 'Accordion'){
					alert("make an accordion");
				}
				
				if ($(this).attr('type') == 'Pills'){
					alert("make a pill set");
				}
				
				if ($(this).attr('type') == 'Carousel'){
					alert("make a carousel");
				}
			}

		});
		
		//a return to top button
		section.append( $('<p><br><a class="btn btn-mini pull-right" href="#">Top</a></p>'));

		//add the section to the document
		$('#mainContent').append(section);
					
	});
	
	//finish initialising the piece now we have the content loaded
	initMedia();
	initSidebar();
	
	window.scroll(0,0);
	
	$('body').scrollspy('refresh');
	
	//an event for user defined code to know when loading is done
	$(document).trigger('contentLoaded');
	
	//force facebook / twitter objects to initialise
	twttr.widgets.load();
	FB.XFBML.parse(); 
	
}

function makeTabSet(node,section){

	var topStr = '<div class="tabbable"><ul class="nav nav-tabs">';
	var bottomStr = '<div class="tab-content">';
	
	node.children().each( function(index, value){
	
		if (index == 0){
			topStr += '<li class="active"><a href="#tab' + index + '" data-toggle="tab">' + $(this).attr('name') + '</a></li>';
			bottomStr += '<div id="tab' + index + '" class="tab-pane active">' + $(this).children().text() + '</div>';
		} else {
			topStr += '<li><a href="#tab' + index + '" data-toggle="tab">' + $(this).attr('name') + '</a></li>';
			bottomStr += '<div id="tab' + index + '" class="tab-pane">' + $(this).children().text() + '</div>';
		}
	
	});
	
	topStr += '</ul>';
	bottomStr += '</div></div>';
	
	alert(topStr + bottomStr);
	
	section.append(topStr + bottomStr + '</p>');
	
	/*
<div class="tabbable">
	<ul class="nav nav-tabs">
		<li class="active"><a href="#tab1" data-toggle="tab">Tab One</a></li>
		<li><a href="#tab2" data-toggle="tab">Tab Two</a></li>
		<li><a href="#tab3" data-toggle="tab">Tab Three</a></li>
		<li><a href="#tab4" data-toggle="tab">Tab Four</a></li>
	</ul>

	<div class="tab-content">
		<div id="tab1" class="tab-pane active"><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>
		<div id="tab2" class="tab-pane"><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p></div>
		<div id="tab3" class="tab-pane"><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></div>										
		<div id="tab4" class="tab-pane"><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>									
	</div>
</div>

<div class="tabbable">
	<ul class="nav nav-tabs">
		<li class="active"><a href="#tab0" data-toggle="tab">Intro</a></li>
		<li><a href="#tab1" data-toggle="tab">Content</a></li>
	</ul>

	<div class="tab-content">
		<div id="#tab0" class="tab-pane active">This si some text</div>
		<div id="#tab1" class="tab-pane">This is more text here, there is more of it</div>
	</div>
</div>


*/
}



























