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
			thisMedia.append('<' + opts.type + ' preload="metadata"' + dimensionsString + '><source type="' + mimeType + '" src="' + opts.source + '" /></' + opts.type + '>');
			
			thisMedia.find(opts.type).mediaelementplayer({
				startVolume:		x_volume,
				alwaysShowControls:	true,
				pauseOtherPlayers:	true,
				enableAutosize:		true,
				playpauseText:		x_mediaText[1].label,
				muteText:			x_mediaText[2].label,
				fullscreenText:		x_mediaText[3].label,
				stopText:			x_mediaText[0].label,
				tracksText:			x_mediaText[4].label,
				success:	function (mediaElement, domObject) {
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
				}
			});
		};


		var fileExists = function(url, resultCallback) {
			$.ajax({
				url: url,
				type: 'HEAD',
				success: function() {
					resultCallback(true);
				}, error: function() {
					resultCallback(false);
				}
			});
		};

        // If it's not an .mp4 media, see if an .mp4 copy exists, and use this in preference.
		if (fileInfo['1'] !== 'mp4') {
			var url = eval(fileInfo[0] + ".mp4'");

			fileExists(url, function(exists) {
				if (exists) {
					opts.source = fileInfo[0] + ".mp4'";
					mimeType = 'video/mp4';
				}
				setUpMedia();
			});
		}
        else {
            // .mp4 
            setUpMedia();
        }

	};
})(jQuery);
