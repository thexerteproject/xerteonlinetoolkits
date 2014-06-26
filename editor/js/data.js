// *******************
// *       Data      *
// *******************
var EDITOR = (function ($, parent) {

    var my = parent.data = {},
        toolbox = parent.toolbox,
        step1_languagesloaded = false,
        step2_xmlloaded = false,
        step2_data = {},

    // replace all line breaks in attributes with ascii code - otherwise these are replaced with spaces when parsed to xml
    FixLineBreaks = function (text) {
        var split_up = text.split(/<\!\[CDATA\[|\]\]>/),
            temp, i, j, len, len2;

        for (i=0, len=split_up.length; i<len; i+=2) {
            temp = split_up[i].split('"');
            for (j=1, len2=temp.length; j<len2; j+=2) {
                temp[j] = temp[j].replace(/(\n|\r|\r\n)/g, "&#10;");
            }
            split_up[i] = temp.join('"');
        }

        // Put the CDATA blocks back...
        temp = [];
        for (i=0, len=split_up.length-1; i<len; i+=2) {
            temp.push(split_up[i] + "<![CDATA[" + split_up[i+1]);
        }
        temp.push(split_up[i]);

        return temp.join("]]>");
    },

    process_data = function (xml) {
        //console.log(previewxmlurl + " is loaded...");

        // replace all line breaks in attributes with ascii code
        // otherwise these are replaced with spaces when parsed to xml

        parent.tree.setup( FixLineBreaks(xml) );
    },

    wait = function(step, data)
    {
        if (step == 1)
        {
            console.log("All language definitions loaded...");
            step1_languagesloaded = true;
        }
        else if (step == 2)
        {
            console.log(previewxmlurl +  " is loaded...");
            step2_xmlloaded = true;
            step2_data = data;

        }
        if (step1_languagesloaded && step2_xmlloaded)
        {
            console.log("Start processing of " + previewxmlurl);
            process_data(step2_data);
        }

    },

    init = function (xmlurl) {
        // Start loading of the data file

        var _this = this;
        $.ajax({
            type: "GET",
            url: xmlurl,
            dataType: "text",
            success: function (data) {
                wait(2, data);
                //process_data(data);
            }
        });
    };

    my.wait = wait;
    init(previewxmlurl);


    return parent;

})(jQuery, EDITOR || {});