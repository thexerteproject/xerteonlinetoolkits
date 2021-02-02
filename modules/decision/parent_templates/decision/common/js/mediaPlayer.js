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
 
(function($){
	
	// media files uploaded to XOT or from YouTube & Vimeo will play using mediaelement.js
	// or iframe embed code can be used (except on pages with synching)

    var evalURL = function(url)
    {
        var trimmedURL = $.trim(url);
        if (trimmedURL.indexOf("'")==0 || trimmedURL.indexOf("+") >=0)
        {
            return eval(url)
        }
        else
        {
            return url;
        }
    }

	$.fn.mediaPlayer = function(options) {
		var defaults = {
				type: "audio",
				source: ""
			},
			opts = $.extend({}, defaults, options),
			mimeType = '',
			uploadedFile = true,
			thisMedia = this;

        var fileInfo = opts.source;
		
		// iframe
		if (fileInfo.substr(0,7) == "<iframe") {
			
			// remove width & height attributes from iframe
			var iframe = $(fileInfo).removeAttr('width').removeAttr('height').prop('outerHTML');
			thisMedia.append(iframe);
			
			if (opts.width != undefined && opts.height != undefined) {
				thisMedia.find('iframe')
					.width(opts.width)
					.height(opts.height);
			}
			
			if (x_templateLocation.indexOf("modules/decision") != -1) { // decision tree template
				mediaMetadata(thisMedia);
			} else {
				try {
					eval(x_pageInfo[x_currentPage].type).mediaMetadata(thisMedia); // call function in page model to confirm it's set up
				} catch(e) {};
			}
			
		// uploaded media or youtube/vimeo - use mediaelement.js
		} else {
			
			fileInfo = evalURL(opts.source);
			fileInfo = fileInfo.split(".");
			mimeType = opts.type + "/" + fileInfo[fileInfo.length - 1];

			// audio
			if (opts.type == "audio") {
				opts.height = x_audioBarH;
				
				if (opts.display == 'playOnly') {
					opts.width = x_audioBarH;
				} else {
					if (opts.width == undefined) {
						opts.width = thisMedia.width();
					}
				}
				
			// video
			} else {
				// is it from youtube or vimeo?
				if (opts.source.indexOf("www.youtube.com") != -1 || opts.source.indexOf("//youtu") != -1) {
					uploadedFile = false;
					mimeType = "video/youtube";
					thisMedia.addClass('mediaElementYouTube');
				} else if (opts.source.indexOf("vimeo.com") != -1) {
					uploadedFile = false;
					mimeType = "video/vimeo";
				}
			}
			
			if (thisMedia.children().length > 0) {
				thisMedia.find("div").detach();
			}
			
			var setUpMedia = function() {
				
				if (uploadedFile == true) {
					opts.source = evalURL(opts.source);
				}
				
				var element = $('<' + opts.type + '>')
					.attr('preload', 'metadata');
				
				if (opts.height != undefined) {
					element.attr('width', opts.width);
					element.attr('height', opts.height);
					element.attr('style', 'width:' + opts.width + ';height:' + opts.height + ';');
				}
				
				element.append($('<source>')
					.attr('type', mimeType)
					.attr('src', opts.source)
				);
				
				var elementobj = element.appendTo(thisMedia);
				elementobj.mediaelementplayer({
					startVolume:		x_volume,
					pauseOtherPlayers:	true,
					enableAutosize:		true,
					playpauseText:		x_mediaText[1].label,
					muteText:			x_mediaText[2].label,
					fullscreenText:		x_mediaText[3].label,
					stopText:			x_mediaText[0].label,
					tracksText:			x_mediaText[4].label,
					enableKeyboard:		false,
					enablePluginDebug:  false,
					classPrefix: 'mejs-', // use the class used in old version so we don't have to update use of the classes in page models & themes
					
					success: function (mediaElement, domObject) {
						// forces Jaws screen reader to find label for button
						var $container = $(mediaElement).parents(".mejs-container");
						$container.find(".mejs-playpause-button button").html(x_mediaText[1].label);
						$container.find(".mejs-volume-button button").html(x_mediaText[2].label);
						$container.find(".mejs-fullscreen-button button").html(x_mediaText[3].label);
						$container.find(".mejs-overlay-play").attr("aria-hidden", true);
						
						if (opts.title != undefined && opts.title != '') {
							$container.find(".mejs-mediaelement").attr("aria-label", opts.title);
						} else if (opts.type == "video" && x_mediaText[5].label != "") {
							$container.find(".mejs-mediaelement").attr("aria-label", x_mediaText[5].label);
						}
						
						if (opts.autoNavigate == "true" && x_currentPage + 1 != x_pages.length) { // go to next page when media played to end
							mediaElement.addEventListener("ended", function() {
								$x_nextBtn.trigger("click");
							}, false);
						}
						
						mediaElement.addEventListener("volumechange", function(e) { // update volume on all media players on page
							
							x_volume = e.detail.target.getVolume();
							
							$("audio,video").each(function() {
								if (this != domObject) {
									var $this = $(this);
									if ($this.is(":visible")) { // html5
										if ($this[0].volume != x_volume) {
											$this[0].volume = x_volume;
										}
									} else { // flash
										if ($this[0].player.media.volume != x_volume) {
											$this[0].player.media.setVolume(x_volume);
										}
									}
								}
							});
						});
						
						if (opts.startEndFrame != undefined) { // start / end playing video at specified frame
							var startFrame	= opts.startEndFrame[0];
							var endFrame	= opts.startEndFrame[1];
							
							if (startFrame != 0) {
								var canPlay = function () {
									mediaElement.setCurrentTime(startFrame);
									mediaElement.pause();
									mediaElement.removeEventListener("canplay", canPlay); // remove as FF keeps on triggering 'canplay' event
								}
								
								mediaElement.addEventListener("canplay", canPlay);
							}
							
							if (endFrame != 0) {
								mediaElement.addEventListener("timeupdate", function(e) {
									if (mediaElement.currentTime > endFrame) {
										mediaElement.pause();
									}
								}, false);
							}
						}
						
						if (opts.autoPlay == "true") { // autoplay media (won't work on iOS on 1st load)
							// autoplay won't always work (e.g. never on iOS & autoplay narration on 1st page on Chrome)
							mediaElement.addEventListener('canplay', function() {
								mediaElement.play();
							}, false);
						}
						
						if (opts.type == "video") {
							// the vimeo video won't play with the media element controls so remove these so default vimeo controls can be used
							if (mimeType == 'video/vimeo') {
								$container.find('.mejs-iframe-overlay, .mejs-layers, .mejs-controls').remove();
							}
							
							if (mimeType == 'video/vimeo' || mimeType == 'video/youtube') {
								if (x_templateLocation.indexOf("modules/decision") != -1) { // decision tree template
									mediaMetadata(mediaElement);
								} else {
									try {
										eval(x_pageInfo[x_currentPage].type).mediaMetadata(mediaElement);
									} catch(e) {};
								}
								
							} else {
								mediaElement.addEventListener("loadedmetadata", function(e) {
									var thisVideo = e.detail.target;
									if (x_templateLocation.indexOf("modules/decision") != -1) { // decision tree template
										mediaMetadata(thisVideo, [thisVideo.videoWidth, thisVideo.videoHeight]);
									} else {
										try {
											eval(x_pageInfo[x_currentPage].type).mediaMetadata(thisVideo, [thisVideo.videoWidth, thisVideo.videoHeight]); // send dimensions details back to page
										} catch(e) {};
									}
								});
							}
							
							// force controls to show when using keyboard only
							$(mediaElement).parents(".mejs-video").focusin(function() {
								if ($(mediaElement).parents(".mejs-video").find(".mejs-controls").css("visibility") == "hidden" || $(mediaElement).parents(".mejs-video").find(".mejs-controls").css("display") == "none") {
									$(mediaElement).parents(".mejs-video").find(".mejs-controls").css({
										"display":		"block",
										"visibility":	"visible"
									});
								}
							});
							
						} else if (opts.type == "audio") {
							if (opts.display == 'playOnly') {
								$(mediaElement).parents(".mejs-audio")
									.addClass('playPauseOnly')
									.find('.mejs-controls').children('a, div:not(.mejs-playpause-button)').css('display', 'none');
							}
						}
						
						if (opts.pageName == "mediaHTML5") { // it's media from mediaViewer window not main interface
							// ** does this still work? does it need to?
							mediaHTML5.mediaFunct(mediaElement);
						} else if ($(mediaElement).parents('#x_pageNarration').length == 0) {
							try {
								eval(x_pageInfo[x_currentPage].type).mediaFunct(mediaElement); // send mediaElement back to page so you can set up events for media
							} catch(e) {};
						}
					},
					
					error: function(mediaElement) {
						console.log('mediaelement problem is detected: %o', mediaElement);
					}

				});
			}
		
			var checkFileType = function() {
				// if video is flv look for alternative mp4 file to use as this can play in flash player or video tag
				$.ajax({
					url:	evalURL(fileInfo[0] + ".mp4"),
					type:	"HEAD",
					success: function() {
						// mp4 version exists - use this instead
						opts.source = fileInfo[0] + ".mp4";
						mimeType = 'video/mp4';
						fileInfo.splice(1, 1, "mp4");
						if (thisMedia.data("src") != undefined) { // save this new src so it doesn't have to check again if page returned to
							thisMedia.data("src", opts.source);
						}
						setUpMedia();
					},
					error:	function() {
						// no mp4 version to use - continue with flv
						setUpMedia();
					}
				});
			}

			if (opts.type == "video" && fileInfo[1] == "flv") {
				checkFileType();
			} else {
				setUpMedia();
			}
		}
	}
})(jQuery);