/// <summary>
/// Mediasite Player SDK v7.2.2
/// 
/// To create a Mediasite player, include this file and instantiate the player.  (One document can contain many players.)
/// <pre>
///     <script src="path/to/assets/MediasitePlayerIFrameApi.js"></script>  <-- Source file for IFrame Player API -->
/// 
///     <div id="myPlayer">
///        <--
///            This element will be replaced by an iframe containing the Mediasite presentation. 
///            The iframe will have the same ID; in this case, "myPlayer".
///        -->
///    </div>
/// 
///     <script>
///         // Create a Mediasite IFrame Player
///         var player = new Mediasite.Player('myPlayer', 
///             {
///                 url: 'http:///mediasite.server.com/path/to/Mediasite/Play/presentationID',
///                 events: {
///                     'ready': function () { console.log('Player ready'); },
///                     'error': function (errorData) {
///                            console.log('Error: ' 
///                                + Mediasite.ErrorDescription[errorData.errorCode] 
///                                + (errorData.details ? ' (' + errorData.details + ')' : '')); 
///                     },
///                     'playstatechanged': onPlayStateChanged
///                 }
///             }
///         );
///
///        player.removeHandler('playstatechanged', onPlayStateChanged);
///
///        function onPlayStateChanged(playState) { 
////            console.log("Play state changed: ' + playState);
////        }
///
////     </script>
/// </pre>
///
/// <para>Browser requirements: IE8+, Firefox 2+, Chrome, Safari 4+, Opera 9.5+.
///       (window.postMessage(), window.JSON)
/// </para>
/// </summary>

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        // Don't do anything if the player had already been defined.
        if (root.Mediasite && root.Mediasite.Player) {
            return;
        }

        root.Mediasite = factory();
    }
}(this, function () {
    var Mediasite = {};

    Mediasite.PlayState = {
        Undefined: 'undefined',
        Stopped: 'stopped',
        Paused: 'paused',
        Playing: 'playing',
        ScanForward: 'scanforward',
        ScanReverse: 'scanreverse',
        Buffering: 'buffering',
        Waiting: 'waiting',
        MediaEnded: 'mediaended',
        Transitioning: 'transitioning',
        Ready: 'ready',
        Reconnecting: 'reconnecting',
        Closed: 'closed',
        Error: 'error',
        Opening: 'opening'
    };

    Mediasite.PlayerState = {
        NotReady: 'NotReady',
        InteractionRequired: 'InteractionRequired',
        Waiting: 'Waiting',
        Playing: 'Playing',
        Paused: 'Paused',
        Stopped: 'Stopped',
        Ended: 'Ended',
        Error: 'Error'
    };

    Mediasite.StreamType = {
        Video1: 0,
        Document: 1,
        Slide: 2,
        Presentation: 3,
        Video2: 4,
        Video3: 5
    };

    Mediasite.LiveStatus = {
        // Corresponds to Mediasite.Player.PresentationStatus

        NotAvailable: "NotAvailable",
        ScheduledForLive: "ScheduledForLive",
        OpenForLive: "OpenForLive",
        Live: "Live",
        LivePaused: "LivePaused",
        LiveEnded: "LiveEnded",
        OnDemand: "OnDemand"
    };


    Mediasite.ErrorDescription = {
        // Corresponds to Mediasite.Player.Error.Description
        410: "API method not found",
        411: "Error while calling API method",
        424: "Error while initializing iframe player",
        500: "Could not load presentation metadata",
        501: "General error",
        510: "Problem with presentation media",
        511: "Presentation media is not supported",
        520: "Player not ready",
        505: "iFrame API client is not compatible with Mediasite server's player API",
        231: "iFrame API client is older than Mediasite server and should be upgraded to the latest version",
        232: "iFrame API client is newer than Mediasite server and might use unavailable methods or data"
    };

    Mediasite.Player = function MediasiteIFramePlayer(element, options) {
        // Sanity check parameters
        if (!element) throw "MediasitePlayer requires value for element parameter";
        if (!options) throw "MediasitePlayer requires value for options parameter";
        if (!options.url) throw "MediasitePlayer requires value for options.url parameter";

        var self = this;
        var _version = {
            version: "7.2.2",
            supports: ["6.1.5", "6.1.7", "6.1.9", "6.1.11", "7.0", "7.0.28", "7.0.29", "7.2", "7.2.2"],
            application: 'MediasitePlayer'
        };
        var _versionMismatchCheck; // undefined for not checked, false for checked and acknowledged, true / version identifier for checked and not acknowledged
        var _broker, _view, _model, _eventBundle;
        var _idGenerator = makeIdGenerator();
        

        // #region Initialize
        function initialize() {
            try {
                var url = options.url;
                _model = new Mediasite.Player.StateModel();
                _view = options.view || new Mediasite.Player.View(element, url);

                _broker = options.broker || new Mediasite.Player.IFrameAPIBroker({
                    messagePrefix: 'MediasitePlayer',
                    iframeView: _view,
                    url: url,
                    events: {
                        "message": onMessage,
                        "activated": onActivated
                    },
                    initializationData: _version
                });

                setInitialModelState();
                addStateChangedHandlers();
                initEventBundle();

                // Add user events
                if (options.events) {
                    self.addHandler(options.events);
                }

                _broker.tryActivate(); // in case iframe is already loaded
            } catch (err) {
                if (options.events && typeof options.events.error == "function") {
                    var message = err.message || err.description || err;
                    options.events.error(makeError(424, message));
                }
            }
        }

        function makeIdGenerator() {
            var scope = Math.abs(Math.floor(Math.random() * 1000000)) + 1; // Greater than zero.
            return new UniqueTemporaryIdGenerator(scope);
        }

        function currySetPropertyFromEvent(parameterMappings, streamTypeKey) {
            /// <summary>Add "set property on event" handlers</summary>
            /// <param name="key">Each key corresponds to a parameter passed to the event handler</param>

            return function setProperty() {
                for (var i = 0, length = arguments.length; i < length; i++) {
                    var eventData = arguments[i];
                    for (var key in eventData) {
                        if (!eventData.hasOwnProperty(key)) continue;

                        var streamType = eventData[streamTypeKey] ? "." + eventData[streamTypeKey] : '';

                        var modelKey = (parameterMappings.hasOwnProperty(key)
                            ? parameterMappings[key]
                            : key) + streamType;
                        _model.Set(modelKey, eventData[key]);
                    }
                }
            };
        }

        function checkVersion(server) {
            server = server || {};
            // Fill in legacy version for player which does not report it
            server.version = server.version || "6.1.1";
            server.supports = server.supports || [server.version];

            if (server.version == _version.version) {
                return true;
            }

            for (var i = 0; i < _version.supports.length; i++) {
                var compatibleVersion = _version.supports[i];
                if (server.version == compatibleVersion) {
                    // client is newer than server, but still compatible
                    // however, some methods/data might be unavailable
                    _eventBundle.callHandlers("error", makeError(232, Mediasite.ErrorDescription[232], { version: server.version }));
                    return true;
                }
            }

            for (var i = 0; i < server.supports.length; i++) {
                var compatibleVersion = server.supports[i];
                if (_version.version == compatibleVersion) {
                    // client is older than server, but server can adapt to client
                    // however, some methods/data might be deprecated and unreliable
                    _eventBundle.callHandlers("error", makeError(231, Mediasite.ErrorDescription[231], { version: server.version }));
                    return true;
                }
            }

            // Client and server APIs are allegedly incompatible;
            // either they can't talk to each other 
            // or the commands/events/data are significantly different
            if (typeof _versionMismatchCheck == "undefined") {
                _versionMismatchCheck = server.version;
            }
            var error = makeError(505, Mediasite.ErrorDescription[505], { version: server.version });
            error.ignoreIncompatibility = function () { _versionMismatchCheck = false; }
            _eventBundle.callHandlers("error", error);

            return false;
        }

        function verifyVersionCheck(asEvent) {
            if (typeof _versionMismatchCheck !== "undefined" && _versionMismatchCheck !== false) {
                throw makeError(505, Mediasite.ErrorDescription[505], { version: _versionMismatchCheck });
            }
        }

        function MediasitePlayerError(errorCode) {
            this.errorCode = errorCode;
        }
        MediasitePlayerError.prototype.toString = function () {
            return "MediasitePlayerError"
                + (typeof this.errorCode != undefined
                    ? "-" + this.errorCode
                    : "");
        }

        function makeError(errorCode, details, properties) {
            var error = new MediasitePlayerError(errorCode);

            if (details) {
                error.details = details;
            }

            if (properties) {
                for (var key in properties) {
                    if (!properties.hasOwnProperty(key)) continue;
                    error[key] = properties[key]
                }
            }

            return error;
        }

        function onMessage(data) {
            if (data && data.version) {
                var compatible = checkVersion(data);
                if (compatible) {
                    _broker.tryActivate();
                }
            }

            if (data && data.errorCode) {
                _eventBundle.callHandlers("error", data);
            }
        }

        function onActivated(properties) {
            var compatible = checkVersion(properties && properties.version);

            _model.Set("activated", true);

            if (compatible && options.layoutOptions) {
                _broker.sendCommand("setLayoutOptions", { options: options.layoutOptions });
            }
        }

        function initEventBundle() {

            if (!_eventBundle) {
                _eventBundle = new Mediasite.Player.StandaloneEventBundle(self);
                _broker.addHandler("*", function (eventName, argumentsArray) {
                    // Opt out of pass-through events for these types.
                    if (eventName === "timedeventlistchanged") {
                        return;
                    }

                    // Pass-through event handler for all the rest.
                    argumentsArray = argumentsArray || [];
                    if (typeof argumentsArray[0] == "undefined" || argumentsArray[0] == null) {
                        argumentsArray[0] = {};
                    }
                    argumentsArray[0].sender = self;

                    _eventBundle.callHandlers(eventName, argumentsArray);
                });
            }

        }

        function addStateChangedHandlers() {
            _broker.addHandler({
                "_api_state": setModelState,
                "playcoverready": onPlayCoverReady,
                "ready": onReady,
                "playstatechanged": currySetPropertyFromEvent({ playState: "playState" }),
                "playerstatechanged": currySetPropertyFromEvent({ state: "playerState.state", isLive: "playerState.live" }),
                "livestatuschanged": currySetPropertyFromEvent({ liveStatus: "liveStatus" }),
                "volumechanged": currySetPropertyFromEvent({ volume: "volume", isMuted: "volume.muted" }),
                "currenttimechanged": currySetPropertyFromEvent({ currentTime: "currentTime" }),
                "durationchanged": currySetPropertyFromEvent({ duration: "duration" }),
                "playbackratechanged": currySetPropertyFromEvent({ playbackRate: "playbackRate" }),
                "captionchanged": currySetPropertyFromEvent({ captions: "currentCaptions" }),
                "chapterchanged": currySetPropertyFromEvent({ chapterTitle: "chapter.title", chapterTime: "chapter.time" }),
                "timedeventlistchanged": handleTimedEventListChanged,
                "timedeventreached": currySetPropertyFromEvent({ timedEventType: "timedevent.type", timedEventTime: "timedevent.time", timedEventPayload: "timedevent.payload", timedEventId: "timedevent.id" }),
                "slidechanged": currySetPropertyFromEvent({ slideTitle: "slide.title", slideDescription: "slide.description", slideTime: "slide.time", slideUrl: "slide.url", slideStreamType: "slide.streamtype" }, "slideStreamType"),
                "slideadded": addNewSlide,
                "visiblestreamschanged": currySetPropertyFromEvent({ streamTypes: "visibleStreamTypes" })
            });
        }

        function setInitialModelState() {
            _model.Set("activated", false);
            _model.Set("ready", false);
        }

        function onPlayCoverReady() {
            _model.Set("playCoverReady", true);
            console.log($(".play-button"));
            $(".play-button").click();
        }

        function onReady() {
            _model.Set("ready", true);
        }

        function setModelState(properties) {
            _model.Set("ready", properties.ready);
            _model.Set("playState", properties.playState);
            _model.Set("playerState", properties.playerState);
            _model.Set("liveStatus", properties.liveStatus);
            _model.Set("volume", properties.volume);
            _model.Set("volume.muted", properties.muted);
            _model.Set("currentTime", properties.currentTime);
            _model.Set("duration", properties.duration);
            _model.Set("playbackRate", properties.playbackRate);
            _model.Set("chapters", properties.chapters);
            _model.Set("timedevents", properties.timedevents);
            _model.Set("captions", properties.captions);
            _model.Set("slides", properties.slides);
            _model.Set("links", properties.links);
            _model.Set("pollsUri", properties.pollsUri);
            _model.Set("allStreams", properties.allStreams);
            _model.Set("visibleStreamTypes", properties.visibleStreamTypes);
            _model.Set("pastSessionPlayedSegments", properties.pastSessionPlayedSegments);
        }

        function addNewSlide(slideEvent) {
            var slides = _model.Get("slides") || [];

            var slide = {
                time: slideEvent.slideTime,
                title: slideEvent.slideTitle,
                description: slideEvent.slideDescription,
                url: slideEvent.slideUrl
            };

            slides.push(slide);
            _model.Set("slides", slides);
        }

        function handleTimedEventListChanged(eventData) {
            _model.Set("timedevents", eventData.timedEvents);
            _eventBundle.callHandlers("timedeventlistchanged", []);
        }

        function getCollection(key) {
            // Get a collection from model storage and sanitize it for API consumers
            var collection = _model.Get(key);
            if (!collection || collection.length == 0) return [];

            collection = collection.slice(0);
            return collection;
        }

        function cloneArrayAndItems(oldArray) {
            var i, oldItem, newItem;
            var newArray = [];

            if (oldArray && oldArray.length > 0) {
                for (i = 0; i < oldArray.length; i += 1) {
                    oldItem = oldArray[i];
                    newItem = {};
                    for (var prop in oldItem) {
                        if (oldItem.hasOwnProperty(prop)) {
                            newItem[prop] = oldItem[prop];
                        }
                    }
                    newArray.push(newItem);
                }
            }

            return newArray;
        }

        function compareTimedEvents(a, b) {
            return a.time - b.time;
        }
        // #endregion

        // #region Public methods
        this.addHandler = function (event, handler) {
            return _eventBundle.addHandler(event, handler);
        };

        this.removeHandler = function (event, handler) {
            return _eventBundle.removeHandler(event, handler);
        };

        this.play = function () {
            /// <returns type="void" />
            verifyVersionCheck();
            _broker.sendCommand("play");
        };

        this.pause = function () {
            /// <returns type="void" />
            verifyVersionCheck();
            _broker.sendCommand("pause");
        };

        this.stop = function () {
            /// <returns type="void" />
            verifyVersionCheck();
            _broker.sendCommand("stop");
        };

        this.seekTo = function (seconds) {
            /// <param name="seconds" type="Number">Position to seek to (in seconds)</param>
            /// <returns type="void" />
            verifyVersionCheck();
            _broker.sendCommand("seekTo", { seconds: seconds });
        };

        this.getCurrentTime = function () {
            /// <returns type="Number">Current position in presentation (in seconds)</returns>
            verifyVersionCheck();
            return _model.Get("currentTime");
        };

        this.getCurrentChapter = function () {
            verifyVersionCheck();
            if (!_model.Has("chapter.time")) { return; }

            return {
                title: _model.Get("chapter.title"),
                time: _model.Get("chapter.time")
            };
        };

        this.getCurrentSlide = function (streamType) {
            verifyVersionCheck();
            streamType = "." + streamType != undefined ? streamType : Mediasite.StreamType.Slide;
            if (!_model.Has("slide.time")) { return; }

            return {
                title: _model.Get("slide.title" + streamType),
                description: _model.Get("slide.description" + streamType),
                time: _model.Get("slide.time" + streamType),
                url: _model.Get("slide.url" + streamType),
                streamType: _model.Get("slide.streamtype" + streamType)
            };
        };

        this.getCurrentCaptions = function () {
            verifyVersionCheck();
            return getCollection("currentCaptions");
        };

        this.getChapters = function () {
            verifyVersionCheck();
            return getCollection("chapters");
        };

        this.getSlides = function (streamType) {
            verifyVersionCheck();
            streamType = streamType != undefined ? streamType : Mediasite.StreamType.Slide;
            var slides = [];
            var allSlides = getCollection("slides")

            for (var i = 0; i < allSlides.length; i++) {
                if (allSlides[i].streamType == streamType || (streamType == Mediasite.StreamType.Slide && allSlides[i].streamType == undefined)) {
                    slides.push(allSlides[i]);
                }
            }

            return slides;
        }

        this.getCaptions = function () {
            verifyVersionCheck();
            return getCollection("captions");
        }

        this.getDuration = function () {
            /// <returns type="Number">Duration of presentation (in seconds)</returns>
            verifyVersionCheck();
            return _model.Get("duration");
        };

        this.getPlayState = function () {
            /// <returns type="MediasitePlayer.PlayState">Current state of the player</returns>
            verifyVersionCheck();
            return _model.Get("playState");
        };

        this.getPlayerState = function () {
            /// <returns type="MediasitePlayer.PlayerState">Current state of the player</returns>
            verifyVersionCheck();

            var playerState = {
                state: _model.Get("playerState.state"),
                isLive: _model.Get("playerState.isLive")
            }

            if (!playerState.state) {
                playerState.state = Mediasite.PlayerState.NotReady;
            }
            return playerState
        };

        this.getLiveStatus = function () {
            /// <returns type="MediasitePlayer.PlayState">Current presentation status for on-demand (loading from storage) or live (streaming from recorder)</returns>
            verifyVersionCheck();
            return _model.Get("liveStatus");
        };


        this.getVolume = function () {
            /// <returns type="Number">Current volume (0-100)</returns>
            verifyVersionCheck();
            return Math.round(_model.Get("volume"));
        };

        this.setVolume = function (volume) {
            /// <param name="volume" type="Number">Volume (0-100)</param>
            verifyVersionCheck();
            _broker.sendCommand("setVolume", { volume: volume });
        };

        this.mute = function () {
            verifyVersionCheck();
            _broker.sendCommand("mute");
        };

        this.unMute = function () {
            verifyVersionCheck();
            _broker.sendCommand("unMute");
        };

        this.isMuted = function () {
            /// <returns type="bool"></returns>
            verifyVersionCheck();
            return _model.Get("volume.muted");
        };

        this.getPlaybackRate = function () {
            /// <returns type="bool"></returns>
            verifyVersionCheck();
            return _model.Get("playbackRate");
        };

        this.setLayoutOptions = function (options) {
            verifyVersionCheck();
            _broker.sendCommand("setLayoutOptions", { options: options });
        };

        this.isActivated = function () {
            /// API is ready
            /// <returns type="bool" />
            verifyVersionCheck();
            return _model.Get("activated");
        };

        this.isReady = function () {
            /// Presentation is ready
            /// <returns type="bool" />
            verifyVersionCheck();
            return _model.Get("ready");
        };

        this.isPlayCoverReady = function () {
            verifyVersionCheck();
            return _model.Get("playCoverReady");
        }

        this.getLinks = function () {
            /// <returns type="string[]"></returns>
            verifyVersionCheck();
            return getCollection("links");
        };

        this.getPollsUri = function () {
            /// <returns type="string"></returns>
            verifyVersionCheck();
            return _model.Get("pollsUri");
        };

        this.getAllStreams = function () {
            verifyVersionCheck();
            return getCollection("allStreams");
        };

        this.getVisibleStreamTypes = function () {
            verifyVersionCheck();
            return getCollection("visibleStreamTypes");
        };

        this.setVisibleStreamTypes = function (streamTypes) {
            verifyVersionCheck();
            _broker.sendCommand("setVisibleStreamTypes", { streamTypes: streamTypes });
        };

        this.getTimedEvents = function (eventType) {
            verifyVersionCheck();
            var i, result;
            var all = getCollection("timedevents");

            if (typeof eventType === 'undefined') {
                return all;
            } else {
                result = [];

                for (i = 0; i < all.length; i++) {
                    if (all[i].type === eventType) {
                        result.push(all[i]);
                    }
                }

                return result;
            }
        };

        this.addTimedEvent = function (time, type, payload) {
            verifyVersionCheck();
            var id = _idGenerator.generate();
            var te = { id:id, time:time, type:type, payload:payload };
            var list = _model.Get('timedevents');
            list.push(te);
            list.sort(compareTimedEvents);

            _broker.sendCommand("unsafeAddTimedEvent", { time: time, type: type, payload: payload, id: id });

            return id;
        };

        this.removeTimedEvent = function (id) {
            verifyVersionCheck();
            var list = _model.Get('timedevents');
            var i;
            for (i = list.length - 1; i >= 0; i -= 1) {
                if (list[i].id === id) {
                    list.splice(i, 1);
                }
            }

            _broker.sendCommand("removeTimedEvent", { id: id });
        };

        this.setTimedEventMarkerOptions = function (timedEventId, options) {
            verifyVersionCheck();
            _broker.sendCommand("setTimedEventMarkerOptions", timedEventId, options);
        };

        this.clearTimedEventMarkerOptions = function (timedEventId) {
            verifyVersionCheck();
            _broker.sendCommand("clearTimedEventMarkerOptions", timedEventId);
        };

        // private
        this.getPastSessionPlayedSegments = function () {
            // NOT PART OF PUBLIC API

            verifyVersionCheck();
            return cloneArrayAndItems(_model.Get("pastSessionPlayedSegments"));
        };

        this.setPlayCoverCustomHtml = function (htmlString) {
            verifyVersionCheck();
            _broker.sendCommand("setPlayCoverCustomHtml", { htmlString: htmlString });
        };

        // #endregion 
        initialize();
    };



    Mediasite.Player.View = function MediasitePlayerIFrameView(element, url) {
        /// <summary>Set up presentation in DOM</summary>
        /// <returns type="bool|string">if successful, true; else, error text</returns>

        // Private properties
        var _element, _originalElement;


        // #region Initialize
        (function initialize() {
            // Sanity check parameters
            if (element instanceof Element) {
                container = element; // If the element is an instanceof a DOM element, use that
            } else {
                container = document.getElementById(element); // Otherwise, look up the element by it's ID in the document

                if (!container) throw 'could not find DOMElement with id="' + element + '"';
            }

            if (container.tagName !== 'IFRAME' && !url) throw 'no presentation url specified';

            if (container.tagName === 'IFRAME') {
                _originalElement = null;
                _element = container;
                _element.src = url;
            } else {
                // Create iframe to host presentation
                var presentationContainer = document.createElement('iframe');
                presentationContainer.id = container.id;
                presentationContainer.src = url;
                presentationContainer.setAttribute('frameBorder', '0');
                presentationContainer.setAttribute('marginHeight', '0');
                presentationContainer.setAttribute('marginWidth', '0');
                presentationContainer.setAttribute('allow', 'autoplay; fullscreen');

                // Replace given container with presentation
                _originalElement = container;
                _element = presentationContainer;
                container.parentNode.replaceChild(presentationContainer, container);
            }
        })();
        // #endregion


        // #region Public methods
        this.getElement = function () {
            return _element;
        }

        this.getElementWindow = function () {
            return _element.contentWindow;
        }

        this.postMessage = function (message, origin) {
            this.getElementWindow().postMessage(message, '*');
        };

        this.addEventListener = function (event, handler) {
            var contentWindow = this.getElement();
            if (contentWindow.addEventListener) {
                contentWindow.addEventListener(event, handler);
            } else if (contentWindow.attachEvent) {
                contentWindow.attachEvent('on' + event, handler);
            } else {
                contentWindow['on' + event] = handler;
            }
        }
        // #endregion
    };

    Mediasite.Player.StateModel = function MediasitePlayerStateModel() {
        // Private properties
        var _properties;

        // #region Initialize
        _properties = {};
        // #endregion

        // #region Public methods
        this.Get = function (key) {
            return _properties[key];
        };

        this.Set = function (key, value) {
            _properties[key] = value;
        };

        this.Has = function (key) {
            return _properties.hasOwnProperty(key);
        }
        // #endregion
    };

    Mediasite.Player.StandaloneEventBundle = function StandaloneEventBundle(thisObject) {
        var _eventList = {};
        var _this = thisObject || window;

        this.addHandler = function (eventName, handler) {
            if (typeof eventName == 'object') {
                actOnEventDictionary(eventName, addSingleHandler);
            } else {
                addSingleHandler(eventName, handler);
            }
        };

        this.removeHandler = function (eventName, handler) {
            if (typeof eventName == 'object') {
                actOnEventDictionary(eventName, removeSingleHandler);
            } else {
                removeSingleHandler(eventName, handler);
            }
        };

        this.callHandlers = function (eventName, argumentsArray) {
            // Corresponds to EventBundle.Fire, but not polyadic

            // Wrap bare argument in array
            if (argumentsArray && (typeof argumentsArray == "string" || typeof argumentsArray.length == "undefined")) {
                argumentsArray = [argumentsArray];
            }

            // Invoke regular handlers
            if (_eventList[eventName]) {
                callHandlers(_eventList[eventName], argumentsArray);
            }

            // Invoke universal handlers
            callHandlers(_eventList["*"], [eventName, argumentsArray]);
        };

        function actOnEventDictionary(dictionary, action) {
            for (name in dictionary) {
                if (dictionary.hasOwnProperty(name)) {
                    var value = dictionary[name];
                    if (typeof value == 'function') {
                        action(name, value);
                    }
                }
            }
        }

        // #region Standalone implementation
        function addSingleHandler(eventName, handler) {
            if (!_eventList[eventName]) {
                _eventList[eventName] = [];
            }
            _eventList[eventName].push(handler);
        }

        function removeSingleHandler(eventName, handler) {
            if (_eventList[eventName]) {
                var handlers = _eventList[eventName];
                for (var i = 0, length = handlers.length; i < length; i++) {
                    if (handlers[i] == handler) {
                        handlers.splice(i, 1);
                        i--;
                        length--;
                    }
                }
            }
        }


        function callHandlers(handlers, arguments) {
            if (!handlers || handlers.length === 0) return;
            for (var i = 0, length = handlers.length; i < length; i++) {
                var handler = handlers[i];

                handler.apply(_this, arguments);
            }
        }
        // #endregion
    };

    Mediasite.Player.IFrameAPIBroker = function IFrameAPIBroker(options) {
        /// <summary>Handles message-passing between MediasitePlayer object and Mediasite.Player.API</summary>

        // Private Properties
        var _eventBundle, _iframeView, _iframeOrigin, _messagePrefix;
        var _messageDelimiter = ':';
        var _initializationData;
        var self = this;

        // #region Initialize
        (function initialize() {
            _messagePrefix = options.messagePrefix || 'Mediasite';
            _eventBundle = new Mediasite.Player.StandaloneEventBundle(self);

            if (options.events) {
                _eventBundle.addHandler(options.events);
            }

            _iframeView = options.iframeView;
            _iframeOrigin = self.getTargetOrigin(options.url);
            _initializationData = options.initializationData || {};


            Mediasite.Player.BrokerMessageDispatcher.registerBroker(self,
                _iframeView,
                _iframeOrigin,
                _messagePrefix);

            _initialized = true;
        })();

        function onInternalBrokerActivated(data) {
            _eventBundle.callHandlers("activated", data);
        }

        function sendInternalBrokerActivate() {
            self.sendCommand('_broker_activate', _initializationData);
        }

        function handleBrokerEvent(eventName, data) {
            if (eventName == '_broker_activated') {
                onInternalBrokerActivated(data);
                return true;
            }
        }


        // #endregion

        // #region Public methods
        this.receiveAPIEvent = function (eventName, dataArray) {
            /// <param name="eventName" type="string">Event name</param>
            /// <param name="dataArray">Data from event</param>

            if (handleBrokerEvent(eventName, dataArray)) {
                return;
            }

            _eventBundle.callHandlers(eventName, dataArray);
        };

        this.tryActivate = function () {
            sendInternalBrokerActivate();
        };

        this.sendCommand = function (command, parameters) {
            /// <param name="command" type="string">Name of presentation API method to call</param>
            /// <param name="parameters">Values to pass to presentation API method (infinite-arity)</param>

            var messageData = {
                command: command,
                params: []
            };
            if (arguments.length >= 2) {
                parameters = Array.prototype.slice.call(arguments, 1);
                messageData.params = parameters;
            }

            var message = _messagePrefix + _messageDelimiter + JSON.stringify(messageData);

            try {
                _iframeView.postMessage(message, _iframeOrigin);
            } catch (err) {
                return false;
            }
            return true;
        };

        this.addHandler = function (eventName, handler) {
            _eventBundle.addHandler(eventName, handler);
        };

        this.removeHandler = function (eventName, handler) {
            _eventBundle.removeHandler(eventName, handler);
        };
        // #endregion
    };

    Mediasite.Player.IFrameAPIBroker.prototype.getTargetOrigin = function (url) {
        // Static function
        var origin, protocol, hostandport;

        url = url.split('://');
        protocol = url[0];

        url = url[1].split('/');
        hostandport = url[0];

        if (protocol == 'file') {
            origin = '*';
        } else {
            origin = [protocol, '://', hostandport].join('');
        }
        origin = origin.trim();
        return origin;
    };

    Mediasite.Player.BrokerMessageDispatcher = (function () {
        /// <summary>Send incoming MediasiteAPIBroker messages to the correct broker</summary>
        var _messageDelimiter = ':'; // const

        var singleton = new (function BrokerMessageDispatcher() { });
        var _brokers = [];

        // #region Dispatch incoming messages to appropriate API message broker
        singleton.registerBroker = function (broker, view, origin) {
            singleton.listenForMessages();
            if (!broker || !view || !view.getElementWindow()) return false;
            origin = origin || [document.location.protocol, '//', document.location.hostname].join('');

            var brokerMetadata = {
                origin: origin,
                window: view.getElementWindow(),
                broker: broker
            };
            _brokers.push(brokerMetadata);

            return true;
        };

        singleton.getBrokerForMessage = function (sourceWindow, eventOrigin) {
            if (!(sourceWindow && eventOrigin)) return;

            if (eventOrigin === "null" || eventOrigin.indexOf('file://') == 0) {
                eventOrigin = "*"; // tolerate non-standard origins
            }

            for (var bmd in _brokers) {
                var brokerMetadata = _brokers[bmd];
                if (brokerMetadata.origin == eventOrigin
                    && brokerMetadata.window == sourceWindow)
                    return brokerMetadata.broker;
            }
        }


        var _listening = false;
        singleton.listenForMessages = function () {
            if (_listening) return;
            _listening = true;

            if (window.addEventListener) {
                window.addEventListener("message", singleton.handleIncomingMessageEvent);
            } else if (window.attachEvent) {
                window.attachEvent("onmessage", singleton.handleIncomingMessageEvent);
            }

        };


        singleton.handleIncomingMessageEvent = function (event) {
            var message = singleton.parseIncomingMessageEvent(event.data);
            if (!message) return;
            // Expected message is JSON-parsed object

            var broker = singleton.getBrokerForMessage(event.source, event.origin);
            if (!broker) return;

            if (message.event) {
                broker.receiveAPIEvent(message.event, message.data);
            } else {
                broker.receiveAPIEvent("message", message);
            }
        };


        singleton.parseIncomingMessageEvent = function (eventData) {
            // Expected eventData (string):
            //      messagePrefix 
            //      + _messageDelimiter
            //      + JSON.stringify(contents)
            // or expected initialization data (string):
            //      JSON.stringify(contents)
            eventData = eventData || '';

            var delimiterPosition = eventData.indexOf(_messageDelimiter);
            if (eventData.substr(0, 1) !== '{' && delimiterPosition >= 0) {
                var messagePrefix = eventData.substring(0, delimiterPosition);
                var messageData = eventData.substring(delimiterPosition + 1);
            } else {
                messageData = eventData;
            }

            try {
                var messageContents = JSON.parse(messageData);
            } catch (e) {
                return false;
            }

            return messageContents;
        }

        return singleton;
    })();

    /* =================================
    PlaybackTracker
    ================================= */
    var Mediasite = Mediasite || {};

    Mediasite.PlaybackTracker = (function () {
        var module = Mediasite$TimelineCoverage$Tracker;

        module.TrackerDefaults = {
            tolerance: 1,    // player reports contiguous segments as [1:2] [3:4], not [1:2] [2:3].
            includePastSessions: false
        };

        function Mediasite$TimelineCoverage$Tracker(player, options) {
            var self = this;
            // #region Private
            var _tolerance; // seconds
            var _duration = -1;
            var _normalizedTimeRanges = [];
            var _currentTimeRange;


            // Set local variables from options/defaults
            if (!options) options = {};
            var defaults = module.TrackerDefaults;
            for (var option in defaults) {
                if (!options.hasOwnProperty(option)) {
                    options[option] = defaults[option];
                }
            }
            setTolerance(options.tolerance);

            self.addMoment = addMoment;
            self.add = addTimeRange;

            self.played = {
                start: getTimeRangeStart,
                end: getTimeRangeEnd,
                length: 0
            };

            if (Object.defineProperty) {
                Object.defineProperty(self.played, "length", {
                    get: getTimeRangeCount,
                    set: function () { /* read only */ },
                    configurable: false
                });
            }

            if (player) {
                attachToApi(player);
            }


            function addMoment(moment) {
                if (_currentTimeRange && _currentTimeRange.merge(moment, moment, _tolerance)) {
                    if (_currentTimeRange.duration() >= _minChunkDuration) {    // ignore blips
                        addTimeRange(_currentTimeRange);
                    }
                } else {
                    _currentTimeRange = new module.TimeRange(moment, moment);
                }
            }

            function getNormalizedTimeRanges() {
                return _normalizedTimeRanges;
            }

            function addTimeRange(start, end) {
                if (start.start) {
                    end = start.end();
                    start = start.start();
                }

                if (start > end) {
                    var temp = start;
                    start = end;
                    end = temp;
                }

                var ranges = _normalizedTimeRanges; // alias

                // Insert/merge time range into appropriate location
                var added = false;
                for (var i = 0, len = ranges.length; i < len; i++) {
                    var current = ranges[i];

                    var merged = current.merge(start, end, _tolerance);
                    if (merged) {
                        added = true;

                        // Swallow up following time ranges which are now contiguous
                        var next;
                        while ((next = ranges[i + 1])   // check for next available
                            && current.merge(next.start(), next.end(), _tolerance)) // attempt to merge it
                        {
                            ranges.splice(i + 1, 1);
                        }

                        break;
                    } else if (current.start() > start) {
                        ranges.splice(i, 0, new module.TimeRange(start, end));
                        added = true;
                        break;
                    }
                }

                if (!added) {
                    // Time range comes after existing time ranges
                    ranges.push(new module.TimeRange(start, end));
                }

                if (!Object.defineProperty) {
                    self.played.length = ranges.length;
                }
            }

            // #endregion

            // #region Public methods
            self.attachToPlayer = attachToApi;
            function attachToApi(playerApi) {
                var _playing = false;

                playerApi.addHandler({
                    "ready": onReady,
                    "currenttimechanged": function (data) {
                        addMoment(data.currentTime);
                    },
                    "durationchanged": function (data) {
                        setDuration(data.duration);
                    }
                });

                if (playerApi.isReady()) {
                    onReady();
                }


            }

            function onReady() {
                setDuration(player.getDuration());
                if (options.includePastSessions) {
                    addPastSessions();
                }
            }

            function getTimeRangeCount() {
                /// <returns type="Number[integer]">Number of normalized time ranges available</returns>
                var timeRanges = getNormalizedTimeRanges();
                return timeRanges.length;
            };

            function getTimeRangeStart(index) {
                /// <param name="index" type="Number[integer]">Which TimeRange you want</param>
                /// <returns type="Number[integer:seconds]">Start time for the given TimeRange</returns>

                var timeRanges = getNormalizedTimeRanges();

                if (typeof index == "undefined" || index < 0) return;
                if (index >= timeRanges.length) return;

                var range = timeRanges[index];
                if (range) {
                    return range.start();
                }
            };

            function getTimeRangeEnd(index) {
                /// <param name="index" type="Number[integer]">Which TimeRange you want</param>
                /// <returns type="Number[seconds]">End time for the given TimeRange</returns>

                var timeRanges = getNormalizedTimeRanges();
                if (typeof index == "undefined" || index < 0) return;
                if (index >= timeRanges.length) return;

                var range = timeRanges[index];
                if (range) {
                    return range.end();
                }
            };

            self.setTolerance = setTolerance;
            function setTolerance(tolerance) {
                /// <param name="tolerance" type="Number[seconds]"></param>
                _tolerance = Math.abs(tolerance);
                if (typeof _tolerance != "number") {
                    _tolerance = 0;
                }

                _minChunkDuration = Math.min(1, _tolerance);
            };

            self.getTolerance = getTolerance;
            function getTolerance() {
                /// <returns type="Number[seconds]"></returns>
                return _tolerance;
            };

            self.setDuration = setDuration;
            function setDuration(time, updateIfLonger) {
                /// <param name="time" type="Number[seconds]"></param>
                if (typeof time == "undefined" || time <= 0) return;
                if (updateIfLonger && time < _duration) return;
                _duration = time;
            };

            self.getPercentageWatched = getPercentageWatched;
            function getPercentageWatched() {
                /// <returns type="Number[0 to 100]">
                if (_duration <= 0) return;

                var ranges = getNormalizedTimeRanges();
                var durationsSum = 0;
                for (var i = 0; i < ranges.length; i++) {
                    durationsSum += ranges[i].duration();
                }

                var percentage = durationsSum / _duration * 100;
                return percentage;
            };


            function addPastSessions() {
                if (!player || typeof player.getPastSessionPlayedSegments !== 'function') {
                    return;
                }

                var i;
                var items = player.getPastSessionPlayedSegments();
                for (i = 0; i < items.length; i += 1) {
                    addTimeRange(items[i].start, items[i].end);
                }
            }
        }


        module.TimeRange = function Mediasite$TimeRange(startTime, endTime) {
            var self = this;
            var _startTime, _endTime;

            // Set start and end times; reverse them if endTime < startTime
            if (startTime < endTime) {
                _startTime = startTime;
                _endTime = endTime;
            } else {
                _startTime = endTime;
                _endTime = startTime;
            }

            self.start = function (time) {
                if (typeof time != "undefined") {
                    _startTime = time;
                }

                return _startTime;
            };
            self.end = function (time) {
                if (typeof time != "undefined") {
                    _endTime = time;
                }

                return _endTime;
            };
            self.duration = function () {
                return _endTime - _startTime;
            };
            self.intersects = function (start, end, tolerance) {
                tolerance = tolerance || 1;

                if (_endTime < start - tolerance) return false;
                if (end < _startTime - tolerance) return false;

                return true;
            };

            self.merge = function (start, end, tolerance) {
                /// <returns type="boolean">true for merged, false for could not merge</returns>
                if (!self.intersects(start, end, tolerance)) return false;

                _startTime = Math.min(_startTime, start);
                _endTime = Math.max(_endTime, end);

                return true;
            };
        }

        return module;
    })();


    function UniqueTemporaryIdGenerator(idScope) {
        var self = this;

        this.idScope = idScope;
        this.idCounter = 0;

        this.generate = function () {
            self.idCounter += 1;

            return ['TEMP', self.idScope, self.idCounter].join('-');
        };
    }


    return Mediasite;
}));
