/*var linkEl;*/

$(document).ready(function(){
    $(window).trigger('resize');
    /*
    linkEl = $('<link rel="stylesheet" href="https://learningcentral.cf.ac.uk/bbcswebdav/courses/REGOS-ELTTStaff/XERTE%20Files/XT%20Toolkit%20Open.css" type="text/css">').appendTo('head')[0];
    $(window).trigger('resize');


    $(document).keydown(function(e) {
        switch(e.which) {
            case 37: // left
                $( "#x_prevBtn" ).click();
                break;

            case 38: // up
                break;

            case 39: // right
                $( "#x_nextBtn" ).click();
                break;

            case 40: // down
                break;

            default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });





    $("#x_colourChangerBtn").click(function() {
        setTimeout(
            function()
            {
                $("input[value='0'][name='colourChangerRadios']").addClass("loadSheet")
                $("input[value='1'][name='colourChangerRadios']").addClass("loadSheet")
                $("input[value='2'][name='colourChangerRadios']").addClass("unLoadSheet")
                $("input[value='3'][name='colourChangerRadios']").addClass("unLoadSheet")
            }, 500);

    });

*/
    $('#x_pageDiv').on('DOMNodeInserted', '.splitScreen', function(){
        $('.splitScreen:first').closest('#pageContents').addClass('withChild');
    });

    $('#x_pageDiv').on('DOMNodeInserted', '#dragDropHolderLabelling', function(){
        $('#dragDropHolderLabelling').closest('#pageContents').addClass('withChild2');
    });

    $('#x_pageDiv').on('DOMNodeInserted', '#hsHolder', function(){
        $('#hsHolder').closest('#pageContents').addClass('withChild2');
    });




});


/*$(function(){
    $('body').on('click', '.loadSheet', function() {
        linkEl.sheet.disabled = false;
    });
});

$(function(){
    $('body').on('click', '.unLoadSheet', function() {
        linkEl.sheet.disabled = true;
    });

});*/
