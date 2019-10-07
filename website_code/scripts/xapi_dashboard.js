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

xAPIDashboard.prototype.getGroupFromStatements = function(statements){
    var cur_group="";
    var first_statement = statements[0];
    if(     first_statement != undefined
        &&  first_statement.context != undefined
        &&  first_statement.context.team != undefined
        &&  first_statement.context.team.account != undefined
    ){
        cur_group = first_statement.context.team.account.name
    }
    return cur_group;
};

xAPIDashboard.prototype.setStatisticsValues = function(base, learningObjectIndex){
    var data = this.data.groupStatements();
    var interactions = this.data.getInteractions(learningObjects[learningObjectIndex].url);
    var first_launch = new Date(moment($('#dp-start').val(), "DD/MM/YYYY").add(-1, 'days').format("YYYY-MM-DD"));
    var last_launch = new Date(moment($('#dp-end').val(), "DD/MM/YYYY").add(1, 'days').format("YYYY-MM-DD"));
    if($('.journeyOverviewActivity').html() == "") {
        this.drawActivityChart(base, $(base + '.journeyOverviewActivity'), first_launch, last_launch, false);
    }

    // Add the number of Users.
    var numberOfUsers = 0;
    var dashboard=this;
    for (var user in data) {
        if($this.currentGroup.group_id == "all-groups" || $this.currentGroup.group_id == dashboard.getGroupFromStatements(data[user].statements)) {
            numberOfUsers++;
        }
    }
    var totalScore = 0;
    var scoreCount = 0;
    for(var i in this.data.groupedData){
        var curUser = this.data.groupedData[i];
        var completedStatements = this.data.getStatementsList(curUser.statements.filter(function(rd){
            return $this.currentGroup.group_id == "all-groups" || $this.currentGroup.group_id == dashboard.getGroupFromStatements([rd]);
        }), "http://adlnet.gov/expapi/verbs/completed");
        if(completedStatements.length > 0)
        {
            totalScore += completedStatements[0].result.score.scaled;
            scoreCount++;
        }
    }
    this.drawNumberOfUsers($(base + '.journeyOverviewStats'), numberOfUsers);
    var sessions = [];
    var totalCompletedPages = 0;
    this.data.rawData.forEach(function(s){
        if($this.currentGroup.group_id == "all-groups" || $this.currentGroup.group_id == dashboard.getGroupFromStatements([s])){
            sessionId = s.context.extensions["http://xerte.org.uk/sessionId"];
            if(sessions.indexOf(sessionId) === -1){
                sessions.push(sessionId);
            }
            if(s.verb.id == "http://adlnet.gov/expapi/verbs/exited"){
                var pages = interactions.filter(function(i){ return i.type == "page" }).map(function(p) {return  p.url});
                if(pages.indexOf(s.object.id) >= 0)
                {
                    totalCompletedPages++;
                }
            }
        }
    });
    // Add the number of launches.

    var launchedStatements = this.data.getStatementsList(this.data.rawData, "http://adlnet.gov/expapi/verbs/launched");
    this.drawNumberOfInteractions($(base + '.journeyOverviewStats'), this.data.rawData.filter(function(rd){
        return $this.currentGroup.group_id == "all-groups" || $this.currentGroup.group_id == dashboard.getGroupFromStatements([rd]);
    }).length);
    this.drawNumberOfSessions($(base + '.journeyOverviewStats'), sessions.length);
    this.drawNumberOfCompletedSessions($(base + '.journeyOverviewStats'), scoreCount);
    this.drawAverageCompletedPages($(base + '.journeyOverviewStats'), Math.round(100 * totalCompletedPages / numberOfUsers) / 100);

    // Add the average grade.
    this.drawAverageScore($(base + '.journeyOverviewStats'), (Math.round((totalScore / scoreCount) * 10 * 10) / 10), first_launch, last_launch);
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
            '<div class="journeyOverview"><div class="journeyOverviewHeader row"><h3>' + XAPI_DASHBOARD_OVERVIEW + '</h3></div><div class="journeyOverviewActivity row"></div><div class="journeyOverviewStats row"></div></div>'
        );
        this.setStatisticsValues(".journeyOverview ", learningObjectIndex);

        leftButton = "<button class='xerte_button_c_no_width page-button' id='pageButtonLeft'>" + XAPI_DASHBOARD_PAGE_PREV + "</button>";
        rightButton = "<button class='xerte_button_c_no_width page-button' id='pageButtonRight'>" + XAPI_DASHBOARD_PAGE_NEXT + "</button>";

        var pageOptions = '<div class="row container-fluid"><span class="col col-md-1 align-self-start">' + leftButton + '</span><span id="page-information" class="col-md-1"></span><span class="col-md-9"></span><span class="col col-md-1 align-self-end">' + rightButton + '</span><br></div>';
        // Add table with specific overview.
        div.append('<div class="row journeyTable">' + pageOptions + '<table class="table table-hover table-bordered table-responsive" id="' + learningObjectIndex +
            '"><thead></thead><tbody id="journeyTableBody"></tbody></table></div>');
        /*
        if(this.data.pageIndex > 0)
        {
            $("#pageButtonLeft").prop("disabled", false).removeClass("diaabled");
        }else{
            $("#pageButtonLeft").prop("disabled", true).addClass("disabled");

        }
        if((this.data.pageIndex+1) * this.data.pageSize < Object.keys(this.data.groupedData).length - 1)
        {
            $("#pageButtonRight").prop("disabled", false).removeClass("diaabled");
        }else{
            $("#pageButtonRight").prop("disabled", true).addClass("disabled");
        }
        */
        div.find("#" + learningObjectIndex + " thead").append("<tr><th>" + XAPI_DASHBOARD_STARTED + "</th><th>" +  XAPI_DASHBOARD_COMPLETED + "</th></tr>");
        if (this.data.info.dashboard.enable_nonanonymous && $("#dp-unanonymous-view").prop('checked')) {
            div.find("#" + learningObjectIndex + " thead tr").prepend('<th>Users</th>');
        }
        for (var interactionIndex in interactions) {
            interactionHeader = this.insertInteractionModal(div, learningObjectIndex, interactionIndex, interactions[interactionIndex]);
        }
        /*
        var redDiv = '<div class="status-indicator status-red">&nbsp;</div>';
        var greenDiv = '<div class="status-indicator status-green">&nbsp;</div>';
        var orangeDiv = '<div class="status-indicator status-orange">&nbsp;</div>';
        var greyDiv = '<div class="status-indicator status-gray">&nbsp;</div>';
        */
        var redDiv = '<i class="status-indicator status-red fa fa-square"></i>';
        var greenDiv = '<i class="status-indicator status-green fa fa-square"></i>';
        var orangeDiv = '<i class="status-indicator status-orange fa fa-square"></i>';
        var greyDiv = '<i class="status-indicator status-gray fa fa-square"></i>';
        $.each(data, function(key, value) {
            console.log(key);
        });
        var userCount = 0;
        for (var user in data) {
            var lastStatements = this.getLastUserAttempt(data[user]);
            group = "";
            if(lastStatements.statements[0].context.team != undefined)
            {
                group = lastStatements.statements[0].context.team.account.name;
            }
            var rowid = "session-" + learningObjectIndex + "-" + this.escapeId(user);
            var row = "<tr data-index='" + userCount + "' class='session-row' id='" + rowid + "' data-group='" + group + "'>";
            userCount++;
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
                started = "<i class=\"status fa fa-x-tick\">";
            } else {
                continue;
            }
            row += "<td>" + started + "</td>";
            if (this.data.hasCompletedLearningObject(lastStatements, learningObjects[learningObjectIndex].url)) {
                completed = "<i class=\"status fa fa-x-tick\">";
            } else {
                completed = "<i class=\"status fa fa-x-cross\">";
            }
            row += "<td>" + completed + "</td>";
            div.find("#journeyTableBody").append(row);
            for (var interactionIndex in interactions) {

                //insertInteractionData(div, colorDiv, user, learningObjectIndex, interactionObjectIndex)
                interaction = interactions[interactionIndex];
                learningObject = learningObjects[learningObjectIndex];
                var tr = div.find('#' + rowid);
                if (this.data.hasPassedInteraction(lastStatements, interaction.url)) {
                    this.insertInteractionData(tr, greenDiv, data[user], learningObjectIndex, interactionIndex);
                } else if (this.data.hasCompletedInteraction(lastStatements, interaction.url)) {
                    this.insertInteractionData(tr, redDiv, data[user], learningObjectIndex, interactionIndex);
                } else if (this.data.hasStartedInteraction(lastStatements, interaction.url)) {
                    this.insertInteractionData(tr, orangeDiv, data[user], learningObjectIndex, interactionIndex);
                } else {
                    this.insertInteractionData(tr, greyDiv, data[user], learningObjectIndex, interactionIndex);
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
        var pageState = this;
        $(".page-button").click(function(e, init){


            if(init){
                $this.groupedDataComplete = $this.groupedData;
            }else{
                $this.groupedData = $this.groupedDataComplete;
            }
            var groupedData = {};
            for($key in $this.groupedData) {
                $val = $this.groupedData[$key];
                if ($this.currentGroup.group_id == "all-groups" || $this.currentGroup.group_id == pageState.getGroupFromStatements($val.statements)) {
                    groupedData[$key] = $val;
                }
            }
            var pageSize = $this.pageSize;
            if(pageSize == -1){
                pageSize = Object.keys(groupedData).length;
            }

            if(e.target.id == "pageButtonLeft" && !init)
            {
                $this.pageIndex = Math.max($this.pageIndex -= pageSize, 0);
            }else if(e.target.id == "pageButtonRight" && !init)
            {
                $this.pageIndex = Math.min($this.pageIndex +=pageSize, Object.keys(groupedData).length - 1);
            }else if(Object.keys(groupedData).length < pageSize){
                $this.pageIndex = 0;
            }

            if($this.pageIndex > 0)
            {
                $("#pageButtonLeft").prop("disabled", false).removeClass("disabled");
            }else{
                $("#pageButtonLeft").prop("disabled", true).addClass("disabled");

            }
            if($this.pageIndex + pageSize < Object.keys(groupedData).length - 1)
            {
                $("#pageButtonRight").prop("disabled", false).removeClass("disabled");
            }else{
                $("#pageButtonRight").prop("disabled", true).addClass("disabled");
            }
            pageState.drawPages($this.pageIndex, pageSize, groupedData);

            var curPage = Math.ceil($this.pageIndex / pageSize) + 1;
            var maxPage = Math.ceil(Object.keys(groupedData).length / pageSize);

            var pageinfo = XAPI_DASHBOARD_PAGE_OF_PAGE;
            pageinfo = pageinfo.replace("{i}", curPage);
            pageinfo = pageinfo.replace("{n}", maxPage);
            $("#page-information").html(pageinfo);

            var first_launch = new Date(moment($('#dp-start').val(), "DD/MM/YYYY").add(-1, 'days').format("YYYY-MM-DD"));
            var last_launch = new Date(moment($('#dp-end').val(), "DD/MM/YYYY").add(1, 'days').format("YYYY-MM-DD"));
            $('.journeyOverviewActivity').html("");
            pageState.drawActivityChart("", $('.journeyOverviewActivity'), first_launch, last_launch, false);


        });
        $("#pageButtonLeft").trigger("click", [true]);

        /* Setup modal question overview */
        $("body").append(
            '<div id="model-question-overview" class="modal fade" role="dialog" >' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +

            '<h4 class="modal-title">Interaction overview</h4>' +
            '<button id="interaction-overview-print" type="button" class="xerte_button_c_no_width">Print</button><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '</div>' +
            '<div class="modal-body col-md-12">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>');



        $("#interaction-overview-print").click(function(e){
            e.preventDefault();
            var currentUrl = window.location.href;
            if(currentUrl.endsWith("#")){
                currentUrl = currentUrl.slice(0, -1);
            }
            if(!currentUrl.endsWith("/")){
                currentUrl = currentUrl + "/";
            }
            var w = window.open();
            var htmlHead = $("head").html();
            var htmlBody = $("#model-question-overview .modal-body").html();
            $(w.document.body).parent().find("head").html(htmlHead);
            $(w.document.body).html("<button id='doprint' type='button' class='xerte_button_c_no_width noprint' onclick='window.print();'>Do print</button><div id='print-overview' class='dashboard'>" + htmlBody + "</div>");

            $(w.document.body).parent().find("link").each(function(l){
                var href = $(this).attr('href');
                if(href.includes("frontpage.css")){
                    $(this).remove();
                }
                if(!href.startsWith("http://") && !href.startsWith("https://")) {
                    $(this).attr("href", currentUrl + href);
                }
            });

            $(w.document.body).find("button").each(function(l){
                $(this).hide();
            });

            $(w.document).find(".noprint").each(function(l){
                $(this).show();
            });

        });



        $(".show-question-overview-button").on('click', function() {
            var drawOverviewCheckbox = $(".hide-show-overview-interaction-overview");
            var drawOverview = drawOverviewCheckbox.length == 0 || drawOverviewCheckbox.is(":checked");

            if(drawOverview){
                $("#model-question-overview .modal-body").html('<div class="journeyOverviewModal"><div class="journeyOverviewHeader row"><h3>' + XAPI_DASHBOARD_OVERVIEW + '</h3></div><div class="journeyOverviewActivityModal row"></div><div class="journeyOverviewStats row"></div></div>');
            }else{
                $("#model-question-overview .modal-body").html('');
            }


            $("#model-question-overview").modal();
            if(drawOverview) {
                pageState.setStatisticsValues(".journeyOverviewModal ", 0);
            }

            var first_launch = new Date(moment($('#dp-start').val(), "DD/MM/YYYY").add(-1, 'days').format("YYYY-MM-DD"));
            var last_launch = new Date(moment($('#dp-end').val(), "DD/MM/YYYY").add(1, 'days').format("YYYY-MM-DD"));


            for(var learningObjectIndex = 0; learningObjectIndex < learningObjects.length; learningObjectIndex++) {
                interactions = pageState.data.getInteractions(learningObjects[learningObjectIndex].url);
                for(var interactionIndex = 0; interactionIndex < interactions.length; interactionIndex++){

                    var contentDiv = $('#model-question-overview .modal-body');
                    interaction = interactions[interactionIndex];
                    jcId = "journey-container-" + learningObjectIndex + "-" + interactionIndex;
                    var block = "";
                    if (interaction.children.length == 0 && interaction.type == "interaction") {
                        block += "<div class='print_block'><h4 class='offset-1'>" + interaction.name + "</h4>";
                    }else{
                        block += "<div class='print_block'><h3>" + interaction.name + "</h3>";
                    }
                    block += '<div class="class-overview-box" id="'+jcId+'"></div>';
                    block += '<hr></div>';
                    contentDiv.append(block);

                    if (interaction.children.length == 0 && interaction.type == "interaction") {
                        contentDiv.find("#" + jcId).addClass("sub-interaction");
                        contentDiv.find("#" + jcId).append("<div class='offset-1 col-5 panel main-information'></div>");
                        var interactionDetails = pageState.data.selectInteractionById(interactions, interaction.url);
                        var statements = pageState.data.getInteractionStatements(interaction.url).filter(function (s) {
                                g = pageState.getGroupFromStatements([s]);
                                cg = pageState.data.currentGroup.group_id;
                                return cg == undefined || cg == "all-groups" || cg == g;
                            }
                        );
                        contentDiv.find("#" + jcId + " div").append('<svg class="graph" id="model-svg-' + learningObjectIndex + '-' + interactionIndex +
                            '"></svg>');
                        pageState.createPieChartInteraction(statements, '#model-question-overview #model-svg-' +
                            learningObjectIndex +
                            '-' + interactionIndex);
                        var question = pageState.data.getQuestion(interactionDetails.url);
                        var pausedStatements = pageState.data.getStatementsList(statements, 'https://w3id.org/xapi/video/verbs/paused');
                        if (question != undefined) {
                            var questionDiv = $("<div class='panel col-6'></div>").appendTo(contentDiv.find("#" + jcId));
                            pageState.displayQuestionInformation(questionDiv, question, learningObjectIndex, interactionIndex);
                        } else if (pausedStatements.length > 0) {
                            var heatmapDiv = $("<div class='panel col-6'></div>").appendTo(contentDiv.find("#" + jcId));
                            pageState.displayHeatmap(heatmapDiv, learningObjectIndex, interactionIndex, pausedStatements);
                        }
                        pageState.displayPageInfo(contentDiv, "#" + jcId + " .main-information", interaction);
                        //getMultipleChoiceQuestion(learningObjects[learningObjectIndex].url, interaction.url);
                    } else {
                        contentDiv.find("#" + jcId).addClass("main-interaction");
                        statements = pageState.data.getInteractionStatements(interaction.url).filter(function (s) {
                                g = pageState.getGroupFromStatements([s]);
                                cg = pageState.data.currentGroup.group_id;
                                return cg == undefined || cg == "all-groups" || cg == g;
                            }
                        );
                        panelDiv = $("<div class='panel col-6'></div>").appendTo(contentDiv.find("#" + jcId));
                        panelDiv.append("<svg class='graph'></svg>");
                        pageState.createPieChartInteraction(statements, '#' + jcId + " svg"); //#model-question-overview svg:last');
                        panelDiv.append('<div class="page-info panel"></div>');
                        pageState.displayPageInfo(contentDiv, "#" + jcId + " .page-info", interaction);
                        childQuestions = interaction.children.map(function (c) {
                            return pageState.data.getQuestion(c);
                        });
                        if (childQuestions.filter(function (q) {
                            return q != undefined && q.interactionType == "choice"
                        }).length == childQuestions.length) {
                            var heatmapDiv = $("<div class='panel col-6'></div>").appendTo(contentDiv.find("#" + jcId));
                            pageState.displayQuizOverview(heatmapDiv, childQuestions);
                        }
                    }

                }

            }
            if(drawOverview) {
                pageState.drawActivityChart(".journeyOverviewModal ", $('.journeyOverviewActivityModal'), first_launch, last_launch, false);
            }

                //debugger;
        });

        $(".dashboard-print-button").on('click', function(e){

            e.preventDefault();
            var currentUrl = window.location.href;
            if(currentUrl.endsWith("#")){
                currentUrl = currentUrl.slice(0, -1);
            }
            if(!currentUrl.endsWith("/")){
                currentUrl = currentUrl + "/";
            }
            var w = window.open();
            var htmlHead = $("head").html();
            var htmlBody = $(".jorneyData-container").html();
            $(w.document.body).parent().find("head").html(htmlHead);
            $(w.document.body).html("<button id='doprint' type='button' class='xerte_button_c_no_width noprint' onclick='window.print();'>Do print</button><div id='print-overview' class='dashboard'>" + htmlBody + "</div>");


            $(w.document.body).parent().find("link").each(function(l){
                var href = $(this).attr('href');
                if(href.includes("frontpage.css")){
                    $(this).remove();
                }
                if(!href.startsWith("http://") && !href.startsWith("https://")) {
                    $(this).attr("href", currentUrl + href);
                }
            });

            $(w.document.body).find("button").each(function(l){
                $(this).hide();
            });
            $(w.document).find(".noprint").each(function(l){
                $(this).show();
            });

            $(w.document.body).find("#journeyData").css("position", "unset");
        });


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
                menu.append("<div><label>" + XAPI_DASHBOARD_DISPLAY_INTERACTION_OVERVIEW + "</label><input class='hide-show-overview-interaction-overview' type='checkbox' checked></div>");
                menu.append("<div><label>" + XAPI_DASHBOARD_PAGE_SIZE + "</label><select id='pageSize'></select></div>");
                pagesizes = [5, 10, 20, 50, 100, "All"];
                defaultSize = $this.pageSize;
                pagesizes.forEach(function(size){
                    var selected = "";
                    if(defaultSize == size || (size == "All" && defaultSize == -1))
                    {
                        selected = "selected"
                    }
                    menu.find("select").append("<option " + selected + " value='" + size + "'>" + size + "</option>");


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
                $("#pageSize").change(function(){
                    $this.pageSize = Number($("#pageSize").val());
                    if(isNaN($this.pageSize))
                    {
                        $this.pageSize = -1;
                    }
                    $(".page-button").trigger("click", [true]);
                    var display_options = JSON.parse($this.info.dashboard.display_options);
                    display_options.pageSize = $this.pageSize;
                    $this.info.dashboard.display_options = JSON.stringify(display_options);
                    $.post("website_code/php/xAPI/update_dashboard_display_properties.php",
                        {
                            "id": $this.info.template_id,
                            "properties" : $this.info.dashboard.display_options
                        },
                        function(data) {
                            }

                    );
                })



            } else {
                //debugger;
                $(this).parent().find('.popover').toggle();
            }



        });




    }
};

xAPIDashboard.prototype.drawPages = function(startingIndex, pageSize, groupedData) {
    var from = startingIndex;
    var pageSize = pageSize;
    var to = Math.min(startingIndex + pageSize, Object.keys(groupedData).length);

    $(".session-row").each(function(row){
        var rowIndex = $(this).data("index");
        if(rowIndex < from || rowIndex >= to){
            $(this).hide();
        }else{
            $(this).show();
        }
    });
}

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
    lastStatements.statements.reverse();
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

xAPIDashboard.prototype.insertInteractionData = function(tr, colorDiv, userdata, learningObjectIndex, interactionObjectIndex) {
    var learningObject = this.data.getLearningObjects()[learningObjectIndex];
    var interactionObject = this.data.getInteractions(learningObject.url)[interactionObjectIndex];
    var interactions = this.data.getInteractions(learningObjects[learningObjectIndex].url);
    var showHide = "column-hide";
    var parentId = -1;
    var $this = this;
    var tdclass;
    if (interactionObject.type == "page" || this.data.selectInteractionById(interactions, interactionObject.parent) == undefined) {
        if (interactionObject.children.length > 0) {
            showHide = "column-show";
        }
        tdclass = "x-dashboard-page";
    } else {
        parentId = this.data.selectInteractionById(interactions, interactionObject.parent).interactionObjectIndex;
        tdclass = "x-dashboard-interaction";
    }
    colorDiv = "<td data-parent='" + parentId + "' class='" + showHide + " " + tdclass + " column-" + interactionObjectIndex + "'><a href='#' id='session-" +
        learningObjectIndex + "-" + this.escapeId(userdata['key']) + "-interaction-" + interactionObjectIndex +
        "' rel='popover' data-placement='left' data-trigger='hover'>" +
        colorDiv + "</a></td>";

    tr.append(colorDiv);
    var title = interactionObject.name;
    if (title == undefined) {
        title = "";
    }
    var max_popover_title = 25;
    if(title.length > max_popover_title)
    {
        title = title.substr(0, max_popover_title - 3) + "...";
    }
    sessionDiv = tr.find("#session-" + learningObjectIndex + "-" + this.escapeId(userdata['key']) + "-interaction-" + interactionObjectIndex);
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
    var colinteractionTitle = interactionTitle;
    var collapseIcon = "";
    var showHide = "hide";
    var parentIndex = "";
    var $this = this;
    var thclass = " ";
    var max_colinteraction_title_length;

    if (interaction.parent == "" || this.data.selectInteractionById(interactions, interaction.parent) == undefined) {
        parentIndex = "-1";
        if (interaction.children.length > 0) {
            showHide = "show";
            collapseIcon = '<div data-interaction="' + interactionIndex + '" class="icon-header icon-hide">&#9701</div>';
            thclass += "x-dashboard-has-children ";
        }
        max_colinteraction_title_length = 15;
        thclass += "x-dashboard-page";
    } else {

        parentIndex = this.data.selectInteractionById(interactions, interaction.parent).interactionObjectIndex;
        thclass += "x-dashboard-interaction";
        max_colinteraction_title_length = 15;
    }
    if(colinteractionTitle.length > max_colinteraction_title_length)
    {
        colinteractionTitle = colinteractionTitle.substr(0, max_colinteraction_title_length - 3) + "...";
    }
    var interactionHeader = '<th data-interaction-index="' + interaction.interactionObjectIndex + '" data-parent="' + parentIndex + '" class="column-' + showHide + thclass +
        '" title="' + interaction.name + '"><a href="#" data-toggle="modal" data-target="#model-' +
        learningObjectIndex + '-' + interactionIndex + '">' + colinteractionTitle + '</a>' + collapseIcon + '</th>';
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
        .on('show.bs.modal', function() {
            var contentDiv =
                $('#model-' + learningObjectIndex + '-' + interactionIndex + ' .modal-body');
            contentDiv.html("");
            interactions = $this.data.getInteractions(learningObjects[learningObjectIndex].url);
            interaction = interactions[interactionIndex];
            contentDiv.append('<div class="journey-container"></div>');
            if (interaction.children.length == 0 && interaction.type == "interaction") {
                contentDiv.find(".journey-container").append("<div class='col-6 panel main-information'></div>");
                var interactionDetails = $this.data.selectInteractionById(interactions, interaction.url);
                var statements = $this.data.getInteractionStatements(interaction.url).filter(function(s){
                        g = $this.getGroupFromStatements([s]);
                        cg = $this.data.currentGroup.group_id;
                        return cg == undefined || cg == "all-groups" || cg == g;
                    }
                );
                contentDiv.find(".journey-container div").append('<svg class="graph" id="model-svg-' + learningObjectIndex + '-' + interactionIndex +
                    '"></svg>');
                $this.createPieChartInteraction(statements, '#model-' + learningObjectIndex + '-' + interactionIndex + ' #model-svg-' +
                    learningObjectIndex +
                    '-' + interactionIndex);
                var question = $this.data.getQuestion(interactionDetails.url);
                if (question != undefined) {
                    var questionDiv = $("<div class='panel col-6'></div>").appendTo(contentDiv.find('.journey-container'));
                    $this.displayQuestionInformation(questionDiv, question, learningObjectIndex, interactionIndex);
                }
                else
                {
                    var pausedStatements = $this.data.getStatementsList(statements, 'https://w3id.org/xapi/video/verbs/paused');
                    if (pausedStatements.length > 0) {
                        var heatmapDiv = $("<div class='panel col-6'></div>").appendTo(contentDiv.find('.container'));
                        $this.displayHeatmap(heatmapDiv, learningObjectIndex, interactionIndex, pausedStatements);
                    }
                }
                $this.displayPageInfo(contentDiv, ".journey-container .main-information", interaction);
                //getMultipleChoiceQuestion(learningObjects[learningObjectIndex].url, interaction.url);
            } else {
                statements = $this.data.getInteractionStatements(interaction.url).filter(function(s){
                        g = $this.getGroupFromStatements([s]);
                        cg = $this.data.currentGroup.group_id;
                        return cg == undefined || cg == "all-groups" || cg == g;
                    }
                );
                panelDiv =  $("<div class='panel col-6'></div>").appendTo(contentDiv.find(".journey-container"));
                panelDiv.append("<svg class='graph'></svg>");
                $this.createPieChartInteraction(statements, '#model-' + learningObjectIndex + '-' + interactionIndex + ' svg');
                panelDiv.append('<div class="page-info panel"></div>');
                $this.displayPageInfo(contentDiv, ".journey-container .page-info", interaction);
                childQuestions = interaction.children.map(function(c){
                    return $this.data.getQuestion(c);
                });
                if(childQuestions.filter(function(q) {return q != undefined && q.interactionType == "choice"}).length == childQuestions.length){
                    var heatmapDiv = $("<div class='panel col-6'></div>").appendTo(contentDiv.find('.journey-container'));
                    $this.displayQuizOverview(heatmapDiv, childQuestions);
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
        videoLength = pausedstatements[0].result.extensions["https://w3id.org/xapi/video/extensions/time"];

    }else{
        videoLength = pausedstatements.map(function(s) { return s.result.extensions["https://w3id.org/xapi/video/extensions/played-segments"]})
            .reduce(function(a,b){ return Math.max(a,b)});
    }
    // Gets all the ranges from the data.
    var stringRanges = pausedstatements.map(function(s) {return s.result.extensions["https://w3id.org/xapi/video/extensions/played-segments"]});
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
            ticksuffix: pausedstatements[0].object.definition.name["en-US"],
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
    var $this = this;
    contentDiv.append("<div class='question-overview'><ul></ul></div>");
    questions.forEach(function(q){
        answerStatements = $this.data.rawData.filter(function(s){
                g = $this.getGroupFromStatements([s]);
                cg = $this.data.currentGroup.group_id;
                return (cg == undefined || cg == "all-groups" || cg == g) && s.object.id == q.interactionUrl && s.verb.id == "http://adlnet.gov/expapi/verbs/answered";
            }
        );
        answers = answerStatements.map(function(s) {return s.result.response});
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
            var rounded = Math.round(current / total * 1000) / 10;
            if(isNaN(rounded)){
                rounded = "0";

            }
            ol.append("<li>" + correct + c.description["en-US"] + " - " + rounded + "%</li>");
        });

    });

};

xAPIDashboard.prototype.displayPageInfo = function(contentDiv, jqLocation, interaction) {
    var $this = this;
    var statements = this.data.getInteractionStatements(interaction.url).filter(function(s){
            g = $this.getGroupFromStatements([s]);
            cg = $this.data.currentGroup.group_id;
            return cg == undefined || cg == "all-groups" || cg == g;
        }
    );
    var started = this.data.getStatementsList(statements, "http://adlnet.gov/expapi/verbs/initialized");
    var completed = this.data.getStatementsList(statements, "http://adlnet.gov/expapi/verbs/exited").concat(
         this.data.getStatementsList(statements, "http://adlnet.gov/expapi/verbs/scored")
    );
    var uniqIds = completed.map(function(s) {return s.actor.mbox_sha1sum} ).filter(function(v, i, a) { return a.indexOf(v) === i});
    started = started.filter(function(v, i, a){
        return a.map(function(s) {return s.actor}).indexOf(v.actor) === i;
    });
    var groupedData = {};
    for($key in $this.data.groupedData) {
        $val = $this.data.groupedData[$key];
        if ($this.data.currentGroup.group_id == "all-groups" || $this.data.currentGroup.group_id == $this.getGroupFromStatements($val.statements)) {
            groupedData[$key] = $val;
        }
    }
    users = Object.keys(groupedData);
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
    var $this = this;
    statements = this.data.getAllScoreStatements(statements).filter(function(s){
            g = $this.getGroupFromStatements([s]);
            cg = $this.data.currentGroup.group_id;
            return cg == undefined || cg == "all-groups" || cg == g;
        }
    );
    var newStatements = jQuery.extend(true, [], statements);
    newStatements.forEach(function(x) {
        if (x.result.score.isScaled == undefined || x.result.score.isScaled == false) {
            x.result.score.isScaled = true;
            x.result.score.scaled *= 100;
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
            end: 100.0,
            increment: 10
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
        case "text":  // Special case for open ansers, see also DashboardState.prototype.getQuestion
            this.displayTextQuestionInformation(contentDiv, question, learningObjectIndex, interactionIndex);
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
    //contentDiv.append(question.name["en-US"]);
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
    pairs = pairs.map(function(x) {return x.split("[.]").join(" <i class=\"fa fa-long-arrow-right\"></i> ")});
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
    options += '<div><svg class="graph" id="answers-' + learningObjectIndex + '-' + interactionIndex + '"></svg ></div></div>';
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
    //contentDiv.append(XAPI_DASHBOARD_QUESTION + " " + question.name["en-US"]);
    var options = "<div>" + XAPI_DASHBOARD_ANSWERS + "<ol>";
    choices = question.choices;
    var dash = new ADL.XAPIDashboard();
    var statements = this.data.getQuestionResponses(interactionObjectUrl);
    var numberOfAnswers = statements.filter(function(s) {return s.result != undefined && s.result.response != undefined}).length;
    question.choices.forEach(function(option) {
        var correct = "";
        if (question.correctResponsesPattern.indexOf(option.id) != -1) {
            correct = "<i class=\"fa fa-x-tick\"></i>";
        } else {
            correct = "<i class=\"fa fa-x-cross\"></i>";
        }
        var percentage = Math.round(1000 * statements.filter(function(s) {return s.result != undefined && s.result.response == option.id}).length / numberOfAnswers) / 10;

        if(isNaN(percentage)){
            percentage = "0";
        }
        options += "<li>" + correct + option.description["en-US"] + " - " + percentage + "%</li>";
    });

    dash.addStatements(statements);
    options += '</ol><div><svg class="graph" id="answers-' + learningObjectIndex + '-' + interactionIndex + '"></svg ></div></div>';
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
                    updatedAnswers.push(choices.map(function(c) { return c.id} ).indexOf(a) + 1);
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
    //contentDiv.append(question.name["en-US"]);
    var options = "<div><ul>";
    question.correctResponsesPattern.forEach(function(option) {
        options += "<li>" + option + "</li>";
    });
    var dash = new ADL.XAPIDashboard();
    var statements = this.data.getQuestionResponses(interactionObjectUrl);
    dash.addStatements(statements);
    options += '</ul><div><svg class="graph" id="answers-' + learningObjectIndex + '-' + interactionIndex + '"></svg ></div></div>';
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

xAPIDashboard.prototype.displayTextQuestionInformation = function(contentDiv, question, learningObjectIndex, interactionIndex) {
    var learningObjects = this.data.getLearningObjects();
    var interactions = this.data.getInteractions(learningObjects[learningObjectIndex].url);
    var interaction = interactions[interactionIndex];
    var learningObjectUrl = learningObjects[learningObjectIndex].url;
    var interactionObjectUrl = interaction.url;
    //contentDiv.append(question.name["en-US"]);
    var statements = this.data.getQuestionResponses(interactionObjectUrl);
    var answers = "<div class='openanwers'><ul>";
    statements.forEach(function(statement){
        if (statement.result.response != undefined && statement.result.response != "") {
            answers += "<li>" + statement.result.response + "</li>";
        }
    });
    answers += "</ul></div>";
    contentDiv.append(answers);
};


xAPIDashboard.prototype.getResultPage = function(div, userdata, learningObject, statement) {
    var classIdentifier = "row-pagecontents-" + learningObject + "-" + this.escapeId(userdata['key']);
    if (statement.result != undefined && statement.result.extensions["http://xerte.org.uk/xapi/trackingstate"] != undefined) {
        var trackingState = JSON.parse(statement.result.extensions["http://xerte.org.uk/xapi/trackingstate"]);
        html = '<div id='  + classIdentifier +
            '>\n' +
        '<div class="pageContents">\n' +

    '<div class="pdfContent">\n' +
    '    <h3 class="generalResultsTxt"></h3>\n' +
    '    <table class="general_summary" rules="rows">\n' +
    '        <tr>\n' +
    '            <td class="averageTxt"></td>\n' +
    '            <td><span class="averageScore"></span></td>\n' +
    '        </tr>\n' +
    '        <tr>\n' +
    '            <td class="completionTxt"></td>\n' +
    '            <td><span class="completion"></span></td>\n' +
    '        </tr>\n' +
    '        <tr>\n' +
    '            <td class="startTimeTxt"></td>\n' +
    '            <td><span class="startTime"></span></td>\n' +
    '        </tr>\n' +
    '        <tr>\n' +
    '            <td class="durationTxt1"></td>\n' +
    '            <td><span class="totalDuration"></span></td>\n' +
    '        </tr>\n' +
    '    </table>\n' +
    '    <div class ="specific">\n' +
    '    <h3 class="interactivityResultsTxt"></h3>\n' +
    '    <h3 class="globalResultsTxt"></h3>\n' +
    '    <table class="questionScores" rules="rows">\n' +
    '    </table>\n' +
    '    <br />\n' +
    '    <h3 class="specificResultsTxt">Specific Results</h3>\n' +
    '    <div class="fullResults">\n' +

    '    </div>\n' +
    '    <br />\n' +
    '</div>\n' +
    '</div>\n' +
'</div></div>\n';
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

xAPIDashboard.prototype.drawActivityChart = function(base, elmnt, begin, end, link) {
    if (link == undefined)
    {
        link = true;
    }
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
    var statements = this.data.rawData.filter(function(s){
            g = $this.getGroupFromStatements([s]);
            cg = $this.data.currentGroup.group_id;
            return cg == undefined || cg == "all-groups" || cg == g;
        }
    );
    var launchedStatements = this.data.getStatementsList(statements, "http://adlnet.gov/expapi/verbs/launched");
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
        container: base + '#graph-svg-wrapper-' + this.data.info.template_id + ' svg',
        groupBy: 'timestamp',
        range: {
            start: begin.toISOString(),
            end: end.toISOString(),
            increment: 1000 * 3600 * 24
        },
        aggregate: ADL.count(),
        rangeLabel: 'start',
        customize: function(chart) {

            chart.width($(base + '#graph-svg-wrapper-' + template_id + ' svg').width() - 10);

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
            chart.color(['#f86718']);
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

    $this.data.pageSize = JSON.parse($this.data.info.dashboard.display_options).pageSize;
    if($this.data.pageSize == undefined)
    {
        $this.data.pageSize = 5;
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
        $("#dp-start").prop("disabled", true);
        $("#dp-end").prop("disabled", true);
        $("#dp-unanonymous-view").prop("disabled", true);
        $this.regenerate_dashboard();
    });

    $("#dp-end").change(function() {
        $("#dp-start").prop("disabled", true);
        $("#dp-end").prop("disabled", true);
        $("#dp-unanonymous-view").prop("disabled", true);
        $this.regenerate_dashboard();
    });

    $("#group-select").change(function(){
        var group = $(this).val();
        $this.data.currentGroup.group_id = group;

        $this.data.pageIndex = 0;
        $(".page-button").eq(0).trigger("click", [false]);
        if(group == "all-groups")
        {
            $(".session-row").show();
        }else{
            $('.session-row:not([data-group="' + group + '"])').hide();
            $('.session-row[data-group="' + group + '"]').show();
        }

        $(".journeyOverviewStats").html("");
        $this.setStatisticsValues(".journeyOverview ", 0);

    });

    if (this.data.info.dashboard.enable_nonanonymous == 'true') {
        $(".unanonymous-view").show();
        this.data.info.dashboard.anonymous = !$("#dp-unanonymous-view").is(":checked");
        $("#dp-unanonymous-view").change(function(event) {
            $this.data.info.dashboard.anonymous = !$("#dp-unanonymous-view").is(":checked");
            $("#dp-start").prop("disabled", true);
            $("#dp-end").prop("disabled", true);
            $("#dp-unanonymous-view").prop("disabled", true);

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
    $("#journeyData").html("<div id=\"loader\"><img id=\"loader_image\" class=\"loading_gif\" src=\"editor/img/loading16.gif\" /><p id=\"loader_text\"></p>");
    $("#group-select option:not(:first-child)").remove();
    this.data.currentGroup.group_id = "all-groups";
    var url = site_url + this.data.info.template_id;
    var start = this.helperGetDate('#dp-start');
    var end = this.helperGetDate('#dp-end');
    end = new Date(moment(end).add(1, 'days').toISOString());
    var q = {};
    q['activities'] = [url];
    if (this.data.info.lrs.lrsurls != null && this.data.info.lrs.lrsurls != "undefined" && this.data.info.lrs.lrsurls != "")
    {
        var $this = this;
        q['activities'] = q['activities'].concat(this.data.info.lrs.lrsurls.split(","));
    }
    if (this.data.info.lrs.site_allowed_urls != null && this.data.info.lrs.site_allowed_urls != "undefined" && this.data.info.lrs.site_allowed_urls != "")
    {
        var $this = this;
        q['activities'] = q['activities'].concat(this.data.info.lrs.site_allowed_urls.split(",").map(function(url) { return url + $this.data.info.template_id})).filter(function(url) {return url != ""});
    }
    q['activity'] = url;
    q['related_activities'] = true;
    q['since'] = start.toISOString();
    q['until'] = end.toISOString();

    var $this = this;
    this.data.getStatements(q, false, function() {
        $("#dp-start").prop("disabled", false);
        $("#dp-end").prop("disabled", false);
        $("#dp-unanonymous-view").prop("disabled", false);
        $("#journeyData").html("");
        $this.createJourneyTableSession($("#journeyData"));
    });
};

