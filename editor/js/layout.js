// *******************
// *     Layout    *
// *******************
var EDITOR = (function ($, parent) {

    var my = parent.layout = {},

    setup = function () {
        console.log("Setting up layout...");
        var xerte_layout,
            xerte_editor_layout_settings = {
                name: "xerte_editor_layout"
            ,   defaults: {
                    size:                   "auto",
                    minSize:                50,
                    paneClass:              "pane",
                    resizerClass:           "resizer",
                    togglerClass:           "toggler",
                    buttonClass:            "button",
                    contentSelector:        ".content",
                    contentIgnoreSelector:  "span",
                    togglerLength_open:     35,
                    togglerLength_closed:   35,
                    hideTogglerOnSlide:     true,
                    togglerTip_open:        "Close This Pane",
                    togglerTip_closed:      "Open This Pane",
                    resizerTip:             "Resize This Pane",
                    fxName:                 "slide",
                    fxSpeed_open:           750,
                    fxSpeed_close:          1500,
                    fxSettings_open:        { easing: "easeInQuint" },
                    fxSettings_close:       { easing: "easeOutQuint" }
                },
                north: {
                    minSize:                65,
                    spacing_open:           1,
                    togglerLength_open:     0,
                    togglerLength_closed:   -1,
                    resizable:              false,
                    slidable:               false,
                    fxName:                 "none"
                },
                south: {
                    maxSize:                75,
                    spacing_closed:         0,
                    spacing_open:           4,
                    slidable:               false,
                    initClosed:             false
                },
                west: {
                    size:                   250,
                    minSize:                150,
                    maxSize:                450,
                    spacing_open:           4,
                    spacing_closed:         21,
                    togglerLength_closed:   21,
                    togglerAlign_closed:    "top",
                    togglerLength_open:     0,
                    togglerTip_open:        "Close This Pane",
                    togglerTip_closed:      "Open This Pane",
                    resizerTip_open:        "Resize This Pane",
                    slideTrigger_open:      "click",
                    initClosed:             false,
                    fxSettings_open:        { easing: "easeOutBounce" }
                },
                east: {
                    size:                   150,
                    minSize:                150,
                    maxSize:                350,
                    spacing_open:           4,
                    spacing_closed:         21,
                    togglerLength_closed:   21,
                    togglerAlign_closed:    "top",
                    togglerLength_open:     0,
                    togglerTip_open:        "Close This Pane",
                    togglerTip_closed:      "Open This Pane",
                    resizerTip_open:        "Resize This Pane",
                    slideTrigger_open:      "mouseover",
                    initClosed:             false,
                    fxName:                 "drop",
                    fxSpeed:                "normal",
                    fxSettings:             { easing: "" } // remove default
                },
                center: {
                    paneSelector:           "#mainContent",
                    minWidth:               200,
                    minHeight:              200
                }
            };

        xerte_layout = $("body").layout( xerte_editor_layout_settings );
        var left_column = "body > .ui-layout-west";
        var right_column = "body > .ui-layout-east";

        // ** Add pin buttons and wire them up **
        $("<span></span>").addClass("pin-button").prependTo( left_column );
        $("<span></span>").addClass("pin-button").prependTo( right_column );
        xerte_layout.addPinBtn( left_column +" .pin-button", "west");
        xerte_layout.addPinBtn( right_column +" .pin-button", "east" );

        // ** Add close buttons and wire them up **
        $("<span></span>").attr("id", "west-closer" ).prependTo( left_column );
        $("<span></span>").attr("id", "east-closer").prependTo( right_column );
        xerte_layout.addCloseBtn("#west-closer", "west");
        xerte_layout.addCloseBtn("#east-closer", "east");

        // ** stop # links reloading page **
        $("a").each(function () {
            var path = document.location.href;
            if (path.substr(path.length-1)=="#") path = path.substr(0,path.length-1);
            if (this.href.substr(this.href.length-1) == "#") this.href = path +"#";
        });
    }

    // Create the layout once the document has finished loading
    //$(document).ready(setup);

    my.setup = setup;

    return parent;

})(jQuery, EDITOR || {});










