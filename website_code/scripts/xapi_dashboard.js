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

xAPIDashboard.prototype.getStatements = function (q, one, callback, force_xapi=true) {
  this.data.getStatements(q, one, callback, force_xapi);
};
xAPIDashboard.prototype.escapeId = function (id) {
  return id.replace(/[^A-Za-z0-9]/g, "_");
};

xAPIDashboard.prototype.displayFrequencyGraph = function (
  statementidxs,
  element
) {
  if (element == null) {
    element = "#heatmapData";
  }
  $(element).append('<div id="table_overview_graph">' + "<svg></svg></div>");
  var dashstatements = this.data.getStatementsList(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/launched"
  );

  let begin = moment(
    moment(dashstatements[dashstatements.length - 1].timestamp).format(
      "YYYY-MM-DD"
    )
  );
  begin = begin.subtract(1, "day");
  let end = moment(moment(dashstatements[0].timestamp).format("YYYY-MM-DD"));
  end = end.add(1, "day");

  var dash = new ADL.XAPIDashboard();
  dash.addStatements(dashstatements);
  var chart = dash.createLineChart({
    container: "#table_overview_graph svg",
    groupBy: "timestamp",
    range: {
      start: begin.toISOString(),
      end: end.toISOString(),
      increment: 1000 * 3600 * 24,
    },
    aggregate: ADL.count(),
    rangeLabel: "start",
    customize: function (chart) {
      chart.height(200);
      chart.tooltips(false);
      chart.interpolate("monotone");
      chart.xAxis.tickFormat(function (label) {
        return d3.time.format("%b %d")(new Date(label));
      });
    },
    post: function (data) {
      data.contents.map(function (el) {
        el.in = Date.parse(el.in);
      });
    },
  });
  chart.draw();
};

xAPIDashboard.prototype.getGroupFromStatements = function (statementidxs) {
  var cur_group = "";
  var first_statement = this.data.rawData[statementidxs[0]];
  if (
    first_statement != undefined &&
    first_statement.context != undefined &&
    first_statement.context.team != undefined &&
    first_statement.context.team.account != undefined
  ) {
    cur_group = first_statement.context.team.account.name;
  }
  return cur_group;
};

xAPIDashboard.prototype.setStatisticsValues = function (
  base,
  learningObjectIndex
) {
  var $this = this;
  var data = this.data.groupStatements();
  var interactions = this.data.getInteractions(
    this.data.learningObjects[learningObjectIndex].url
  );
  var first_launch = new Date(
    moment($("#dp-start").val(), "DD/MM/YYYY")
      .add(-1, "days")
      .format("YYYY-MM-DD")
  );
  var last_launch = new Date(
    moment($("#dp-end").val(), "DD/MM/YYYY").add(1, "days").format("YYYY-MM-DD")
  );

  // Add the number of Users.
  var numberOfUsers = 0;
  var dashboard = this;
  var totalUserScore = 0;
  var totalSessionScore = 0;
  var completedUserCount = 0;
  var completedSessionCount = 0;
  var completionUserPercentage = 0;
  var completionSessionPercentage = 0;
  var passedUserCount = 0;
  var passedSessionCount = 0;
  var sessionCount = 0;
  var eventCount = 0;
  for (var user in data) {
    if (
      this.data.currentGroup.group_id == "all-groups" ||
      this.data.currentGroup.group_id ==
        dashboard.getGroupFromStatements(data[user].statementidxs)
    ) {
      numberOfUsers++;
      var curUser = this.data.groupedData[user];

      if (curUser["completedstatus"] == "completed") {
        completedUserCount++;
      }
      totalUserScore += curUser["score"] != undefined ? curUser["score"] : 0;
      completionUserPercentage += curUser["completedpercentage"];
      if (curUser["successstatus"] == "passed") {
        passedUserCount++;
      }
      if (curUser["attemptkeys"].length > 0) {
        for (var attempt in curUser["attempts"]) {
          if (curUser["attempts"][attempt]["completedstatus"] == "completed") {
            completedSessionCount++;
          }
          totalSessionScore += curUser["attempts"][attempt]["score"];
          completionSessionPercentage +=
            curUser["attempts"][attempt]["completedpercentage"];
          if (curUser["attempts"][attempt]["successstatus"] == "passed") {
            passedSessionCount++;
          }
        }
      }
      sessionCount += curUser["attemptkeys"].length;
      eventCount += curUser["statementidxs"].length;
    }
  }
  this.userCount = numberOfUsers;
  this.sessionCount = sessionCount;
  /*
    for(var i in this.data.groupedData){
        var curUser = this.data.groupedData[i];
        var completedStatements = this.data.getStatementidxsList(curUser.statementidxs.filter(function(rd){
            return $this.data.currentGroup.group_id == "all-groups" || $this.data.currentGroup.group_id == dashboard.getGroupFromStatements([rd]);
        }), "http://adlnet.gov/expapi/verbs/completed");
        if(completedStatements.length > 0)
        {
            totalScore += this.data.rawData[completedStatements[0]].result.score.scaled;
            scoreCount++;
        }
    }
    this.drawNumberOfUsers($(base + '.journeyOverviewStats'), numberOfUsers);
    var sessions = [];
    var totalCompletedPages = 0;
    this.data.rawDatamap.forEach(function(s){
        if($this.data.currentGroup.group_id == "all-groups" || $this.data.currentGroup.group_id == dashboard.getGroupFromStatements([s])){
            sessionId = $this.data.rawData[s].context.extensions["http://xerte.org.uk/sessionId"];
            if(sessions.indexOf(sessionId) === -1){
                sessions.push(sessionId);
            }
            if($this.data.rawData[s].verb.id == "http://adlnet.gov/expapi/verbs/exited"){
                var pages = interactions.filter(function(i){ return i.type == "page" }).map(function(p) {return  p.url});
                if(pages.indexOf($this.data.rawData[s].object.id) >= 0)
                {
                    totalCompletedPages++;
                }
            }
        }
    });
    // Add the number of launches.

    var launchedStatementidxs = this.data.getStatementidxsList(this.data.rawDatamap, "http://adlnet.gov/expapi/verbs/launched");
    */
  var numberOfUsersDeler = numberOfUsers;
  var completedSessionCountDeler = completedSessionCount;
  var completedUserCountDeler = completedUserCount;
  var sessionCountDeler = sessionCount;
  if (numberOfUsersDeler == 0) numberOfUsersDeler = 1;
  if (completedSessionCountDeler == 0) completedSessionCountDeler = 1;
  if (completedUserCountDeler == 0) completedUserCountDeler = 1;
  if (sessionCountDeler == 0) sessionCountDeler = 1;

  $(base + ".journeyOverviewStats").append(
    '<div class="col statscontainer"></div>'
  );
  this.addStatisticsRow(
    $(base + ".journeyOverviewStats .statscontainer"),
    "users",
    XAPI_DASHBOARD_USERSTATS
  );
  this.drawNumberOfUsers(
    $(base + ".journeyOverviewStats .users"),
    numberOfUsers
  );
  this.drawNumberOfCompletedUsers(
    $(base + ".journeyOverviewStats .users"),
    completedUserCount
  );
  this.drawAverageUserCompletion(
    $(base + ".journeyOverviewStats .users"),
    Math.round((10 * completionUserPercentage) / numberOfUsersDeler) / 10
  );
  this.drawUsersPassed(
    $(base + ".journeyOverviewStats .users"),
    passedUserCount
  );
  // Add the average grade.
  this.drawAverageUserScore(
    $(base + ".journeyOverviewStats .row"),
    Math.round(totalUserScore / numberOfUsersDeler) / 10,
    first_launch,
    last_launch
  );

  this.addStatisticsRow(
    $(base + ".journeyOverviewStats .statscontainer"),
    "sessions",
    XAPI_DASHBOARD_SESSIONSTATS
  );
  //this.drawNumberOfInteractions($(base + '.journeyOverviewStats .sessions'), eventCount);
  this.drawNumberOfSessions(
    $(base + ".journeyOverviewStats .sessions"),
    sessionCount
  );
  this.drawNumberOfCompletedSessions(
    $(base + ".journeyOverviewStats .sessions"),
    completedSessionCount
  );
  //this.drawAverageCompletedPages($(base + '.journeyOverviewStats'), Math.round(100 * totalCompletedPages / numberOfUsers) / 100);
  this.drawAverageSessionCompletion(
    $(base + ".journeyOverviewStats .sessions"),
    Math.round((10 * completionSessionPercentage) / sessionCountDeler) / 10
  );
  this.drawSessionsPassed(
    $(base + ".journeyOverviewStats .sessions"),
    passedSessionCount
  );
  // Add the average grade.
  this.drawAverageSessionScore(
    $(base + ".journeyOverviewStats .sessions"),
    Math.round(totalSessionScore / sessionCountDeler) / 10,
    first_launch,
    last_launch
  );
};

xAPIDashboard.prototype.drawInteraction = function (
  interaction,
  showPageInteraction,
  contentDiv,
  interactions,
  learningObjectIndex,
  interactionIndex,
  localJcId
) {
  let pageState = this;
  let $this = this;
  if (interaction.children.length == 0 && interaction.type == "interaction") {
    contentDiv.find("#" + localJcId).addClass("sub-interaction");
    contentDiv
      .find("#" + localJcId)
      .append(
        `<div id='interaction-container' class='${
          showPageInteraction ? "offset-1 " : ""
        }w-100 container row'><div class='col-6 panel main-information'></div></div>`
      );
    var interactionDetails = pageState.data.selectInteractionById(
      interactions,
      interaction.url
    );

    var statements = $this.data
      .getStatementidxsFromGroupedData(interaction.url)
      .flat()
      .flat();

    var question = pageState.data.getQuestion(interactionDetails.url);
    var pausedStatements = pageState.data.getStatementsList(
      statements,
      "https://w3id.org/xapi/video/verbs/paused"
    );
    if (question != undefined) {
      switch (question.interactionType) {
        case "matching":
        case "choice":
        case "text": // Special case for open ansers, see also DashboardState.prototype.getQuestion
          var questionDiv = $("<div class='panel col-6'></div>");
          $(`#${localJcId} #interaction-container`).append(questionDiv);
          pageState.displayQuestionInformation(
            questionDiv,
            question,
            learningObjectIndex,
            interactionIndex,
            interaction
          );
          break;
        default:
          $(`#${localJcId} .main-information`)
            .removeClass("col-6")
            .addClass("col-12");
          break;
      }
    } else if (pausedStatements.length > 0) {
      var heatmapDiv = $("<div class='panel col-6'></div>").appendTo(
        contentDiv.find("#" + localJcId)
      );
      pageState.displayHeatmap(
        heatmapDiv,
        learningObjectIndex,
        interactionIndex,
        pausedStatements
      );
    }
    if (question != undefined && question.interactionType === "text") {
      // Remove the contentDiv and resize the question div to take the whole screen
      $(`#${localJcId} .main-information`).remove();
      questionDiv.removeClass("col-6").addClass("col-12");
      questionDiv.append(
        '<div class="page-info panel" style="margin-top:1rem"></div>'
      );
      pageState.displayPageInfo(questionDiv, ".page-info", interaction);
    } else {
      contentDiv
        .find("#" + localJcId + " .main-information")
        .append(
          '<svg class="graph" id="model-svg-' +
            learningObjectIndex +
            "-" +
            interactionIndex +
            '"></svg><div class="page-info panel"></div>'
        );
      pageState.createPieChartInteraction(
        statements,
        "#model-svg-" + learningObjectIndex + "-" + interactionIndex
      );
      pageState.displayPageInfo(
        contentDiv,
        "#" + localJcId + " .page-info",
        interaction
      );
    }
    //getMultipleChoiceQuestion(learningObjects[learningObjectIndex].url, interaction.url);
  } else if (showPageInteraction) {
    contentDiv.find("#" + localJcId).addClass("main-interaction");
    statements = $this.data
      .getStatementidxsFromGroupedData(interaction.url)
      .flat()
      .flat();
    panelDiv = $("<div class='panel col-6'></div>").appendTo(
      contentDiv.find("#" + localJcId)
    );
    panelDiv.append("<svg class='graph'></svg>");
    pageState.createPieChartInteraction(statements, "#" + localJcId + " svg"); //#model-question-overview svg:last');
    panelDiv.append('<div class="page-info panel"></div>');
    pageState.displayPageInfo(
      contentDiv,
      "#" + localJcId + " .page-info",
      interaction
    );
    childQuestions = interaction.children.map(function (c) {
      return pageState.data.getQuestion(c);
    });
    if (
      childQuestions.filter(function (q) {
        return q != undefined && q.interactionType == "choice";
      }).length == childQuestions.length
    ) {
      var heatmapDiv = $("<div class='panel col-6'></div>").appendTo(
        contentDiv.find("#" + localJcId)
      );
      pageState.displayQuizOverview(heatmapDiv, childQuestions);
    }
  }
};

xAPIDashboard.prototype.createJourneyTableSession = function (div) {
  var $this = this;
  this.data.rawData = this.data.combineUrls();
  if (this.data.rawData.length == 0) {
    // No statements found
    $("#journeyData").html('<div id="loader"><p id="loader_text"></p></div>');
    $("#loader_text").html(XAPI_DASHBOARD_NO_STATEMENTS_FOUND);
  }
  var learningObjects = this.data.getLearningObjects();
  var data = this.data.groupStatements();
  this.data.getAllInteractions(this.data.rawDatamap);
  this.data.groups.forEach(function (group) {
    $("#group-select").append(
      '<option value="' + group + '">' + group + "</option>"
    );
  });
  for (
    var learningObjectIndex = 0;
    learningObjectIndex < learningObjects.length;
    learningObjectIndex++
  ) {
    //if (learningObjects[learningObjectIndex].url != learningObjectUrl) {
    //    continue;
    //}
    var interactions = this.data.getInteractions(
      learningObjects[learningObjectIndex].url
    );
    // Title should go to #dashboard-title if found
    var titlediv = $("#dashboard-title");
    if (titlediv.length == 0) {
      // Not found -> Place in div
      titlediv = div;
    }
    titlediv.html(
      '<h3 class="header">' +
        learningObjects[learningObjectIndex].name +
        "</h3>"
    );

    // Add statistics above the table.
    div.append(
      '<div class="journeyOverview"><div class="journeyOverviewHeader row"><h3>' +
        XAPI_DASHBOARD_OVERVIEW +
        '</h3></div><div class="journeyOverviewActivity row"></div><div class="journeyOverviewStats row"></div></div>'
    );
    this.setStatisticsValues(".journeyOverview ", learningObjectIndex);

    leftButton =
      "<button class='xerte_button_c_no_width page-button' id='pageButtonLeft'>" +
      XAPI_DASHBOARD_PAGE_PREV +
      "</button>";
    rightButton =
      "<button class='xerte_button_c_no_width page-button' id='pageButtonRight'>" +
      XAPI_DASHBOARD_PAGE_NEXT +
      "</button>";

    var pageOptions =
      '<div class="row container-fluid"><span class="col col-md-1 align-self-start">' +
      leftButton +
      '</span><span id="page-information" class="col-md-1"></span><span class="col-md-9"></span><span class="col col-md-1 align-self-end">' +
      rightButton +
      "</span><br></div>";
    // Add table with specific overview.
    div.append(
      '<div class="row journeyTable">' +
        pageOptions +
        '<table class="table table-hover table-bordered table-responsive" id="' +
        learningObjectIndex +
        '"><thead></thead><tbody id="journeyTableBody"></tbody></table></div>'
    );
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
    div
      .find("#" + learningObjectIndex + " thead")
      .append(
        "<tr><th>" +
          XAPI_DASHBOARD_COMPLETED +
          "</th><th>" +
          XAPI_DASHBOARD_COMPLETION +
          "</th><th>" +
          XAPI_DASHBOARD_SCORE +
          "</th><th>" +
          XAPI_DASHBOARD_PASSED +
          "</th><th>" +
          XAPI_DASHBOARD_STARTCOL +
          "</th><th>" +
          XAPI_DASHBOARD_DURATIONCOL +
          "</th></tr>"
      );
    if (
      this.data.info.dashboard.enable_nonanonymous &&
      $("#dp-unanonymous-view").prop("checked")
    ) {
      div
        .find("#" + learningObjectIndex + " thead tr")
        .prepend("<th></th><th>" + XAPI_DASHBOARD_USERS + "</th>");
    } else {
      div.find("#" + learningObjectIndex + " thead tr").prepend("<th></th>");
    }
    for (var interactionIndex in interactions) {
      interactionHeader = this.insertInteractionModal(
        div,
        learningObjectIndex,
        interactionIndex,
        interactions[interactionIndex]
      );
    }
    /*
        var redDiv = '<div class="status-indicator status-red">&nbsp;</div>';
        var greenDiv = '<div class="status-indicator status-green">&nbsp;</div>';
        var orangeDiv = '<div class="status-indicator status-orange">&nbsp;</div>';
        var greyDiv = '<div class="status-indicator status-gray">&nbsp;</div>';
        */
    var redDiv = '<i class="status-indicator status-red fa fa-square"></i>';
    var blueDiv = '<i class="status-indicator status-blue fa fa-square"></i>';
    var greenDiv = '<i class="status-indicator status-green fa fa-square"></i>';
    var orangeDiv =
      '<i class="status-indicator status-orange fa fa-square"></i>';
    var greyDiv = '<i class="status-indicator status-gray fa fa-square"></i>';
    $.each(data, function (key, value) {
      console.log(key);
    });
    var userCount = 0;
    for (var user in data) {
      if (data[user]["attemptkeys"].length > 0) {
        var usedattempt = data[user]["attemptkeys"][0].key;
        if (typeof data[user]["usedattempt"] != "undefined") {
          usedattempt = data[user]["usedattempt"];
        }
        var summaryUserData = data[user]["attempts"][usedattempt];
        var summaryStatementidxs = summaryUserData["statementidxs"];

        group = "";
        if (
          this.data.rawData[summaryStatementidxs[0]].context.team != undefined
        ) {
          group =
            this.data.rawData[summaryStatementidxs[0]].context.team.account
              .name;
        }
        var rowid =
          "user-" +
          learningObjectIndex +
          "-" +
          this.escapeId(user) +
          "-summary";
        var singleattempt = data[user]["attemptkeys"].length == 1;
        var singleattemptclass = singleattempt ? "disabled" : "";
        var row =
          "<tr data-index='" +
          userCount +
          "' class='session-row summary ' id='" +
          rowid +
          "' data-group='" +
          group +
          "'>";
        row +=
          "<td class='align-left' id='" +
          rowid +
          "-caret'><i class=\"openclose closed summary fa fa-2x fa-caret-right " +
          singleattemptclass +
          '"></i></td>';
        if (
          this.data.info.dashboard.enable_nonanonymous &&
          $("#dp-unanonymous-view").prop("checked")
        ) {
          if (data[user]["mode"] == "username") {
            row +=
              "<td class='name-column align-left'>" +
              data[user]["username"] +
              "</td>";
          } else {
            var actor = this.data.rawData[summaryStatementidxs[0]].actor;
            var group = "";
            if (actor.account != undefined) {
              group =
                " - " +
                this.data.rawData[summaryStatementidxs[0]].actor.account.name;
            }
            row +=
              "<td class='name-column align-left'>" + user + group + "</td>";
          }
        }
        /*
                if (this.data.hasStartedLearningObject(lastStatementidxs, learningObjects[learningObjectIndex].url)) {
                    started = "<i class=\"status fa fa-x-tick\">";
                } else {
                    continue;
                }
                row += "<td>" + started + "</td>";
                if (this.data.hasCompletedLearningObject(lastStatementidxs, learningObjects[learningObjectIndex].url)) {
                    var completed = "<i class=\"status fa fa-x-tick\">";
                } else {
                    var completed = "<i class=\"status fa fa-x-cross\">";
                }
                */
        var completed;
        var skippercentages = false;
        if (data[user]["completedstatus"] == "completed") {
          completed = '<i class="status fa fa-x-tick">';
        } else if (data[user]["completedstatus"] == "incomplete") {
          completed = '<i class="status fa fa-x-inprogress">';
        } else {
          completed = '<i class="status fa fa-minus">';
          skippercentages = true;
        }
        row += "<td class='showresult'>" + completed + "</td>";
        if (skippercentages) {
          row +=
            "<td class='align-center'><i class=\"status fa fa-minus\"></td><td class='align-center'><i class=\"status fa fa-minus\"></td>";
        } else {
          row +=
            "<td class='completion align-right'>" +
            data[user]["completedpercentage"] +
            "%</td><td class='score align-right'>" +
            data[user]["score"] +
            "%</td>";
        }
        if (data[user]["successstatus"] == "passed") {
          var passed = '<i class="status fa fa-x-tick">';
        } else if (data[user]["successstatus"] == "failed") {
          var passed = '<i class="status fa fa-x-cross">';
        } else {
          var passed = '<i class="status fa fa-minus">';
        }
        row += "<td>" + passed + "</td>";
        var start = this.formatStart(data[user]["start"]);
        row += "<td class='start align-right'>" + start + "</td>";
        var duration = this.formatDuration(data[user]["duration"]);
        row += "<td class='duration align-right'>" + duration + "</td>";
        div.find("#journeyTableBody").append(row);
        for (var interactionIndex in interactions) {
          //insertInteractionData(div, colorDiv, user, learningObjectIndex, interactionObjectIndex)
          var interaction = interactions[interactionIndex];
          var learningObject = learningObjects[learningObjectIndex];
          var tr = div.find("#" + rowid);
					if (
						this.data.hasCompletedNotJudgedInteraction(
							summaryStatementidxs,
							interaction.url
						)
					) {
						this.insertInteractionData(
							tr,
							blueDiv,
							summaryUserData,
							learningObjectIndex,
							interactionIndex
						);
          } else if (
            this.data.hasPassedInteraction(
              summaryStatementidxs,
              interaction.url
            )
          ) {
            this.insertInteractionData(
              tr,
              greenDiv,
              summaryUserData,
              learningObjectIndex,
              interactionIndex
            );
          } else if (
            this.data.hasCompletedInteraction(
              summaryStatementidxs,
              interaction.url
            )
          ) {
            this.insertInteractionData(
              tr,
              redDiv,
              summaryUserData,
              learningObjectIndex,
              interactionIndex
            );
          } else if (
            this.data.hasStartedInteraction(
              summaryStatementidxs,
              interaction.url
            )
          ) {
            this.insertInteractionData(
              tr,
              orangeDiv,
              summaryUserData,
              learningObjectIndex,
              interactionIndex
            );
          } else {
            this.insertInteractionData(
              tr,
              greyDiv,
              summaryUserData,
              learningObjectIndex,
              interactionIndex
            );
          }
        }
        row = "</tr>";
        var rows = this.insertCollapse(rowid, div, row);

        div.find("#" + learningObjectIndex + " tbody").append(rows);
        this.handleCollapse(rowid, div, summaryUserData, learningObjectIndex);

        // Output the sessions
        if (data[user]["attemptkeys"].length > 1) {
          for (var attempt in data[user]["attempts"]) {
            var attemptUserData = data[user]["attempts"][attempt];
            var attemptStatementidxs = attemptUserData["statementidxs"];
            group = "";
            if (
              this.data.rawData[attemptStatementidxs[0]].context.team !=
              undefined
            ) {
              group =
                this.data.rawData[attemptStatementidxs[0]].context.team.account
                  .name;
            }
            var attemptrowid =
              "user-" +
              learningObjectIndex +
              "-" +
              this.escapeId(user) +
              "-attempt-" +
              this.escapeId(attempt);
            var collapseClass = "attempt collapse";
            var dataSubIndex = "";
            if (attemptUserData["subattempts"].length > 0) {
              dataSubIndex = " data-subindex='" + attempt + "' ";
            }
            if (attemptUserData["parentattempt"] != null) {
              collapseClass = "subattempt collapse";
              dataSubIndex =
                " data-subindex='" + attemptUserData["parentattempt"] + "' ";
            }
            var row =
              "<tr data-index='" +
              userCount +
              "'" +
              dataSubIndex +
              "class='session-row " +
              collapseClass +
              "' id='" +
              attemptrowid +
              "' data-group='" +
              group +
              "'>";
            if (attempt == usedattempt) {
              if (attemptUserData["parentattempt"] == null) {
                var singlesubattempt =
                  attemptUserData["subattempts"].length == 0;
                var singlesubattemptclass = singlesubattempt ? "disabled" : "";
                row +=
                  "<td class='usedattempt attempt' id='" +
                  attemptrowid +
                  "-subcaret'><i class='openclose closed parent fa fa-2x fa-caret-right usedattempt " +
                  singlesubattemptclass +
                  "'></i></td>";
              }
            } else {
              if (attemptUserData["parentattempt"] == null) {
                var singlesubattempt =
                  attemptUserData["subattempts"].length == 0;
                var singlesubattemptclass = singlesubattempt ? "disabled" : "";
                row +=
                  "<td id='" +
                  attemptrowid +
                  "-subcaret'><i class='openclose closed parent fa fa-2x fa-caret-right " +
                  singlesubattemptclass +
                  "'></i></td>";
              } else {
                row += "<td></td>";
              }
            }
            if (
              this.data.info.dashboard.enable_nonanonymous &&
              $("#dp-unanonymous-view").prop("checked")
            ) {
              row += "<td></td>";
            }
            /*
                        if (this.data.hasStartedLearningObject(lastStatementidxs, learningObjects[learningObjectIndex].url)) {
                            started = "<i class=\"status fa fa-x-tick\">";
                        } else {
                            continue;
                        }
                        row += "<td>" + started + "</td>";
                        if (this.data.hasCompletedLearningObject(lastStatementidxs, learningObjects[learningObjectIndex].url)) {
                            var completed = "<i class=\"status fa fa-x-tick\">";
                        } else {
                            var completed = "<i class=\"status fa fa-x-cross\">";
                        }
                        */
            var completed;
            var skippercentages = false;
            if (attemptUserData["completedstatus"] == "completed") {
              completed = '<i class="status fa fa-x-tick">';
            } else if (attemptUserData["completedstatus"] == "incomplete") {
              completed = '<i class="status fa fa-x-inprogress">';
            } else {
              completed = '<i class="status fa fa-minus">';
              skippercentages = true;
            }
            row += "<td class='showresult'>" + completed + "</td>";
            if (skippercentages) {
              row +=
                "<td class='align-center'><i class=\"status fa fa-minus\"></td><td class='align-center'><i class=\"status fa fa-minus\"></td>";
            } else {
              row +=
                "<td class='completion align-right'>" +
                attemptUserData["completedpercentage"] +
                "%</td><td class='score align-right'>" +
                attemptUserData["score"] +
                "%</td>";
            }
            if (attemptUserData["successstatus"] == "passed") {
              var passed = '<i class="status fa fa-x-tick">';
            } else if (attemptUserData["successstatus"] == "failed") {
              var passed = '<i class="status fa fa-x-cross">';
            } else {
              var passed = '<i class="status fa fa-minus">';
            }
            row += "<td>" + passed + "</td>";
            var start = this.formatStart(attemptUserData["start"]);
            row += "<td class='start align-right'>" + start + "</td>";
            var duration = this.formatDuration(attemptUserData["duration"]);
            row += "<td class='duration align-right'>" + duration + "</td>";
            div.find("#journeyTableBody").append(row);
            for (var interactionIndex in interactions) {
              //insertInteractionData(div, colorDiv, user, learningObjectIndex, interactionObjectIndex)
              var interaction = interactions[interactionIndex];
              var learningObject = learningObjects[learningObjectIndex];
              var tr = div.find("#" + attemptrowid);
              if (
								this.data.hasCompletedNotJudgedInteraction(
									summaryStatementidxs,
									interaction.url
								)
							) {
								this.insertInteractionData(
									tr,
									blueDiv,
									summaryUserData,
									learningObjectIndex,
									interactionIndex
								);
							} else if (
                this.data.hasPassedInteraction(
                  attemptStatementidxs,
                  interaction.url
                )
              ) {
                this.insertInteractionData(
                  tr,
                  greenDiv,
                  attemptUserData,
                  learningObjectIndex,
                  interactionIndex
                );
              } else if (
                this.data.hasCompletedInteraction(
                  attemptStatementidxs,
                  interaction.url
                )
              ) {
                this.insertInteractionData(
                  tr,
                  redDiv,
                  attemptUserData,
                  learningObjectIndex,
                  interactionIndex
                );
              } else if (
                this.data.hasStartedInteraction(
                  attemptStatementidxs,
                  interaction.url
                )
              ) {
                this.insertInteractionData(
                  tr,
                  orangeDiv,
                  attemptUserData,
                  learningObjectIndex,
                  interactionIndex
                );
              } else {
                this.insertInteractionData(
                  tr,
                  greyDiv,
                  attemptUserData,
                  learningObjectIndex,
                  interactionIndex
                );
              }
            }
            row = "</tr>";
            var rows = this.insertCollapse(attemptrowid, div, row);

            div.find("#" + learningObjectIndex + " tbody").append(rows);
            this.handleCollapse(
              attemptrowid,
              div,
              attemptUserData,
              learningObjectIndex
            );
            if (attemptUserData["subattempts"].length > 0) {
              this.handleSubAttemptCollapse(attemptrowid, div);
            }
          }
        }
        if (!singleattempt) {
          this.handleAttemptCollapse(rowid, div);
        }
        userCount++;
      }
    }

    this.applyDisplayOptions(interactions);
    $(".close-results").click(function () {
      $(this).closest(".collapse").collapse("toggle");
    });
    $(".icon-header").click(function () {
      if ($(this).hasClass("icon-hide")) {
        $(this).removeClass("icon-hide");
        $(this).addClass("icon-show");
      } else if ($(this).hasClass("icon-show")) {
        $(this).removeClass("icon-show");
        $(this).addClass("icon-hide");
      }

      interactionIndex =
        $(this)[0].attributes.getNamedItem("data-interaction").value;
      interaction = interactions[interactionIndex];

      var column = $(this)
        .closest("table")
        .find("[data-parent=" + interaction.interactionObjectIndex + "]");
      column.each(function (ci) {
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
    $(".page-button").click(function (e, init) {
      if (init) {
        $this.data.groupedDataComplete = $this.data.groupedData;
      } else {
        $this.data.groupedData = $this.data.groupedDataComplete;
      }
      var groupedData = {};
      for ($key in $this.data.groupedData) {
        $val = $this.data.groupedData[$key];
        if (
          $this.data.currentGroup.group_id == "all-groups" ||
          $this.data.currentGroup.group_id ==
            pageState.getGroupFromStatements($val.statementidxs)
        ) {
          groupedData[$key] = $val;
        }
      }
      var pageSize = $this.data.pageSize;
      if (pageSize == -1) {
        pageSize = Object.keys(groupedData).length;
      }

      if (e.target.id == "pageButtonLeft" && !init) {
        $this.data.pageIndex = Math.max(($this.data.pageIndex -= pageSize), 0);
      } else if (e.target.id == "pageButtonRight" && !init) {
        $this.data.pageIndex = Math.min(
          ($this.data.pageIndex += pageSize),
          Object.keys(groupedData).length - 1
        );
      } else if (Object.keys(groupedData).length < pageSize) {
        $this.data.pageIndex = 0;
      }

      if ($this.data.pageIndex > 0) {
        $("#pageButtonLeft").prop("disabled", false).removeClass("disabled");
      } else {
        $("#pageButtonLeft").prop("disabled", true).addClass("disabled");
      }
      if ($this.data.pageIndex + pageSize < Object.keys(groupedData).length) {
        $("#pageButtonRight").prop("disabled", false).removeClass("disabled");
      } else {
        $("#pageButtonRight").prop("disabled", true).addClass("disabled");
      }
      pageState.drawPages($this.data.pageIndex, pageSize, groupedData);

      var curPage = Math.ceil($this.data.pageIndex / pageSize) + 1;
      var maxPage = Math.ceil(Object.keys(groupedData).length / pageSize);

      var pageinfo = XAPI_DASHBOARD_PAGE_OF_PAGE;
      pageinfo = pageinfo.replace("{i}", curPage);
      pageinfo = pageinfo.replace("{n}", maxPage);
      $("#page-information").html(pageinfo);

      var first_launch = new Date(
        moment($("#dp-start").val(), "DD/MM/YYYY")
          .add(-1, "days")
          .format("YYYY-MM-DD")
      );
      var last_launch = new Date(
        moment($("#dp-end").val(), "DD/MM/YYYY")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
      $(".journeyOverviewActivity").html("");
      pageState.drawActivityChart(
        "",
        $(".journeyOverviewActivity"),
        first_launch,
        last_launch,
        false
      );
    });
    $("#pageButtonLeft").trigger("click", [true]);

    /* Setup modal question overview
     * but only add the div when it is not there yet
     * */
    let modelQuestionOverviewName = "model-question-overview";
    if ($("body").find(`#${modelQuestionOverviewName}`).length === 0) {
      $("body").append(
        `<div id="${modelQuestionOverviewName}" class="modal fade" role="dialog" >` +
          '<div class="modal-dialog">' +
          '<div class="modal-content">' +
          '<div class="modal-header">' +
          '<h4 class="modal-title">Interaction overview</h4>' +
          '<button id="interaction-overview-print" type="button" class="xerte_button_c_no_width">Print</button><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
          "</div>" +
          '<div class="modal-body col-md-12" style="overflow-x: hidden;">' +
          "</div>" +
          "</div>" +
          "</div>" +
          "</div>"
      );
    }

    $("#interaction-overview-print").click(function (e) {
      e.preventDefault();
      var currentUrl = window.location.href;
      if (currentUrl.endsWith("#")) {
        currentUrl = currentUrl.slice(0, -1);
      }
      if (!currentUrl.endsWith("/")) {
        currentUrl = currentUrl + "/";
      }
      var w = window.open();
      var htmlHead = $("head").html();
      var htmlBody = $("#model-question-overview .modal-body").html();
      $(w.document.body).parent().find("head").html(htmlHead);
      $(w.document.body).html(
        "<button id='doprint' type='button' class='xerte_button_c_no_width noprint' onclick='window.print();'>Do print</button><div id='print-overview' class='dashboard'>" +
          htmlBody +
          "</div>"
      );

      $(w.document.body)
        .parent()
        .find("link")
        .each(function (l) {
          var href = $(this).attr("href");
          if (href.includes("frontpage.css")) {
            $(this).remove();
          }
          if (!href.startsWith("http://") && !href.startsWith("https://")) {
            $(this).attr("href", currentUrl + href);
          }
        });

      $(w.document.body)
        .find("button")
        .each(function (l) {
          $(this).hide();
        });

      $(w.document)
        .find(".noprint")
        .each(function (l) {
          $(this).show();
        });
    });

    $(".show-question-overview-button").on("click", function () {
      var drawOverviewCheckbox = $(".hide-show-overview-interaction-overview");
      var drawOverview =
        drawOverviewCheckbox.length == 0 || drawOverviewCheckbox.is(":checked");

      if (drawOverview) {
        $("#model-question-overview .modal-body").html(
          '<div class="journeyOverviewModal"><div class="journeyOverviewHeader row"><h3>' +
            XAPI_DASHBOARD_OVERVIEW +
            '</h3></div><div class="journeyOverviewActivityModal row"></div><div class="journeyOverviewStats row"></div></div>'
        );
      } else {
        $("#model-question-overview .modal-body").html("");
      }

      $("#model-question-overview").modal();
      if (drawOverview) {
        pageState.setStatisticsValues(".journeyOverviewModal ", 0);
      }

      var first_launch = new Date(
        moment($("#dp-start").val(), "DD/MM/YYYY")
          .add(-1, "days")
          .format("YYYY-MM-DD")
      );
      var last_launch = new Date(
        moment($("#dp-end").val(), "DD/MM/YYYY")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );

      $("#model-question-overview").on("shown.bs.modal", function () {
        $(".modal-body > .print_block").remove();
        for (
          var learningObjectIndex = 0;
          learningObjectIndex < learningObjects.length;
          learningObjectIndex++
        ) {
          interactions = pageState.data.getInteractions(
            learningObjects[learningObjectIndex].url
          );
          for (
            var interactionIndex = 0;
            interactionIndex < interactions.length;
            interactionIndex++
          ) {
            let interaction = interactions[interactionIndex];
            let showPageInteraction =
              interactions.filter(
                (inter) =>
                  interaction.children.includes(inter.url) &&
                  inter.type === "interaction"
              ).length > 1;
            //let showPageInteraction =
            //  interactions.filter(
            //    (interaction) => interaction.type === "interaction"
            //  ).length > 1;
            var contentDiv = $("#model-question-overview .modal-body");
            interaction = interactions[interactionIndex];
            jcId =
              "journey-container-" +
              learningObjectIndex +
              "-" +
              interactionIndex;
            var block = "";
            if (
              interaction.children.length === 0 &&
              interaction.type === "interaction" &&
              showPageInteraction
            ) {
              block += `<div class='print_block'><div class='offset-1 container'><h4>${interaction.name}</h4></div>`;
            } else if (interaction.type === "page" && showPageInteraction) {
              block += `<div class='print_block'><div class='container'><h4>${interaction.name}</h4></div>`;
            } else if (
              interaction.type === "interaction" &&
              !showPageInteraction
            ) {
              block += `<div class='print_block'><div class='container'><h4>${
                //interactions.filter(
                //  (interaction) => interaction.type === "page"
                //)[0].name
                interaction.name
              }</h4></div>`;
            }
            block += `<div class="class-overview-box" id="${jcId}"></div>`;
            block += `${
              !showPageInteraction && interaction.type === "page" ? "" : "<hr>"
            }</div>`;
            contentDiv.append(block);
            pageState.drawInteraction(
              interaction,
              showPageInteraction,
              contentDiv,
              interactions,
              learningObjectIndex,
              interactionIndex,
              jcId
            );
          }
        }
        if (drawOverview) {
          $(".journeyOverviewActivityModal").empty();
          pageState.drawActivityChart(
            ".journeyOverviewModal ",
            $(".journeyOverviewActivityModal"),
            first_launch,
            last_launch,
            false
          );
        }
      });
    });

    $(".dashboard-print-button").on("click", function (e) {
      e.preventDefault();
      var currentUrl = window.location.href;
      if (currentUrl.endsWith("#")) {
        currentUrl = currentUrl.slice(0, -1);
      }
      if (!currentUrl.endsWith("/")) {
        currentUrl = currentUrl + "/";
      }
      var w = window.open();
      var htmlHead = $("head").html();
      var htmlBody = $(".jorneyData-container").html();
      $(w.document.body).parent().find("head").html(htmlHead);
      $(w.document.body).html(
        "<button id='doprint' type='button' class='xerte_button_c_no_width noprint' onclick='window.print();'>Do print</button><div id='print-overview' class='dashboard'>" +
          htmlBody +
          "</div>"
      );

      $(w.document.body)
        .parent()
        .find("link")
        .each(function (l) {
          var href = $(this).attr("href");
          if (href.includes("frontpage.css")) {
            $(this).remove();
          }
          if (!href.startsWith("http://") && !href.startsWith("https://")) {
            $(this).attr("href", currentUrl + href);
          }
        });

      $(w.document.body)
        .find("button")
        .each(function (l) {
          $(this).hide();
        });
      $(w.document)
        .find(".noprint")
        .each(function (l) {
          $(this).show();
        });

      $(w.document.body).find("#journeyData").css("position", "unset");
    });

    $(".show-display-options-button").unbind("click");
    $(".show-display-options-button").popover("dispose");
    $(".show-display-options-button").on("click", function () {
      if (
        typeof $(this).data("bs.popover") == "undefined" ||
        $(this).data("bs.popover") == undefined
      ) {
        // Init the popover and show immediately
        var menu = $(
          "<div><h5>" + XAPI_DASHBOARD_DISPLAY_COLUMNS + "</h5><ul></ul></div>"
        );
        interactions.forEach(function (i) {
          if (i.type == "page") {
            header = $(
              "th[data-interaction-index=" + i.interactionObjectIndex + "]"
            );
            isVisible = header.is(":visible");
            checked = "";
            if (isVisible) {
              checked = "checked";
            }
            menu
              .find("ul")
              .append(
                "<li><input class='hide-show-column-checkbox' type='checkbox' " +
                  checked +
                  " data-target='" +
                  i.interactionObjectIndex +
                  "'>" +
                  i.name +
                  "</li>"
              );
          }
        });

        menu.append("<h5>" + XAPI_DASHBOARD_DISPLAY_OVERVIEW + "</h5>");
        menu.append(
          "<div><label>" +
            XAPI_DASHBOARD_DISPLAY_OVERVIEW +
            "</label><input class='hide-show-overview' type='checkbox' checked></div>"
        );
        menu.append(
          "<div><label>" +
            XAPI_DASHBOARD_DISPLAY_INTERACTION_OVERVIEW +
            "</label><input class='hide-show-overview-interaction-overview' type='checkbox' checked></div>"
        );
        menu.append(
          "<div><label>" +
            XAPI_DASHBOARD_PAGE_SIZE +
            "</label><select id='pageSize'></select></div>"
        );
        var pagesizes = [5, 10, 20, 50, 100, XAPI_DASHBOARD_PAGE_SIZE_ALL];
        var defaultSize = $this.data.pageSize;
        pagesizes.forEach(function (size) {
          var selected = "";
          if (defaultSize == size || (size == "All" && defaultSize == -1)) {
            selected = "selected";
          }
          menu
            .find("select")
            .append(
              "<option " +
                selected +
                " value='" +
                size +
                "'>" +
                size +
                "</option>"
            );
        });

        $(".show-display-options-button")
          .popover({
            content: menu.html(),
            html: true,
            placement: "bottom",
            trigger: "click",
            container: $(".show-display-options-button").parent(),
          })
          .popover("show");

        $(".show-display-options-button").on("show.bs.popover", function () {
          return false;
        });

        // Same for hide, don't let parent execute
        $(".show-display-options-button").on("hide.bs.popover", function () {
          return false;
        });

        //$(".hide-show-column-checkbox").unbind("click");
        $(".hide-show-column-checkbox").change(function () {
          var checkbox = $(this);
          var target = checkbox.data("target");
          var checked = checkbox.is(":checked");
          var targetHeader = $("th[data-interaction-index=" + target + "]");
          var targetIndex = targetHeader.index() + 1;
          var column = $(
            ".journeyData td:nth-child(" +
              targetIndex +
              "),.journeyData th:nth-child(" +
              targetIndex +
              ")"
          );
          var subQuestionToggle = targetHeader.find("div");
          if (checked) {
            column.show();
          } else {
            column.hide();
          }
          if (subQuestionToggle.hasClass("icon-show")) {
            subQuestionToggle.click();
          }
          var display_options = JSON.parse(
            $this.data.info.dashboard.display_options
          );
          if (typeof display_options.columns == "undefined") {
            display_options.columns = [];
          }
          display_options.columns[targetIndex - 1] = checked;
          $this.data.info.dashboard.display_options =
            JSON.stringify(display_options);
          $.post(
            "website_code/php/xAPI/update_dashboard_display_properties.php",
            {
              id: $this.data.info.template_id,
              properties: $this.data.info.dashboard.display_options,
            },
            function (data) {}
          );
        });

        $(".hide-show-overview").change(function () {
          $(".journeyOverview").toggle();
        });
        $("#pageSize").change(function () {
          $this.data.pageSize = Number($("#pageSize").val());
          if (isNaN($this.data.pageSize)) {
            $this.data.pageSize = -1;
          }
          $(".page-button").trigger("click", [true]);
          var display_options = JSON.parse(
            $this.data.info.dashboard.display_options
          );
          display_options.pageSize = $this.data.pageSize;
          $this.data.info.dashboard.display_options =
            JSON.stringify(display_options);
          $.post(
            "website_code/php/xAPI/update_dashboard_display_properties.php",
            {
              id: $this.data.info.template_id,
              properties: $this.data.info.dashboard.display_options,
            },
            function (data) {}
          );
        });
      } else {
        $(this).parent().find(".popover").toggle();
      }
    });
  }
};

xAPIDashboard.prototype.applyDisplayOptions = function (interactions) {
  var display_options = JSON.parse(this.data.info.dashboard.display_options);
  for (var interactionIndex in interactions) {
    var targetHeader = $("th[data-interaction-index=" + interactionIndex + "]");
    var targetIndex = targetHeader.index() + 1;
    var column = $(
      ".journeyData td:nth-child(" +
        targetIndex +
        "),.journeyData th:nth-child(" +
        targetIndex +
        ")"
    );
    if (
      typeof display_options.columns != "undefined" &&
      typeof display_options.columns[targetIndex - 1] != "undefined"
    ) {
      if (display_options.columns[targetIndex - 1] === true) {
        column.show();
      } else {
        column.hide();
      }
    }
  }
};

xAPIDashboard.prototype.formatDuration = function (duration) {
  var dm = moment.duration(duration, "seconds");
  var days = dm.days();
  if (days > 0) {
    return "> 1" + XAPI_DASHBOARD_DAYCODE;
  } else {
    var hours = dm.hours() + "";
    var minutes = dm.minutes() + "";
    if (minutes.length < 2) minutes = "0" + minutes;
    var seconds = dm.seconds() + "";
    if (seconds.length < 2) seconds = "0" + seconds;

    if (dm.hours() > 0) return hours + ":" + minutes + ":" + seconds;
    else return minutes + ":" + seconds;
  }
};

xAPIDashboard.prototype.formatStart = function (start) {
  var sd = moment(start);
  return sd.format("YYYY-MM-DD HH:mm:ss");
};

xAPIDashboard.prototype.drawPages = function (
  startingIndex,
  pageSize,
  groupedData
) {
  var from = startingIndex;
  var pageSize = pageSize;
  var to = Math.min(startingIndex + pageSize, Object.keys(groupedData).length);

  let counter = 0;
  $(".session-row").each((_, row) => {
    // TODO: TOR: the follwoing does NOT work in general, so filetering on groups is broken for now
    /*
    if (
      $(row).data("group-selected") ||
      $(row).data("group-selected") === undefined
    ) {
      $(row).data("index", counter);
      counter += 1;
    } else {
      $(row).data("index", -1);
    }
    */
    var rowIndex = $(row).data("index");
    if (rowIndex < from || rowIndex >= to) {
      $(row).addClass("hide");
      //$(row).css("display", "none");
    } else {
      $(row).removeClass("hide");
      //$(row).css("display", "table-row");
    }
  });
};

xAPIDashboard.prototype.insertCollapse = function (rowid, div, rows) {
  var numberOfColumns = div.find("th").length;
  rows +=
    "<tr class='collapse' id='collapse-" +
    rowid +
    "'><td colspan='" +
    numberOfColumns +
    "'><div>";
  rows +=
    '<div><span><button type="button" class="close-results xerte_button_c_no_width">' +
    XAPI_DASHBOARD_CLOSERESULTS +
    "</button></span></i></div>";
  rows += "<div class='card card-inverse' data-empty='true'>";
  rows += "</div>";
  rows += "</div></td></tr>";

  return rows;
};

xAPIDashboard.prototype.handleAttemptCollapse = function (rowid, div) {
  var $this = this;
  $("#" + rowid + "-caret").click(function (e) {
    var summarycaret = $("#" + rowid + "-caret  .openclose");

    if (summarycaret.hasClass("closed")) {
      summarycaret.removeClass("closed");
      summarycaret.removeClass("fa-caret-right");
      summarycaret.addClass("open");
      summarycaret.addClass("fa-caret-down");
    } else {
      summarycaret.removeClass("open");
      summarycaret.removeClass("fa-caret-down");
      summarycaret.addClass("closed");
      summarycaret.addClass("fa-caret-right");
    }
    var summaryrow = $("#" + rowid);
    var index = summaryrow.data("index");
    var targets = div.find("tr[data-index=" + index + "].attempt");
    targets.collapse("toggle");
    // close subtargets and reset subcarets
    var subtargets = div.find("tr[data-index=" + index + "].subattempt");
    subtargets.collapse("hide");
    var subcarets = div.find(
      "tr[data-index=" + index + "].attempt td i.openclose"
    );
    subcarets
      .removeClass("open")
      .removeClass("fa-caret-down")
      .addClass("closed")
      .addClass("fa-caret-right");
  });
};
xAPIDashboard.prototype.handleSubAttemptCollapse = function (rowid, div) {
  $("#" + rowid + "-subcaret").click(function (e) {
    var subcaret = $("#" + rowid + "-subcaret  .openclose");

    if (subcaret.hasClass("closed")) {
      subcaret.removeClass("closed");
      subcaret.removeClass("fa-caret-right");
      subcaret.addClass("open");
      subcaret.addClass("fa-caret-down");
    } else {
      subcaret.removeClass("open");
      subcaret.removeClass("fa-caret-down");
      subcaret.addClass("closed");
      subcaret.addClass("fa-caret-right");
    }
    var subparentrow = $("#" + rowid);
    var index = subparentrow.data("subindex");
    var targets = div.find("tr[data-subindex=" + index + "].subattempt");
    targets.collapse("toggle");
  });
};

xAPIDashboard.prototype.handleCollapse = function (
  rowid,
  div,
  userdata,
  learningObjectIndex
) {
  var $this = this;
  div
    .find(`#${rowid} .showresult`, `#collapse-${rowid} .close-results`)
    .click(function (e) {
      var target = $("#collapse-" + rowid);
      if (target.find(".card")[0].attributes["data-empty"].value == "true") {
        $this.getExtraUserData(
          rowid,
          target.find(".card"),
          userdata,
          learningObjectIndex
        );
        target.find(".card")[0].attributes["data-empty"].value = "false";
      }
      target.collapse("toggle");
    });
};

xAPIDashboard.prototype.getExtraUserData = function (
  rowid,
  div,
  userdata,
  objIdx
) {
  var statementidxs = this.data.getStatementidxsList(
    userdata["statementidxs"],
    "http://adlnet.gov/expapi/verbs/exited"
  );
  var statement = undefined;
  if (statementidxs[0] != undefined) {
    statement = this.data.rawData[statementidxs[0]];
  } else {
    var learningObjects = this.data.getLearningObjects();
    var url = learningObjects[objIdx].url;
    // Try to find exited
    statementidxs = this.data.getExitedStatements(userdata.statementidxs, url);
    if (statementidxs[0] != undefined) {
      statement = this.data.rawData[statementidxs[0]];
    }
  }
  if (
    statement == undefined ||
    statement.result == undefined ||
    statement.result.extensions == undefined ||
    statement.result.extensions["http://xerte.org.uk/xapi/trackingstate"] ==
      undefined
  ) {
    rows = "";
    rows +=
      XAPI_DASHBOARD_STARTINGTIME +
      " " +
      moment(this.userStartTime(userdata, objIdx)).format(
        "YYYY-MM-DD HH:mm:ss"
      ) +
      "<br>";
    rows +=
      XAPI_DASHBOARD_COMPLETETIME +
      " " +
      moment(this.userCompleteTime(userdata, objIdx)).format(
        "YYYY-MM-DD HH:mm:ss"
      ) +
      "<br>";
    rows +=
      XAPI_DASHBOARD_DURATION +
      " " +
      this.userDuration(userdata, objIdx) +
      "<br>";
    div.append(rows);
    return;
  }
  this.getResultPage(rowid, div, userdata, objIdx, statement);
};

xAPIDashboard.prototype.userStartTime = function (userdata, learningObject) {
  var statements = userdata["statements"];
  var statement = this.data.getStatement(
    statements,
    "http://adlnet.gov/expapi/verbs/launched"
  );
  if (statement == undefined) {
    return " " + XAPI_DASHBOARD_NOTYETSTARTED;
  }
  return new Date(statement.timestamp);
};

xAPIDashboard.prototype.userCompleteTime = function (userdata, learningObject) {
  statements = userdata["statements"];
  statement = this.data.getStatement(
    statements,
    "http://adlnet.gov/expapi/verbs/exited"
  );
  if (statement == undefined) {
    return " " + XAPI_DASHBOARD_NOTYETFINISHED;
  }
  return new Date(statement.timestamp);
};

xAPIDashboard.prototype.userDuration = function (userdata, learningObject) {
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

xAPIDashboard.prototype.insertInteractionData = function (
  tr,
  colorDiv,
  userdata,
  learningObjectIndex,
  interactionObjectIndex
) {
  var learningObject = this.data.getLearningObjects()[learningObjectIndex];
  var interactionObject = this.data.getInteractions(learningObject.url)[
    interactionObjectIndex
  ];
  var interactions = this.data.getInteractions(
    this.data.learningObjects[learningObjectIndex].url
  );
  var showHide = "column-hide";
  var parentId = -1;
  var $this = this;
  var tdclass;
  if (
    interactionObject.type == "page" ||
    this.data.selectInteractionById(interactions, interactionObject.parent) ==
      undefined
  ) {
    if (interactionObject.children.length > 0) {
      showHide = "column-show";
    }
    tdclass = "x-dashboard-page";
  } else {
    parentId = this.data.selectInteractionById(
      interactions,
      interactionObject.parent
    ).interactionObjectIndex;
    tdclass = "x-dashboard-interaction";
  }
  colorDiv =
    "<td data-parent='" +
    parentId +
    "' class='" +
    showHide +
    " " +
    tdclass +
    " column-" +
    interactionObjectIndex +
    "'><a href='#' id='session-" +
    learningObjectIndex +
    "-" +
    this.escapeId(userdata["key"]) +
    "-interaction-" +
    interactionObjectIndex +
    "' rel='popover' data-placement='left' data-trigger='hover'>" +
    colorDiv +
    "</a></td>";

  tr.append(colorDiv);
  var title = interactionObject.name;
  if (title == undefined) {
    title = "";
  }
  var max_popover_title = 25;
  if (title.length > max_popover_title) {
    title = title.substr(0, max_popover_title - 3) + "...";
  }
  sessionDiv = tr.find(
    "#session-" +
      learningObjectIndex +
      "-" +
      this.escapeId(userdata["key"]) +
      "-interaction-" +
      interactionObjectIndex
  );
  sessionDiv.popover({
    content:
      "<div id='popover-" +
      learningObjectIndex +
      "-session-" +
      $this.escapeId(userdata["key"]) +
      "-interaction-" +
      interactionObjectIndex +
      "'></div>",
    title: title,
    html: true,
  });
  sessionDiv.on("inserted.bs.popover", function (e) {
    elem = $(
      "#popover-" +
        learningObjectIndex +
        "-session-" +
        $this.escapeId(userdata["key"]) +
        "-interaction-" +
        interactionObjectIndex
    );
    if (elem.html() == "") {
      elem.append(
        $this.popoverData(userdata, learningObjectIndex, interactionObjectIndex)
      );
    }
  });
};

xAPIDashboard.prototype.popoverData = function (
  userdata,
  learningObjectIndex,
  interactionObjectIndex
) {
  var learningObject = this.data.getLearningObjects()[learningObjectIndex];
  var interactions = this.data.getInteractions(
    this.data.learningObjects[learningObjectIndex].url
  );
  var interactionObject = interactions[interactionObjectIndex];
  var html =
    XAPI_JOURNEY_POPOVER_STATUS +
    " " +
    this.interactionStatus(userdata, interactionObject.url) +
    "<br>";

  var started = this.data.getFilteredStatements(
    userdata.statementidxs,
    "http://adlnet.gov/expapi/verbs/initialized",
    interactionObject.url
  );
  var scores = this.data.getAllInteractionScores(
    userdata.statementidxs,
    interactionObject.url
  );
  var durations = this.data.getAllDurations(
    userdata.statementidxs,
    interactionObject.url
  );
  var lastAnswer = this.data.getAnswers(
    userdata.statementidxs,
    interactionObject.url
  );
  var lastStatementidxs = [];
  lastStatementidxs = userdata.statementidxs;

  html += XAPI_JOURNEY_POPOVER_NRTRIES + " " + started.length + "<br>";
  if (scores.length == 1) {
    html +=
      XAPI_JOURNEY_POPOVER_GRADE +
      " " +
      Math.round(scores[0] * 10000) / 100 +
      "%<br>";
  } else if (scores.length > 1) {
    html +=
      XAPI_JOURNEY_POPOVER_AVGGRADE +
      " " +
      Math.round(
        100 *
          (scores.reduce(function (a, b) {
            return a + b;
          }) /
            scores.length),
        2
      ) +
      "%<br>";

    var last_score = this.data.getAllInteractionScores(
      lastStatementidxs,
      interactionObject.url
    )[0];

    html +=
      XAPI_JOURNEY_POPOVER_LAST_GRADE +
      " " +
      Math.round(last_score * 10000) / 100 +
      "%<br>";
  }
  var durationBlocks = [];
  if (interactionObject.url.endsWith("/video")) {
    durationBlocks = this.data.getDurationBlocks(
      userdata.statementidxs,
      interactionObject.url.substring(
        0,
        interactionObject.url.length - "/video".length
      )
    );
  }
  if (durations.length == 1) {
    html +=
      XAPI_JOURNEY_POPOVER_DURATION +
      " " +
      Math.round(durations[0] * 100) / 100 +
      XAPI_JOURNEY_POPOVER_DURATION_UNIT +
      "<br>";
  } else if (durations.length > 1) {
    html +=
      XAPI_JOURNEY_POPOVER_AVGDURATION +
      " " +
      Math.round(
        durations.reduce(function (a, b) {
          return a + b;
        }) / durations.length,
        2
      ) +
      XAPI_JOURNEY_POPOVER_DURATION_UNIT +
      "<br>";
    var last_duration = this.data.getAllDurations(
      lastStatementidxs,
      interactionObject.url
    )[0];
    html +=
      XAPI_JOURNEY_POPOVER_LAST_DURATION +
      " " +
      Math.round(last_duration * 100) / 100 +
      XAPI_JOURNEY_POPOVER_DURATION_UNIT +
      "<br>";
  }
  if (durationBlocks.length > 0) {
    html += "Overview of intervals:<ul>";
    durationBlocks.forEach(function (block) {
      html +=
        "<li>" +
        block.start +
        XAPI_JOURNEY_POPOVER_DURATION_UNIT +
        " - " +
        block.end +
        XAPI_JOURNEY_POPOVER_DURATION_UNIT +
        "</li>";
    });
    html + "</ul>";
  }
  if (lastAnswer.length > 0) {
    // Format a bit
    var lastanswer = lastAnswer[0];
    if (
      lastanswer.indexOf("[.]") != false ||
      lastanswer.indexOf("[,]") != false
    ) {
      if (lastanswer.length > 23) {
        lastanswer = lastanswer.substr(0, 20) + "...";
      }
      if (lastanswer.indexOf("[,]") != false) {
        lastanswer = "<br>&nbsp;    " + lastanswer;
      }
      lastanswer = lastanswer.replace(
        /\[\.\]/g,
        ' <i class="fa fa-long-arrow-right"></i> '
      );
      lastanswer = lastanswer.replace(/\[,\]/g, "<br>&nbsp;    ");

      html += XAPI_JOURNEY_POPOVER_LASTANSWER + " " + lastanswer;
    }
  }
  return html;
};

xAPIDashboard.prototype.interactionStatus = function (
  user,
  interactionObjectUrl
) {
  if (
    this.data.hasPassedInteraction(user.statementidxs, interactionObjectUrl)
  ) {
    return XAPI_DASHBOARD_STATUS_COMPLETED_PASSED;
  } else if (
    this.data.hasCompletedInteraction(user.statementidxs, interactionObjectUrl)
  ) {
    return XAPI_DASHBOARD_STATUS_COMPLETED_NOTPASSED;
  } else if (
    this.data.hasStartedInteraction(user.statementidxs, interactionObjectUrl)
  ) {
    return XAPI_DASHBOARD_STATUS_STARTED_NOTCOMPLETED;
  } else {
    return XAPI_DASHBOARD_STATUS_NOTSTARTED;
  }
};

xAPIDashboard.prototype.insertInteractionModal = function (
  div,
  learningObjectIndex,
  interactionIndex,
  interaction
) {
  var learningObjects = this.data.getLearningObjects();
  var interactions = this.data.getInteractions(
    learningObjects[learningObjectIndex].url
  );
  var interaction = interactions[interactionIndex];
  var interactionTitle = interaction.name;
  var colinteractionTitle = interactionTitle;
  var collapseIcon = "";
  var showHide = "hide";
  var parentIndex = "";
  var $this = this;
  var thclass = " ";
  var max_colinteraction_title_length;

  if (
    interaction.parent == "" ||
    this.data.selectInteractionById(interactions, interaction.parent) ==
      undefined
  ) {
    parentIndex = "-1";
    if (interaction.children.length > 0) {
      showHide = "show";
      collapseIcon =
        '<div data-interaction="' +
        interactionIndex +
        '" class="icon-header icon-hide">&#9701</div>';
      thclass += "x-dashboard-has-children ";
    }
    max_colinteraction_title_length = 15;
    thclass += "x-dashboard-page";
  } else {
    parentIndex = this.data.selectInteractionById(
      interactions,
      interaction.parent
    ).interactionObjectIndex;
    thclass += "x-dashboard-interaction";
    max_colinteraction_title_length = 15;
  }

  if (colinteractionTitle.length > max_colinteraction_title_length) {
    colinteractionTitle =
      colinteractionTitle.substr(0, max_colinteraction_title_length - 3) +
      "...";
  }
  var interactionHeader =
    '<th data-interaction-index="' +
    interaction.interactionObjectIndex +
    '" data-parent="' +
    parentIndex +
    '" class="column-' +
    showHide +
    thclass +
    '" title="' +
    interaction.name +
    '"><a href="#" data-toggle="modal" data-target="#model-' +
    learningObjectIndex +
    "-" +
    interactionIndex +
    '">' +
    colinteractionTitle +
    "</a>" +
    collapseIcon +
    "</th>";
  if ($(`#model-${learningObjectIndex}-${interactionIndex}`).length === 0) {
    $("body").append(
      '<div id="model-' +
        learningObjectIndex +
        "-" +
        interactionIndex +
        '" class="modal fade dashboard-modal" role="dialog" >' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h4 class="modal-title">' +
        interactionTitle +
        "</h4>" +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        "</div>" +
        '<div class="modal-body col-md-12">' +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>"
    );
  }
  div.find("#" + learningObjectIndex + " thead tr").append(interactionHeader);
  var display_options = JSON.parse($this.data.info.dashboard.display_options);
  var index = div.find("#" + learningObjectIndex + " thead th").length; // nr of prevous th elements is current index
  var targetHeader = $(
    "th[data-interaction-index=" + interaction.interactionObjectIndex + "]"
  );
  var column = $(
    ".journeyData td:nth-child(" +
      index +
      "),.journeyData th:nth-child(" +
      index +
      ")"
  );
  var subQuestionToggle = targetHeader.find("div");
  if (
    typeof display_options.columns != "undefined" &&
    typeof display_options.columns[index - 1] != "undefined"
  ) {
    if (display_options.columns[index - 1] === true) {
      column.show();
    } else {
      column.hide();
    }
  }
  $(document).on(
    "shown.bs.modal",
    "#model-" + learningObjectIndex + "-" + interactionIndex,
    function () {
      var contentDiv = $(
        "#model-" +
          learningObjectIndex +
          "-" +
          interactionIndex +
          " .modal-body"
      );
      $(".modal-body > div").remove();
      contentDiv.html("");
      interactions = $this.data.getInteractions(
        learningObjects[learningObjectIndex].url
      );
      interaction = interactions[interactionIndex];
      contentDiv.append('<div class="journey-container"></div>');
      let showPageInteraction =
        interactions.filter(
          (inter) =>
            inter.parent === interaction.url && inter.type === "interaction"
        ).length > 1;
      let localJcId = `block-detail-journey-container-${learningObjectIndex}-${interactionIndex}`;
      $(`#${localJcId}`).remove();
      let block = `<div class="class-overview-box" id="${localJcId}"></div>`;
      block += `${
        !showPageInteraction && interaction.type === "page" ? "" : "<hr>"
      }</div>`;
      contentDiv.append(block);
      childInteractions = interactions.filter(
        (inter) => inter.parent === interaction.url
      );
      if (
        childInteractions.length === 1 &&
        interaction.type !== "interaction"
      ) {
        interaction = childInteractions[0];
      }
      $this.drawInteraction(
        interaction,
        showPageInteraction,
        contentDiv,
        interactions,
        learningObjectIndex,
        interactionIndex,
        localJcId,
        true
      );
    }
  );
};

xAPIDashboard.prototype.consolidateSegments = function(stringRanges)
{
    let csegments = stringRanges.map(function(s) {
        var segments = s.split("[,]");
        if (segments[0] == "") {
            return [];
        }
        return segments.map(function(segment) {
            return {
                start: parseFloat(segment.split("[.]")[0]),
                end: parseFloat(segment.split("[.]")[1])
            };
        });
    });
    var segments = [];
    csegments.forEach(function(segment) {
        segment.forEach(function(seg) {
            segments.push(seg);
        });
    });
    segments.sort(function(a, b) {
        return (a.start > b.start) ? 1 : ((b.start > a.start) ? -1 : a.end - b.end);
    });
    // 2. Combine the segments
    csegments = [];
    var i = 0;
    while (i < segments.length) {
        var segment = $.extend(true, {}, segments[i]);
        i++;
        while (i < segments.length && segments[i].start >= segment.start && segments[i].start <= segment.end) {
            if (segment.end <= segments[i].end) {
                segment.end = segments[i].end;
            }
            i++;
        }
        csegments.push(segment);
    }
    return csegments;
};

/**
 * Displays a graph of the video showing how many students watched a specific part of a video in a learningObject.
 * @param {String} contentDiv The element you want to place the retention graph in (if null then element is heatmapData).
 * @param {int} learningObjectIndex Is the index of the object containing information about the learningObject.
 * @param {int} interactionIndex Is the index of the interaction within the object.
 * @param {[statement]} pausedStatements A list of statements from the learningObject that is given.
 * @param {int} height The number displayed on the y-axis.
 */
xAPIDashboard.prototype.displayOverviewRetention = function (
  contentDiv,
  learningObjectIndex,
  interactionIndex,
  pausedStatements,
  height = 10
) {
  if (contentDiv == null) {
    contentDiv = "heatmapData";
  }
  //var pausedStatements = getStatementsList(pausedstatementmap, 'https://w3id.org/xapi/video/verbs/paused');
  var times = [];
  var data = [[]];
  var total = 200;
  var videoLength = Math.max(
    ...pausedStatements.map(
      (s) =>
        s.context.extensions["https://w3id.org/xapi/video/extensions/length"]
    )
  );

  // Gets all the ranges from the data.
  // groupedPausedStatements
  var stringRanges = [];
  for (var i = 0; i < pausedStatements.length; i++) {
    var session =
      pausedStatements[i].context.extensions[
        "https://w3id.org/xapi/video/extensions/session-id"
      ];
    if (stringRanges[session] != undefined) {
      stringRanges[session].push(
        pausedStatements[i].result.extensions[
          "https://w3id.org/xapi/video/extensions/played-segments"
        ]
      );
    } else {
      stringRanges[session] = [
        pausedStatements[i].result.extensions[
          "https://w3id.org/xapi/video/extensions/played-segments"
        ],
      ];
    }
  }
  //var stringRanges = pausedStatements.map(s => s.result.extensions["https://w3id.org/xapi/video/extensions/played-segments"]);
  var totalViewed = [];
  for (var i = 0; i < total; i++) {
    totalViewed.push(0);
  }
  var totalFound = 0;
  for (var sRangeIndex in stringRanges) {
    var segments = this.consolidateSegments(stringRanges[sRangeIndex]);
    for (var i in segments) {
      var segment = segments[i];
      totalFound++;
      //sanitize
      if (segment.start < 0) {
        segment.start = 0;
      }
      if (segment.start > videoLength) {
        segment.start = videoLength;
      }
      if (segment.end < 0) {
        segment.end = 0;
      }
      if (segment.end > videoLength) {
        segment.end = videoLength;
      }

      for (
        var j = Math.floor((segment.start / videoLength) * total);
        j <= Math.ceil((segment.end / videoLength) * total);
        j++
      ) {
        var t = (j * videoLength) / total;
        if (t >= segment.start && i <= segment.end) {
          totalViewed[j]++;
        }
      }
    }
  }

  for (var i = 0; i < total; i++) {
    times.push(i / total);
    data[0].push(totalViewed[i]);
  }
  var data = [
    {
      y: data[0],
      x: times,
      fill: "tonexty",
      type: "scatter",
      fillcolor: "#358B3D",
      line: {
        color: "#217729",
      },
      zmin: 0,
      zmax: height,
    },
  ];

  var vals = [];
  var valtexts = [];

  if (pausedStatements.length > 0) {
    // Divide in 5 blocks
    if (videoLength > 0) {
      var blocks = Math.floor(videoLength / 150);
      var blockLength = (blocks * 30) / videoLength;
      for (var i = 0; i <= 1; i += blockLength) {
        vals.push(i / 1);
        var seconds = Math.round(100 * i * videoLength) / 100;
        if (videoLength > 60) {
          var minutes = Math.round(seconds / 60);
          seconds = Math.round(seconds % 60);
          if (seconds < 10) {
            seconds = "0" + seconds;
          }
          var time = minutes + ":" + seconds;
        } else {
          time = seconds + " seconds";
        }
        valtexts.push(time);
      }
    }
  }

  var layout = {
    annotations: [],
    //height: 120,
    margin: {
      t: 40,
      l: 40,
      b: 20,
      r: 20,
    },
    xaxis: {
      tickmode: "array",
      tickvals: vals,
      ticktext: valtexts,
      range: [0, 1],
    },
    yaxis: {
      title: "",
      ticks: "",
      width: 700,
      height: 700,
      autosize: false,
      range: [0, height],
    },
    hovermode: false,
  };

  if (pausedStatements.length > 0) {
    layout["title"] = pausedStatements[0].object.definition.name["en-US"];
  }
  contentDiv.attr(
    "id",
    "heatmap-" + learningObjectIndex + "-" + interactionIndex
  );
  Plotly.newPlot(contentDiv.attr("id"), data, layout, {
    staticPlot: true,
  });
};

// Function that creates a heatmap for the given data.
xAPIDashboard.prototype.displayHeatmap = function (
  contentDiv,
  learningObjectIndex,
  interactionIndex,
  pausedstatements
) {
  var times = [],
    data = [[]],
    total = 100;
  var videoLength;
  if (pausedstatements.length == 1) {
    videoLength =
      pausedstatements[0].result.extensions[
        "https://w3id.org/xapi/video/extensions/time"
      ];
  } else {
    videoLength = pausedstatements
      .map(function (s) {
        return s
          .result.extensions["https://w3id.org/xapi/video/extensions/played-segments"];
      })
      .reduce(function (a, b) {
        return Math.max(a, b);
      });
  }
  // Gets all the ranges from the data.
  var stringRanges = pausedstatements.map(function (s) {
    return s
      .result.extensions["https://w3id.org/xapi/video/extensions/played-segments"];
  });
  var totalViewed = [];
  for (var i = 0; i < total; i++) {
    totalViewed.push(0);
  }
  for (sRangeIndex in stringRanges) {
    var sRanges = stringRanges[sRangeIndex].split("[,]");
    for (var sRangeIndex in sRanges) {
      var sRange = sRanges[sRangeIndex];
      var range = sRange.split("[.]");
      for (
        var j = parseFloat(range[0]);
        j <= parseFloat(range[1]);
        j += videoLength / total
      ) {
        totalViewed[Math.floor((j / videoLength) * total)]++;
      }
    }
  }

  for (var i = 0; i < total; i++) {
    times.push(i / total);

    data[0].push((totalViewed[i] / stringRanges.length) * 100);
  }
  var data = [
    {
      z: data,
      x: times,
      y: [" "],
      type: "heatmap",
    },
  ];

  var layout = {
    title: "",
    annotations: [],
    xaxis: {
      ticks: "",
      side: "top",
      tickformat: ",.0%",
      ticksuffix: " of video",
      range: [0, 1],
    },
    yaxis: {
      title: "",
      ticks: "",
      ticksuffix: pausedstatements[0].object.definition.name["en-US"],
      y: "-15",
      tickangle: "-90",
      width: 700,
      height: 700,
      autosize: false,
    },
    hovermode: false,
  };

  for (var j = 0; j < data[0].length; j++) {
    var currentValue = data[0][j];
    if (currentValue != 0.0) {
      var textColor = "white";
    } else {
      var textColor = "black";
    }
    var result = {
      xref: "x1",
      yref: "y1",
      x: times[j],
      y: "",
      text: currentValue,
      font: {
        family: "Arial",
        size: 12,
        color: "rgb(50, 171, 96)",
      },
      showarrow: false,
      font: {
        color: textColor,
      },
    };
    layout.annotations.push(result);
  }
  contentDiv.attr(
    "id",
    "heatmap-" + learningObjectIndex + "-" + interactionIndex
  );
  Plotly.newPlot(contentDiv.attr("id"), data, layout, {
    staticPlot: true,
  });
};

xAPIDashboard.prototype.displayQuizOverview = function (contentDiv, questions) {
  var $this = this;
  contentDiv.append("<div class='question-overview'><ul></ul></div>");
  questions.forEach(function (q) {
    answerStatements = $this.data.rawData.filter(function (s, i) {
      g = $this.getGroupFromStatements([i]);
      cg = $this.data.currentGroup.group_id;
      return (
        (cg == undefined || cg == "all-groups" || cg == g) &&
        s.object.id == q.interactionUrl &&
        s.verb.id == "http://adlnet.gov/expapi/verbs/answered"
      );
    });

    var idxs = $this.data.getStatementidxsFromGroupedData(q.interactionUrl);
    answers = answerStatements.map(function (s) {
      return s.result.response;
    });
    answers = idxs
      .flat()
      .flat()
      .map((idx) => $this.data.rawData[idx])
      .filter(
        (statement) =>
          statement.verb.id === "http://adlnet.gov/expapi/verbs/answered"
      )
      .map((statement) => statement.result.response)
      .flatMap((x) => x.split("[,]"));
    contentDiv
      .find(".question-overview ul")
      .append("<li>" + q.name["en-US"] + "</li>");
    var ol = $("<ol></ol>").appendTo(
      contentDiv.find(".question-overview ul li:last")
    );
    q.choices.forEach(function (c) {
      current = 0;
      total = 0;
      answers.forEach(function (a) {
        total++;
        if (a == c.id) {
          current++;
        }
      });
      if (
        q.correctResponsesPattern
          .flatMap((x) => x.split("[,]"))
          .indexOf(c.id) != -1
      ) {
        correct = '<i class="fa fa-x-tick"></i>';
      } else {
        correct = '<i class="fa fa-x-cross"></i>';
      }
      var rounded = Math.round((current / total) * 1000) / 10;
      if (isNaN(rounded)) {
        rounded = "0";
      }
      ol.append(
        "<li>" + correct + c.description["en-US"] + " - " + rounded + "%</li>"
      );
    });
  });
};

xAPIDashboard.prototype.displayPageInfo = function (
  contentDiv,
  jqLocation,
  interaction
) {
  var $this = this;

  var groupedData = {};
  for ($key in $this.data.groupedData) {
    $val = $this.data.groupedData[$key];
    if (
      $this.data.currentGroup.group_id == "all-groups" ||
      $this.data.currentGroup.group_id ==
        $this.getGroupFromStatements($val.statementidxs)
    ) {
      groupedData[$key] = $val;
    }
  }

  let groupedEntries = Object.entries(groupedData).filter(
    ([k, v]) => v.usedattempt !== undefined
  );
  let attempts = groupedEntries
    .flatMap(([key, value]) => Object.entries(value.attempts))
    .map((attempts) => attempts[1].statementidxs)
    .filter((statementIdxs) =>
      statementIdxs.some(
        (statementIdx) =>
          this.data.rawData[statementIdx].object.id === interaction.url
      )
    );

  // Number of users
  var users = Object.keys(groupedEntries);
  contentDiv
    .find(jqLocation)
    .append(`${XAPI_DASHBOARD_NRUSERS} ${users.length}<br>`);

  // Number of attempts
  var attempts2 = groupedEntries.reduce(
    (sum, [key, value]) =>
      sum + Object.entries(groupedData[key].attempts).length,
    0
  );
  contentDiv
    .find(jqLocation)
    .append(`${XAPI_DASHBOARD_NRATTEMPTS} ${attempts.length}<br>`);

  // Average time
  let statements = groupedEntries.map(([key, value]) =>
    Object.entries(value.attempts)
      .filter(([aKey, aValue]) => aKey === value.usedattempt)
      .map(([k, v]) =>
        v.statementidxs.filter(
          (idx) => $this.data.rawData[idx].object.id === interaction.url
        )
      )
  );
  statements = $this.data.getStatementidxsFromGroupedData(interaction.url);
  var avgTime = statements
    .map((idxss) => this.data.calculateDuration(idxss))
    .filter((duration) => !isNaN(duration))
    .reduce((avg, val, _, arr) => avg + val / arr.length, 0);

  if (avgTime < 120) {
    avgTime = `${Math.round(avgTime)} ${XAPI_DASHBOARD_COMPLETED_UNIT_SECONDS}`;
  } else {
    avgTime = `${
      Math.round(avgTime / 6) / 10
    } ${XAPI_DASHBOARD_COMPLETED_UNIT_MINUTES}`;
  }
  contentDiv
    .find(jqLocation)
    .append(`${XAPI_DASHBOARD_AVGDURATION} ${avgTime}<br>`);
};

xAPIDashboard.prototype.createPieChartInteraction = function (
  statementidxs,
  div_location
) {
  var dash = new ADL.XAPIDashboard();
  var $this = this;
  var statementidxsList = this.data
    .getAllScoreStatements(statementidxs)
    .filter(function (s) {
      g = $this.getGroupFromStatements([s]);
      cg = $this.data.currentGroup.group_id;
      return cg == undefined || cg == "all-groups" || cg == g;
    });
  var statements = this.data.getStatementsFromIdxs(statementidxsList);
  var newStatements = jQuery.extend(true, [], statements);
  newStatements.forEach(function (x) {
    if (
      x.result.score.isScaled == undefined ||
      x.result.score.isScaled == false
    ) {
      x.result.score.isScaled = true;
      x.result.score.scaled *= 100;
    }
    return x;
  });
  dash.addStatements(newStatements);
  var chart = dash.createBarChart({
    container: div_location,
    groupBy: "result.score.scaled",
    aggregate: ADL.count(),
    range: {
      start: 0.0,
      end: 100.0,
      increment: 10,
    },
    post: function (data) {
      data.contents.map(function (el) {
        el.out *= (1 / newStatements.length) * 100;
      });
    },
    customize: function (chart) {
      chart.xAxis.axisLabel(XAPI_DASHBOARD_GRAPH_GRADERANGE);
      chart.yAxis.axisLabel(XAPI_DASHBOARD_GRAPH_PERCOFCLASS);
      chart.width(500);
      chart.height(500);
      chart.yDomain([0, 100]);
    },
  });
  chart.draw();
};

xAPIDashboard.prototype.displayQuestionInformation = function (
  contentDiv,
  question,
  learningObjectIndex,
  interactionIndex,
  interaction
) {
  switch (question.interactionType) {
    case "matching":
      this.displayMatchingQuestionInformation(
        contentDiv,
        question,
        learningObjectIndex,
        interactionIndex,
        interaction
      );
      break;
    case "choice":
      this.displayMCQQuestionInformation(
        contentDiv,
        question,
        learningObjectIndex,
        interactionIndex,
        interaction
      );
      break;
    case "fill-in":
      //this.displayFillInQuestionInformation(
      //  contentDiv,
      //  question,
      //  learningObjectIndex,
      //  interactionIndex
      //);
      break;
    case "text": // Special case for open ansers, see also DashboardState.prototype.getQuestion
      this.displayTextQuestionInformation(contentDiv, interaction);
      break;
    default:
      console.log("Invalid interaction type");
  }
};

xAPIDashboard.prototype.displayMatchingQuestionInformation = function (
  contentDiv,
  question,
  learningObjectIndex,
  interactionIndex,
  interaction
) {
  const interactionObjectUrl = interaction.url;
  const $this = this;
  //contentDiv.append(question.name["en-US"]);
  let options = "<div>" + XAPI_DASHBOARD_SOURCES + "<ol>";
  question.source.forEach(function (s) {
    options += "<li>" + s.description["en-US"] + "</li>";
  });
  options += "</ol>";
  options += XAPI_DASHBOARD_TARGETS + "<ol>";
  question.target.forEach(function (targ) {
    options += "<li>" + targ.description["en-US"] + "</li>";
  });
  options += "</ol>";
  let pairs = question.correctResponsesPattern[0].split("[,]");
  pairs = pairs.map(function (x) {
    return x.split("[.]").join(' <i class="fa fa-long-arrow-right"></i> ');
  });
	if(question.judge){
		options += XAPI_DASHBOARD_CORRECTANSWERS;
		options += "<ul>";
		pairs.forEach(function (p) {
			options += "<li>" + p + "</li>";
		});
		options += "</ul>";
	}

  const dash = new ADL.XAPIDashboard();
  const statements = this.data.getQuestionResponses(interactionObjectUrl);

  let pairStatements = [];
  statements.forEach((si) => {
    const s = $this.data.rawData[si];
    if (s.result.response !== "") {
      const tup = s.result.response.split("[,]");
      tup.forEach((t) => {
        statement = JSON.parse(JSON.stringify(s));
        arr = t.split("[.]");
        const pair = `${arr[0]} > ${arr[1]}`;
        statement.result.pairs = $this.data.stripHtml(pair);
        pairStatements.push(statement);
      });
    }
  });
  dash.addStatements(pairStatements);
  const container =
    "answers-container-" + learningObjectIndex + "-" + interactionIndex;
  options +=
    '<div id="' +
    container +
    '" style="height: 510px"><svg class="graph" id="answers-' +
    learningObjectIndex +
    "-" +
    interactionIndex +
    '"></svg ></div></div>';
  contentDiv.append(options);
  var chart = dash.createBarChart({
    container: "#answers-" + learningObjectIndex + "-" + interactionIndex,
    groupBy: "result.pairs",
    aggregate: ADL.count(),
    customize: function (chart) {
      chart.xAxis.rotateLabels(90);
      chart.xAxis.axisLabel(XAPI_DASHBOARD_GRAPH_MATCH_XAXIS);
      chart.yAxis.axisLabel(XAPI_DASHBOARD_GRAPH_NUMBER_OF_ANSWERS);
      chart.width($("#" + container).width() - 10);
      chart.height(490);
    },
    process: function (data, event, opts) {
      data
        .where("result.pairs != null")
        .orderBy("result.pairs", "asc")
        .groupBy("result.pairs")
        .count()
        //            .orderBy('count', 'desc')
        .select("group as in, count as out")
        .exec(opts.cb);
    },
  });
  chart.draw();
};

xAPIDashboard.prototype.displayMCQQuestionInformation = function (
  contentDiv,
  question,
  learningObjectIndex,
  interactionIndex,
  interaction
) {
  const interactionObjectUrl = interaction.url;
  //contentDiv.append(XAPI_DASHBOARD_QUESTION + " " + question.name["en-US"]);
  let options = "<div>" + XAPI_DASHBOARD_ANSWERS + "<ol>";
  choices = question.choices;
  const dash = new ADL.XAPIDashboard();
  const statements = this.data.getQuestionResponses(interactionObjectUrl);
  const sts = statements.map((i) => this.data.rawData[i]);
  const numberOfAnswers = sts.filter(
    (s) => s.result != undefined && s.result.response != undefined
  ).length;
  const correctResponsesSplitted = question.correctResponsesPattern.flatMap(
    (pattern) => pattern.split("[,]")
  );
  question.choices.forEach((option) => {
    let correct = "";
		if(question.judge) {
			if (correctResponsesSplitted.indexOf(option.id) != -1) {
				correct = '<i class="fa fa-x-tick"></i>';
			} else {
				correct = '<i class="fa fa-x-cross"></i>';
			}
		}

    let percentage =
      Math.round(
        (1000 *
          sts.filter(
            (s) =>
              s.result != undefined &&
              s.result.response.split("[,]").includes(option.id)
          ).length) /
          numberOfAnswers
      ) / 10;

    if (isNaN(percentage)) {
      percentage = "0";
    }
    options += `<li>${correct} ${option.description["en-US"]} - ${percentage}%</li>`;
  });

  dash.addStatements(sts);
  options +=
    '</ol><div><svg class="graph" id="answers-' +
    learningObjectIndex +
    "-" +
    interactionIndex +
    '"></svg ></div></div>';
  contentDiv.append(options);

  const chart = dash.createBarChart({
    container: "#answers-" + learningObjectIndex + "-" + interactionIndex,
    groupBy: "result.response",
    aggregate: ADL.count(),
    post: function (data) {},
    customize: function (chart) {
      chart.xAxis.axisLabel(XAPI_DASHBOARD_GRAPH_CHOICE_XAXIS);
      chart.yAxis.axisLabel(XAPI_DASHBOARD_GRAPH_CHOICE_YAXIS);
      chart.width(500);
      chart.height(500);
      chart.color(function (d) {
        if (d.correct) {
          return "green";
        }
        return "red";
      });
    },
    post: function (data) {
      data.contents.map(function (el) {
        el.out *= (1 / sts.length) * 100;
      });
      data.contents = data.contents.flatMap((el) => {
        const splitted = el.in.split("[,]");
        const length = splitted.length;
        return splitted.map((sp) => ({
          in: sp,
          out: el.out / length,
          correct: correctResponsesSplitted.includes(sp),
        }));
      });
    },
  });
  chart.draw();
};

xAPIDashboard.prototype.displayFillInQuestionInformation = function (
  contentDiv,
  question,
  learningObjectIndex,
  interactionIndex
) {
  var learningObjects = this.data.getLearningObjects();
  var interactions = this.data.getInteractions(
    learningObjects[learningObjectIndex].url
  );
  var interaction = interactions[interactionIndex];
  var learningObjectUrl = learningObjects[learningObjectIndex].url;
  var interactionObjectUrl = interaction.url;
  //contentDiv.append(question.name["en-US"]);
  var options = "<div><ul>";
  question.correctResponsesPattern.forEach(function (option) {
    options += "<li>" + option + "</li>";
  });
  var dash = new ADL.XAPIDashboard();
  var statements = this.data.getQuestionResponses(interactionObjectUrl);
  dash.addStatements(statements);
  options +=
    '</ul><div><svg class="graph" id="answers-' +
    learningObjectIndex +
    "-" +
    interactionIndex +
    '"></svg ></div></div>';
  contentDiv.append(options);
  var chart = dash.createBarChart({
    container: "#answers-" + learningObjectIndex + "-" + interactionIndex,
    groupBy: "result.response",
    aggregate: ADL.count(),
    customize: function (chart) {
      chart.xAxis.axisLabel(XAPI_DASHBOARD_GRAPH_FILLIN_XAXIS);
      chart.yAxis.axisLabel(XAPI_DASHBOARD_GRAPH_FILLIN_YAXIS);
      chart.width(500);
      chart.height(500);
    },
  });
  chart.draw();
};

xAPIDashboard.prototype.getUserNameOrEmail = function (statement) {
  var participant = "";
  if (statement.actor.mbox != undefined) {
    // Key is email
    // Cutoff mailto:
    var key = statement.actor.mbox.substr(7).trim();
    participant = key;
    if (statement.actor.name != undefined) {
      participant = statement.actor.name;
    }
  } else if (statement.actor.mbox_sha1sum != undefined) {
    // Key is sha1(email)
    participant = statement.actor.mbox_sha1sum;
  } else if (
    statement.actor.account !== undefined &&
    statement.actor.account.name !== undefined
  ) {
    // Key is account name
    participant = statement.actor.account.name;
  }
  if (participant != "") return participant;
  return "-";
};

xAPIDashboard.prototype.displayTextQuestionInformation = function (
  contentDiv,
  interaction
) {
  let interactionObjectUrl = interaction.url;
  let showUsers =
    this.data.info.dashboard.enable_nonanonymous &&
    $("#dp-unanonymous-view").prop("checked");
  let statementidxs = this.data.getQuestionResponses(interactionObjectUrl);
  let answers = "<div class='openanwers container-fluid'>";
  // Add headers
  answers +=
    '<div class="row" style="border-bottom: 1px solid black">' +
    `${showUsers ? '<div class="col"><b>User</b></div>' : ""}` +
    '<div class="col"><b>Given answer</b></div>' +
    '<div class="col"><b>Date</b></div>' +
    "</div>";
  let $this = this;
  statementidxs.forEach(function (statementidx) {
    let statement = $this.data.rawData[statementidx];
    let actor = "";
    if (showUsers) {
      actor =
        "<div class='col'>" + $this.getUserNameOrEmail(statement) + "</div>";
    }
    var timestamp = moment(statement.timestamp).format("YYYY-MM-DD HH:mm");
    if (
      statement.result.response != undefined &&
      statement.result.response != ""
    ) {
      answers +=
        "<div class='row'>" +
        actor +
        "<div class='col'>" +
        statement.result.response +
        "</div>" +
        "<div class='col'>" +
        timestamp +
        "</div></div>";
    }
  });
  answers += "</div></div>";
  contentDiv.append(answers);
};

xAPIDashboard.prototype.getResultPage = function (
  rowid,
  div,
  userdata,
  learningObject,
  statement
) {
  var classIdentifier = "row-pagecontents-" + rowid;
  if (
    statement.result != undefined &&
    statement.result.extensions["http://xerte.org.uk/xapi/trackingstate"] !=
      undefined
  ) {
    var trackingState = JSON.parse(
      statement.result.extensions["http://xerte.org.uk/xapi/trackingstate"]
    );
    html =
      "<div id=" +
      classIdentifier +
      ">\n" +
      '<div class="pageContents">\n' +
      '<div class="pdfContent">\n' +
      '    <h3 class="generalResultsTxt"></h3>\n' +
      '    <table class="general_summary" rules="rows">\n' +
      "        <tr>\n" +
      '            <td class="averageTxt"></td>\n' +
      '            <td><span class="averageScore"></span></td>\n' +
      "        </tr>\n" +
      "        <tr>\n" +
      '            <td class="completionTxt"></td>\n' +
      '            <td><span class="completion"></span></td>\n' +
      "        </tr>\n" +
      "        <tr>\n" +
      '            <td class="weightedscoreTxt"></td>\n' +
      '            <td><span class="weightedscore"></span></td>\n' +
      "        </tr>\n" +
      "        <tr>\n" +
      '            <td class="startTimeTxt"></td>\n' +
      '            <td><span class="startTime"></span></td>\n' +
      "        </tr>\n" +
      "        <tr>\n" +
      '            <td class="durationTxt1"></td>\n' +
      '            <td><span class="totalDuration"></span></td>\n' +
      "        </tr>\n" +
      "    </table>\n" +
      '    <div class ="specific">\n' +
      '    <h3 class="interactivityResultsTxt"></h3>\n' +
      '    <h3 class="globalResultsTxt"></h3>\n' +
      '    <table class="questionScores" rules="rows">\n' +
      "    </table>\n" +
      "    <br />\n" +
      '    <h3 class="specificResultsTxt">Specific Results</h3>\n' +
      '    <div class="fullResults">\n' +
      "    </div>\n" +
      "    <br />\n" +
      "</div>\n" +
      "</div>\n" +
      "</div></div>\n";
    div.append(html);
    results.init(classIdentifier, trackingState);
  } else {
    html = "<div></div>";
    div.append(html);
  }
};

xAPIDashboard.prototype.drawSelectRow = function (table, obj, begin, end) {
  var urlArr = obj.url.split("/");
  var row =
    "<tr><td>" +
    obj.name +
    "</td><td><div id='table-graph-" +
    urlArr[urlArr.length - 1] +
    "'><svg></svg></div></td></tr>";
  table.append(row);
  var statements = this.data.getStatementsFromLearningObject(obj.url);
  var dash = new ADL.XAPIDashboard();
  dash.addStatements(statements);
  var chart = dash.createLineChart({
    container: "#table-graph-" + urlArr[urlArr.length - 1] + " svg",
    groupBy: "timestamp",
    range: {
      start: begin.toISOString(),
      end: end.toISOString(),
      increment: 1000 * 3600 * 24,
    },
    aggregate: ADL.count(),
    rangeLabel: "start",
    customize: function (chart) {
      //chart.width(500);
      //chart.height(250);
      chart.tooltips(false);
      chart.interpolate("monotone");
      chart.xAxis.tickFormat(function (label) {
        return d3.time.format("%b %d")(new Date(label));
      });
    },
    post: function (data) {
      data.contents.map(function (el) {
        el.in = Date.parse(el.in);
      });
    },
  });
  chart.draw();
};

xAPIDashboard.prototype.addStatisticsRow = function (elmnt, id, label) {
  var row =
    '<div class="row ' +
    id +
    '"><div class="col-widget col"><h5>&nbsp;</h5><h2>' +
    label +
    "</h2></div></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawNumberOfUsers = function (elmnt, numberOfUsers) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_NUMBER_OF_STUDENTS +
    "</h5><h2>" +
    numberOfUsers +
    "</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawNumberOfSessions = function (
  elmnt,
  numberOfSessions
) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_NUMBER_OF_SESSIONS +
    "</h5><h2>" +
    numberOfSessions +
    "</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawNumberOfCompletedUsers = function (
  elmnt,
  completedSessions
) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_COMPLETED_SESSIONS +
    "</h5><h2>" +
    completedSessions +
    "</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawNumberOfCompletedSessions = function (
  elmnt,
  completedSessions
) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_COMPLETED_SESSIONS +
    "</h5><h2>" +
    completedSessions +
    "</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawAverageUserCompletion = function (
  elmnt,
  averageCompletion
) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_AVERAGE_USER_COMPLETION +
    "</h5><h2>" +
    averageCompletion +
    "%</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawAverageSessionCompletion = function (
  elmnt,
  averageCompletion
) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_AVERAGE_SESSION_COMPLETION +
    "</h5><h2>" +
    averageCompletion +
    "%</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawUsersPassed = function (elmnt, passed) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_NUMBER_USERS_PASSED +
    "</h5><h2>" +
    passed +
    "</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawSessionsPassed = function (elmnt, passed) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_NUMBER_SESSIONS_PASSED +
    "</h5><h2>" +
    passed +
    "</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawAverageCompletedPages = function (
  elmnt,
  averageCompletedPages
) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_AVERAGE_COMPLETED_PAGES +
    "</h5><h2>" +
    averageCompletedPages +
    "</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawNumberOfInteractions = function (
  elmnt,
  numberOfInteractions
) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_NUMBER_OF_INTERACTIONS +
    "</h5><h2>" +
    numberOfInteractions +
    "</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawAverageUserScore = function (elmnt, averageGrade) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_AVERAGE_USER_SCORE +
    "</h5><h2>" +
    averageGrade +
    "</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawAverageSessionScore = function (
  elmnt,
  averageGrade
) {
  var row =
    '<div class="col-widget col"><h5>' +
    XAPI_DASHBOARD_AVERAGE_SESSION_SCORE +
    "</h5><h2>" +
    averageGrade +
    "</h2></div>";
  elmnt.append(row);
};

xAPIDashboard.prototype.drawActivityChart = function (
  base,
  elmnt,
  begin,
  end,
  link
) {
  if (link == undefined) {
    link = true;
  }
  var row =
    "<a id='graph_link_" +
    this.data.info.template_id +
    "' href='#'><div id='graph-svg-wrapper-" +
    this.data.info.template_id +
    "' class='graph-svg-wrapper'><svg></svg></div></a>";
  elmnt.append(row);
  var $this = this;
  if (link) {
    $("#graph_link_" + this.data.info.template_id).click(function () {
      $this.show_dashboard(begin, end);
    });
  }
  var dash = new ADL.XAPIDashboard();
  var statementidxs = this.data.rawDatamap.filter(function (s) {
    g = $this.getGroupFromStatements([s]);
    cg = $this.data.currentGroup.group_id;
    return cg == undefined || cg == "all-groups" || cg == g;
  });
  var launchedStatements = this.data.getStatementsList(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/launched"
  );
  dash.addStatements(launchedStatements);
  template_id = this.data.info.template_id;
  var vals = [];
  var timeFrame = end.getTime() - begin.getTime();
  var tickmarkDuration = timeFrame / 8;
  //round to nearset day
  var tickMarkNrDays = Math.round(tickmarkDuration / (1000 * 3600 * 24));
  if (tickMarkNrDays < 1) {
    tickMarkNrDays = 1;
  }
  var tick = begin.getTime();
  while (tick < end.getTime()) {
    vals.push(tick);
    tick += tickMarkNrDays * 1000 * 3600 * 24;
  }

  console.log($(base + "#graph-svg-wrapper-" + template_id).width());

  var chart = dash.createLineChart({
    container:
      base + "#graph-svg-wrapper-" + this.data.info.template_id + " svg",
    groupBy: "timestamp",
    range: {
      start: begin.toISOString(),
      end: end.toISOString(),
      increment: 1000 * 3600 * 24,
    },
    aggregate: ADL.count(),
    rangeLabel: "start",
    customize: function (chart) {
      chart.width(
        Math.max(
          $(base + "#graph-svg-wrapper-" + template_id + " svg").width() - 10
        )
      );

            chart.height(300);
            chart.tooltips(true);
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
            chart.tooltipContent(function(key, x, y, e, graph) {
                //console.log("key=" + key + ", x=" + x + ", y=" + y + ", e=" + e + "graph=" + graph);
                return x + ': ' + y;
            });

                //.headerFormatter(function(d) { return ""; });
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
  x_Dashboard.data.clear();
  $("#dp-start").unbind("change");
  $("#dp-end").unbind("change");
  $("#dp-unanonymous-view").unbind("change");

  $(document).off("show.bs.modal");
  $("#model-question-overview").off("shown.bs.modal");
  $(".show-question-overview-button").off("click");

  $(".journeyData > div").remove();
  $(".dashboard-modal").remove();
  $(".journeyOverviewActivity").html("");
  $("#dashboard-wrapper").hide();
}

xAPIDashboard.prototype.show_dashboard = function (begin, end) {
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

  $this.data.pageSize = JSON.parse(
    $this.data.info.dashboard.display_options
  ).pageSize;
  if ($this.data.pageSize == undefined) {
    $this.data.pageSize = 5;
  }
  $.datepicker.setDefaults(
    $.extend({}, $.datepicker.regional[jquery_language])
  );

  $("#dp-end").val(until.toDateString());

  $("#dp-start").val(since.toDateString());

  $("#dp-start").datepicker({
    onShow: function (ct) {
      this.setOptions({
        maxDate: $("#dp-end").val() ? $("#dp-end").val() : false,
        maxTime: $("#dp-end").val() ? $("#dp-end").val() : false,
      });
    },
    timepicker: true,
  });
  $("#dp-end").datepicker({
    onShow: function (ct) {
      this.setOptions({
        minDate: $("#dp-start").val() ? $("#dp-start").val() : false,
        minTime: $("#dp-start").val() ? $("#dp-start").val() : false,
      });
    },
    timepicker: true,
  });
  $("#dp-start").datepicker("setDate", since);
  $("#dp-end").datepicker("setDate", until);

  $("#dp-start").change(function () {
    $("#dp-start").prop("disabled", true);
    $("#dp-end").prop("disabled", true);
    $("#dp-unanonymous-view").prop("disabled", true);
    $this.regenerate_dashboard();
  });

  $("#dp-end").change(function () {
    $("#dp-start").prop("disabled", true);
    $("#dp-end").prop("disabled", true);
    $("#dp-unanonymous-view").prop("disabled", true);
    $this.regenerate_dashboard();
  });

  $("#group-select").change(function () {
    var group = $(this).val();
    $this.data.currentGroup.group_id = group;

    $this.data.pageIndex = 0;
    if (group == "all-groups") {
      $(".session-row").data("group-selected", true);
    } else {
      $('.session-row:not([data-group="' + group + '"])').data(
        "group-selected",
        false
      );
      $('.session-row[data-group="' + group + '"]').data(
        "group-selected",
        true
      );
    }
    $(".page-button").eq(0).trigger("click", [false]);

    $(".journeyOverviewStats").html("");
    $this.setStatisticsValues(".journeyOverview ", 0);
  });

  if (this.data.info.dashboard.enable_nonanonymous == "true") {
    if (this.data.info.unanonymous == "true") {
      $("#dp-unanonymous-view").prop("checked", true);
      $("#dp-unanonymous-view").hide();
      this.data.info.dashboard.anonymous = false;
    } else {
      $(".unanonymous-view").show();
      this.data.info.dashboard.anonymous = !$("#dp-unanonymous-view").is(
        ":checked"
      );
      $("#dp-unanonymous-view").change(function (event) {
        $this.data.info.dashboard.anonymous = !$("#dp-unanonymous-view").is(
          ":checked"
        );
        $("#dp-start").prop("disabled", true);
        $("#dp-end").prop("disabled", true);
        $("#dp-unanonymous-view").prop("disabled", true);

        $this.regenerate_dashboard();
      });
    }
  }

  this.regenerate_dashboard();
  $("#dashboard-wrapper").show();
};

xAPIDashboard.prototype.helperGetDate = function (datetimepicker) {
  var mTime = $(datetimepicker).datepicker("getDate");
  if (mTime == "") {
    if (datetimepicker == "#dp-end") {
      return new Date();
    }
    if (datetimepicker == "#dp-start") {
      return new Date("1970-01-01");
    }
  }

  return mTime;
};

xAPIDashboard.prototype.regenerate_dashboard = function () {
  $("#journeyData").html(
    '<div id="loader"><img id="loader_image" class="loading_gif" src="' +
      site_url +
      '/editor/img/loading16.gif" /><p id="loader_text"></p>'
  );
  $("#group-select option:not(:first-child)").remove();
  this.data.currentGroup.group_id = "all-groups";
  var url = site_url + this.data.info.template_id;
  var start = this.helperGetDate("#dp-start");
  var end = this.helperGetDate("#dp-end");
  end = new Date(moment(end).add(1, "days").toISOString());
  var q = {};
  q["activities"] = [url];
  if (
    this.data.info.role != undefined &&
    this.data.info.role == "Student" &&
    this.data.info.actor != undefined
  ) {
    q["actor"] = this.data.info.actor;
  }
  if (
    this.data.info.lrs.lrsurls != null &&
    this.data.info.lrs.lrsurls != "undefined" &&
    this.data.info.lrs.lrsurls != ""
  ) {
    var $this = this;
    q["activities"] = q["activities"].concat(
      this.data.info.lrs.lrsurls.split(",")
    );
  }
  if (
    this.data.info.lrs.site_allowed_urls != null &&
    this.data.info.lrs.site_allowed_urls != "undefined" &&
    this.data.info.lrs.site_allowed_urls != ""
  ) {
    var $this = this;
    q["activities"] = q["activities"]
      .concat(
        this.data.info.lrs.site_allowed_urls.split(",").map(function (url) {
          return url + $this.data.info.template_id;
        })
      )
      .filter(function (url) {
        return url != "";
      });
  }
  q["activity"] = url;
  q["related_activities"] = true;
  q["since"] = start.toISOString();
  q["until"] = end.toISOString();

  var $this = this;
  this.data.getStatements(q, false, function () {
    $("#dp-start").prop("disabled", false);
    $("#dp-end").prop("disabled", false);
    $("#dp-unanonymous-view").prop("disabled", false);
    $("#journeyData").html("");
    $this.createJourneyTableSession($("#journeyData"));
  });
};
