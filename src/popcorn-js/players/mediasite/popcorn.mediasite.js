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

}( window, Popcorn ));