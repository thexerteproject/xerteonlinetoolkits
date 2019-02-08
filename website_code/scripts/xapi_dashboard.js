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

/*
function xapiGetStatements(lrs, q, one, callback) {
    var conf = {
        "endpoint": lrs.lrsendpoint + '/',
        "user": lrs.lrskey,
        "password": lrs.lrssecret,
        "strictCallbacks": true
    };
    ADL.XAPIWrapper.log.debug = true;
    ADL.XAPIWrapper.changeConfig(conf);

    var search = ADL.XAPIWrapper.searchParams();
    $.each(q, function(i, value){
        search[i] = value;
    });
    if (one)
    {
        search['limit'] = 1;
    }
    var statements = [];
    ADL.XAPIWrapper.getStatements(search, null,
        function getmorestatements(err, res, body) {
            for (x = 0; x < body.statements.length; x++) {
                statements.push(body.statements[x]);
            }
            if (err !== null) {
                console.log("Failed to query statements: " + err);
                // TODO: do something with error, didn't get statements
                return;
            }
            if (body.more && body.more !== "") {
                ADL.XAPIWrapper.getStatements(null, body.more, getmorestatements);
            } else {
                callback(statements);
            }
        }
    );
}
*/
function xAPIDashboard(info) {
    this.data = new DashboardState(info);
}

xAPIDashboard.prototype.getStatements = function(q, one, callback) {
    this.data.getStatements(q, one, callback);
};
xAPIDashboard.prototype.escapeId = function(id) {
    return id.replace(/[^A-Za-z0-9]/g, "_");
};

xAPIDashboard.prototype.displayFrequencyGraph = function(statements, element) {
    if (element == null) {
        element = "#heatmapData";
    }
    $(element).append(
        '<div id="table_overview_graph">' +
        '<svg></svg></div>');
    var dashstatements = this.data.getStatementsList(this.data.rawData, "http://adlnet.gov/expapi/verbs/launched");
    begin = new Date(dashstatements[0].timestamp);
    begin.setDate(begin.getDate() - 1);
    end = new Date(dashstatements[dashstatements.length - 1].timestamp);
    end.setDate(end.getDate() + 1);

    var vals = [];
    var timeFrame = end.getTime() - begin.getTime();
    var tickmarkDuration = timeFrame / 8;
    //round to nearset day
    var tickMarkNrDays = Math.round(tickmarkDuration / (1000 * 3600 * 24));
    if (tickMarkNrDays < 1)
    {
        tickMarkNrDays = 1;
    }
    var tick = begin.getTime();
    while(tick < end.getTime()) {
        vals.push(tick);
        tick += (tickMarkNrDays * 1000 * 3600 * 24);
    }

    var dash = new ADL.XAPIDashboard();
    dash.addStatements(dashstatements);
    var chart = dash.createLineChart({
        container: '#table_overview_graph svg',
        groupBy: 'timestamp',
        range: {
            start: begin.toISOString(),
            end: end.toISOString(),
            increment: 1000 * 3600 * 24
        },
        aggregate: ADL.count(),
        rangeLabel: 'start',
        customize: function(chart) {
            chart.height(200);
            chart.tooltips(false);
            chart.interpolate("monotone");
            chart.xAxis.tickFormat(function(label) {
                return d3.time.format('%b %d')(new Date(label));
            });
        },
        post: function(data) {
            data.contents.map(function(el) {
                el.in = Date.parse(el.in);
            });
        }
    });
    chart.draw();
};


xAPIDashboard.prototype.createJourneyTableSession = function(div) {
    this.data.rawData = this.data.combineUrls();
    var learningObjects = this.data.getLearningObjects();
    this.data.getAllInteractions(this.rawData);
    var data = this.data.groupStatements();
    this.data.groups.forEach(function(group){
        $("#group-select").append('<option value="' + group + '">'+group+'</option>')
    });
    for (var learningObjectIndex = 0; learningObjectIndex < learningObjects.length; learningObjectIndex++) {
        //if (learningObjects[learningObjectIndex].url != learningObjectUrl) {
        //    continue;
        //}
        var interactions = this.data.getInteractions(learningObjects[learningObjectIndex].url);
        // Title should go to #dashboard-title if found
        var titlediv = $("#dashboard-title");
        if (titlediv.length == 0) {
            // Not found -> Place in div
            titlediv = div;
        }
        titlediv.html('<h3 class="header">' + learningObjects[learningObjectIndex].name + '</h3>');

        // Add statistics above the table.
        div.append(
            '<div class="journeyOverview"><div class="journeyOverviewHeader row"><h3>Overview</h3></div><div class="journeyOverviewActivity row"></div><div class="journeyOverviewStats row"></div></div>'
        );
        var first_launch = new Date(moment($('#dp-start').val(), "DD/MM/YYYY").add(-1, 'days').format("YYYY-MM-DD"));
        var last_launch = new Date(moment($('#dp-end').val(), "DD/MM/YYYY").add(1, 'days').format("YYYY-MM-DD"));
        this.drawActivityChart($('.journeyOverviewActivity'), first_launch, last_launch, false);

        // Add the number of Users.
        var numberOfUsers = 0;
        for (var user in data) {
            numberOfUsers++;
        }
        var totalScore = 0;
        var scoreCount = 0;
        for(var i in this.data.groupedData){
            var curUser = this.data.groupedData[i];
            var completedStatements = this.data.getStatementsList(curUser.statements, "http://adlnet.gov/expapi/verbs/completed");
            if(completedStatements.length > 0)
            {
                totalScore += completedStatements[0].result.score.scaled;
                scoreCount++;
            }
        }
        this.drawNumberOfUsers($('.journeyOverviewStats'), numberOfUsers);
        var sessions = [];
        var totalCompletedPages = 0;
        this.data.rawData.forEach(function(s){
            sessionId = s.context.extensions["http://xerte.org.uk/sessionId"];
            if(sessions.indexOf(sessionId) === -1){
                sessions.push(sessionId);
            }
            if(s.verb.id == "http://adlnet.gov/expapi/verbs/exited"){
                var pages = interactions.filter(i => i.type == "page").map(p => p.url);
                if(pages.indexOf(s.object.id) >= 0)
                {
                    totalCompletedPages++;
                }
            }
        });
        // Add the number of launches.
        var launchedStatements = this.data.getStatementsList(this.data.rawData, "http://adlnet.gov/expapi/verbs/launched");
        this.drawNumberOfInteractions($('.journeyOverviewStats'), this.data.rawData.length);
        this.drawNumberOfSessions($('.journeyOverviewStats'), sessions.length);
        this.drawNumberOfCompletedSessions($('.journeyOverviewStats'), scoreCount);
        this.drawAverageCompletedPages($('.journeyOverviewStats'), Math.round(100 * totalCompletedPages / numberOfUsers) / 100);

        // Add the average grade.
        this.drawAverageScore($('.journeyOverviewStats'), (Math.round((totalScore / scoreCount) * 10 * 10) / 10), first_launch, last_launch);
        var pageOptions = "" //'<div class="row"><span>Left</span><span>Right</span><br></div>';
        // Add table with specific overview.
        div.append('<div class="row journeyTable">' + pageOptions + '<table class="table table-hover table-bordered table-responsive" id="' + learningObjectIndex +
            '"><thead></thead><tbody></tbody></table></div>');
        div.find("#" + learningObjectIndex + " thead").append("<tr><th>Started</th><th>Completed</th></tr>");
        if (this.data.info.dashboard.enable_nonanonymous && $("#dp-unanonymous-view").prop('checked')) {
            div.find("#" + learningObjectIndex + " thead tr").prepend('<th>Users</th>');
        }
        for (var interactionIndex in interactions) {
            interactionHeader = this.insertInteractionModal(div, learningObjectIndex, interactionIndex, interactions[interactionIndex]);
        }
        var redDiv = '<div class="status-indicator status-red">&nbsp;</div>';
        var greenDiv = '<div class="status-indicator status-green">&nbsp;</div>';
        var orangeDiv = '<div class="status-indicator status-orange">&nbsp;</div>';
        var greyDiv = '<div class="status-indicator status-gray">&nbsp;</div>';
        $.each(data, function(key, value) {
            console.log(key);
        });
        for (var user in data) {
            var lastStatements = this.getLastUserAttempt(data[user]);
            group = "";
            if(lastStatements.statements[0].context.team != undefined)
            {
                group = lastStatements.statements[0].context.team.account.name;
            }
            var row = "<tr class='session-row' id='session-" + learningObjectIndex + "-" + this.escapeId(user) + "' data-group='" + group + "'>";
            if (this.data.info.dashboard.enable_nonanonymous && $("#dp-unanonymous-view").prop('checked')) {
                if (data[user]['mode'] == 'username') {
                    row += "<td class='name-column'>" + data[user]['username'] + "</td>";
                } else {
                    actor = lastStatements.statements[0].actor;
                    var group = "";
                    if(actor.account != undefined)
                    {
                        group = " - " + lastStatements.statements[0].actor.account.name;
                    }
                    row += "<td class='name-column'>" + user + group +"</td>";
                }
            }
            if (this.data.hasStartedLearningObject(lastStatements, learningObjects[learningObjectIndex].url)) {
                started = "<i class=\"fa fa-x-tick\">";
            } else {
                continue;
            }
            row += "<td>" + started + "</td>";
            if (this.data.hasCompletedLearningObject(lastStatements, learningObjects[learningObjectIndex].url)) {
                completed = "<i class=\"fa fa-x-tick\">";
            } else {
                completed = "<i class=\"fa fa-x-cross\">";
            }
            row += "<td>" + completed + "</td>";
            div.find("tbody").last().append(row);
            for (var interactionIndex in interactions) {

                //insertInteractionData(div, colorDiv, user, learningObjectIndex, interactionObjectIndex)
                interaction = interactions[interactionIndex];
                learningObject = learningObjects[learningObjectIndex];
                if (this.data.hasPassedInteraction(lastStatements, interaction.url)) {
                    this.insertInteractionData(div, greenDiv, data[user], learningObjectIndex, interactionIndex);
                } else if (this.data.hasCompletedInteraction(lastStatements, interaction.url)) {
                    this.insertInteractionData(div, redDiv, data[user], learningObjectIndex, interactionIndex);
                } else if (this.data.hasStartedInteraction(lastStatements, interaction.url)) {
                    this.insertInteractionData(div, orangeDiv, data[user], learningObjectIndex, interactionIndex);
                } else {
                    this.insertInteractionData(div, greyDiv, data[user], learningObjectIndex, interactionIndex);
                }

            }
            row = "</tr>";
            rows = this.insertCollapse(div, data[user], learningObjectIndex, row);

            div.find("#" + learningObjectIndex + " tbody").append(rows);
            this.handleCollapse(div, data[user], learningObjectIndex);

        }
        $(".close-results").click(function(){
            $(this).closest(".collapse").collapse('toggle');
        });
        $(".icon-header").click(function() {
            if ($(this).hasClass("icon-hide")) {
                $(this).removeClass("icon-hide");
                $(this).addClass("icon-show");
            } else if ($(this).hasClass("icon-show")) {
                $(this).removeClass("icon-show");
                $(this).addClass("icon-hide");
            }

            interactionIndex = $(this)[0].attributes.getNamedItem("data-interaction").value;
            interaction = interactions[interactionIndex];

            column = $(this).closest("table").find("[data-parent=" + interaction.interactionObjectIndex + "]");
            column.each(function(ci) {
                c = $(column[ci]);
                if (c.hasClass("column-show")) {
                    c.removeClass("column-show");
                    c.addClass("column-hide");
                } else if (c.hasClass("column-hide")) {
                    c.removeClass("column-hide");
                    c.addClass("column-show");
                }
            });
            //$(".journeyTable").width(Math.min($(".journeyTable thead").width(), $(".journeyOverview").width()));
        });
        /*
        menu = $("<div><ul></ul></div>");
        interactions.forEach(function(i){
            if(i.type == "page"){
                menu.append("<li><input class='hide-show-column-checkbox' type='checkbox' checked data-target='" + i.interactionObjectIndex + "'>" + i.name + "</li>");
            }
        });
        $(".show-hide-column-button").popover({
            content : menu.html(),
            html : true,
            placement : "bottom"
        });
        $(".hide-show-column-checkbox");
*/

        $(".show-display-options-button").unbind("click");
        $(".show-display-options-button").popover('dispose');
        $(".show-display-options-button").on('click', function() {
            if (typeof $(this).data('bs.popover') == "undefined" || $(this).data('bs.popover') == undefined) {

                // Init the popover and show immediately
                menu = $("<div><h5>" + XAPI_DASHBOARD_DISPLAY_COLUMNS + "</h5><ul></ul></div>");
                interactions.forEach(function(i){
                    if(i.type == "page"){
                        header = $("th[data-interaction-index=" + i.interactionObjectIndex + "]");
                        isVisible = header.is(":visible");
                        checked = "";
                        if(isVisible){
                            checked = "checked"
                        }
                        menu.find("ul").append("<li><input class='hide-show-column-checkbox' type='checkbox' "
                            + checked
                            + " data-target='" + i.interactionObjectIndex + "'>" + i.name + "</li>");
                    }
                });

                menu.append("<h5>" + XAPI_DASHBOARD_DISPLAY_OVERVIEW + "</h5>");
                menu.append("<div><label>" + XAPI_DASHBOARD_DISPLAY_OVERVIEW + "</label><input class='hide-show-overview' type='checkbox' checked></div>");
                //menu.append("<div><label>" + XAPI_DASHBOARD_PAGE_SIZE + "</label><select></select></div>");
                pagesizes = [5, 10, 20, 50, 100, "All"];
                pagesizes.forEach(function(size){
                    //menu.find("select").append("<option value='" + size + "'>" + size + "</option>");
                })

                //debugger;
                $(".show-display-options-button").popover({
                    'content' : menu.html(),
                    'html' : true,
                    'placement' : "bottom",
                    'trigger' : 'click',
                    'container' : $(".show-display-options-button").parent()
                }).popover('show');

                $(".show-display-options-button").on('show.bs.popover', function () {
                    return false;
                });

                // Same for hide, don't let parent execute
                $(".show-display-options-button").on('hide.bs.popover', function () {
                    return false;
                });



                //$(".hide-show-column-checkbox").unbind("click");
                $(".hide-show-column-checkbox").change(function(){
                    checkbox = $(this);
                    target = checkbox.data("target");
                    checked = checkbox.is(":checked");
                    targetHeader = $("th[data-interaction-index=" + target + "]");
                    targetIndex = targetHeader.index() + 1;
                    column = $('.journeyData td:nth-child(' + targetIndex + '),.journeyData th:nth-child(' + targetIndex + ')');
                    subQuestionToggle = targetHeader.find("div");
                    if(checked){
                        column.show();
                    }else{
                        column.hide();
                    }
                    if(subQuestionToggle.hasClass("icon-show")){
                        subQuestionToggle.click();
                    }
                });

                $(".hide-show-overview").change(function(){
                    $(".journeyOverview").toggle();
                });



            } else {
                //debugger;
                $(this).parent().find('.popover').toggle();
            }
        });



    }
};

xAPIDashboard.prototype.getLastUserAttempt = function(data) {
    data.statements.sort(function(a, b) {
        return (new Date(a.timestamp) < new Date(b.timestamp)) ? 1 : ((new Date(b.timestamp) < new Date(a.timestamp)) ? -1 : 0);
    });
    var lastStatements = {
        'key': data.key,
        'mbox_sha1sum': data.mbox_sha1sum,
        'mode': data.mode,
        'statements': []
    };
    for (var userStatement in data.statements) {
        lastStatements.statements.push(data.statements[userStatement]);
        if (data.statements[userStatement].verb.id == "http://adlnet.gov/expapi/verbs/launched") {
            lastStatements.statements.reverse();
            return lastStatements;
        }
    }
    return lastStatements;
};

xAPIDashboard.prototype.insertCollapse = function(div, userdata, learningObject, rows) {
    numberOfColumns = div.find("th").length;
    rows += "<tr class='collapse' id='collapse-session-" + learningObject + "-" + this.escapeId(userdata['key']) + "'><td colspan='" + numberOfColumns +
        "'><div>";
    rows += '<div><span><button type="button" class="close-results xerte_button_c_no_width">Close Results</button></span></i></div>';
    rows += "<div class='card card-inverse' data-empty='true'>";
    rows += "</div>";
    rows += "</div></td></tr>";

    return rows;
};

xAPIDashboard.prototype.handleCollapse = function(div, userdata, learningObjectIndex) {
    var $this = this;
    div.find("#session-" + learningObjectIndex + "-" + this.escapeId(userdata['key'])).click(function(e) {
        var id = e.currentTarget.attributes.id.value;
        var target = $(e.currentTarget).parent().find("#collapse-" + id);
        if (target.find(".card")[0].attributes["data-empty"].value == "true") {
            $this.getExtraUserData(target.find(".card"), userdata, learningObjectIndex);
            target.find(".card")[0].attributes["data-empty"].value = "false";
        }
        target.collapse('toggle');

    });
};

xAPIDashboard.prototype.getExtraUserData = function(div, userdata, objIdx) {
    var statements = this.data.getStatementsList(userdata['statements'], "http://adlnet.gov/expapi/verbs/completed");
    var statement = undefined;
    if (statements[0] != undefined) {
        statement = statements[0];
    } else {
        var learningObjects = this.data.getLearningObjects();
        var url = learningObjects[objIdx].url;
        // Try to find exited
        statements = this.data.getExitedStatements(userdata, url);
        if (statements[0] != undefined) {
            statement = statements[0];
        }
    }
    if (statement == undefined ||
        statement.result == undefined ||
        statement.result.extensions == undefined || statement.result.extensions["http://xerte.org.uk/xapi/trackingstate"] == undefined) {
        rows = "";
        rows += XAPI_DASHBOARD_STARTINGTIME + " " + moment(this.userStartTime(userdata, objIdx)).format('YYYY-MM-DD HH:mm:ss') + "<br>";
        rows += XAPI_DASHBOARD_COMPLETETIME + " " + moment(this.userCompleteTime(userdata, objIdx)).format('YYYY-MM-DD HH:mm:ss') + "<br>";
        rows += XAPI_DASHBOARD_DURATION + " " + this.userDuration(userdata, objIdx) + "<br>";
        div.append(rows);
        return;
    }
    this.getResultPage(div, userdata, objIdx, statement);
};

xAPIDashboard.prototype.userStartTime = function(userdata, learningObject) {
    var statements = userdata['statements'];
    var statement = this.data.getStatement(statements, "http://adlnet.gov/expapi/verbs/launched");
    if (statement == undefined) {
        return " " + XAPI_DASHBOARD_NOTYETSTARTED;
    }
    return new Date(statement.timestamp);
};

xAPIDashboard.prototype.userCompleteTime = function(userdata, learningObject) {
    statements = userdata['statements'];
    statement = this.data.getStatement(statements, "http://adlnet.gov/expapi/verbs/exited");
    if (statement == undefined) {
        return " " + XAPI_DASHBOARD_NOTYETFINISHED;
    }
    return new Date(statement.timestamp);
};

xAPIDashboard.prototype.userDuration = function(userdata, learningObject) {
    startTime = this.userStartTime(userdata, learningObject);
    endTime = this.userCompleteTime(userdata, learningObject);
    time = (endTime - startTime) / 1000;
    if (isNaN(time)) {
        return " " + XAPI_DASHBOARD_NOTYETCOMPLETED;
    }
    if (time > 120) {
        return Math.round(time / 60) + " " + XAPI_DASHBOARD_COMPLETED_UNIT_MINUTES;
    }
    return Math.round(time) + " " + XAPI_DASHBOARD_COMPLETED_UNIT_SECONDS;
};

xAPIDashboard.prototype.insertInteractionData = function(div, colorDiv, userdata, learningObjectIndex, interactionObjectIndex) {
    var learningObject = this.data.getLearningObjects()[learningObjectIndex];
    var interactionObject = this.data.getInteractions(learningObject.url)[interactionObjectIndex];
    var interactions = this.data.getInteractions(learningObjects[learningObjectIndex].url);
    var showHide = "column-hide";
    var parentId = -1;
    var $this = this;
    var tdclass;
    if (interactionObject.type == "page" || this.data.selectInteractionById(interactions, interactionObject.parent) == undefined) {
        showHide = "column-show";
        tdclass = "x-dashboard-page";
    } else {
        parentId = this.data.selectInteractionById(interactions, interactionObject.parent).interactionObjectIndex;
        tdclass = "x-dashboard-interaction";
    }
    colorDiv = "<td data-parent='" + parentId + "' class='" + showHide + " " + tdclass + " column-" + interactionObjectIndex + "'><a href='#' id='session-" +
        learningObjectIndex + "-" + this.escapeId(userdata['key']) + "-interaction-" + interactionObjectIndex +
        "' rel='popover' data-placement='left' data-trigger='hover'>" +
        colorDiv + "</a></td>";

    div.find("tr").last().append(colorDiv);
    title = interactionObject.name;
    if (title == undefined) {
        title = "";
    }
    var max_popover_title = 25;
    if(title.length > max_popover_title)
    {
        title = title.substr(0, max_popover_title - 3) + "...";
    }
    sessionDiv = div.find("#session-" + learningObjectIndex + "-" + this.escapeId(userdata['key']) + "-interaction-" + interactionObjectIndex);
    sessionDiv.popover({
        content: "<div id='popover-" + learningObjectIndex + "-session-" + $this.escapeId(userdata['key']) + "-interaction-" +
            interactionObjectIndex + "'></div>",
        title: title,
        html: true
    });
    sessionDiv
        .on('inserted.bs.popover', function(e) {
            elem = $("#popover-" + learningObjectIndex + "-session-" + $this.escapeId(userdata['key']) + "-interaction-" + interactionObjectIndex);
            if (elem.html() == "") {
                elem.append($this.popoverData(userdata, learningObjectIndex, interactionObjectIndex));
            }
        });
};

xAPIDashboard.prototype.popoverData = function(userdata, learningObjectIndex, interactionObjectIndex) {
    var learningObject = this.data.getLearningObjects()[learningObjectIndex];
    var interactions = this.data.getInteractions(learningObjects[learningObjectIndex].url);
    var interactionObject = interactions[interactionObjectIndex];
    var html = XAPI_JOURNEY_POPOVER_STATUS + " " + this.interactionStatus(userdata, interactionObject.url) + "<br>";

    var started = this.data.getFilteredStatements(userdata, "http://adlnet.gov/expapi/verbs/initialized", interactionObject.url);
    var scores = this.data.getAllInteractionScores(userdata, interactionObject.url);
    var durations = this.data.getAllDurations(userdata, interactionObject.url);
    var lastAnswer = this.data.getAnswers(userdata, interactionObject.url);
    var lastStatements = this.getLastUserAttempt(userdata);

    html += XAPI_JOURNEY_POPOVER_NRTRIES + " " + started.length + "<br>";
    if (scores.length == 1) {
        html += XAPI_JOURNEY_POPOVER_GRADE + " " + Math.round(scores[0] * 10000) / 100 + "%<br>";

    } else if (scores.length > 1) {
        html += XAPI_JOURNEY_POPOVER_AVGGRADE + " " + Math.round(100 * (scores.reduce(function(a, b) {
            return a + b;
        }) / scores.length), 2) + "%<br>";

        var last_score = this.data.getAllInteractionScores(lastStatements, interactionObject.url)[0];

        html += XAPI_JOURNEY_POPOVER_LAST_GRADE + " " + Math.round(last_score * 10000) / 100 + "%<br>"
    }
    var durationBlocks = [];;
    if(interactionObject.url.endsWith("/video"))
    {
        durationBlocks = this.data.getDurationBlocks(userdata, interactionObject.url.substring(0, interactionObject.url.length - ("/video").length));
    }
    if (durations.length == 1) {
        html += XAPI_JOURNEY_POPOVER_DURATION + " " + Math.round(durations[0] * 100) / 100 + XAPI_JOURNEY_POPOVER_DURATION_UNIT + "<br>";
    } else if (durations.length > 1) {
        html += XAPI_JOURNEY_POPOVER_AVGDURATION + " " + Math.round((durations.reduce(function(a, b) {
            return a + b;
        }) / durations.length), 2) + XAPI_JOURNEY_POPOVER_DURATION_UNIT + "<br>";
        var last_duration = this.data.getAllDurations(lastStatements, interactionObject.url)[0];
        html += XAPI_JOURNEY_POPOVER_LAST_DURATION + " " + Math.round(last_duration * 100) / 100 + XAPI_JOURNEY_POPOVER_DURATION_UNIT + "<br>";
    }
    if(durationBlocks.length > 0)
    {
        html += "Overview of intervals:<ul>";
        durationBlocks.forEach(function(block)
        {
            html += "<li>" + block.start + XAPI_JOURNEY_POPOVER_DURATION_UNIT + " - " + block.end + XAPI_JOURNEY_POPOVER_DURATION_UNIT + "</li>";
        });
        html + "</ul>";
        //debugger;
    }
    if (lastAnswer.length > 0) {
        // Format a bit
        var lastanswer = lastAnswer[0];
        if (lastanswer.indexOf('[.]') != false || lastanswer.indexOf('[,]') != false) {
            if(lastanswer.length > 23)
            {
                lastanswer = lastanswer.substr(0, 20) + "...";
            }
            if (lastanswer.indexOf('[,]') != false) {
                lastanswer = "<br>&nbsp;    " + lastanswer;
            }
            lastanswer = lastanswer.replace(/\[\.\]/g, " <i class=\"fa fa-long-arrow-right\"></i> ");
            lastanswer = lastanswer.replace(/\[,\]/g, "<br>&nbsp;    ");


            html += XAPI_JOURNEY_POPOVER_LASTANSWER + " " + lastanswer;

        }

    }
    return html;
};

xAPIDashboard.prototype.interactionStatus = function(user, interactionObjectUrl) {
    if (this.data.hasPassedInteraction(user, interactionObjectUrl)) {
        return XAPI_DASHBOARD_STATUS_COMPLETED_PASSED;
    } else if (this.data.hasCompletedInteraction(user, interactionObjectUrl)) {
        return XAPI_DASHBOARD_STATUS_COMPLETED_NOTPASSED;
    } else if (this.data.hasStartedInteraction(user, interactionObjectUrl)) {
        return XAPI_DASHBOARD_STATUS_STARTED_NOTCOMPLETED;
    } else {
        return XAPI_DASHBOARD_STATUS_NOTSTARTED;
    }
};

xAPIDashboard.prototype.insertInteractionModal = function(div, learningObjectIndex, interactionIndex, interaction) {
    var learningObjects = this.data.getLearningObjects();
    var interactions = this.data.getInteractions(learningObjects[learningObjectIndex].url);
    var interaction = interactions[interactionIndex];
    var interactionTitle = interaction.name;
    var collapseIcon = "";
    var showHide = "hide";
    var parentIndex = "";
    var $this = this;
    var thclass = " ";
    var max_interaction_title_length;

    if (interaction.parent == "" || this.data.selectInteractionById(interactions, interaction.parent) == undefined) {
        parentIndex = "-1";
        showHide = "show";
        interactionTitle = interactionTitle;

        if (interaction.children.length > 0) {
            collapseIcon = '<div data-interaction="' + interactionIndex + '" class="icon-header icon-hide">&#9701</div>';
            thclass += "x-dashboard-has-children ";
        }
        max_interaction_title_length = 25;
        thclass += "x-dashboard-page";
    } else {

        parentIndex = this.data.selectInteractionById(interactions, interaction.parent).interactionObjectIndex;
        thclass += "x-dashboard-interaction";
        max_interaction_title_length = 35;
    }
    if(interactionTitle.length > max_interaction_title_length)
    {
        interactionTitle = interactionTitle.substr(0, max_interaction_title_length - 3) + "...";
    }
    var interactionHeader = '<th data-interaction-index="' + interaction.interactionObjectIndex + '" data-parent="' + parentIndex + '" class="column-' + showHide + thclass +
        '"><a href="#" data-toggle="modal" data-target="#model-' +
        learningObjectIndex + '-' + interactionIndex + '">' + interactionTitle + '</a>' + collapseIcon + '</th>';
    $('body').append('<div id="model-' + learningObjectIndex + '-' + interactionIndex + '" class="modal fade" role="dialog" >' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +

        '<h4 class="modal-title">' + interactionTitle + '</h4>' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '</div>' +
        '<div class="modal-body col-md-12">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>');
    div.find("#" + learningObjectIndex + " thead tr").append(interactionHeader);
    $('#model-' + learningObjectIndex + '-' + interactionIndex)
        .on('show.bs.modal', function(e) {
            var contentDiv =
                $('#model-' + learningObjectIndex + '-' + interactionIndex + ' .modal-body');
            if (contentDiv.html() == "") {
                interactions = $this.data.getInteractions(learningObjects[learningObjectIndex].url);
                interaction = interactions[interactionIndex];
                contentDiv.append('<div class="journey-container"></div>');
                if (interaction.children.length == 0 && interaction.type == "interaction") {
                    contentDiv.find(".journey-container").append("<div class='col-6 panel main-information'></div>");
                    var interactionDetails = $this.data.selectInteractionById(interactions, interaction.url);
                    var statements = $this.data.getInteractionStatements(interaction.url);
                    contentDiv.find(".journey-container div").append('<svg class="graph" id="model-svg-' + learningObjectIndex + '-' + interactionIndex +
                        '"></svg>');
                    $this.createPieChartInteraction(statements, '#model-' + learningObjectIndex + '-' + interactionIndex + ' #model-svg-' +
                        learningObjectIndex +
                        '-' + interactionIndex);
                    var question = $this.data.getQuestion(interactionDetails.url);
                    var pausedStatements = $this.data.getStatementsList(statements, 'https://w3id.org/xapi/video/verbs/paused');
                    if (question != undefined) {
                        var questionDiv = $("<div class='panel col-6'></div>").appendTo(contentDiv.find('.journey-container'));
                        $this.displayQuestionInformation(questionDiv, question, learningObjectIndex, interactionIndex);
                    } else if (pausedStatements.length > 0) {
                        var heatmapDiv = $("<div class='panel col-6'></div>").appendTo(contentDiv.find('.container'));
                        $this.displayHeatmap(heatmapDiv, learningObjectIndex, interactionIndex, pausedStatements);
                    }
                    $this.displayPageInfo(contentDiv, ".journey-container .main-information", interaction);
                    //getMultipleChoiceQuestion(learningObjects[learningObjectIndex].url, interaction.url);
                } else {
                    statements = $this.data.getInteractionStatements(interaction.url);
                    panelDiv =  $("<div class='panel col-6'></div>").appendTo(contentDiv.find(".journey-container"));
                    panelDiv.append("<svg class='graph'></svg>");
                    $this.createPieChartInteraction(statements, '#model-' + learningObjectIndex + '-' + interactionIndex + ' svg');
                    panelDiv.append('<div class="page-info panel"></div>');
                    $this.displayPageInfo(contentDiv, ".journey-container .page-info", interaction);
                    childQuestions = interaction.children.map(function(c){
                        return $this.data.getQuestion(c);
                    });
                    if(childQuestions.filter(q => q != undefined && q.interactionType == "choice").length == childQuestions.length){
                        var heatmapDiv = $("<div class='panel col-6'></div>").appendTo(contentDiv.find('.journey-container'));
                        $this.displayQuizOverview(heatmapDiv, childQuestions);
                    }

                }
            }
        });
};

// Function that creates a heatmap for the given data.
xAPIDashboard.prototype.displayHeatmap = function(contentDiv, learningObjectIndex, interactionIndex, pausedstatements) {
    var times = [],
        data = [
            []
        ],
        total = 100;
    var videoLength;
    if(pausedstatements.length == 1)
    {
        videoLength = pausedstatements[0].result.extensions["https://w3id&46;org/xapi/video/extensions/time"];

    }else{
        videoLength = Math.max(...pausedStatements.map(s => s.result.extensions["https://w3id&46;org/xapi/video/extensions/time"]));
    }
    // Gets all the ranges from the data.
    var stringRanges = pausedstatements.map(s => s.result.extensions["https://w3id&46;org/xapi/video/extensions/played-segments"]);
    var totalViewed = [];
    for (var i = 0; i < total; i++) {
        totalViewed.push(0);
    }
    for (sRangeIndex in stringRanges) {
        var sRanges = stringRanges[sRangeIndex].split('[,]');
        for (var sRangeIndex in sRanges) {
            var sRange = sRanges[sRangeIndex];
            var range = sRange.split('[.]');
            for (var j = parseFloat(range[0]); j <= parseFloat(range[1]); j += videoLength / total) {
                totalViewed[Math.floor(j / videoLength * total)]++;
            }
        }
    }


    for (var i = 0; i < total; i++) {
        times.push(i / total);

        data[0].push(totalViewed[i] / stringRanges.length * 100);
    }
    var data = [{
        z: data,
        x: times,
        y: [' '],
        type: 'heatmap'
    }];

    var layout = {
        title: '',
        annotations: [],
        xaxis: {
            ticks: '',
            side: 'top',
            tickformat: ',.0%',
            ticksuffix: ' of video',
            range: [0, 1]
        },
        yaxis: {
            title: '',
            ticks: '',
            ticksuffix: pausedStatements[0].object.definition.name["en-US"],
            y: "-15",
            tickangle: '-90',
            width: 700,
            height: 700,
            autosize: false
        },
        hovermode: false
    };

    for (var j = 0; j < data[0].length; j++) {

        var currentValue = data[0][j];
        if (currentValue != 0.0) {
            var textColor = 'white';
        } else {
            var textColor = 'black';
        }
        var result = {
            xref: 'x1',
            yref: 'y1',
            x: times[j],
            y: '',
            text: currentValue,
            font: {
                family: 'Arial',
                size: 12,
                color: 'rgb(50, 171, 96)'
            },
            showarrow: false,
            font: {
                color: textColor
            }
        };
        layout.annotations.push(result);
    }
    contentDiv.attr('id', 'heatmap-' + learningObjectIndex + '-' + interactionIndex);
    Plotly.newPlot(contentDiv.attr('id'), data, layout, {
        staticPlot: true
    });
};

xAPIDashboard.prototype.displayQuizOverview = function(contentDiv, questions)
{

    contentDiv.append("<div class='question-overview'><ul></ul></div>");
    questions.forEach(function(q){
        answerStatements = $this.rawData.filter(s => s.object.id == q.interactionUrl && s.verb.id == "http://adlnet.gov/expapi/verbs/answered");
        answers = answerStatements.map(s => s.result.response);
        contentDiv.find(".question-overview ul").append("<li>" + q.name["en-US"] + "</li>");
        var ol = $("<ol></ol>").appendTo(contentDiv.find(".question-overview ul li:last"));
        q.choices.forEach(function(c){
            current = 0;
            total = 0;
            answers.forEach(function(a){
                total++;
                if(a == c.id){
                    current++;
                }
            });
            if (q.correctResponsesPattern.indexOf(c.id) != -1) {
                correct = "<i class=\"fa fa-x-tick\"></i>";
            } else {
                correct = "<i class=\"fa fa-x-cross\"></i>";
            }
            ol.append("<li>" + correct + c.description["en-US"] + " - " + Math.round(current / total * 1000) / 10 + "%</li>");
        });

    });

}

xAPIDashboard.prototype.displayPageInfo = function(contentDiv, jqLocation, interaction) {
    var statements = this.data.getInteractionStatements(interaction.url);
    var started = this.data.getStatementsList(statements, "http://adlnet.gov/expapi/verbs/initialized");
    var completed = this.data.getStatementsList(statements, "http://adlnet.gov/expapi/verbs/exited").concat(
         this.data.getStatementsList(statements, "http://adlnet.gov/expapi/verbs/scored")
    );
    var uniqIds = completed.map(s => s.actor.mbox_sha1sum).filter((v, i, a) => a.indexOf(v) === i);
    started = started.filter(function(v, i, a){
        return a.map(s => s.actor).indexOf(v.actor) === i;
    });

    users = Object.keys(this.data.groupedData);
    contentDiv.find(jqLocation).append("Number of users" + " " + users.length + "<br>");
    contentDiv.find(jqLocation).append(XAPI_DASHBOARD_NRATTEMPTS + " " + started.length + " = " + Math.round(started.length / users.length * 100) + "%<br>");
    contentDiv.find(jqLocation).append(XAPI_DASHBOARD_NRCOMPLETIONS + " " + uniqIds.length + " = " + Math.round(uniqIds.length / users.length * 100) + "%<br>");

    var grouped = this.data.groupStatementsOnSession([started, completed]);
    avgTime = this.data.calculateDuration(grouped);

    if (avgTime < 120) {
        avgTime = Math.round(avgTime) + " " + XAPI_DASHBOARD_COMPLETED_UNIT_SECONDS;
    } else {
        avgTime = Math.round(avgTime / 6) / 10 + " " + XAPI_DASHBOARD_COMPLETED_UNIT_MINUTES;
    }
    contentDiv.find(jqLocation).append(XAPI_DASHBOARD_AVGDURATION + " " + avgTime + "<br>");
};

xAPIDashboard.prototype.createPieChartInteraction = function(statements, div_location) {
    var dash = new ADL.XAPIDashboard();
    statements = this.data.getAllScoreStatements(statements);
    var newStatements = jQuery.extend(true, [], statements);
    newStatements.forEach(function(x) {
        if (x.result.score.isScaled == undefined || x.result.score.isScaled == false) {
            x.result.score.isScaled = true;
            x.result.score.scaled *= 10;
        }
        return x;
    });
    dash.addStatements(newStatements);
    var chart = dash.createBarChart({
        container: div_location,
        groupBy: 'result.score.scaled',
        aggregate: ADL.count(),
        range: {
            start: 0.0,
            end: 10.0,
            increment: 1
        },
        post: function(data) {
            data.contents.map(function(el) {
                el.out *= 1 / newStatements.length * 100;
            });
        },
        customize: function(chart) {
            chart.xAxis.axisLabel(XAPI_DASHBOARD_GRAPH_GRADERANGE);
            chart.yAxis.axisLabel(XAPI_DASHBOARD_GRAPH_PERCOFCLASS);
            chart.width(500);
            chart.height(500);
            chart.yDomain([0, 100]);
        }

    });
    chart.draw();
};

xAPIDashboard.prototype.displayQuestionInformation = function(contentDiv, question, learningObjectIndex, interactionIndex) {
    switch (question.interactionType) {
        case "matching":
            this.displayMatchingQuestionInformation(contentDiv, question, learningObjectIndex, interactionIndex);
            break;
        case "choice":
            this.displayMCQQuestionInformation(contentDiv, question, learningObjectIndex, interactionIndex);
            break;
        case "fill-in":
            this.displayFillInQuestionInformation(contentDiv, question, learningObjectIndex, interactionIndex);
            break;
        default:
            debugger;
            console.log("Invalid interaction type");
    }
};

xAPIDashboard.prototype.displayMatchingQuestionInformation = function(contentDiv, question, learningObjectIndex, interactionIndex) {
    var learningObjects = this.data.getLearningObjects();
    var interactions = this.data.getInteractions(learningObjects[learningObjectIndex].url);
    var interaction = interactions[interactionIndex];
    var learningObjectUrl = learningObjects[learningObjectIndex].url;
    var interactionObjectUrl = interaction.url;
    contentDiv.append(question.name["en-US"]);
    var options = "<div>" + XAPI_DASHBOARD_SOURCES + "<ol>";
    question.source.forEach(function(s) {
        options += "<li>" + s.description["en-US"] + "</li>";
    });
    options += '</ol>';
    options += XAPI_DASHBOARD_TARGETS + "<ol>";
    question.target.forEach(function(targ) {
        options += "<li>" + targ.description["en-US"] + "</li>";
    });
    options += '</ol>';
    var pairs = question.correctResponsesPattern[0].split("[,]");
    pairs = pairs.map(x => x.split("[.]").join(" <i class=\"fa fa-long-arrow-right\"></i> "));
    options += XAPI_DASHBOARD_CORRECTANSWERS;
    options += "<ul>";
    pairs.forEach(function(p) {
        options += "<li>" + p + "</li>";
    });
    options += "</ul>";

    var dash = new ADL.XAPIDashboard();
    var statements = this.data.getQuestionResponses(interactionObjectUrl);
    var pairStatements = [];
    statements.forEach(function(s) {

        var tup = s.result.response.split("[,]");
        tup.forEach(function(t) {
            statement = JSON.parse(JSON.stringify(s));
            arr = t.split("[.]");
            statement.result.pairs = arr[1] + " < " + arr[0];
            pairStatements.push(statement);
        });
    });
    dash.addStatements(pairStatements);
    options += '<svg class="graph" id="answers-' + learningObjectIndex + '-' + interactionIndex + '"></svg ></div>';
    contentDiv.append(options);
    var chart = dash.createBarChart({
        container: '#answers-' + learningObjectIndex + '-' + interactionIndex,
        groupBy: 'result.pairs',
        aggregate: ADL.count(),
        customize: function(chart) {
            chart.xAxis.axisLabel(XAPI_DASHBOARD_GRAPH_MATCH_XAXIS);
            chart.yAxis.axisLabel(XAPI_DASHBOARD_GRAPH_PERCOFCLASS);
            chart.width(1000);
            chart.height(500);
        },
        process: function(data, event, opts) {
            data.where('result.pairs != null')
                .orderBy('result.pairs', 'asc')
                .groupBy('result.pairs')
                .count()
                //            .orderBy('count', 'desc')
                .select('group as in, count as out')
                .exec(opts.cb);
        }

    });
    chart.draw();
};

xAPIDashboard.prototype.displayMCQQuestionInformation = function(contentDiv, question, learningObjectIndex, interactionIndex) {
    var learningObjects = this.data.getLearningObjects();
    var interactions = this.data.getInteractions(learningObjects[learningObjectIndex].url);
    var interaction = interactions[interactionIndex];
    var learningObjectUrl = learningObjects[learningObjectIndex].url;
    var interactionObjectUrl = interaction.url;
    contentDiv.append(XAPI_DASHBOARD_QUESTION + " " + question.name["en-US"]);
    var options = "<div>" + XAPI_DASHBOARD_ANSWERS + "<ol>";
    choices = question.choices;
    var dash = new ADL.XAPIDashboard();
    var statements = this.data.getQuestionResponses(interactionObjectUrl);
    var numberOfAnswers = statements.filter(s => s.result != undefined && s.result.response != undefined).length;
    question.choices.forEach(function(option) {
        var correct = "";
        if (question.correctResponsesPattern.indexOf(option.id) != -1) {
            correct = "<i class=\"fa fa-x-tick\"></i>";
        } else {
            correct = "<i class=\"fa fa-x-cross\"></i>";
        }
        var percentage = Math.round(1000 * statements.filter(s => s.result != undefined && s.result.response == option.id).length / numberOfAnswers) / 10 + "%"
        options += "<li>" + correct + option.description["en-US"] + " - " + percentage + "</li>";
    });

    dash.addStatements(statements);
    options += '</ol><svg class="graph" id="answers-' + learningObjectIndex + '-' + interactionIndex + '"></svg ></div>';
    contentDiv.append(options);
    var chart = dash.createBarChart({
        container: '#answers-' + learningObjectIndex + '-' + interactionIndex,
        groupBy: 'result.response',
        aggregate: ADL.count(),
        post: function(data) {

        },
        customize: function(chart) {
            chart.xAxis.axisLabel(XAPI_DASHBOARD_GRAPH_CHOICE_XAXIS);
            chart.yAxis.axisLabel(XAPI_DASHBOARD_GRAPH_CHOICE_YAXIS);
            chart.width(500);
            chart.height(500);
            chart.color(function(d){
                if(d.correct)
                {
                    return "green";
                }
                return "red";

            });
        },
        post : function(data)
        {
            data.contents.map(function(el) {
                el.out *= 1 / statements.length * 100;
            });
            data.contents.forEach(function(d){
                origAnswer = d.in;
                answers = origAnswer.split("[,]");
                updatedAnswers = [];
                answers.forEach(function(a)
                {
                    updatedAnswers.push(choices.map(c => c.id).indexOf(a) + 1);
                })
                d.in = updatedAnswers.join(",");
                d.correct = question.correctResponsesPattern.indexOf(origAnswer) != -1;
            });

        }

    });
    chart.draw();
};

xAPIDashboard.prototype.displayFillInQuestionInformation = function(contentDiv, question, learningObjectIndex, interactionIndex) {
    var learningObjects = this.data.getLearningObjects();
    var interactions = this.data.getInteractions(learningObjects[learningObjectIndex].url);
    var interaction = interactions[interactionIndex];
    var learningObjectUrl = learningObjects[learningObjectIndex].url;
    var interactionObjectUrl = interaction.url;
    contentDiv.append(question.name["en-US"]);
    var options = "<div><ul>";
    question.correctResponsesPattern.forEach(function(option) {
        options += "<li>" + option + "</li>";
    });
    var dash = new ADL.XAPIDashboard();
    var statements = this.data.getQuestionResponses(interactionObjectUrl);
    dash.addStatements(statements);
    options += '</ul><svg class="graph" id="answers-' + learningObjectIndex + '-' + interactionIndex + '"></svg ></div>';
    contentDiv.append(options);
    var chart = dash.createBarChart({
        container: '#answers-' + learningObjectIndex + '-' + interactionIndex,
        groupBy: 'result.response',
        aggregate: ADL.count(),
        customize: function(chart) {
            chart.xAxis.axisLabel(XAPI_DASHBOARD_GRAPH_FILLIN_XAXIS);
            chart.yAxis.axisLabel(XAPI_DASHBOARD_GRAPH_FILLIN_YAXIS);
            chart.width(500);
            chart.height(500);
        }

    });
    chart.draw();
};

xAPIDashboard.prototype.getResultPage = function(div, userdata, learningObject, statement) {
    var classIdentifier = "row-pagecontents-" + learningObject + "-" + this.escapeId(userdata['key']);
    if (statement.result != undefined && statement.result.extensions["http://xerte.org.uk/xapi/trackingstate"] != undefined) {
        var trackingState = JSON.parse(statement.result.extensions["http://xerte.org.uk/xapi/trackingstate"]);
        html = `<div id=` + classIdentifier +
            `>
        <div class="pageContents">

    <div class="pdfContent">
        <h3 class="generalResultsTxt"></h3>
        <table class="general_summary" rules="rows">
            <tr>
                <td class="averageTxt"></td>
                <td><span class="averageScore"></span></td>
            </tr>
            <tr>
                <td class="completionTxt"></td>
                <td><span class="completion"></span></td>
            </tr>
            <tr>
                <td class="startTimeTxt"></td>
                <td><span class="startTime"></span></td>
            </tr>
            <tr>
                <td class="durationTxt1"></td>
                <td><span class="totalDuration"></span></td>
            </tr>
        </table>
        <div class ="specific">
        <h3 class="interactivityResultsTxt"></h3>
        <h3 class="globalResultsTxt"></h3>
        <table class="questionScores" rules="rows">
        </table>
        <br />
        <h3 class="specificResultsTxt">Specific Results</h3>
        <div class="fullResults">

        </div>
        <br />
    </div>
    </div>
</div></div>`;
        div.append(html);
        results.init(classIdentifier, trackingState);
    } else {
        html = "<div></div>";
        div.append(html);
    }

};

xAPIDashboard.prototype.drawSelectRow = function(table, obj, begin, end) {
    var urlArr = obj.url.split('/');
    var row = "<tr><td>" + obj.name + "</td><td><div id='table-graph-" + urlArr[urlArr.length - 1] + "'><svg></svg></div></td></tr>";
    table.append(row);
    var statements = this.data.getStatementsFromLearningObject(obj.url);
    var dash = new ADL.XAPIDashboard();
    dash.addStatements(statements);
    var chart = dash.createLineChart({
        container: '#table-graph-' + urlArr[urlArr.length - 1] + ' svg',
        groupBy: 'timestamp',
        range: {
            start: begin.toISOString(),
            end: end.toISOString(),
            increment: 1000 * 3600 * 24
        },
        aggregate: ADL.count(),
        rangeLabel: 'start',
        customize: function(chart) {
            //chart.width(500);
            //chart.height(250);
            chart.tooltips(false);
            chart.interpolate("monotone");
            chart.xAxis.tickFormat(function(label) {
                return d3.time.format('%b %d')(new Date(label));
            });
        },
        post: function(data) {
            data.contents.map(function(el) {
                el.in = Date.parse(el.in);
            });
        }
    });
    chart.draw();
};


xAPIDashboard.prototype.drawNumberOfSessions = function(elmnt, numberOfSessions) {
    var row = '<div class="col-2-widget col-2"><h5>' + XAPI_DASHBOARD_NUMBER_OF_SESSIONS + '</h5><h2>' + numberOfSessions + '</h2></div>';
    elmnt.append(row);
};

xAPIDashboard.prototype.drawNumberOfCompletedSessions = function(elmnt, completedSessions) {
    var row = '<div class="col-2-widget col-2"><h5>' + XAPI_DASHBOARD_COMPLETED_SESSIONS + '</h5><h2>' + completedSessions + '</h2></div>';
    elmnt.append(row);
};

xAPIDashboard.prototype.drawAverageCompletedPages = function(elmnt, averageCompletedPages) {
    var row = '<div class="col-2-widget col-2"><h5>' + XAPI_DASHBOARD_AVERAGE_COMPLETED_PAGES + '</h5><h2>' + averageCompletedPages + '</h2></div>';
    elmnt.append(row);
};

xAPIDashboard.prototype.drawNumberOfInteractions = function(elmnt, numberOfInteractions) {
    var row = '<div class="col-2-widget col-2"><h5>' + XAPI_DASHBOARD_NUMBER_OF_INTERACTIONS + '</h5><h2>' + numberOfInteractions + '</h2></div>';
    elmnt.append(row);
};

xAPIDashboard.prototype.drawNumberOfUsers = function(elmnt, numberOfUsers) {
    var row = '<div class="col-2-widget col-2"><h5>' + XAPI_DASHBOARD_NUMBER_OF_STUDENTS + '</h5><h2>' + numberOfUsers + '</h2></div>';
    elmnt.append(row);
};

xAPIDashboard.prototype.drawAverageScore = function(elmnt, averageGrade) {
    var row = '<div class="col-2-widget col-2"><h5>' + XAPI_DASHBOARD_AVERAGE_SCORE + '</h5><h2>' + averageGrade + '</h2></div>';
    elmnt.append(row);
};

xAPIDashboard.prototype.drawActivityChart = function(elmnt, begin, end, link = true) {
    var row = "<a id='graph_link_" + this.data.info.template_id + "' href='#'><div id='graph-svg-wrapper-" + this.data.info.template_id +
        "' class='graph-svg-wrapper'><svg></svg></div></a>";
    elmnt.append(row);
    var $this = this;
    if (link) {
        $("#graph_link_" + this.data.info.template_id).click(function() {
            $this.show_dashboard(begin, end)
        });
    }
    var dash = new ADL.XAPIDashboard();
    var launchedStatements = this.data.getStatementsList(this.data.rawData, "http://adlnet.gov/expapi/verbs/launched");
    dash.addStatements(launchedStatements);
    template_id = this.data.info.template_id;
    var vals = [];
    var timeFrame = end.getTime() - begin.getTime();
    var tickmarkDuration = timeFrame / 8;
    //round to nearset day
    var tickMarkNrDays = Math.round(tickmarkDuration / (1000 * 3600 * 24));
    if (tickMarkNrDays < 1)
    {
        tickMarkNrDays = 1;
    }
    var tick = begin.getTime();
    while(tick < end.getTime()) {
        vals.push(tick);
        tick += (tickMarkNrDays * 1000 * 3600 * 24);
    }
    var chart = dash.createLineChart({
        container: '#graph-svg-wrapper-' + this.data.info.template_id + ' svg',
        groupBy: 'timestamp',
        range: {
            start: begin.toISOString(),
            end: end.toISOString(),
            increment: 1000 * 3600 * 24
        },
        aggregate: ADL.count(),
        rangeLabel: 'start',
        customize: function(chart) {

            chart.width($('#graph-svg-wrapper-' + template_id + ' svg').width() - 10);

            chart.height(300);
            chart.tooltips(false);
            chart.interpolate("monotone");
            chart.yAxis.axisLabel(XAPI_ACTIVITY_CHART_YAXIS);

            chart.xAxis.tickFormat(function(label) {
                var date = new Date(label);
                var options = {
                    month: 'short',
                    day: 'numeric'
                };
                var intllabel;
                try {
                    intllabel = new Intl.DateTimeFormat(language_code, options).format(date);
                } catch (e) {
                    intllabel = d3.time.format('%b %d')(date);
                }
                return intllabel;
            });
            chart.xAxis.tickValues(vals);
        },
        post: function(data) {
            data.contents.map(function(el) {
                el.in = Date.parse(el.in);
            });
        }
    });
    chart.draw();
};

function close_dashboard() {
    $this.clear();
    $("#dp-start").unbind("change");
    $("#dp-end").unbind("change");
    $("#dp-unanonymous-view").unbind("change");


    $(".journeyOverviewActivity").html("");
    $("#dashboard-wrapper").hide();
};

xAPIDashboard.prototype.show_dashboard = function(begin, end) {
    var $this = this;
    var until = new Date(end);
    var since = new Date(begin);
    var jquery_language;
    if ($.datepicker.regional[language_code] != undefined) {
        jquery_language = language_code;
    } else {
        jquery_language = language_code.substr(0, 2);
        if ($.datepicker.regional[jquery_language] == undefined) {
            jquery_language = "";
        }
    }
    $.datepicker.setDefaults(
        $.extend({},
            $.datepicker.regional[jquery_language]
        )
    );

    $('#dp-end').val(until.toDateString());

    $('#dp-start').val(since.toDateString());

    $('#dp-start').datepicker({
        onShow: function(ct) {
            this.setOptions({
                maxDate: $('#dp-end').val() ? $('#dp-end').val() : false,
                maxTime: $('#dp-end').val() ? $('#dp-end').val() : false
            })
        },
        timepicker: true
    });
    $('#dp-end').datepicker({
        onShow: function(ct) {
            this.setOptions({
                minDate: $('#dp-start').val() ? $('#dp-start').val() : false,
                minTime: $('#dp-start').val() ? $('#dp-start').val() : false
            })
        },
        timepicker: true
    });
    $('#dp-start').datepicker("setDate", since);
    $('#dp-end').datepicker("setDate", until);

    $("#dp-start").change(function() {
        $this.regenerate_dashboard();
    });

    $("#dp-end").change(function() {
        $this.regenerate_dashboard();
    });

    $("#group-select").change(function(){
        var group = $(this).val();
        if(group == "all-groups")
        {
            $(".session-row").show();
        }else{
            $('.session-row:not([data-group="' + group + '"])').hide();
            $('.session-row[data-group="' + group + '"]').show();
        }
    });

    if (this.data.info.dashboard.enable_nonanonymous == 'true') {
        $(".unanonymous-view").show();
        this.data.info.dashboard.anonymous = true;
        $("#dp-unanonymous-view").change(function(event) {
            $this.data.info.dashboard.anonymous = !$this.data.info.dashboard.anonymous;
            $this.regenerate_dashboard();

        });
    }

    this.regenerate_dashboard();
    $('#dashboard-wrapper').show();
};

xAPIDashboard.prototype.helperGetDate = function(datetimepicker) {
    var mTime = $(datetimepicker).datepicker("getDate");
    if (mTime == "") {
        if (datetimepicker == "#dp-end") {
            return new Date();
        }
        if (datetimepicker == "#dp-start") {
            return new Date('1970-01-01');
        }
    }

    return mTime;
};

xAPIDashboard.prototype.regenerate_dashboard = function() {
    $("#journeyData").html("<img class='loading-gif' src='editor/img/loading16.gif'/>");
    $("#group-select option:not(:first-child)").remove();
    var url = site_url + this.data.info.template_id;
    var start = this.helperGetDate('#dp-start');
    var end = this.helperGetDate('#dp-end');
    end = new Date(moment(end).add(1, 'days').toISOString());
    var q = {};
    if (this.data.info.lrs.lrsurls != null && this.data.info.lrs.lrsurls != "undefined" && this.data.info.lrs.lrsurls != ""
        && this.data.info.lrs.site_allowed_urls != null && this.data.info.lrs.site_allowed_urls != "undefined" && this.data.info.lrs.site_allowed_urls != "")
    {
        q['activities'] = [url].concat(this.data.info.lrs.lrsurls.split(",")).concat(this.data.info.lrs.site_allowed_urls.split(",").map(url => url + this.data.info.template_id)).filter(url => url != "");
    }
    q['activity'] = url;
    q['related_activities'] = true;
    q['since'] = start.toISOString();
    q['until'] = end.toISOString();

    var $this = this;
    this.data.getStatements(q, false, function() {
        $("#journeyData").html("");
        $this.createJourneyTableSession($("#journeyData"));
    });
};

