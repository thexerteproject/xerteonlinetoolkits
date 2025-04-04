Mediasite = window.Mediasite || {};

if (!Mediasite.PlayerControls) {
	Mediasite.PlayerControls = (function() {
		return Mediasite$PlayerControls;



		function Mediasite$PlayerControls(playerApi, controlsElementId, options) {
			if (!playerApi) {
				throw "PlayerControls must have a player.";
			} else if (typeof controlsElementId == "undefined") {
				throw "PlayerControls must have a DOMElement to populate";
			}

			var controlsElement = controlsElementId.tagName 
				? controlsElementId
			 	: document.getElementById(controlsElementId);

			 if (!(controlsElement && controlsElement.tagName)) {
			 	throw "PlayerControls must have a valid DOMElement to populate";
			 }

			 options = extendDefaultOptions(options);

			 var context = {
			 	player: playerApi
			 };
			 populateControls(controlsElement, context);
			 displayInitialValues(context);
			 attachControlHandlers(context);
			 attachPlayerEvents(context);
			 Mediasite.PlayerControls.createCss(options);
		}

		function extendDefaultOptions(optionsParam) {
			 options = {};

			 var defaults = Mediasite.PlayerControls.defaults;
			 for (var option in defaults) {
			 	if (!defaults.hasOwnProperty(option)) continue;
			 	options[option] = defaults[option];
			 }

			 for (var option in optionsParam) {
			 	if (!optionsParam.hasOwnProperty(option)) continue;
			 	options[option] = optionsParam[option];
			 }

			 return options;
		}


		function populateControls(container, context) {
			container.innerHTML = Mediasite.PlayerControls.html;

			context.containerControl = findElement(container, "data-mediasite", "container");
			context.playPauseControl = findElement(container, "data-mediasite", "playpause");
			context.seekSliderControl = findElement(container, "data-mediasite", "seekslider");
			context.seekBarControl = findElement(container, "data-mediasite", "seekbar");
			context.volumeSliderControl = findElement(container, "data-mediasite", "volumeslider");
			context.volumeBarControl = findElement(container, "data-mediasite", "volumebar");
			context.volumeMuteControl = findElement(container, "data-mediasite", "volumemute");
			context.currentTimeControl = findElement(container, "data-mediasite", "currenttime");
			context.durationControl = findElement(container, "data-mediasite", "duration");
		};

		function displayInitialValues(context) {
			updatePlayState('paused', context);
			updateDuration(0, context);
			updateCurrentTime(0, context);
			updateVolume(0, false, context);
		}

		function findElement(container, matchAttribute, matchValue) {
			if (container.getAttribute(matchAttribute) == matchValue)
				return container;

			var children = container.children;
			for (var i = 0; i < children.length; i++) {
				var result = findElement(children[i], matchAttribute, matchValue);
				if (result) {
					return result;
				}
			}
		}		

		function addClass(element, className) {
			if (!element || typeof className == "undefined") return;

			var classes = (element.getAttribute('class') || "").split(' ');
			for (var i = 0; i < classes.length; i++) {
				if (classes[i] == className) 
					return;
			}
			classes.push(className);

			var classAttribute = classes.join(" ");
			element.setAttribute('class', classAttribute);
		}

		function removeClass(element, className) {
			if (!element || typeof className == "undefined") return;

			var classes = (element.getAttribute('class') || "").split(' ');
			for (var i = 0; i < classes.length; i++) {
				if (classes[i] == className) {
					classes.splice(i, 1);
					i--;
				}
			}

			var classAttribute = classes.join(" ");
			element.setAttribute("class", classAttribute);
		}

		function attachControlHandlers(context) {
			Mediasite.PlayerControls.addEventHandler(context.playPauseControl, 'click', function () {
				if (context.player.getPlayState() == "playing") {
					context.player.pause();
				} else {
					context.player.play();
				}
			});

			Mediasite.PlayerControls.addEventHandler(context.volumeSliderControl, 'click', onTouchVolumeSlider);
			function onTouchVolumeSlider(e) {
				var clickedAt = getSliderPercentageWhereClicked(e, context.volumeSliderControl);
				if (typeof clickedAt == "undefined") return;
				context.player.setVolume(clickedAt);
			}

			Mediasite.PlayerControls.addEventHandler(context.volumeMuteControl, 'click', onTouchVolumeMute);
			function onTouchVolumeMute(e) {
				e.stopPropagation();

				if (context.player.isMuted()) {
					context.player.unMute();
				} else {
					context.player.mute();
				}
			}

			Mediasite.PlayerControls.addEventHandler(context.seekSliderControl, 'click', onTouchSeekSlider);
			function onTouchSeekSlider(e) {
				var clickedAt = getSliderPercentageWhereClicked(e, context.seekSliderControl);
				var position = context.duration * clickedAt / 100;
				context.player.seekTo(position);
			}
		}

		function attachPlayerEvents(context) {
			context.player.addHandler({
				"ready": onReady,
				"playstatechanged": function(eventData) { updatePlayState(eventData.playState, context); },
				"durationchanged": function (eventData) { updateDuration(eventData.duration, context); },
				"currenttimechanged": function (eventData) { updateCurrentTime(eventData.currentTime, context); },
				"volumechanged": function(eventData) { updateVolume(eventData.volume, eventData.isMuted, context); }
			});

			if (context.player.isReady()) { onReady(); }

			function onReady(eventData) {
				updatePlayState(context.player.getPlayState(), context);
				updateCurrentTime(context.player.getCurrentTime(), context);
				updateDuration(context.player.getDuration(), context);
				updateVolume(context.player.getVolume(), context.player.isMuted(), context);
				addClass(context.containerControl, 'MediasitePlayerControls-Ready');
			}
		}

		function getSliderPercentageWhereClicked(e, control) {
			var controlLeft = getOffsetRelativeToPage(control).left;
			var offsetElement = e.pageX - controlLeft;
			if (offsetElement < 0) return; // ignore clicks from outside slider

			var width = control.clientWidth ? control.clientWidth
				: control.offsetWidth;

			var percentage = offsetElement / width * 100;

			return percentage;
		}

		function getOffsetRelativeToPage(element) {
			var offset = { left: 0, top: 0 };
			do {
				offset.left += element.offsetLeft;
				offset.Top += element.offsetTop;
				element = element.offsetParent;
			} while (element);

			return offset;
		}

		function updatePlayState(playState, context) {
			if (playState == "playing") {
				addClass(context.containerControl, "MediasitePlayerControls-Playing");
				context.playPauseControl.setAttribute('title', Mediasite.PlayerControls.Localization.Pause);
			} else {
				removeClass(context.containerControl, "MediasitePlayerControls-Playing");
				context.playPauseControl.setAttribute('title', Mediasite.PlayerControls.Localization.Play);
			}
		}

		function updateDuration(duration, context) {
			var seekBarThumbControl = context.seekBarThumbControl;
			context.duration = duration;
			context.currentTime = context.currentTime || 0;

			setBarControlWidth(context.seekBarControl, context.currentTime, context.duration);
			var displayTime = Mediasite.PlayerControls.formatTime(context.duration);
			context.durationControl.innerHTML = displayTime;
		}

		function updateCurrentTime(currentTime, context) {
			var seekBarThumbControl = context.seekBarThumbControl;
			context.currentTime = currentTime;

			if (!context.duration || context.currentTime > context.duration) {
				context.duration = context.currentTime;
				var displayTime = Mediasite.PlayerControls.formatTime(context.duration);
				context.durationControl.innerHTML = displayTime;
			}

			setBarControlWidth(context.seekBarControl, context.currentTime, context.duration);
			var displayTime = Mediasite.PlayerControls.formatTime(context.currentTime);
			context.currentTimeControl.innerHTML = displayTime;
		}

		function updateVolume(volume, isMuted, context) {
			volume = isMuted ? 0 : volume;
			setBarControlWidth(context.volumeBarControl, volume, 100);

			if (isMuted) {
				addClass(context.containerControl, "MediasitePlayerControls-Muted");
				context.volumeMuteControl.setAttribute('title', Mediasite.PlayerControls.Localization.Unmute);
			} else {
				removeClass(context.containerControl, "MediasitePlayerControls-Muted");
				context.volumeMuteControl.setAttribute('title', Mediasite.PlayerControls.Localization.Mute);
			}
		}

		function setBarControlWidth(control, filled, maximum) {
			var width = 0;
			if (typeof maximum == "undefined") {
				width = filled;
			} else {
				maximum = Math.max(1, maximum);
				filled = Math.max(0, filled);

				var width = Math.round(filled / maximum * 10000) / 100;
				width = Math.max(1, width);
			}
			control.style.width = width + '%';
		}
	})();

	Mediasite.PlayerControls.defaults = {};

	Mediasite.PlayerControls.addEventHandler = function(element, eventName, handler) {
		if (!(element && eventName && handler)) return;

		if (element.addEventListener) {
			element.addEventListener(eventName, handler);
		} else if (element.attachEvent) {
			element.attachEvent('on' + eventName.toLowerCase(), handler);
		} else {
			element['on' + eventName.toLowerCase()] = handler;
		}
	};

	Mediasite.PlayerControls.html = '\
		<div class="MediasitePlayerControls" data-mediasite="container">	\
			<div class="MediasitePlayerControls-Volume MediasitePlayerControls-Slider" data-mediasite="volumeslider">	\
				<div class="MediasitePlayerControls-Volume-Icon" data-mediasite="volumemute">Volume</div>	\
				<div class="MediasitePlayerControls-VolumeBar MediasitePlayerControls-SliderTrack">	\
					<div class="MediasitePlayerControls-SliderBar" data-mediasite="volumebar"></div> \
				</div> \
			</div>	\
			<div class="MediasitePlayerControls-PlayPause" data-mediasite="playpause">Play/Pause</div>	\
			<div class="MediasitePlayerControls-Seek MediasitePlayerControls-Slider" data-mediasite="seekslider">	\
				<div class="MediasitePlayerControls-CurrentTime" data-mediasite="currenttime"></div>	\
				<div class="MediasitePlayerControls-Duration" data-mediasite="duration"></div>	\
				<div class="MediasitePlayerControls-SeekBar MediasitePlayerControls-SliderTrack">	\
					<div class="MediasitePlayerControls-SliderBar" data-mediasite="seekbar"></div> \
				</div> \
			</div>	\
		</div> \
	';

	Mediasite.PlayerControls.createCss = (function() {
		return createCss;

		var css;
		function createCss(options) {
			if (css) return;

			var contents  = Mediasite.PlayerControls.css + Mediasite.PlayerControls.spriteCss(options);
			
			css = document.createElement('style');
			css.setAttribute('type', 'text/css');
			css.innerHTML = contents;

			document.documentElement.appendChild(css);
		}
	})();

	Mediasite.PlayerControls.css = '\
			.MediasitePlayerControls { display: block; margin: 5px 0 10px; border: 0; border-radius: 10px; background: black; padding: 10px; height: 25px; font-size: 25px; font-family: sans-serif; color: white; }	\
			.MediasitePlayerControls-Seek { margin-left: 35px; margin-right: 100px; }	\
			.MediasitePlayerControls-PlayPause { float: left; width: 25px; height: 100%; cursor: pointer; text-indent: -500px; }	\
			.MediasitePlayerControls-Slider { height: 100%; }	\
			.MediasitePlayerControls-Ready .MediasitePlayerControls-Slider { cursor: pointer; }	\
			.MediasitePlayerControls-SliderTrack { margin: 0; padding: 0; background: #333; width: 100%; height: 100%; }	\
			.MediasitePlayerControls-SliderBar { margin: 0; padding: 0; background: #990; width: 0%; height: 100%; }	\
			.MediasitePlayerControls-SeekBar { position: relative; top: 70%; height: 30%; }	\
			.MediasitePlayerControls-Volume { float: right; margin-right: 5px; width: 50px; }	\
			.MediasitePlayerControls-Volume-Icon { float: left; margin-left: -30px; width: 25px; height: 100%; text-indent: -500px; }	\
			.MediasitePlayerControls-CurrentTime, .MediasitePlayerControls-Duration { font-size: 50%; } \
			.MediasitePlayerControls-CurrentTime { float: left; }	\
			.MediasitePlayerControls-Duration { float: right; }	\
	';

	Mediasite.PlayerControls.defaults.imageSprite = 'url(MediasitePlayerControls.png)';
	Mediasite.PlayerControls.spriteCss = function(options) {
		var imageSprite = options.imageSprite;

		return '\
			.MediasitePlayerControls-PlayPause { background-image: ' + imageSprite + '; background-repeat: no-repeat; }	\
			.MediasitePlayerControls-PlayPause { background-position: 0 0; }	\
			.MediasitePlayerControls-Playing .MediasitePlayerControls-PlayPause { background-position: -25px 0; }	\
			.MediasitePlayerControls-Volume-Icon { background-image: ' + imageSprite + ';  background-repeat: no-repeat; }	\
			.MediasitePlayerControls-Volume-Icon { background-position: -50px 0; }	\
			.MediasitePlayerControls-Muted .MediasitePlayerControls-Volume-Icon { background-position: -75px 0; }	\
			';
	};

	Mediasite.PlayerControls.formatTime = function(timeInSeconds) {
        var hours   = Math.floor(timeInSeconds / 3600);
        var minutes = Math.floor((timeInSeconds - (hours * 3600)) / 60);
        var seconds = Math.floor(timeInSeconds - (hours * 3600) - (minutes * 60));

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}

        var timeComponents = [];
        if (hours > 0) {
            timeComponents.push(hours);
        }
        timeComponents.push(minutes);
        timeComponents.push(seconds);
        
        var displayTime = timeComponents.join(":");
        return displayTime;
    };

	Mediasite.PlayerControls.Localization = {
		Play: 'Play',
		Pause: 'Pause',
		Mute: 'Mute',
		Unmute: 'Unmute'
	};
}