// pageChanged & sizeChanged functions are needed in every model file
    // other functions for model should also be in here to avoid conflicts
    var results = new function() {
        var generalResultsTxt,
            averageTxt,
            completionTxt,
            startTimeTxt,
            durationTxt,
            interactivityResultsTxt,
            globalResultsTxt,
            nameTxt,
            scoreTxt,
            weightingTxt,
            completedTxt,
            detailsTxt,
            specificResultsTxt,
            yourAnswerTxt,
            correctAnswerTxt,
            downloadPdfTxt,
            correctTooltip,
            inCorrectTooltip,
            completeTooltip,
            inCompleteTooltip,
            NACompleteTooltip,
            detailsTooltip,
            noDetailsTooltip,
            userNameDialogTitle,
            userNamePrompt,
            okButtonTxt,
            numLoaded = 0,
            xtresults,
            normalcolumns,
            username,
            normalrows = [],
            detailstablescolumns = [],
            detailstablesrows = [];


        // function called every time the page is viewed after it has initially loaded
        this.pageChanged = function() {

            this.getLabels();
            // Always regenerate page
            $("#" + classIdentifier + " .questionScores").html("");
            $("#" + classIdentifier + " .fullResults").html("");
            this.init();

        };

        // function called every time the size of the LO is changed
        this.sizeChanged = function() {

        };

        this.loadJS = function() {
            if (numLoaded < 2) {
                var fileToLoad;
                if (numLoaded == 0) {
                    fileToLoad = "common_html5/js/jspdf.min.js";
                }
                else
                {
                    fileToLoad = "common_html5/js/jspdf.plugin.autotable.min.js";
                }

                $.getScript(x_templateLocation + fileToLoad)
                    .done(function(script, textStatus) {
                        numLoaded++;
                        results.loadJS();
                    })
                    .fail(function( jqxhr, settings, exception ) {
                        console.log("Failed to load results jspdf scripts");
                    });
            }
        };

        this.replaceArrow = function(str)
        {
            if (typeof(str) === 'string') {
                return str.replace(/-->/g, '<i class="fa fa-long-arrow-right"></i>');
            }
            else
            {
                return str;
            }
        };

        this.init = function(classIdentifier, trackingState) {

            this.getLabels(classIdentifier);


            // ignores superscript support data in xml as it will do it automatically with <sub> <sup> tags

            var showzeroweight = false;
            xtresults = XTResults(false, trackingState);
            var altnormalrow = false;
            var altfullrow = false;
            $("#" + classIdentifier + " .averageScore").html(xtresults.averageScore + "%");
            $("#" + classIdentifier + " .completion").html(xtresults.completion + "%");
            $("#" + classIdentifier + " .totalDuration").html(xtresults.totalDuration + "s");
            $("#" + classIdentifier + " .startTime").html(moment(new Date(xtresults.start)).format('YYYY-MM-DD HH:mm:ss'));
            var detailstables=0;
            var firstnormalrow=true;
            var detailstable = $("<table class='details'>");
            var scoretxt;


            xtresults.interactions.forEach(function(x)
            {
                if (x.type == 'result' || (!showzeroweight && x.completed == "true" && x.weighting == 0))
                {
                    // Skip
                    return;
                }
                var interactiveToken, interactiveTokenTxt;
                if(x.type != 'page')
                {
                    interactiveToken = '<i class="fa fa-x-circle blue" title="' + detailsTooltip + '"><span class="ui-helper-hidden-accessible">' + detailsTooltip + '</span></i>';
                    interactiveTokenTxt = "details";
                }
                else
                {
                    interactiveToken = '<i class="fa fa-x-circle-o blue" title="' + noDetailsTooltip + '"><span class="ui-helper-hidden-accessible">' + noDetailsTooltip + '</span></i>';
                    interactiveTokenTxt = "nodetails";
                }
                var completedToken, completedTokenTxt;
                if(x.completed == "true")
                {
                    completedToken = '<i class="fa fa-x-tick" title="' + completeTooltip + '"><span class="ui-helper-hidden-accessible">' + completeTooltip + '</span></i>';
                    completedTokenTxt = "completed";
                }
                else if (x.completed == "false")
                {
                    completedToken = '<i class="fa fa-x-cross" title="' + inCompleteTooltip + '"><span class="ui-helper-hidden-accessible">' + inCompleteTooltip + '</span></i>';
                    completedTokenTxt = "notcompleted";
                }
                else {
                    completedToken = '<i class="fa fa-minus" title="' + NACompleteTooltip + '"><span class="ui-helper-hidden-accessible">' + NACompleteTooltip + '</span></i>';
                    completedTokenTxt = '-';
                }
                if (x.type == 'page')
                {
                    scoretxt = '-';
                }
                else
                {
                    scoretxt = x.score + '%';
                }
                if(xtresults.mode == 'normal-results'){
                    $("#" + classIdentifier + " .specific").show();
                    $("#" + classIdentifier + " .specificResultsTxt").hide();
                    if (firstnormalrow)
                    {
                        $("#" + classIdentifier + " .questionScores").append("<th>" + nameTxt + "</th><th>" + scoreTxt + "</th><th>" + durationTxt + "</th><th>" + weightingTxt + "</th><th>" + completedTxt + "</th>");
                        normalcolumns = [x_GetTrackingTextFromHTML(nameTxt, ""), scoreTxt, durationTxt, weightingTxt, completedTxt];
                        firstnormalrow = false;
                    }
                    $("#" + classIdentifier + " .questionScores").append("<tr " + (altnormalrow ? "class='alt'" : "") + "><td>" + x.title + "</td><td class='td-center'>" + scoretxt + "</td><td class='td-center'>" + x.duration + "s</td><td class='td-center'>" + x.weighting + "</td><td class='td-center'>" + completedToken + "</td></tr>");
                    var normalrow = [x_GetTrackingTextFromHTML(x.title, ""), scoretxt, x.duration, x.weighting, completedTokenTxt];
                    normalrows.push(normalrow);
                    altnormalrow = !altnormalrow;
                }
                else if(xtresults.mode == 'full-results' ) {
                    $("#" + classIdentifier + " .specific").show();
                    $("#" + classIdentifier + " .specificResultsTxt").show();
                    if (firstnormalrow)
                    {
                        normalcolumns = [x_GetTrackingTextFromHTML(nameTxt, ""), scoreTxt, durationTxt, weightingTxt, completedTxt, detailsTxt];
                        $("#" + classIdentifier + " .questionScores").append("<th>" + nameTxt + "</th><th>" + scoreTxt + "</th><th>" + durationTxt + "</th><th>" + weightingTxt + "</th><th>" + completedTxt + "</th><th>" + detailsTxt + "</th>");
                        firstnormalrow = false;
                    }
                    $("#" + classIdentifier + " .questionScores").append("<tr " + (altnormalrow ? "class='alt'" : "") + "><td>" + x.title + "</td><td class='td-center'>" + scoretxt + "</td><td class='td-center'>" + x.duration + "s</td><td class='td-center'>" + x.weighting + "</td><td class='td-center'>" + completedToken + "</td><td class='td-center'>" + interactiveToken + "</td></tr>");
                    var normalrow = [x_GetTrackingTextFromHTML(x.title, ""), scoretxt, x.duration, x.weighting, completedTokenTxt, interactiveTokenTxt];
                    normalrows.push(normalrow);
                    altnormalrow = !altnormalrow;
                    altfullrow = false;
                    if (x.subinteractions.length > 0 && x.type != 'page') {
                        detailstable.append("<tr><th class='correct'></th><th class='question'>" + x.title + "</th><th class='answer'>" + yourAnswerTxt + "</th><th class='correctanswer'>"+ correctAnswerTxt +"</th></tr>");
                        var detailstablecolumns = ["", x_GetTrackingTextFromHTML(x.title, ""), yourAnswerTxt, correctAnswerTxt];
                        var detailstablerows = [];
                        altfullrow = false;
                        x.subinteractions.forEach(function (y) {
                            var question = y.question;
                            var learnerAnswer = y.learnerAnswer;
                            var correctAnswer = y.correctAnswer;
                            if (learnerAnswer == correctAnswer || y.correct) {
                                detailstable.append("<tr " + (altfullrow ? "class='alt'" : "") + "><td class='correct'>" + "<i class='fa fa-x-tick' title='" + correctTooltip + "'><span class='ui-helper-hidden-accessible'>" + correctTooltip + "</span></td><td class='question'>" + question + "</td><td class='answer'>" + results.replaceArrow(learnerAnswer) + "</td><td class='correctanswer'>" + results.replaceArrow(correctAnswer) + "</td></tr>");
                                var detailstablerow = ["correct",  x_GetTrackingTextFromHTML(question, ""), x_GetTrackingTextFromHTML(learnerAnswer, ""), x_GetTrackingTextFromHTML(correctAnswer, "")];
                                detailstablerows.push(detailstablerow);
                            }
                            else {
                                detailstable.append("<tr " + (altfullrow ? "class='alt'" : "") + "><td class='correct'>" + "<i class='fa fa-x-cross' title='" + inCorrectTooltip + "'><span class='ui-helper-hidden-accessible'>" + inCorrectTooltip + "</span></td><td class='question'>" + question + "</td><td class='answer'>" + results.replaceArrow(learnerAnswer) + "</td><td class='correctanswer'>" + results.replaceArrow(correctAnswer) + "</td></tr>");
                                var detailstablerow = ["incorrect", x_GetTrackingTextFromHTML(question, ""), x_GetTrackingTextFromHTML(learnerAnswer, ""), x_GetTrackingTextFromHTML(correctAnswer, "")];
                                detailstablerows.push(detailstablerow);
                            }
                            altfullrow = !altfullrow;
                        });
                        $("#" + classIdentifier + " .fullResults").append(detailstable);
                        detailstable = $("<table class='details'>");
                        detailstablescolumns.push(detailstablecolumns);
                        detailstablesrows.push(detailstablerows);
                    }
                }
            });
            // call this function in every model once everything's loaded
        };

        this.getLabels = function(classIdentifier){

            generalResultsTxt = "General Results";
            averageTxt =  "Average: ";
            completionTxt =  "Completion: ";
            durationTxt = "Duration: ";
            startTimeTxt = "Start Time";
            interactivityResultsTxt = "Interactivity Results";
            globalResultsTxt = "Global Results";
            nameTxt = "Name";
            scoreTxt = "Score";
            weightingTxt = "Weighting";
            completedTxt = "Completed";
            detailsTxt = "Details";
            specificResultsTxt = "Specific Results";
            yourAnswerTxt = "Your Answer";
            correctAnswerTxt = "Correct Answer";
            downloadPdfTxt = "Download PDF File";
            correctTooltip = "Correct";
            inCorrectTooltip = "Incorrect";
            completeTooltip = "Complete";
            inCompleteTooltip = "Incomplete";
            NACompleteTooltip = "Not applicable";
            detailsTooltip =  "Details available";
            noDetailsTooltip = "No details available";
            userNameDialogTitle = "Enter user name";
            userNamePrompt = "User name:";
            okButtonTxt = "OK";
            $("#" + classIdentifier + " .dialog-form").attr("title", userNameDialogTitle);
            $("#" + classIdentifier + " .namelabel").html(userNamePrompt);
            $("#" + classIdentifier + " .generalResultsTxt").html(generalResultsTxt);
            $("#" + classIdentifier + " .averageTxt").html(averageTxt);
            $("#" + classIdentifier + " .durationTxt").html(durationTxt);
            $("#" + classIdentifier + " .durationTxt1").html(durationTxt);
            $("#" + classIdentifier + " .startTimeTxt").html(startTimeTxt);
            $("#" + classIdentifier + " .completionTxt").html(completionTxt);
            $("#" + classIdentifier + " .interactivityResultsTxt").html(interactivityResultsTxt);
            $("#" + classIdentifier + " .globalResultsTxt").html(globalResultsTxt);
            $("#" + classIdentifier + " .nameTxt").html(nameTxt);
            $("#" + classIdentifier + " .scoreTxt").html(scoreTxt);
            $("#" + classIdentifier + " .weightingTxt").html(weightingTxt);
            $("#" + classIdentifier + " .completedTxt").html(completedTxt);
            $("#" + classIdentifier + " .detailsTxt").html(detailsTxt);
            $("#" + classIdentifier + " .specificResultsTxt").html(specificResultsTxt);
            $("#" + classIdentifier + " .button").html(downloadPdfTxt);
        }

        this.pdfDownload = function(skip) {

            if (skip!==true && x_currentPageXML.getAttribute("givename"))
            {
                $("#" + classIdentifier + " .dialog-form").dialog( "open" );
                return;
            }
            var pdf = new jsPDF('p', 'mm', 'a4');

            var checkmark = "data:image/png;base64,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";
            var cross = "data:image/png;base64,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";
            var details = "data:image/png;base64,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";
            var nodetails = "data:image/png;base64,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";
            var nacomplete = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAAAAAB5Gfe6AAACXUlEQVR42u3cP2+OURgG8DsdGhExGIhJOjQx1sQuzAYdJGwk/QQ2m8FGIsG7SDB4J4PBYrF1YBCDhZCWN/4kjaoORZ2HvmharQ/QXr/rG1y/nJznGc59VxeeAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwBYE+PL8wZ0b17Zvrt+89/hD+x/A3NW9lZCRc882A5g/UzkZf7IB4G5lZfLrOoAfpyst+z6uAVg+WnnZMbsK0E5UYnbN/QW4VJkZX/4N8KJSc34I0A7GAtTbFYDp3P41uQJwJBig5rv6nNy/+l09igY43tWFaIBqdSwbYLH2ZwO8r9FsgJkKzysAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2zyva082wKAmsgE+1VQ2wPfqR/cf68Ifyl3sqkXfgi+76nrB/Q+0XwBLI7kAD4dDU7dj+x9qQ4B2OBXg3Z+5wYXdmf3vr47ODiLfzF9ZMzw9CDwDvXXj8wtp98Do9D/7A9qtqK/hqcWNKzSWejH/hGffbL5Epc30pya2t8LOsZOXn36zRgcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABbLj8BUGokzEYTmjMAAAAASUVORK5CYII=";

            var source = $('#" + classIdentifier + " .pdfContent').clone();

            //source.find("#" + classIdentifier + " .general_summary").prepend("<tr><th>ABC</th><th>DEF</th></tr>");
            var margins = {
                top: 20,
                bottom: 20,
                left: 20,
                width: 170
            };
            /*
            pdf.fromHTML(
                source.html(), // HTML string or DOM elem ref.
                margins.left, // x coord
                margins.top, { // y coord
                    'width': margins.width// max width of content on PDF
                },

                function (dispose) {
                    name = x_params.name + "_" + XTResults().start;
                    pdf.save(name.replace(/ /g, "_"));

                }, margins
            );
            */
            var vertpos = 20;
            pdf.setFontSize(14);

            if (x_currentPageXML.getAttribute("givename"))
            {
                pdf.text(username, 10, vertpos);
                vertpos += 5;
            }
            pdf.text(generalResultsTxt, 10, vertpos);
            vertpos += 0.2;
            pdf.lines([[190,0]], 10, vertpos);
            vertpos += 3;
            //pdf.setFontSize(11);
            var general_table = $("#" + classIdentifier + " .general_summary");
            if (general_table != null) {
                var elem = document.getElementById("general_summary");
                var res = pdf.autoTableHtmlToJson(elem);
                pdf.autoTable(res.columns, res.data, {
                    showHeader: false,
                    startY: vertpos,
                    margin: {horizontal: 10},
                    bodyStyles: {valign: 'top'},
                    styles: {overflow: 'linebreak', columnWidth: 'wrap'}
                });
                vertpos = pdf.autoTable.previous.finalY + 10;

            }
            if (xtresults.mode == 'normal-results')
            {
                pdf.text(interactivityResultsTxt, 10, vertpos);
                vertpos += 5;
                pdf.setFontSize(12);
                pdf.text(globalResultsTxt, 10, vertpos);
                vertpos += 5;
                var images = [];
                var imgIndex = 0;
                pdf.autoTable(normalcolumns, normalrows, {
                    startY: vertpos,
                    margin: {horizontal: 10},
                    bodyStyles: {valign: 'top'},
                    styles: {overflow: 'linebreak', columnWidth: 'wrap'},
                    headerStyles: { fillColor: [50, 50, 50] },
                    columnStyles:{
                        0: {halign: 'left', columnWidth : 100},
                        1: {halign: 'right', columnWidth : 22.5},
                        2: {halign: 'right', columnWidth : 22.5},
                        3: {halign: 'right', columnWidth : 22.5},
                        4: {halign: 'right', columnWidth : 22.5}
                    },
                    drawCell: function(cell, opts) {
                        if (opts.column.dataKey === 4) {
                            var img;
                            if (cell.raw === "completed")
                            {
                                img = checkmark;
                            }
                            else if (cell.raw == "notcompleted")
                            {
                                img = cross;
                            }
                            else
                            {
                                img = nacomplete;
                            }
                            cell.text = '';
                            images.push({
                                url: img,
                                x: cell.textPos.x - 11,
                                y: cell.textPos.y,
                                used: false
                            });
                            imgIndex++;
                        }
                    },
                    addPageContent: function() {
                        for (var i = 0; i < images.length; i++) {
                            if (!images[i].used) {
                                pdf.addImage(images[i].url, 'png', images[i].x, images[i].y + 0.4, 2.4, 2.4);
                                images[i].used = true;
                            }
                        }
                    }



                });
                vertpos = pdf.autoTable.previous.finalY + 5;
            }

            if (xtresults.mode == 'full-results')
            {
                var i;
                pdf.text(interactivityResultsTxt, 10, vertpos);
                vertpos += 7;
                pdf.setFontSize(12);
                pdf.text(globalResultsTxt, 10, vertpos);
                vertpos += 7;
                var images = [];
                var imgIndex = 0;
                pdf.autoTable(normalcolumns, normalrows, {
                    startY: vertpos,
                    margin: {horizontal: 10},
                    bodyStyles: {valign: 'top'},
                    styles: {overflow: 'linebreak', columnWidth: 'wrap'},
                    headerStyles: { fillColor: [50, 50, 50] },
                    columnStyles:{
                        0: {halign: 'left', columnWidth : 77.5},
                        1: {halign: 'right', columnWidth : 22.5},
                        2: {halign: 'right', columnWidth : 22.5},
                        3: {halign: 'right', columnWidth : 22.5},
                        4: {halign: 'right', columnWidth : 22.5},
                        5: {halign: 'right', columnWidth : 22.5}
                    },
                    drawCell: function(cell, opts) {
                        if (opts.column.dataKey === 4) {
                            var img;
                            if (cell.raw === "completed")
                            {
                                img = checkmark;
                            }
                            else if (cell.raw == "notcompleted")
                            {
                                img = cross;
                            }
                            else
                            {
                                img = nacomplete;
                            }
                            cell.text = '';
                            images.push({
                                url: img,
                                x: cell.textPos.x-11,
                                y: cell.textPos.y,
                                used: false
                            });
                            imgIndex++;
                        }
                        if (opts.column.dataKey === 5) {
                            var img;
                            if (cell.raw === "details")
                            {
                                img = details;
                            }
                            else
                            {
                                img = nodetails;
                            }
                            cell.text = '';
                            images.push({
                                url: img,
                                x: cell.textPos.x - 13.5,
                                y: cell.textPos.y,
                                used: false
                            });
                            imgIndex++;
                        }
                    },
                    addPageContent: function() {
                        for (var i = 0; i < images.length; i++) {
                            if (!images[i].used) {
                                pdf.addImage(images[i].url, 'png', images[i].x, images[i].y + 0.4, 2.4, 2.4);
                                images[i].used = true;
                            }
                        }
                    }

                });
                vertpos = pdf.autoTable.previous.finalY + 10;
                pdf.text(specificResultsTxt, 10, vertpos);
                vertpos+=7;
                for (i=0; i<detailstablescolumns.length; i++)
                {
                    var images = [];
                    var imgIndex = 0;
                    pdf.autoTable(detailstablescolumns[i], detailstablesrows[i], {
                        startY: vertpos,
                        margin: {horizontal: 10},
                        bodyStyles: {valign: 'top'},
                        styles: {overflow: 'linebreak', columnWidth: 'wrap'},
                        headerStyles: { fillColor: [128, 128, 128] },
                        columnStyles: {
                            0: {columnWidth: 10},
                            1: {columnWidth: 60},
                            2: {columnWidth: 60},
                            3: {columnWidth: 60}
                        },
                        drawCell: function(cell, opts) {
                            if (opts.column.dataKey === 0) {
                                var img;
                                if (cell.raw === "correct")
                                {
                                    img = checkmark;
                                }
                                else
                                {
                                    img = cross;
                                }
                                cell.text = '';
                                images.push({
                                    url: img,
                                    x: 12,
                                    y: cell.textPos.y,
                                    used: false
                                });
                                imgIndex++;
                            }
                        },
                        addPageContent: function() {
                            for (var i = 0; i < images.length; i++) {
                                if (!images[i].used) {
                                    pdf.addImage(images[i].url, 'png', images[i].x, images[i].y + 0.4, 2.4, 2.4);
                                    images[i].used = true;
                                }
                            }
                        }

                    });
                    vertpos = pdf.autoTable.previous.finalY;
                }
            }
            var name = x_params.name + "_" + XTResults().start + ".pdf";
            pdf.save(name.replace(/ /g, "_"));
        }
    };



function XTResults(fullcompletion, trackingState) {
        var completion = 0;
        var nrcompleted = 0;
        var nrvisited = 0;
        var completed;
        $.each(trackingState.completedPages, function (i, completed) {
            // indices not defined will be visited anyway.
            // In that case 'completed' will be undefined
            if (completed) {
                nrcompleted++;
            }
            if (typeof(completed) != "undefined") {
                nrvisited++;
            }
        })

        if (nrcompleted != 0) {
            if (!fullcompletion) {
                completion = Math.round((nrcompleted / nrvisited) * 100);
            }
            else {
                completion = Math.round((nrcompleted / trackingState.toCompletePages.length) * 100);
            }
        }
        else {
            completion = 0;
        }

        var results = {};
        results.mode = "full-results";

        var score = 0,
            nrofquestions = 0,
            totalWeight = 0,
            totalDuration = 0;
        results.interactions = Array();

        for (i = 0; i < trackingState.interactions.length - 1; i++) {


            score += trackingState.interactions[i].score * trackingState.interactions[i].weighting;
            if (trackingState.interactions[i].ia_nr < 0 || trackingState.interactions[i].nrinteractions > 0) {

                var interaction = {};
                interaction.score = Math.round(trackingState.interactions[i].score);
                interaction.title = trackingState.interactions[i].ia_name;
                interaction.type = trackingState.interactions[i].ia_type;
                interaction.correct = trackingState.interactions[i].result;
                interaction.duration = Math.round(trackingState.interactions[i].duration / 1000);
                interaction.weighting = trackingState.interactions[i].weighting;
                interaction.subinteractions = Array();

                var j = 0;
                for (j; j < trackingState.toCompletePages.length; j++) {
                    var currentPageNr = trackingState.toCompletePages[j];
                    if (currentPageNr == trackingState.interactions[i].page_nr) {
                        if (trackingState.completedPages[j]) {
                            interaction.completed = "true";
                        }
                        else if (!trackingState.completedPages[j]) {
                            interaction.completed = "false";
                        }
                        else {
                            interaction.completed = "unknown";
                        }
                    }
                }

                results.interactions[nrofquestions] = interaction;
                totalDuration += trackingState.interactions[i].duration;
                nrofquestions++;
                totalWeight += trackingState.interactions[i].weighting;

            }
            else if (results.mode == "full-results") {
                var subinteraction = {};

                var learnerAnswer, correctAnswer;
                switch (trackingState.interactions[i].ia_type) {
                    case "match":
                        var resultCorrect=false;
                        for (var c = 0; c < trackingState.interactions[i].correctOptions.length; c++) {
                            var matchSub = {}; //Create a subinteraction here for every match sub instead
                            correctAnswer = trackingState.interactions[i].correctOptions[c].source + ' --> ' + trackingState.interactions[i].correctOptions[c].target;
                            source = trackingState.interactions[i].correctOptions[c].source;
                            if (trackingState.interactions[i].learnerOptions.length == 0) {
                                learnerAnswer = source + ' --> ' + ' ';
                            }
                            else {
                                for (var d = 0; d < trackingState.interactions[i].learnerOptions.length; d++) {
                                    if (source == trackingState.interactions[i].learnerOptions[d].source) {
                                        learnerAnswer = source + ' --> ' + trackingState.interactions[i].learnerOptions[d].target;
                                        break;
                                    }
                                    else {
                                        learnerAnswer = source + ' --> ' + ' ';
                                    }
                                }
                            }

                            matchSub.question = trackingState.interactions[i].ia_name;
                            matchSub.correct = resultCorrect;
                            matchSub.learnerAnswer = learnerAnswer;
                            matchSub.correctAnswer = correctAnswer;
                            results.interactions[nrofquestions - 1].subinteractions.push(matchSub);
                        }

                        break;
                    case "text":
                        learnerAnswer = trackingState.interactions[i].learnerAnswers;
                        correctAnswer = trackingState.interactions[i].correctAnswers;
                        break;
                    case "multiplechoice":
                        learnerAnswer = trackingState.interactions[i].learnerAnswers[0] != undefined ? trackingState.interactions[i].learnerAnswers[0] : "";
                        for (var j = 1; j < trackingState.interactions[i].learnerAnswers.length; j++) {
                            learnerAnswer += "\n" + trackingState.interactions[i].learnerAnswers[j];
                        }
                        correctAnswer = "";
                        for (var j = 0; j < trackingState.interactions[i].correctAnswers.length; j++) {
                            if (trackingState.interactions[i].correctAnswers[j] != undefined) {
                                if (correctAnswer.length > 0)
                                    correctAnswer += "\n";
                                correctAnswer += trackingState.interactions[i].correctAnswers[j];
                            }
                        }
                        break;
                    case "numeric":

                        learnerAnswer = trackingState.interactions[i].learnerAnswers;
                        correctAnswer = "-";  // Not applicable
                        //TODO: We don't have a good example of an interactivity where the numeric type has a correctAnswer. Currently implemented for the survey page.
                        break;
                    case "fill-in":
                        learnerAnswer = trackingState.interactions[i].learnerAnswers;
                        correctAnswer = trackingState.interactions[i].correctAnswers;
                        break;
                }
                if (trackingState.interactions[i].ia_type != "match") {
                    subinteraction.question = trackingState.interactions[i].ia_name;
                    if (trackingState.interactions[i].result != undefined && trackingState.interactions[i].result.success != undefined) {
                        subinteraction.correct = trackingState.interactions[i].result.success;
                    }
                    else
                    {
                        subinteraction.correct = false;
                    }
                    subinteraction.learnerAnswer = learnerAnswer;
                    subinteraction.correctAnswer = correctAnswer;
                    results.interactions[nrofquestions - 1].subinteractions.push(subinteraction);
                }
            }
        }
        results.completion = completion;
        results.score = score;
        results.nrofquestions = nrofquestions;
        results.averageScore = getScaledScore(trackingState) * 100;
        results.totalDuration = Math.round(totalDuration / 1000);
        results.start = trackingState.start.toLocaleString();

        //$.ajax({
        //    type: "POST",
        //    url: window.location.href,
        //    data: {
        //        grade: results.averageScore / 100
        //    }
        //});
        return results;
    }

function getdScaledScore(x)
{
    return getdRawScore(x) / (getdMaxScore(x) - getdMinScore(x));
}

function getScaledScore(x)
{
    return Math.round(getdScaledScore(x)*100)/100 + "";
}

function getdRawScore(x)
    {
        if (x.lo_type == "pages only")
        {
            if (getSuccessStatus(x) == 'completed')
                return 100;
            else
                return 0;
        }
        else
        {
            var score = [];
            var weight = [];
            var totalweight = 0.0;
            // Walk passed the pages
            var i=0;
            for (i=0; i<x.nrpages; i++)
            {
                var sit = findPage(i, x);
                if (sit != null && sit.weighting > 0)
                {
                    totalweight += sit.weighting;
                    score.push(sit.score);
                    weight.push(sit.weighting);
                }
            }
            var totalscore = 0.0;
            if (totalweight > 0.0)
            {
                for (i=0; i<score.length; i++)
                {
                    totalscore += (score[i] * weight[i]);
                }
                totalscore = totalscore / totalweight;
            }
            else
            {
                // If the weight is 0.0, set the score to 100
                totalscore = 100.0;
            }
            return Math.round(totalscore*100)/100;
        }
    }

function getRawScore()
{
    return getdRawScore(x) + "";
}

function getdMinScore(x)
{
    if (x.lo_type == "pages only")
    {
        return 0.0;
    }
    else
    {
        return 0.0;
    }
}

function getMinScore(x)
{
    return x.getdMinScore() + "";
}

function getdMaxScore(x)
{
    if (x.lo_type == "pages only")
    {
        return 100.0;
    }
    else
    {
        return 100.0;
    }
}

function getMaxScore(x)
{
    return x.getdMaxScore() + "";
}

function findPage(page_nr, x)
{
    var id = makeId(page_nr, -1, 'page', "");
    var i=0;
    for (i=0; i<x.interactions.length; i++)
    {
        if (x.interactions[i].id.indexOf(id) == 0 && x.interactions[i].id.indexOf(id + ':interaction') < 0)
            return x.interactions[i];
    }
    return null;
}

function makeId(page_nr, ia_nr, ia_type, ia_name)
{
    var tmpid = 'urn:x-xerte:p-' + (page_nr + 1);
    if (ia_nr >= 0)
    {
        tmpid += ':' + (ia_nr + 1);
        if (ia_type.length > 0)
        {
            tmpid += '-' + ia_type;
        }
    }

    if (ia_name)
    {
        // ia_nam can be HTML, just extract text from it
        var div = $("<div>").html(ia_name);
        var strippedName = div.text();
        tmpid += ':' + encodeURIComponent(strippedName.replace(/^[a-zA-Z0-9_ ]/g, "").replace(/ /g, "_"));
        // Truncate to max 255 chars, this should be 4000
        tmpid = tmpid.substr(0,255);
    }
    return tmpid;
}

function x_GetTrackingTextFromHTML(html, fallback)
{
    var div = $('<div>').html(html);
    var txt = $.trim(div.text());
    if (txt == "")
    {
        var img = div.find("img");
        if (img != undefined && img.length > 0)
        {
            txt = img[0].attributes['alt'].value;
        }
    }
    if (txt == "")
    {
        txt = fallback;
    }
    return txt;
}

function getSuccessStatus(x)
    {
        if (x.lo_type != "pages only")
        {
            if (getScaledScore(x) > x.lo_passed)
            {
                return "passed";
            }
            else
            {
                return "failed";
            }
        }
        else
        {
            if (getCompletionStatus(x) == 'completed')
            {
                return "passed";
            }
            else
            {
                return "unknown";
            }
        }
    }

function getCompletionStatus(state)
    {
        var completed = true;
        for(var i = 0; i<state.completedPages.length; i++)
        {
            if(state.completedPages[i] == false)
            {
                completed = false;
                break;
            }
            //if( i == state.completedPages.length-1 && state.completedPages[i] == true)
            //{
            //completed = true;
            //
        }

        if (completed)
        {
            return "completed";

        }
        else if(!completed)
        {
            return 'incomplete';
        }
        else
        {
            return "unknown"
        }
    }
