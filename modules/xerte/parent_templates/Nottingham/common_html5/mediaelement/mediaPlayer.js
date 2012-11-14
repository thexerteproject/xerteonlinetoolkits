(function($){
	
	$.fn.mediaPlayer = function(options) {
		var defaults = {
			type			:"audio",
			source			:""
		};
		var opts = $.extend({}, defaults, options);
		
		var dimensionsString = "";
		
		if (opts.type == "audio") {
			opts.height = x_audioBarH;
			if (opts.width == undefined) {
				opts.width = this.width();
			}
		}
		if (opts.height != undefined) {
			dimensionsString = ' width="' + opts.width + '" height="' + opts.height + '"';
		}
		
		if (this.children().length > 0) {
			this.find("div").detach();
		}
		
		opts.source = eval(opts.source);
		var fileType = opts.type + "/" + opts.source.substring(opts.source.indexOf(".")+1);
		this.append('<' + opts.type + ' preload="metadata"' + dimensionsString + '><source type="' + fileType + '" src="' + opts.source + '" /></' + opts.type + '>');
		
		this.find(opts.type).mediaelementplayer({
			startVolume:		x_volume,
			alwaysShowControls:	true,
			pauseOtherPlayers:	true,
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
			}
		});
	}
	
})(jQuery);