(function( Popcorn, window, document ) {

    var CURRENT_TIME_MONITOR_MS = 16;
    var MEDIASITE_HOST = "mediamission.nl";

    function MediasitePlayer( iframe )
    {
        function sendMessage( method, params ) {
            var data = JSON.stringify({
                method: method,
                value: params
            });

            // The iframe has been destroyed, it just doesn't know it
            if (!iframe.contentWindow) {
                return;
            }
            var url = "deltion.mediamission.nl"

            iframe.contentWindow.postMessage(data, url);
            debugger;
        }

        var methods = ("play pause stop seekTo getCurrentTime getCurrentChapter getCurrentSlide getCurrentCaption getChapters getTimedEvents"
        + "getPlayState getDuration getPlayerState getVolume setVolume addEventListener").split(" ");

        methods.forEach( function( method ) {
            // All current methods take 0 or 1 args, always send arg0
            self[ method ] = function( arg0 ) {
                sendMessage( method, arg0 );
                debugger;
            };
        });
    }

    function HTMLMediasiteVideoElement(id) {
        var self = Popcorn._MediaElementProto(),
            parent = typeof id === "string" ? Popcorn.dom.find( id ) : id,
            elem = document.createElement( "iframe" ),
            impl = {
                src: "",
                networkState: self.NETWORK_EMPTY,
                readyState: self.HAVE_NOTHING,
                seeking: false,
                autoplay: "",
                preload: "",
                controls: false,
                loop: false,
                poster: "",
                volume: 1,
                muted: 0,
                currentTime: 0,
                duration: NaN,
                ended: false,
                paused: true,
                error: null
            },
            playerReady = false,
            playerUID = Popcorn.guid(),
            player,
            playerPaused = true,
            playerReadyCallbacks = [],
            timeUpdateInterval,
            currentTimeInterval,
            lastCurrentTime = 0;

        // Namespace all events we'll produce
        self._eventNamespace = Popcorn.guid( "HTMLMediasiteVideoElement::" );

        self.parentNode = parent;

        // Mark type as Mediasite
        self._util.type = "Mediasite";

        function addPlayerReadyCallback( callback ) {
            playerReadyCallbacks.push( callback );
        }

        function changeSrc( aSrc ) {
            if (!self._canPlaySrc(aSrc)) {
                impl.error = {
                    name: "MediaError",
                    message: "Media Source Not Supported",
                    code: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
                };
                self.dispatchEvent("error");
                return;
            }

            impl.src = aSrc;
            $.getScript("/plugins/mediasite/MediasitePlayerIFrameAPI.js");

            player = new Mediasite.Player( elem,
                {
                    url: aSrc,
                    events:
                        {
                            ready: onReady,
                            playerstatechanged: onPlayerStateChanged
                        }
                }
            );


            elem.id = playerUID;
            elem.style.width = "100%";
            elem.style.height = "100%";
            elem.frameBorder = 0;
            // Leave this for IE (?)
            elem.webkitAllowFullScreen = true;
            elem.mozAllowFullScreen = true;
            elem.allowFullScreen = true;
            // Set in correct way for other browsers (including edge)
            elem.setAttribute("webkitAllowFullScreen", "");
            elem.setAttribute("mozAllowFullScreen", "");
            elem.setAttribute("allowFullScreen", "");
            parent.appendChild( elem );
            elem.src = aSrc;

            //window.addEventListener( "message", startupMessage, false);
        }

        function onReady ()
        {
            player = new MediasitePlayer( elem );
        }

        function startupMessage ( event )
        {
            if (event.origin.indexOf(MEDIASITE_HOST) === -1)
                return;

            var data;
            try {
                data = JSON.parse( event.data );
            } catch ( ex ) {
                console.warn( ex );
            }
            switch (data.event)
            {
                case "ready":
                    player = new MediasitePlayer( elem );
                    player.addEventListener( "loadProgress" );
                    player.addEventListener( "pause" );
                    player.setVolume( 0 );
                    // set subtitle to Xerte language
                    player.enableTextTrack(x_params.language.substr(0,2));
                    player.play();
                    break;
                case "pause":
                    debugger;
            }
        }

        function destroyPlayer() {
            if( !( playerReady && player ) ) {
                return;
            }
            clearInterval( currentTimeInterval );
            player.pause();

            window.removeEventListener( 'message', onStateChange, false );
            parent.removeChild( elem );
            elem = document.createElement( "iframe" );
        }

        function onStateChange( event )
        {
            debugger;
        }

        self.play = function() {
            impl.paused = false;
            if( !playerReady ) {
                addPlayerReadyCallback( function() { self.play(); } );
                return;
            }

            player.play();
        };

        Object.defineProperties( self, {

            src: {
                get: function () {
                    return impl.src;
                },
                set: function (aSrc) {
                    if (aSrc && aSrc !== impl.src) {
                        changeSrc(aSrc);
                    }
                }
            }
        });

        self._canPlaySrc = Popcorn.HTMLMediasiteVideoElement._canPlaySrc;

        return self;
    }

    self.pause = function() {
        impl.paused = true;
        if( !playerReady ) {
            addPlayerReadyCallback( function() { self.pause(); } );
            return;
        }

        player.pause();
    };

    Popcorn.HTMLMediasiteVideoElement = function( id ) {
        return new HTMLMediasiteVideoElement( id );
    };

    // Helper for identifying URLs we know how to play.
    Popcorn.HTMLMediasiteVideoElement._canPlaySrc = function( url ) {
        return "probably";
    };



}( Popcorn, window, document ));