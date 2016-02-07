/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// *******************
// *     Layout    *
// *******************
var EDITOR = (function ($, parent) {

    var my = parent.layout = {},

    setup = function () {
        console.log("Setting up layout...");
        var opentooltip = "Open this pane",
            closetooltip = "Close this pane",
            resizetooltip = "Resize this pane",
            pin = "Pin",
            unpin = "Un-Pin";

        if (language.layout.$opentooltip)
            opentooltip = language.layout.$opentooltip;
        if (language.layout.$closetooltip)
            closetooltip = language.layout.$closetooltip;
        if (language.layout.$resizetooltip)
            resizetooltip = language.layout.$resizetooltip;
        if (language.layout.$pin)
            pin = language.layout.$pin;
        if (language.layout.$unpin)
            unpin = language.layout.$unpin;

        var xerte_layout,
            xerte_editor_layout_settings = {
                name: "xerte_editor_layout"
            ,   panes: {
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
                    tips: {
                        Open: opentooltip    // eg: "Open Pane"
                        , Close: closetooltip
                        , Resize: resizetooltip
                        , Pin: pin
                        , Unpin: unpin
                        },
                    fxName:                 "none"
                    /*
                    fxSpeed_open:           750,
                    fxSpeed_close:          1500,
                    fxSettings_open:        { easing: "easeInQuint" },
                    fxSettings_close:       { easing: "easeOutQuint" }
                    */
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
                    initClosed:             true
                },
                west: {
                    size:                   300,
                    minSize:                250,
                    maxSize:                450,
                    spacing_open:           4,
                    spacing_closed:         21,
                    togglerLength_closed:   21,
                    togglerAlign_closed:    "top",
                    togglerLength_open:     0,
                    slideTrigger_open:      "click",
                    initClosed:             false
                    /*
                    fxName:                 "drop",
                    fxSpeed:                "normal",
                    fxSettings:             { easing: "" } // remove default
                    */
                },
                east: {
                    size:                   250,
                    minSize:                200,
                    maxSize:                350,
                    spacing_open:           4,
                    spacing_closed:         21,
                    togglerLength_closed:   21,
                    togglerAlign_closed:    "top",
                    togglerLength_open:     0,
                    slideTrigger_open:      "click",
                    initClosed:             true
                    /*
                    fxName:                 "drop",
                    fxSpeed:                "normal",
                    fxSettings:             { easing: "" } // remove default
                    */
                },
                center: {
                    /*paneSelector:           "#mainContent",*/
                    minWidth:               200,
                    minHeight:              200/*,
                    contentSelector:        ".ui-layout-content"*/
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
		
		var optionaltitle = language.optionalPropHTML ? language.optionalPropHTML.$label : "Optional Properties";
		$("#optional_title").html(optionaltitle);
    }

    // Create the layout once the document has finished loading
    //$(document).ready(setup);

    my.setup = setup;

    return parent;

})(jQuery, EDITOR || {});










