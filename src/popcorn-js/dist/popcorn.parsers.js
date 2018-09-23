// PARSER: 0.3 JSON

(function (Popcorn) {
  Popcorn.parser( "parseJSON", "JSON", function( data ) {

    // declare needed variables
    var retObj = {
          title: "",
          remote: "",
          data: []
        },
        manifestData = {}, 
        dataObj = data;
    
    
    /*
      TODO: add support for filling in source children of the video element
      
      
      remote: [
        { 
          src: "whatever.mp4", 
          type: 'video/mp4; codecs="avc1, mp4a"'
        }, 
        { 
          src: "whatever.ogv", 
          type: 'video/ogg; codecs="theora, vorbis"'
        }
      ]

    */
    
        
    Popcorn.forEach( dataObj.data, function ( obj, key ) {
      retObj.data.push( obj );
    });

    return retObj;
  });

})( Popcorn );
// PARSER: 0.1 SBV

(function (Popcorn) {

  /**
   * SBV popcorn parser plug-in 
   * Parses subtitle files in the SBV format.
   * Times are expected in H:MM:SS.MIL format, with hours optional
   * Subtitles which don't match expected format are ignored
   * Data parameter is given by Popcorn, will need a text.
   * Text is the file contents to be parsed
   * 
   * @param {Object} data
   * 
   * Example:
    0:00:02.400,0:00:07.200
    Senator, we're making our final approach into Coruscant.
   */
  Popcorn.parser( "parseSBV", function( data ) {
  
    // declare needed variables
    var retObj = {
          title: "",
          remote: "",
          data: []
        },
        subs = [],
        lines,
        i = 0,
        len = 0,
        idx = 0;
    
    // [H:]MM:SS.MIL string to SS.MIL
    // Will thrown exception on bad time format
    var toSeconds = function( t_in ) {
      var t = t_in.split( ":" ),
          l = t.length-1,
          time;
      
      try {
        time = parseInt( t[l-1], 10 )*60 + parseFloat( t[l], 10 );
        
        // Hours optionally given
        if ( l === 2 ) { 
          time += parseInt( t[0], 10 )*3600;
        }
      } catch ( e ) {
        throw "Bad cue";
      }
      
      return time;
    };
    
    var createTrack = function( name, attributes ) {
      var track = {};
      track[name] = attributes;
      return track;
    };
  
    // Here is where the magic happens
    // Split on line breaks
    lines = data.text.split( /(?:\r\n|\r|\n)/gm );
    len = lines.length;
    
    while ( i < len ) {
      var sub = {},
          text = [],
          time = lines[i++].split( "," );
      
      try {
        sub.start = toSeconds( time[0] );
        sub.end = toSeconds( time[1] );
        
        // Gather all lines of text
        while ( i < len && lines[i] ) {
          text.push( lines[i++] );
        }
        
        // Join line breaks in text
        sub.text = text.join( "<br />" );
        subs.push( createTrack( "subtitle", sub ) );
      } catch ( e ) {
        // Bad cue, advance to end of cue
        while ( i < len && lines[i] ) {
          i++;
        }
      }
      
      // Consume empty whitespace
      while ( i < len && !lines[i] ) {
        i++;
      }
    }
    
    retObj.data = subs;

    return retObj;
  });

})( Popcorn );
// PARSER: 0.3 SRT
(function (Popcorn) {
  /**
   * SRT popcorn parser plug-in
   * Parses subtitle files in the SRT format.
   * Times are expected in HH:MM:SS,MIL format, though HH:MM:SS.MIL also supported
   * Ignore styling, which may occur after the end time or in-text
   * While not part of the "official" spec, majority of players support HTML and SSA styling tags
   * SSA-style tags are stripped, HTML style tags are left for the browser to handle:
   *    HTML: <font>, <b>, <i>, <u>, <s>
   *    SSA:  \N or \n, {\cmdArg1}, {\cmd(arg1, arg2, ...)}

   * Data parameter is given by Popcorn, will need a text.
   * Text is the file contents to be parsed
   *
   * @param {Object} data
   *
   * Example:
    1
    00:00:25,712 --> 00:00:30.399
    This text is <font color="red">RED</font> and has not been {\pos(142,120)} positioned.
    This takes \Nup three \nentire lines.
    This contains nested <b>bold, <i>italic, <u>underline</u> and <s>strike-through</s></u></i></b> HTML tags
    Unclosed but <b>supported tags are left in
    <ggg>Unsupported</ggg> HTML tags are left in, even if <hhh>not closed.
    SSA tags with {\i1} would open and close italicize {\i0}, but are stripped
    Multiple {\pos(142,120)\b1}SSA tags are stripped
   */
  Popcorn.parser( "parseSRT", function( data, options ) {

    // declare needed variables
    var retObj = {
          title: "",
          remote: "",
          data: []
        },
        subs = [],
        i = 0,
        idx = 0,
        lines,
        time,
        text,
        endIdx,
        sub;

    // Here is where the magic happens
    // Split on line breaks
    lines = data.text.split( /(?:\r\n|\r|\n)/gm );
    endIdx = lastNonEmptyLine( lines ) + 1;

    for( i=0; i < endIdx; i++ ) {
      sub = {};
      text = [];

      i = nextNonEmptyLine( lines, i );
      sub.id = parseInt( lines[i++], 10 );

      // Split on '-->' delimiter, trimming spaces as well
      time = lines[i++].split( /[\t ]*-->[\t ]*/ );

      sub.start = toSeconds( time[0] );

      // So as to trim positioning information from end
      idx = time[1].indexOf( " " );
      if ( idx !== -1) {
        time[1] = time[1].substr( 0, idx );
      }
      sub.end = toSeconds( time[1] );

      // Build single line of text from multi-line subtitle in file
      while ( i < endIdx && lines[i] ) {
        text.push( lines[i++] );
      }

      // Join into 1 line, SSA-style linebreaks
      // Strip out other SSA-style tags
      sub.text = text.join( "\\N" ).replace( /\{(\\[\w]+\(?([\w\d]+,?)+\)?)+\}/gi, "" );

      // Escape HTML entities
      sub.text = sub.text.replace( /</g, "&lt;" ).replace( />/g, "&gt;" );

      // Unescape great than and less than when it makes a valid html tag of a supported style (font, b, u, s, i)
      // Modified version of regex from Phil Haack's blog: http://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx
      // Later modified by kev: http://kevin.deldycke.com/2007/03/ultimate-regular-expression-for-html-tag-parsing-with-php/
      sub.text = sub.text.replace( /&lt;(\/?(font|b|u|i|s))((\s+(\w|\w[\w\-]*\w)(\s*=\s*(?:\".*?\"|'.*?'|[^'\">\s]+))?)+\s*|\s*)(\/?)&gt;/gi, "<$1$3$7>" );
      sub.text = sub.text.replace( /\\N/gi, "<br />" );
      
      if ( options && options[ "target" ] ) {
        sub.target = options[ "target" ];
      }
  
      subs.push( createTrack( "subtitle", sub ) );
    }

    retObj.data = subs;
    return retObj;
  });

  function createTrack( name, attributes ) {
    var track = {};
    track[name] = attributes;
    return track;
  }

  // Simple function to convert HH:MM:SS,MMM or HH:MM:SS.MMM to SS.MMM
  // Assume valid, returns 0 on error
  function toSeconds( t_in ) {
    var t = t_in.split( ':' );

    try {
      var s = t[2].split( ',' );

      // Just in case a . is decimal seperator
      if ( s.length === 1 ) {
        s = t[2].split( '.' );
      }

      return parseFloat( t[0], 10 ) * 3600 + parseFloat( t[1], 10 ) * 60 + parseFloat( s[0], 10 ) + parseFloat( s[1], 10 ) / 1000;
    } catch ( e ) {
      return 0;
    }
  }

  function nextNonEmptyLine( linesArray, position ) {
    var idx = position;
    while ( !linesArray[idx] ) {
      idx++;
    }
    return idx;
  }

  function lastNonEmptyLine( linesArray ) {
    var idx = linesArray.length - 1;

    while ( idx >= 0 && !linesArray[idx] ) {
      idx--;
    }

    return idx;
  }
})( Popcorn );
// PARSER: 0.3 SSA/ASS

(function ( Popcorn ) {
  /**
   * SSA/ASS popcorn parser plug-in
   * Parses subtitle files in the identical SSA and ASS formats.
   * Style information is ignored, and may be found in these
   * formats: (\N    \n    {\pos(400,570)}     {\kf89})
   * Out of the [Script Info], [V4 Styles], [Events], [Pictures],
   * and [Fonts] sections, only [Events] is processed.
   * Data parameter is given by Popcorn, will need a text.
   * Text is the file contents to be parsed
   *
   * @param {Object} data
   *
   * Example:
     [Script Info]
      Title: Testing subtitles for the SSA Format
      [V4 Styles]
      Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, TertiaryColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, AlphaLevel, Encoding
      Style: Default,Arial,20,65535,65535,65535,-2147483640,-1,0,1,3,0,2,30,30,30,0,0
      [Events]
      Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
      Dialogue: 0,0:00:02.40,0:00:07.20,Default,,0000,0000,0000,,Senator, {\kf89}we're \Nmaking our final \napproach into Coruscant.
      Dialogue: 0,0:00:09.71,0:00:13.39,Default,,0000,0000,0000,,{\pos(400,570)}Very good, Lieutenant.
      Dialogue: 0,0:00:15.04,0:00:18.04,Default,,0000,0000,0000,,It's \Na \ntrap!
   *
   */

  // Register for SSA extensions
  Popcorn.parser( "parseSSA", function( data ) {
    // declare needed variables
    var retObj = {
          title: "",
          remote: "",
          data: [  ]
        },
        rNewLineFile = /(?:\r\n|\r|\n)/gm,
        subs = [  ],
        lines,
        headers,
        i = 0,
        len;

    // Here is where the magic happens
    // Split on line breaks
    lines = data.text.split( rNewLineFile );
    len = lines.length;

    // Ignore non-textual info
    while ( i < len && lines[ i ] !== "[Events]" ) {
      i++;
    }

    headers = parseFieldHeaders( lines[ ++i ] );

    while ( ++i < len && lines[ i ] && lines[ i ][ 0 ] !== "[" ) {
      try {
        subs.push( createTrack( "subtitle", parseSub( lines[ i ], headers ) ) );
      } catch ( e ) {}
    }

    retObj.data = subs;
    return retObj;
  });

  function parseSub( line, headers ) {
    // Trim beginning 'Dialogue: ' and split on delim
    var fields = line.substr( 10 ).split( "," ),
        rAdvancedStyles = /\{(\\[\w]+\(?([\w\d]+,?)+\)?)+\}/gi,
        rNewLineSSA = /\\N/gi,
        sub;

    sub = {
      start: toSeconds( fields[ headers.start ] ),
      end: toSeconds( fields[ headers.end ] )
    };

    // Invalid time, skip
    if ( sub.start === -1 || sub.end === -1 ) {
      throw "Invalid time";
    }

    // Eliminate advanced styles and convert forced line breaks
    sub.text = getTextFromFields( fields, headers.text ).replace( rAdvancedStyles, "" ).replace( rNewLineSSA, "<br />" );

    return sub;
  }

  // h:mm:ss.cc (centisec) string to SS.mmm
  // Returns -1 if invalid
  function toSeconds( t_in ) {
    var t = t_in.split( ":" );

    // Not all there
    if ( t_in.length !== 10 || t.length < 3 ) {
      return -1;
    }

    return parseInt( t[ 0 ], 10 ) * 3600 + parseInt( t[ 1 ], 10 ) * 60 + parseFloat( t[ 2 ], 10 );
  }

  function getTextFromFields( fields, startIdx ) {
    var fieldLen = fields.length,
        text = [  ],
        i = startIdx;

    // There may be commas in the text which were split, append back together into one line
    for( ; i < fieldLen; i++ ) {
      text.push( fields[ i ] );
    }

    return text.join( "," );
  }

  function createTrack( name, attributes ) {
    var track = {};
    track[ name ] = attributes;
    return track;
  }

  function parseFieldHeaders( line ) {
    // Trim 'Format: ' off front, split on delim
    var fields = line.substr( 8 ).split( ", " ),
        result = {},
        len,
        i;

     //Find where in Dialogue string the start, end and text info is
    for ( i = 0, len = fields.length; i < len; i++ ) {
      if ( fields[ i ] === "Start" ) {
        result.start = i;
      } else if ( fields[ i ] === "End" ) {
        result.end = i;
      } else if ( fields[ i ] === "Text" ) {
        result.text = i;
      }
    }

    return result;
  }
})( Popcorn );
// PARSER: 1.0 TTML
(function ( Popcorn ) {
  /**
   * TTML popcorn parser plug-in
   * Parses subtitle files in the TTML format.
   * Times may be absolute to the timeline or relative
   *   Absolute times are ISO 8601 format (hh:mm:ss[.mmm])
   *   Relative times are a fraction followed by a unit metric (d.ddu)
   *     Relative times are relative to the time given on the parent node
   * Styling information is ignored
   * Data parameter is given by Popcorn, will need an xml.
   * Xml is the file contents to be processed
   *
   * @param {Object} data
   *
   * Example:
    <tt xmlns:tts="http://www.w3.org/2006/04/ttaf1#styling" xmlns="http://www.w3.org/2006/04/ttaf1">
      <body region="subtitleArea">
        <div>
          <p xml:id="subtitle1" begin="0.76s" end="3.45s">
            It seems a paradox, does it not,
          </p>
        </div>
      </body>
    </tt>
   */

  var rWhitespace = /^[\s]+|[\s]+$/gm,
      rLineBreak = /(?:\r\n|\r|\n)/gm;

  Popcorn.parser( "parseTTML", function( data ) {
    var returnData = {
          title: "",
          remote: "",
          data: []
        },
        node;

    // Null checks
    if ( !data.xml || !data.xml.documentElement ) {
      return returnData;
    }

    node = data.xml.documentElement.firstChild;

    if ( !node ) {
      return returnData;
    }

    // Find body tag
    while ( node.nodeName !== "body" ) {
      node = node.nextSibling;
    }

    if ( node ) {
      returnData.data = parseChildren( node, 0 );
    }

    return returnData;
  });

  // Parse the children of the given node
  function parseChildren( node, timeOffset, region ) {
    var currNode = node.firstChild,
        currRegion = getNodeRegion( node, region ),
        retVal = [],
        newOffset;

    while ( currNode ) {
      if ( currNode.nodeType === 1 ) {
        if ( currNode.nodeName === "p" ) {
          // p is a textual node, process contents as subtitle
          retVal.push( parseNode( currNode, timeOffset, currRegion ) );
        } else if ( currNode.nodeName === "div" ) {
          // div is container for subtitles, recurse
          newOffset = toSeconds( currNode.getAttribute( "begin" ) );

          if (newOffset < 0 ) {
            newOffset = timeOffset;
          }

          retVal.push.apply( retVal, parseChildren( currNode, newOffset, currRegion ) );
        }
      }

      currNode = currNode.nextSibling;
    }

    return retVal;
  }

  // Get the "region" attribute of a node, to know where to put the subtitles
  function getNodeRegion( node, defaultTo ) {
    var region = node.getAttribute( "region" );

    if ( region !== null ) {
      return region;
    } else {
      return defaultTo || "";
    }
  }

  // Parse a node for text content
  function parseNode( node, timeOffset, region ) {
    var sub = {};

    // Trim left and right whitespace from text and convert non-explicit line breaks
    sub.text = ( node.textContent || node.text ).replace( rWhitespace, "" ).replace( rLineBreak, "<br />" );
    sub.id = node.getAttribute( "xml:id" ) || node.getAttribute( "id" );
    sub.start = toSeconds ( node.getAttribute( "begin" ), timeOffset );
    sub.end = toSeconds( node.getAttribute( "end" ), timeOffset );
    sub.target = getNodeRegion( node, region );

    if ( sub.end < 0 ) {
      // No end given, infer duration if possible
      // Otherwise, give end as MAX_VALUE
      sub.end = toSeconds( node.getAttribute( "duration" ), 0 );

      if ( sub.end >= 0 ) {
        sub.end += sub.start;
      } else {
        sub.end = Number.MAX_VALUE;
      }
    }

    return { subtitle : sub };
  }

  // Convert time expression to SS.mmm
  // Expression may be absolute to timeline (hh:mm:ss.ms)
  //   or relative ( decimal followed by metric ) ex: 3.4s, 5.7m
  // Returns -1 if invalid
  function toSeconds( t_in, offset ) {
    var i;

    if ( !t_in ) {
      return -1;
    }

    try {
      return Popcorn.util.toSeconds( t_in );
    } catch ( e ) {
      i = getMetricIndex( t_in );
      return parseFloat( t_in.substring( 0, i ) ) * getMultipler( t_in.substring( i ) ) + ( offset || 0 );
    }
  }

  // In a time string such as 3.4ms, get the index of the first character (m) of the time metric (ms)
  function getMetricIndex( t_in ) {
    var i = t_in.length - 1;

    while ( i >= 0 && t_in[ i ] <= "9" && t_in[ i ] >= "0" ) {
      i--;
    }

    return i;
  }

  // Determine multiplier for metric relative to seconds
  function getMultipler( metric ) {
    return {
      "h" : 3600,
      "m" : 60,
      "s" : 1,
      "ms" : 0.001
    }[ metric ] || -1;
  }
})( Popcorn );
// PARSER: 0.1 TTXT

(function (Popcorn) {

  /**
   * TTXT popcorn parser plug-in 
   * Parses subtitle files in the TTXT format.
   * Style information is ignored.
   * Data parameter is given by Popcorn, will need an xml.
   * Xml is the file contents to be parsed as a DOM tree
   * 
   * @param {Object} data
   * 
   * Example:
     <TextSample sampleTime="00:00:00.000" text=""></TextSample>
   */
  Popcorn.parser( "parseTTXT", function( data ) {

    // declare needed variables
    var returnData = {
          title: "",
          remote: "",
          data: []
        };

    // Simple function to convert HH:MM:SS.MMM to SS.MMM
    // Assume valid, returns 0 on error
    var toSeconds = function(t_in) {
      var t = t_in.split(":");
      var time = 0;
      
      try {        
        return parseFloat(t[0], 10)*60*60 + parseFloat(t[1], 10)*60 + parseFloat(t[2], 10);
      } catch (e) { time = 0; }
      
      return time;
    };

    // creates an object of all atrributes keyed by name
    var createTrack = function( name, attributes ) {
      var track = {};
      track[name] = attributes;
      return track;
    };

    // this is where things actually start
    var node = data.xml.lastChild.lastChild; // Last Child of TextStreamHeader
    var lastStart = Number.MAX_VALUE;
    var cmds = [];
    
    // Work backwards through DOM, processing TextSample nodes
    while (node) {
      if ( node.nodeType === 1 && node.nodeName === "TextSample") {
        var sub = {};
        sub.start = toSeconds(node.getAttribute('sampleTime'));
        sub.text = node.getAttribute('text');
      
        if (sub.text) { // Only process if text to display
          // Infer end time from prior element, ms accuracy
          sub.end = lastStart - 0.001;
          cmds.push( createTrack("subtitle", sub) );
        }
        lastStart = sub.start;
      }
      node = node.previousSibling;
    }
    
    returnData.data = cmds.reverse();

    return returnData;
  });

})( Popcorn );
// PARSER: 0.3 WebSRT/VTT

(function ( Popcorn ) {
  /**
   * WebVTT popcorn parser plug-in
   * Parses subtitle files in the WebVTT format.
   * Specification here: http://www.whatwg.org/specs/web-apps/current-work/webvtt.html
   * Styles which appear after timing information are presently ignored.
   * Inline styling tags follow HTML conventions and are left in for the browser to handle (or ignore if VTT-specific)
   * Data parameter is given by Popcorn, text property holds file contents.
   * Text is the file contents to be parsed
   *
   * @param {Object} data
   *
   * Example:
    00:32.500 --> 00:00:33.500 A:start S:50% D:vertical L:98%
    <v Neil DeGrass Tyson><i>Laughs</i>
   */
  Popcorn.parser( "parseVTT", function( data ) {

    // declare needed variables
    var retObj = {
          title: "",
          remote: "",
          data: []
        },
        subs = [],
        i = 0,
        len = 0,
        lines,
        text,
        sub,
        rNewLine = /(?:\r\n|\r|\n)/gm;

    // Here is where the magic happens
    // Split on line breaks
    lines = data.text.split( rNewLine );
    len = lines.length;

    // Check for BOF token
    if ( len === 0 || lines[ 0 ] !== "WEBVTT" ) {
      return retObj;
    }

    i++;

    while ( i < len ) {
      text = [];

      try {
        i = skipWhitespace( lines, len, i );
        sub = parseCueHeader( lines[ i++ ] );

        // Build single line of text from multi-line subtitle in file
        while ( i < len && lines[ i ] ) {
          text.push( lines[ i++ ] );
        }

        // Join lines together to one and build subtitle text
        sub.text = text.join( "<br />" );
        subs.push( createTrack( "subtitle", sub ) );
      } catch ( e ) {
        i = skipNonWhitespace( lines, len, i );
      }
    }

    retObj.data = subs;
    return retObj;
  });

  // [HH:]MM:SS.mmm string to SS.mmm float
  // Throws exception if invalid
  function toSeconds ( t_in ) {
    var t = t_in.split( ":" ),
        l = t_in.length,
        time;

    // Invalid time string provided
    if ( l !== 12 && l !== 9 ) {
      throw "Bad cue";
    }

    l = t.length - 1;

    try {
      time = parseInt( t[ l-1 ], 10 ) * 60 + parseFloat( t[ l ], 10 );

      // Hours were given
      if ( l === 2 ) {
        time += parseInt( t[ 0 ], 10 ) * 3600;
      }
    } catch ( e ) {
      throw "Bad cue";
    }

    return time;
  }

  function createTrack( name, attributes ) {
    var track = {};
    track[ name ] = attributes;
    return track;
  }

  function parseCueHeader ( line ) {
    var lineSegments,
        args,
        sub = {},
        rToken = /-->/,
        rWhitespace = /[\t ]+/;

    if ( !line || line.indexOf( "-->" ) === -1 ) {
      throw "Bad cue";
    }

    lineSegments = line.replace( rToken, " --> " ).split( rWhitespace );

    if ( lineSegments.length < 2 ) {
      throw "Bad cue";
    }

    sub.id = line;
    sub.start = toSeconds( lineSegments[ 0 ] );
    sub.end = toSeconds( lineSegments[ 2 ] );

    return sub;
  }

  function skipWhitespace ( lines, len, i ) {
    while ( i < len && !lines[ i ] ) {
      i++;
    }

    return i;
  }

  function skipNonWhitespace ( lines, len, i ) {
    while ( i < len && lines[ i ] ) {
      i++;
    }

    return i;
  }
})( Popcorn );
// PARSER: 0.1 XML

(function (Popcorn) {

  /**
   *
   *
   */
  Popcorn.parser( "parseXML", "XML", function( data ) {

    // declare needed variables
    var returnData = {
          title: "",
          remote: "",
          data: []
        },
        manifestData = {};

    // Simple function to convert 0:05 to 0.5 in seconds
    // acceptable formats are HH:MM:SS:MM, MM:SS:MM, SS:MM, SS
    var toSeconds = function(time) {
      var t = time.split(":");
      if (t.length === 1) {
        return parseFloat(t[0], 10);
      } else if (t.length === 2) {
        return parseFloat(t[0], 10) + parseFloat(t[1] / 12, 10);
      } else if (t.length === 3) {
        return parseInt(t[0] * 60, 10) + parseFloat(t[1], 10) + parseFloat(t[2] / 12, 10);
      } else if (t.length === 4) {
        return parseInt(t[0] * 3600, 10) + parseInt(t[1] * 60, 10) + parseFloat(t[2], 10) + parseFloat(t[3] / 12, 10);
      }
    };

    // turns a node tree element into a straight up javascript object
    // also converts in and out to start and end
    // also links manifest data with ids
    var objectifyAttributes = function ( nodeAttributes ) {

      var returnObject = {};

      for ( var i = 0, nal = nodeAttributes.length; i < nal; i++ ) {

        var key  = nodeAttributes.item(i).nodeName,
            data = nodeAttributes.item(i).nodeValue,
            manifestItem = manifestData[ data ];

        // converts in into start
        if (key === "in") {
          returnObject.start = toSeconds( data );
        // converts out into end
        } else if ( key === "out" ){
          returnObject.end = toSeconds( data );
        // this is where ids in the manifest are linked
        } else if ( key === "resourceid" ) {
          for ( var item in manifestItem ) {
            if ( manifestItem.hasOwnProperty( item ) ) {
              if ( !returnObject[ item ] && item !== "id" ) {
                returnObject[ item ] = manifestItem[ item ];
              }
            }
          }
        // everything else
        } else {
          returnObject[key] = data;
        }

      }

      return returnObject;
    };

    // creates an object of all atrributes keyd by name
    var createTrack = function( name, attributes ) {
      var track = {};
      track[name] = attributes;
      return track;
    };

    // recursive function to process a node, or process the next child node
    var parseNode = function ( node, allAttributes, manifest ) {
      var attributes = {};
      Popcorn.extend( attributes, allAttributes, objectifyAttributes( node.attributes ), { text: node.textContent || node.text } );

      var childNodes = node.childNodes;

      // processes the node
      if ( childNodes.length < 1 || ( childNodes.length === 1 && childNodes[0].nodeType === 3 ) ) {

        if ( !manifest ) {
          returnData.data.push( createTrack( node.nodeName, attributes ) );
        } else {
          manifestData[attributes.id] = attributes;
        }

      // process the next child node
      } else {

        for ( var i = 0; i < childNodes.length; i++ ) {

          if ( childNodes[i].nodeType === 1 ) {
            parseNode( childNodes[i], attributes, manifest );
          }

        }
      }
    };

    // this is where things actually start
    var x = data.documentElement.childNodes;

    for ( var i = 0, xl = x.length; i < xl; i++ ) {

      if ( x[i].nodeType === 1 ) {

        // start the process of each main node type, manifest or timeline
        if ( x[i].nodeName === "manifest" ) {
          parseNode( x[i], {}, true );
        } else { // timeline
          parseNode( x[i], {}, false );
        }

      }
    }

    return returnData;
  });

})( Popcorn );
