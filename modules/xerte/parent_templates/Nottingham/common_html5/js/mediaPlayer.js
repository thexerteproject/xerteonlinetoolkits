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
	
	// media files uploaded to XOT or from YouTube will play using mediaelement.js
	// videos from vimeo will play in their own player

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
				type	:"audio",
				source	:""
			},
			opts = $.extend({}, defaults, options),
			mimeType = '',
			uploadedFile = true,
			thisMedia = this;

        var fileInfo = evalURL(opts.source);
        fileInfo = fileInfo.split(".");
        mimeType = opts.type + "/" + fileInfo[1];

		// audio
		if (opts.type == "audio") {
			opts.height = x_audioBarH;
			if (opts.width == undefined) {
				opts.width = thisMedia.width();
			}
			
		// video
		} else {
			// is it from youtube or vimeo?
			if (opts.source.indexOf("www.youtube.com") != -1 || opts.source.indexOf("//youtu") != -1) {
				uploadedFile = false;
				mimeType = "video/youtube";
			} else if (opts.source.indexOf("vimeo.com") != -1) {
				uploadedFile = false;
				mimeType = "video/vimeo";
			}
		}
		
		if (thisMedia.children().length > 0) {
			thisMedia.find("div").detach();
		}
		
		var setUpMedia = function() {
			
			if (mimeType != "video/vimeo") { // vimeo not supported by mediaelement.js
				
				if (uploadedFile == true) {
					opts.source = evalURL(opts.source);
				}
				
				var element = $('<' + opts.type + '>')
					.attr('preload', 'metadata');
				
				if (opts.height != undefined) {
					element.attr('width', opts.width);
					element.attr('height', opts.height);
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
					enablePluginDebug:  false,
					
					success: function (mediaElement, domObject) {
						if (opts.autoNavigate == "true" && x_currentPage + 1 != x_pages.length) { // go to next page when media played to end
							mediaElement.addEventListener("ended", function() {
								$x_nextBtn.trigger("click");
							}, false);
						}
						
						mediaElement.addEventListener("volumechange", function(e) { // update volume on all media players on page
							if (e.volume != undefined) {
								x_volume = e.volume;
							} else {
								x_volume = e.target.player.getVolume();
							}
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
							mediaElement.play();
						}
						
						if (opts.type == "video") {
							mediaElement.addEventListener("loadedmetadata", function() {
								if (x_templateLocation.indexOf("modules/decision") != -1) { // decision tree template
									mediaMetadata($(this), [$(this).prop('videoWidth'), $(this).prop('videoHeight')]);
								} else {
									try {
										eval(x_pageInfo[x_currentPage].type).mediaMetadata($(this), [$(this).prop('videoWidth'), $(this).prop('videoHeight')]); // send dimensions details back to page
									} catch(e) {};
								}
							});
						}
						
						if (opts.pageName == "mediaHTML5") { // it's media from mediaViewer window not main interface 
							mediaHTML5.mediaFunct(mediaElement);
						} else {
							try {
								eval(x_pageInfo[x_currentPage].type).mediaFunct(mediaElement); // send mediaElement back to page so you can set up events for media
							} catch(e) {};
						}
					},
					
					error: function(mediaElement) {
						console.log('mediaelement problem is detected: %o', mediaElement);
					}

				});
				
			} else {
				// VIMEO
				
				// set up iframe
				thisMedia.empty();
				
				var num = 0;
				while ($("#vimeo" + num).length > 0) {
					num++;
				}
				
				var $iframe = $('<iframe>')
					.attr({
						id:				"vimeo" + num,
						width:			opts.width,
						height:			opts.height,
						frameborder:	"0"
					});
				
				if (opts.source.indexOf("//player.vimeo.com/video/") == -1) {
					opts.source = "//player.vimeo.com/video/" + opts.source.split("vimeo.com/")[opts.source.split("vimeo.com/").length - 1];
				}
				
				$iframe
					.appendTo(thisMedia)
					.attr("src", opts.source + "?api=1&player_id=vimeo" + num);
				
				var startFrame, endFrame;
				
				// receive message from vimeo iframe
				function onMessageReceived(e) {
					var data = JSON.parse(e.originalEvent.data);
					
					switch (data.event) {
						case "ready":
							onReady(data.player_id);
							break;
						   
						case "playProgress":
							onPlayProgress(data);
							break;
						
						case "finish":
							onFinish();
							break;
					}
				}
				
				// send message to vimeo iframe
				function post(action, value) {
					var data = { method: action };
					
					if (value) {
						data.value = value;
					}
					
					$iframe[0].contentWindow.postMessage(data, window.location.protocol + opts.source);
				}
				
				// set up initial stuff - autoplay / start & end frames / volume etc.
				function onReady(player_id) {
					post("setVolume", x_volume);
					
					if (opts.startEndFrame != undefined) { // start / end playing video at specified frame
						startFrame	= opts.startEndFrame[0];
						endFrame	= opts.startEndFrame[1];
						
						if (startFrame != 0) {
							post("seekTo", startFrame);
							post("pause");
						}
						
						if (endFrame != 0) {
							post("addEventListener", "playProgress");
						}
					}
					
					if (opts.autoPlay == "true") { // autoplay media
						post("play");
					}
					
					if (opts.autoNavigate == "true" && x_currentPage + 1 != x_pages.length) { // go to next page when media played to end
						post("addEventListener", "finish");
					}
					
					// set up listener so page can keep track of what's going on
					post("addEventListener", "playProgress");
				}
				
				function onPlayProgress(data) {
					// has end time been set?
					if (endFrame > 0) {
						if (data.data.seconds > opts.startEndFrame[1]) {
							post("pause");
						}
					}
					
					try {
						eval(x_pageInfo[x_currentPage].type).mediaFunct(data.player_id, "vimeo", "playProgress", data.data.seconds);
					} catch(e) {};
				}
				
				function onFinish() {
					$x_nextBtn.trigger("click");
				}
				
				// listen for message from the player
				$(window).off("message");
				$(window).on("message", onMessageReceived);
			}
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
})(jQuery);