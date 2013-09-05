package components
{
	// ** original code from http://flashcommander.org/blog/flex-4-mp3-player with changes made to muted & volume functions **
	
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.MouseEvent;
	import flash.events.ProgressEvent;
	import flash.events.TimerEvent;
	import flash.media.Sound;
	import flash.media.SoundChannel;
	import flash.media.SoundTransform;
	import flash.net.URLRequest;
	import flash.utils.Timer;
	import mx.controls.Alert;
	import mx.events.FlexEvent;
	import components.Mp3PlayerSkin;
	import spark.components.Label;
	import spark.components.SkinnableContainer;
	import spark.components.ToggleButton;
	import spark.components.mediaClasses.ScrubBar;
	import spark.components.mediaClasses.VolumeBar;
	import spark.events.TrackBaseEvent;
	
	public class Mp3Player extends SkinnableContainer
	{
		public function Mp3Player() {
			super();
			setStyle("skinClass", Mp3PlayerSkin);
			timer = new Timer(100);
			timer.addEventListener(TimerEvent.TIMER, handleTime);
		}
		
		[SkinPart] public var playPauseButton:ToggleButton;
		[SkinPart] public var scrubBar:ScrubBar;
		[SkinPart] public var currentTimeDisplay:Label;
		[SkinPart] public var durationDisplay:Label;
		[SkinPart] public var volumeBar:VolumeBar;
		//[Bindable] public var preview:Boolean = true;
		
		override protected function partAdded(partName:String, instance:Object):void {
			super.partAdded(partName, instance);
			switch (instance) {
				case playPauseButton:
					//if (preview == false) {
						parentDocument.parentDocument.audioPlayPauseButton = playPauseButton;
					//}
					playPauseButton.addEventListener(MouseEvent.CLICK, playSound);
					playPauseButton.selected = isPlaying;
					break;
				case scrubBar:
					// add thumbPress and thumbRelease so we pause the video while dragging
					scrubBar.addEventListener(TrackBaseEvent.THUMB_PRESS, scrubBar_thumbPressHandler);
					scrubBar.addEventListener(TrackBaseEvent.THUMB_RELEASE, scrubBar_thumbReleaseHandler);
					// add change to actually seek() when the change is complete
					scrubBar.addEventListener(Event.CHANGE, scrubBar_changeHandler);
					// add changeEnd and changeStart so we don't update the scrubbar's value 
					// while the scrubbar is moving around due to an animation
					scrubBar.addEventListener(FlexEvent.CHANGE_END, scrubBar_changeEndHandler);
					scrubBar.addEventListener(FlexEvent.CHANGE_START, scrubBar_changeStartHandler);
					updateScrubBar();
					break;
				case volumeBar:
					volumeBar.minimum = 0;
					volumeBar.maximum = 1;
					volumeBar.value = 1;
					volumeBar.addEventListener(Event.CHANGE, volumeBar_changeHandler);
					volumeBar.addEventListener(FlexEvent.MUTED_CHANGE, volumeBar_mutedChangeHandler);
					volumeBar.value = volume;
					volumeBar.muted = muted;
					break;
			}
		}
		
		private var _autoPlay:Boolean = false;
		
		public function get autoPlay():Boolean {
			return _autoPlay;
		}
		
		public function set autoPlay(value:Boolean):void {
			_autoPlay = value;
			if (_source)
				play();
		}
		
		private var _source:String;
		
		public function get source():String {
			return _source;
		}
		
		public function set source(value:String):void {
			_source = value;
			
			if (_source)
				loadSound();
			
			if (autoPlay)
				play();
		}
		
		
		// ********************* PLAYBACK
		
		private var mySound:Sound;
		public var myChannel:SoundChannel;
		private var soundPosition:Number = 0;
		private var isPlaying:Boolean = false;
		private var timer:Timer;
		
		private function loadSound():void {
			mySound = new Sound();
			mySound.addEventListener(IOErrorEvent.IO_ERROR, errorHandler);
			mySound.addEventListener(ProgressEvent.PROGRESS, progressHandler);
			var request:URLRequest = new URLRequest(_source);
			mySound.load(request);
			
			if (myChannel) myChannel.stop();
				soundPosition = 0;
				isPlaying = false;
				timer.stop();
			
			if (playPauseButton)
				playPauseButton.selected = false;
				updateDisplay();
				updateScrubBar();
		}
		
		private function errorHandler(event:IOErrorEvent):void {
			Alert.show(event.text, "Sound error");
		}
		
		private function progressHandler(event:ProgressEvent):void {
			updateDisplay();
			updateScrubBar();
		}
		
		private function updateScrubBar():void {
			if (!scrubBar || !mySound) return;
			
			if (!scrubBarMouseCaptured && !scrubBarChanging) {
				scrubBar.minimum = 0;
				scrubBar.maximum = mySound.length / 1000;
				scrubBar.value = soundPosition / 1000;
			}
			
			if (mySound.bytesTotal == 0)
				scrubBar.loadedRangeEnd = 0;
			else
				scrubBar.loadedRangeEnd = (mySound.bytesLoaded / mySound.bytesTotal) * scrubBar.maximum;
		}
		
		private function updateDisplay():void {
			if (currentTimeDisplay)
				currentTimeDisplay.text = formatTimeValue(soundPosition / 1000);
			if (durationDisplay)
				durationDisplay.text = formatTimeValue(mySound.length / 1000);
		}
		
		private function playSound(event:Event):void {
			if (isPlaying) {
				pause();
				if ((mySound.length-soundPosition)<500)
					rewind();
			}
			else
				play();
		}
		
		public function play():void {
			myChannel = mySound.play(soundPosition);
			myChannel.addEventListener(Event.SOUND_COMPLETE, parentDocument.parentDocument.audioFinished);
			volume = _volume;
			muted = _muted;
				
			if (playPauseButton)
				playPauseButton.selected = true;
			isPlaying = true;
				
			timer.start();
		}
		
		public function pause():void {
			if (myChannel) {
				soundPosition = myChannel.position;
				myChannel.stop();
			}
			if (playPauseButton)
				playPauseButton.selected = false;
			isPlaying = false;
				
			timer.stop();
		}
		
		public function rewind():void {
			soundPosition = 0;
			updateScrubBar();
			updateDisplay();
			
			if (isPlaying) {
				myChannel.stop();
			}
		}
		
		public function seek(time:Number):void {
			soundPosition = time;
			if (isPlaying) {
				myChannel.stop();
				myChannel = mySound.play(soundPosition);
				volume = _volume;
				muted = _muted;
			}
			
		}
		
		private function handleTime(event:TimerEvent):void {
			if (!isPlaying) return;
			soundPosition = myChannel.position;
			updateDisplay();
			updateScrubBar();
		}
		
		protected function formatTimeValue(value:Number):String {
			// default format: hours:minutes:seconds
			value = Math.round(value);
			
			var hours:uint = Math.floor(value/3600) % 24;
			var minutes:uint = Math.floor(value/60) % 60;
			var seconds:uint = value % 60;
			
			var result:String = "";
			if (hours != 0)
				result = hours + ":";
			
			if (result && minutes < 10)
				result += "0" + minutes + ":";
			else
				result += minutes + ":";
			
			if (seconds < 10)
				result += "0" + seconds;
			else
				result += seconds;
			
			return result;
		}
		
		// *************** SCRUBBAR
		
		/**
		 *  @private
		 *  When someone is holding the scrubBar, we don't want to update the 
		 *  range's value--for this time period, we'll let the user completely 
		 *  control the range.
		 */
		private var scrubBarMouseCaptured:Boolean;
		
		/**
		 *  @private
		 *  We pause the video when dragging the thumb for the scrub bar.  This 
		 *  stores whether we were paused or not.
		 */
		private var wasPlayingBeforeSeeking:Boolean;
		
		/**
		 *  @private
		 *  We are in the process of changing the timestamp
		 */
		private var scrubBarChanging:Boolean;
		
		/**
		 *  @private
		 */
		private function scrubBar_changeStartHandler(event:Event):void {
			scrubBarChanging = true;
		}
		
		/**
		 *  @private
		 */
		private function scrubBar_thumbPressHandler(event:TrackBaseEvent):void {
			scrubBarMouseCaptured = true;
			if (isPlaying) {
				pause();
				wasPlayingBeforeSeeking = true;
			}
		}
		
		/**
		 *  @private
		 */
		private function scrubBar_thumbReleaseHandler(event:TrackBaseEvent):void {
			scrubBarMouseCaptured = false;
			if (wasPlayingBeforeSeeking) {
				play();
				wasPlayingBeforeSeeking = false;
			}
		}
		
		/**
		 *  @private
		 */
		private function scrubBar_changeHandler(event:Event):void {
			seek(scrubBar.value * 1000);
		}
		
		/**
		 *  @private
		 */
		private function scrubBar_changeEndHandler(event:Event):void {      
			scrubBarChanging = false;
		}
		
		// ************************ VOLUME
		
		private var _volume:Number = 1;
		
		public function get volume():Number {
			return _volume;
		}
		
		public function set volume(value:Number):void {
			if (value<0 || value>1) return;
			
			_volume = value;
			
			if (volumeBar) 
				volumeBar.value = value;
				
			if (myChannel) {
				var transform:SoundTransform = new SoundTransform(value, myChannel.soundTransform.pan);
				myChannel.soundTransform = transform;
			}
		}
		
		private function volumeBar_changeHandler(event:Event):void {
			if (volume != volumeBar.value)
				volume = volumeBar.value;
		}
		
		private var _muted:Boolean = false;
		
		public function get muted():Boolean {
			return _muted;
		}
		
		public function set muted(value:Boolean):void {
			_muted = value;
			
			if (volumeBar)
				volumeBar.muted = value;
			
			if (myChannel) {
				var transform:SoundTransform = new SoundTransform(volume, myChannel.soundTransform.pan);
				transform.volume = muted ? 0 : volume;
				myChannel.soundTransform = transform;
			}
		}
		
		private function volumeBar_mutedChangeHandler(event:FlexEvent):void {
			if (muted != volumeBar.muted)
				muted = volumeBar.muted;
		}
		
	}
}