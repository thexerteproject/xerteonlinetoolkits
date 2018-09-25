(function( window, Popcorn ) {

    Popcorn.player( "mediasite", {
        _canPlayType: function( nodeName, url ) {
            return ( typeof url === "string" && Popcorn.HTMLMediasiteVideoElement._canPlaySrc( url ) );
        }
    });

    Popcorn.mediasite = function( container, url, options ) {

        var media = Popcorn.HTMLMediasiteVideoElement( container ),
            popcorn = Popcorn( media, options );

        // Set the src "soon" but return popcorn instance first, so
        // the caller can get get error events.
        // Dodgy popcorn-js
        setTimeout( function() {
            media.src = url;
        }, 0 );

        return popcorn;
    };

}( window, Popcorn ));(function( window, Popcorn ) {

  Popcorn.player( "soundcloud", {
    _canPlayType: function( nodeName, url ) {
      return ( typeof url === "string" &&
               Popcorn.HTMLSoundCloudAudioElement._canPlaySrc( url ) &&
               nodeName.toLowerCase() !== "audio" );
    }
  });

  Popcorn.soundcloud = function( container, url, options ) {
    if ( typeof console !== "undefined" && console.warn ) {
      console.warn( "Deprecated player 'soundcloud'. Please use Popcorn.HTMLSoundCloudAudioElement directly." );
    }

    var media = Popcorn.HTMLSoundCloudAudioElement( container ),
        popcorn = Popcorn( media, options );

    // Set the src "soon" but return popcorn instance first, so
    // the caller can get get error events.
    setTimeout( function() {
      media.src = url;
    }, 0 );

    return popcorn;
  };

}( window, Popcorn ));
(function( window, Popcorn ) {

  Popcorn.player( "vimeo", {
    _canPlayType: function( nodeName, url ) {
      return ( typeof url === "string" &&
               Popcorn.HTMLVimeoVideoElement._canPlaySrc( url ) );
    }
  });

  Popcorn.vimeo = function( container, url, options ) {
    if ( typeof console !== "undefined" && console.warn ) {
      console.warn( "Deprecated player 'vimeo'. Please use Popcorn.HTMLVimeoVideoElement directly." );
    }

    var media = Popcorn.HTMLVimeoVideoElement( container ),
      popcorn = Popcorn( media, options );

    // Set the src "soon" but return popcorn instance first, so
    // the caller can get get error events.
    setTimeout( function() {
      media.src = url;
    }, 0 );

    return popcorn;
  };

}( window, Popcorn ));
(function( window, Popcorn ) {

  var canPlayType = function( nodeName, url ) {
    return ( typeof url === "string" &&
             Popcorn.HTMLYouTubeVideoElement._canPlaySrc( url ) );
  };

  Popcorn.player( "youtube", {
    _canPlayType: canPlayType
  });

  Popcorn.youtube = function( container, url, options ) {
    if ( typeof console !== "undefined" && console.warn ) {
      console.warn( "Deprecated player 'youtube'. Please use Popcorn.HTMLYouTubeVideoElement directly." );
    }

    var media = Popcorn.HTMLYouTubeVideoElement( container ),
        popcorn = Popcorn( media, options );

    // Set the src "soon" but return popcorn instance first, so
    // the caller can listen for error events.
    setTimeout( function() {
      media.src = url;
    }, 0 );

    return popcorn;
  };

  Popcorn.youtube.canPlayType = canPlayType;

}( window, Popcorn ));
