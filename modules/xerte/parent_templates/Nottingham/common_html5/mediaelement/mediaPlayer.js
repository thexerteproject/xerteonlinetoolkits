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
	
	$.fn.mediaPlayer = function(options) {
		var defaults = {
				type			:"audio",
				source			:""
			},
			opts = $.extend({}, defaults, options),
			dimensionsString = "",
			mimeType = '',
			thisMedia = this;
		
		if (opts.type == "audio") {
			opts.height = x_audioBarH;
			if (opts.width == undefined) {
				opts.width = thisMedia.width();
			}
		}
		if (opts.height != undefined) {
			dimensionsString = ' width="' + opts.width + '" height="' + opts.height + '"';
		}
		
		if (thisMedia.children().length > 0) {
			thisMedia.find("div").detach();
		}
		
		var fileInfo = opts.source.split(".");
		fileInfo.splice(1, 1, fileInfo[1].slice(0, -1));
		mimeType = opts.type + "/" + fileInfo[1];
		
		var setUpMedia = function() {
			opts.source = eval(opts.source);
			//thisMedia.append('<' + opts.type + ' preload="metadata"' + dimensionsString + '><source type="' + mimeType + '" src="' + opts.source + '" /></' + opts.type + '>');
            var element = $('<' + opts.type + '>')
                .attr('preload', 'metadata');
            if (opts.height != undefined)
            {
                element.attr('width', opts.width);
                element.attr('height', opts.height);
            }
            element.append($('<source>')
                .attr('type', mimeType)
                .attr('src', opts.source)
            );
            thisMedia.append(element);

            var elementobj = thisMedia.find(opts.type);
            console.log(elementobj);
			
			elementobj.mediaelementplayer({
				startVolume:		x_volume,
				alwaysShowControls:	true,
				pauseOtherPlayers:	true,
				enableAutosize:		true,
				playpauseText:		x_mediaText[1].label,
				muteText:			x_mediaText[2].label,
				fullscreenText:		x_mediaText[3].label,
				stopText:			x_mediaText[0].label,
				tracksText:			x_mediaText[4].label,
                enablePluginDebug:  true,
                success:	function (mediaElement, domObject) {
                    mediaElement.setSrc(opts.source);
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
					
					if (opts.autoPlay == "true") { // autoplay media (won't work on iOS on 1st load)
						mediaElement.play();
					}
					
					if (opts.startEndFrame != undefined) { // start / end playing video at specified frame
						var startFrame	= opts.startEndFrame[0];
						var endFrame	= opts.startEndFrame[1];
						if (startFrame != 0) {
							mediaElement.addEventListener("canplay", function() {
								mediaElement.setCurrentTime(startFrame);
							});
						}
						if (endFrame != 0) {
							mediaElement.addEventListener("timeupdate", function(e) {
								if (mediaElement.currentTime > endFrame) {
									mediaElement.pause();
								}
							}, false);
						}
					}
					
					if (opts.pageName) {
						eval(opts.pageName).mediaFunct(mediaElement); // send mediaElement back to page so you can set up events for media
					}
				},
                error: function(mediaElement) {
                    console.log('medialement problem is detected: %o', mediaElement);
                }

            });
		}


		var checkFileType = function() {
			// if video is flv look for alternative mp4 file to use as this can play in flash player or video tag
			$.ajax({
				url:	eval(fileInfo[0] + ".mp4'"),
				type:	"HEAD",
				success: function() {
					// mp4 version exists - use this instead
					opts.source = fileInfo[0] + ".mp4'";
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