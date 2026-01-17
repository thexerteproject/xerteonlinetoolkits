var state;

function DashboardState(info) {
  this.info = info;
  this.conf = {
    endpoint: info.lrs.lrsendpoint + "/",
    user: info.lrs.lrskey,
    password: info.lrs.lrssecret,
    strictCallbacks: true,
  };
  ADL.XAPIWrapper.changeConfig(this.conf);
  this.mode = info.groupmode;
  this.rawData = undefined;
  this.dashboard = new ADL.XAPIDashboard();
  this.learningObjects = undefined;
  this.interactionObjects = undefined;
  this.groupedData = undefined;
  this.isSessionData = false;
  this.username = info.lrs.lrskey;
  this.password = info.lrs.secret;
  this.pageIndex = 0;
  this.pageSize = JSON.parse(info.dashboard.display_options).pageSize;
  if (this.pageSize == undefined) {
    this.pageSize = 5;
  }
  this.currentGroup = {
    group_id: "all-groups",
  };
}

DashboardState.prototype.clear = function () {
  this.rawData = [];
  this.learningObjects = undefined;
  this.interactionObjects = undefined;
  this.groupedData = undefined;
  this.interactions = undefined;
  this.dashboard = new ADL.XAPIDashboard();
  this.pageIndex = 0;
};

DashboardState.prototype.getStatements = function (q, one, callback, force_xapi=false) {
  if (this.info.lrs.db && callback != null && !force_xapi)
  {
    this.getStatementsFromDB(q, one).then(() => callback());
  }
  else if (this.info.lrs.aggregate && !force_xapi) {
    this.getStatementsAggregate(q, one, callback);
  } else {
    this.getStatementsxAPI(q, one, callback);
  }
};

DashboardState.prototype.httpGetStatements = async function(url, query)
{
  const auth = btoa(this.info.lrs.lrskey + ":" + this.info.lrs.lrssecret);
  try {
    const result = await $.ajax({
      url: url,
      type: "POST",
      headers: {
        'X-XERTE-USEDB': 'true',
        'Authorization': 'Basic ' + auth
      },
      data: query,
      dataType: "json"
    });
    return result;
  }
  catch (error) {
    console.log(error);
    return null;
  }
}

DashboardState.prototype.getStatementsFromDB = async function(q, one)
{
  let search = {};
  let activity = "";
  if (q['filter_current_users'] != undefined) {
    if (q['filter_current_users'] == 'true') {
      const lti_user_list = lti_users.split(',');
      search['actor'] = lti_user_list;
    }
    delete q['filter_current_users'];
  }
  if (q['activity'] != undefined && typeof this.info.lrs.extra != 'undefined' && this.info.lrs.extra['source'] != undefined > 0 && q['activity'].indexOf(this.info.lrs.extra['source']) == 0) {
    search['xapiobjectid'] = [q['activity'], q['activity'].replace(this.info.lrs.extra['source'], this.info.lrs.extra['extra'])];
    activity = q['activity'];
    delete q['activity'];
  }
  $.each(q, function(i, value) {
    search[i] = value;
  });
  if (one) {
    limit=1;
  } else {
    limit = 5000;
  }
  search['unsorted']=1;

  let query = 'statements=1&realtime=1&query=' + JSON.stringify(search) + '&limit=' + limit + '&offset=0';
  this.clear();
  $this = this;
  do
  {
    const response = await this.httpGetStatements(this.info.lrs.lrsendpoint, query);
    $this.rawData = [...$this.rawData, ...response.statements];
    $('#loader_text').html(
        XAPI_DASHBOARD_DATA_RETRIEVE_DATA + " " + Math.round(($this.rawData.length * 100) / response.nrrecords) + "%"
    );
    if (response.more) {
      query = response.more;
    }
    else
    {
      query = null;
    }
  } while (query != null && query != "");
  $('#loader_text').html(
        XAPI_DASHBOARD_DATA_PREPARE_GRAPHS
  );
  // Transform the statements to the correct activity
  if (typeof this.info.lrs.extra != 'undefined' && this.info.lrs.extra['extra'] != undefined > 0 && activity.indexOf(this.info.lrs.extra['extra']) == 0) {
    for (let i = 0; i < $this.rawData.length; i++) {
      if ($this.rawData[i].object.id.indexOf(this.info.lrs.extra['extra']) == 0) {
        $this.rawData[i].object.id.replace(this.info.lrs.extra['extra'], this.info.lrs.extra['source']);
      }
    }
  }
  // Sort statements in descending order
  $this.rawData.sort((a, b) => {
      if (a.timestamp < b.timestamp) {
        return 1;
      }
      return -1;
    });
  $this.rawDatamap = [];
  for (var i = 0; i < $this.rawData.length; i++)
    $this.rawDatamap[i] = i;
}


DashboardState.prototype.getStatementsxAPI = function (q, one, callback) {
  //ADL.XAPIWrapper.log.debug = true;
  ADL.XAPIWrapper.changeConfig(this.conf);

    var search = ADL.XAPIWrapper.searchParams();
    var activities = q.activities;
    var query = q;
    $.each(q, function(i, value) {
        if(i != "activities" && i != "actor")
            search[i] = value;
    });
    if (one) {
        search['limit'] = 1;
    } else {
        search['limit'] = 1000;
    }
    if (q['actor'] != undefined)
    {
        search['agent'] = '{ "mbox" : "mailto:' + q['actor'] + '" }';
    }
    var beginDate = moment(q['since']);
    var endDate = moment(q['until']);
    var days = moment.duration(endDate.diff(beginDate)).as('days');
    var nractivities =  1;
    if (q['activities'] != undefined)
    {
        nractivities = q['activities'].length;
    }
    var limit = search['limit'];
    this.clear();
    $this = this;
    ADL.XAPIWrapper.getStatements(search, null,
        function getmorestatements(err, res, body) {
            for (x = 0; x < body.statements.length; x++) {
                var statement = body.statements[x];
                if ($this.info.role == "Teacher") {
                    if (statement.actor.mbox != undefined) {
                        if ($this.info.users.findIndex(u => 'mailto:' + u.email === statement.actor.mbox) === -1) {
                            // Skip this user
                            continue;
                        }
                    }
                    else if (statement.actor.mbox_sha1sum != undefined) {
                        if ($this.info.users.findIndex(u => u.sha1 === statement.actor.mbox_sha1sum) === -1) {
                            // Skip this user
                            continue;
                        }
                    }
                }
                if ($this.info.dashboard.anonymous) {
                    if (statement.actor.mbox != undefined) {
                        // Key is email
                        // cutoff mailto: and calc sha1:
                        var sha1 = toSHA1(statement.actor.mbox);
                        statement.actor.mbox_sha1sum = sha1;
                        delete statement.actor.mbox;
                        if (statement.actor.name) {
                            delete statement.actor.name;
                        }

                    } else if (statement.actor.mbox_sha1sum != undefined) {
                        // Nothing to do

                    } else {
                        // Key is session_id, transform to pseudo mbox_sha1sum
                        var key = statement.context.extensions['http://xerte.org.uk/sessionId'];
                        if (key == undefined) {
                            key = statement.context.extensions[site_url + "sessionId"];
                        }
                        if (key != undefined) {
                            delete statement.actor;

              var sha1 = toSHA1("mailto:" + key + "@example.com");
              statement.actor = {
                mbox_sha1sum: sha1,
              };

              // remove group
            }
          }
          body.statements[x].actor;
        }
        $this.rawData.push(statement);
      }
      if (err !== null) {
        console.log("Failed to query statements: " + err);
        // TODO: do something with error, didn't get statements
        return;
      }
      if (body.more && body.more !== "") {
        ADL.XAPIWrapper.getStatements(null, body.more, getmorestatements);
      } else {
        if (activities == undefined) {
          activities = [];
        }
        activities[0] = undefined;
        activities = activities.filter(function (s) {
          return s != undefined;
        });
        if (activities.length > 0) {
          search = ADL.XAPIWrapper.searchParams();
          search["activity"] = activities[0];
          $.each(query, function (i, value) {
            if (i != "activities" && i != "activity" && i != "actor")
              search[i] = value;
          });
          if (query["actor"] != undefined) {
            search["agent"] = '{ "mbox" : "mailto:' + query["actor"] + '" }';
          }
          search["limit"] = limit;
          ADL.XAPIWrapper.getStatements(search, null, getmorestatements);
        } else {
          $this.rawDatamap = [];
          for (var i = 0; i < $this.rawData.length; i++)
            $this.rawDatamap[i] = i;
          callback();
        }
      }
    }
  );
};

DashboardState.prototype.getStatementsAggregate = function (q, one, callback) {
  var role = this.info ? this.info.role : "";
  var matchLaunched =
    '{"statement.verb.id" : { "$eq" : "http://adlnet.gov/expapi/verbs/launched" } }';
  var matchCourse = "";
  if (typeof q["activities"] != "undefined") {
    if (q["activities"].length == 1) {
      matchCourse =
        '{ "statement.object.id" :  { "$regex" :  "^' +
        q["activities"][0].replace(/\//g, "\\/") +
        '$" } }';
    } else {
      matchCourse = '{ "statement.object.id" :  { "$regex" :  "^(';
      for (var i = 0; i < q["activities"].length; i++) {
        matchCourse += q["activities"][i];
        if (i < q["activities"].length - 1) {
          matchCourse += "|";
        }
      }
      matchCourse += ')$" } }';
    }
  } else if (typeof q["activity"] != "undefined") {
    matchCourse =
      '{ "statement.object.id" :  { "$eq": "' + q["activity"] + '"} }';
  }

  var matchActor = "";
  if (typeof q["actor"] != "undefined") {
    matchActor = '{"statement.actor.mbox" : "mailto:' + q["actor"] + '"}';
  }
  if (role == "Teacher") {
    matchActor = '{"statement.actor.mbox" :  { "$in": [';
    this.info.users.forEach(function (user, i) {
      matchActor += '"mailto:' + user.email + '"';
      if (i < this.info.users.length - 1) {
        matchActor += ", ";
      }
    });
    matchActor += "] } }";
  }
  var matchDateRange = "";
  if (typeof q["since"] != "undefined" && typeof q["until"] != "undefined") {
    matchDateRange =
      '{"timestamp": { "$gte": { "$dte": "' +
      q["since"] +
      '" }, "$lte": { "$dte": "' +
      q["until"] +
      '" }}}';
  } else if (typeof q["since"] != "undefined") {
    matchDateRange = '{"statement.timestamp": {"$gte": "' + q["since"] + '"}}';
  } else if (typeof q["until"] != "undefined") {
    matchDateRange = '{"statement.timestamp": {"$lte": "' + q["until"] + '"}}';
  }

  var startDate = moment(q["since"]);
  var endDate = moment(q["until"]);
  // Create a week array
  var periods = [];
  var currDate = endDate;
  var beginOfPeriod = moment(currDate).subtract(15, "days").add(1, "ms");
  while (startDate <= beginOfPeriod) {
    periods.push(
      '{"timestamp": { "$gte": { "$dte": "' +
        beginOfPeriod.toISOString() +
        '" }, "$lte": { "$dte": "' +
        currDate.toISOString() +
        '" }}}'
    );
    currDate = moment(currDate).subtract(15, "days");
    beginOfPeriod = beginOfPeriod = moment(currDate)
      .subtract(15, "days")
      .add(1, "ms");
  }
  periods.push(
    '{"timestamp": { "$gte": { "$dte": "' +
      startDate.toISOString() +
      '" }, "$lte": { "$dte": "' +
      currDate.toISOString() +
      '" }}}'
  );

  // var project = '{"$project": { "statement.actor": 1, "statement.context" : 1, "statement.id" : 1, "statement.object" : 1,  "statement.timestamp" : 1, "statement.stored" : 1, "statement.verb" :  1, "_id": 0 }}';
  var project = '{"$project": { "statement": 1, "_id": 0 }}';
  var sort = '{"$sort" : {   "timestamp": -1,   "_id": 1 }}';
  var auth = btoa(this.info.lrs.lrskey + ":" + this.info.lrs.lrssecret);
  this.clear();
  if (
    typeof q["verb"] != "undefined" &&
    q["verb"] == "http://adlnet.gov/expapi/verbs/launched"
  ) {
    this.fetchData(
      q,
      role,
      [matchCourse, matchLaunched],
      matchActor,
      [sort, project],
      this.info.lrs.lrsendpoint + "?pipeline=",
      auth,
      periods,
      0,
      callback,
      null,
      "#loader_text",
      XAPI_DASHBOARD_DATA_PREPARE_RETRIEVAL
    );
  } else {
    this.fetchData(
      q,
      role,
      [matchCourse, matchLaunched],
      matchActor,
      [sort, project],
      this.info.lrs.lrsendpoint + "?pipeline=",
      auth,
      periods,
      0,
      callback,
      this.retrieveDataThroughAggregate,
      "#loader_text",
      XAPI_DASHBOARD_DATA_PREPARE_RETRIEVAL
    );
  }
};

DashboardState.prototype.retrieveDataThroughAggregate = function (
  q,
  dashboard_state,
  data,
  callback
) {
  var role = this.info ? this.info.role : "";
  var startDate = moment(q["since"]);
  var endDate = moment(q["until"]);

  var matchCourse = "";
  var related_activities = false;
  if (
    typeof q["related_activities"] != "undefined" &&
    q["related_activities"] == true
  ) {
    related_activities = true;
  }
  if (typeof q["activities"] != "undefined") {
    var postfix = "$";
    if (related_activities) {
      postfix = "(/|$)";
    }

    if (q["activities"].length == 1) {
      matchCourse =
        '{ "statement.object.id" :  { "$regex" :  "^' +
        q["activities"][0].replace(/\//g, "\\/") +
        postfix +
        '" } }';
    } else {
      matchCourse = '{ "statement.object.id" :  { "$regex" :  "^(';
      for (var i = 0; i < q["activities"].length; i++) {
        matchCourse += q["activities"][i];
        if (i < q["activities"].length - 1) {
          matchCourse += "|";
        }
      }
      matchCourse += ")" + postfix + '" } }';
    }
  } else if (typeof q["activity"] != "undefined") {
    if (related_activities) {
      matchCourse =
        '{ "statement.object.id" :  { "$regex" :  "^' +
        q["activities"][0].replace(/\//g, "\\/") +
        '(/|$)" } }';
    } else {
      matchCourse = '{ "statement.object.id" :  { "' + q["activity"] + '" }';
    }
  }

  var matchActor = "";
  if (typeof q["actor"] != "undefined") {
    matchActor = '{"statement.actor.mbox" : "mailto:' + q["actor"] + '"}';
  }
  if (role == "Teacher") {
    matchActor = '{"statement.actor.mbox" :  { "$in": [';
    this.info.users.forEach(function (user, i) {
      matchActor += '"mailto:' + user.email + '"';
      if (i < this.info.users.length - 1) {
        matchActor += ", ";
      }
    });
    matchActor += "] } }";
  }

  var matchVerb = "";
  if (typeof q["verb"] != "undefined") {
    matchVerb =
      '{"statement.verb.id" : { "$eq" : "http://adlnet.gov/expapi/verbs/launched" } }';
  }
  // Create a week array
  var periods = [];
  var currindex = 49;
  var currDate = endDate;
  var beginOfPeriod;
  while (currindex < data.length) {
    beginOfPeriod = moment(data[currindex].timestamp).add(1, "ms");
    periods.push(
      '{"timestamp": { "$gte": { "$dte": "' +
        beginOfPeriod.toISOString() +
        '" }, "$lte": { "$dte": "' +
        currDate.toISOString() +
        '" }}}'
    );
    currDate = moment(data[currindex].timestamp);
    currindex += 50;
  }
  periods.push(
    '{"timestamp": { "$gte": { "$dte": "' +
      startDate.toISOString() +
      '" }, "$lte": { "$dte": "' +
      currDate.toISOString() +
      '" }}}'
  );
  var sort = '{"$sort" : {   "timestamp": -1,   "_id": 1 }}';
  var project = '{"$project": { "statement": 1, "_id": 0 }}';
  var auth = btoa(
    dashboard_state.info.lrs.lrskey + ":" + dashboard_state.info.lrs.lrssecret
  );
  dashboard_state.clear();
  dashboard_state.fetchData(
    q,
    role,
    [matchCourse, matchVerb],
    matchActor,
    [sort, project],
    dashboard_state.info.lrs.lrsendpoint + "?pipeline=",
    auth,
    periods,
    0,
    callback,
    null,
    "#loader_text",
    XAPI_DASHBOARD_DATA_RETRIEVE_DATA
  );
};

DashboardState.prototype.fetchData = function (
  q,
  role,
  matcharray,
  matchactor,
  otherstages,
  url,
  auth,
  periods,
  currperiod,
  orgcallback,
  callback,
  loaderid,
  label
) {
  var $this = this;
  var match = '{ "$match": {"$and" : [' + periods[currperiod];
  for (var i = 0; i < matcharray.length; i++) {
    if (matcharray[i] != "") {
      match += ", " + matcharray[i];
    }
  }
  match += "]}}";

  var pipeline = "[" + match;
  for (var i = 0; i < otherstages.length; i++) {
    pipeline += ", " + otherstages[i];
  }
  pipeline += "]";

  $(loaderid).html(
    label + " " + Math.round((currperiod * 100) / periods.length) + "%"
  );

  $.ajax({
    type: "GET",
    url: url + encodeURIComponent(pipeline),
    dataType: "text",
    headers: {
      Authorization: "Basic " + auth,
    },
    success: function (data) {
      if (currperiod + 1 < periods.length) {
        var rawData = JSON.parse(data.replace(/&46;/g, "."));
        for (var i = 0; i < rawData.length; i++) {
          $this.rawData.push(rawData[i].statement);
        }
        $this.fetchData(
          q,
          role,
          matcharray,
          matchactor,
          otherstages,
          url,
          auth,
          periods,
          currperiod + 1,
          orgcallback,
          callback,
          loaderid,
          label
        );
      } else {
        var rawData = JSON.parse(data.replace(/&46;/g, "."));
        for (var i = 0; i < rawData.length; i++) {
          $this.rawData.push(rawData[i].statement);
        }
        if (callback != null) {
          callback(q, $this, $this.rawData, orgcallback);
        } else {
          $(loaderid).html(XAPI_DASHBOARD_DATA_PREPARE_GRAPHS);
          $this.rawDatamap = [];
          for (var i = 0; i < $this.rawData.length; i++)
            $this.rawDatamap[i] = i;
          setTimeout(function () {
            orgcallback($this.rawData);
          }, 0);
        }
      }
    },
  });
};
/*
DashboardState.prototype.getStatements = function(query, handler) {
    if (state.wrapper == undefined) {
        alert("Dashboard not initialized");
    }

    this.clear();
    var run = false;
    this.dashboard.fetchAllStatements(query, function(data) {
        if (!run) {
            run = true;
            this.rawData = data.contents;
            getAllInteractions(state.rawData);
            handler(state.rawData);
        }
    });

}

*/

DashboardState.prototype.combineUrls = function () {
  var url = site_url + this.info.template_id;
  var urls = [url];
  if (
    this.info.lrs.lrsurls != null &&
    this.info.lrs.lrsurls != "undefined" &&
    this.info.lrs.lrsurls != "" &&
    this.info.lrs.site_allowed_urls != null &&
    this.info.lrs.site_allowed_urls != "undefined" &&
    this.info.lrs.site_allowed_urls != ""
  ) {
    $this = this;
    urls = [url]
      .concat(this.info.lrs.lrsurls.split(","))
      .concat(
        this.info.lrs.site_allowed_urls.split(",").map(function (url) {
          return url + $this.info.template_id;
        })
      )
      .filter(function (url) {
        return url != "";
      });
  }
  var mapping = function (url) {
    return url;
  };
  if (urls.length > 1) {
    mapping = function (url) {
      urls.forEach(function (mUrl) {
        url = url.replace(mUrl, urls[0]);
      });
      return url;
    };
  }
  for (index in this.rawData) {
    statement = this.rawData[index];
    statement.object.id = mapping(statement.object.id);
    if (statement.context != undefined) {
      statement.context.extensions["http://xerte.org.uk/learningObjectId"] =
        mapping(
          statement.context.extensions["http://xerte.org.uk/learningObjectId"]
        );
    }
    this.rawData[index] = statement;
  }
  return this.rawData;
};

DashboardState.prototype.filterStatements = function (data, handler) {
  return data.contents.filter(handler);
};

DashboardState.prototype.filterOnGroup = function (name) {
  return function (statement) {
    return (
      statement.actor.objectType == "Group" &&
      statement.actor.account.name == name
    );
  };
};

DashboardState.prototype.userStartTime = function (statementidxs) {
  var first = this.rawData[statementidxs[statementidxs.length - 1]];
  return new Date(first.timestamp);
};

DashboardState.prototype.userCompleteTime = function (statementidxs) {
  var last = this.rawData[statementidxs[0]];
  return new Date(last.timestamp);
};

DashboardState.prototype.userDuration = function (statementidxs) {
  var startTime = this.userStartTime(statementidxs);
  var endTime = this.userCompleteTime(statementidxs);
  var time = (endTime - startTime) / 1000;
  return time;
};

DashboardState.prototype.groupStatements = function (data) {
  var groupedData = {};

  if (data == undefined) {
    if (this.groupedData != undefined) {
      return this.groupedData;
    } else {
      data = this.rawData;
    }
  }
  const groups = [];
  const $this = this;
  data.forEach(function (statement, i) {
    var participant = {
      attemptkeys: [],
      attempts: [],
      statementidxs: [],
    };

    if (statement.context.team != undefined) {
      var group = statement.context.team.account.name;
      if (groups.indexOf(group) == -1) {
        groups.push(group);
      }
    }
    if ($this.info.users !== undefined) {
      if (statement.actor.mbox != undefined) {
        var key = statement.actor.mbox.substr(7).trim();
        var user = $this.info.users.find((x) => x.email == key);
      } else if (statement.actor.mbox_sha1sum != undefined) {
        var key = statement.actor.mbox_sha1sum.trim();
        var user = $this.info.users.find((x) => x.sha1 == key);
      } else {
        var key = undefined;
      }
      if (user != undefined) {
        key = user.email;
        if (groupedData[key] == undefined) {
          participant["username"] = user.name;
          participant["mode"] = "username";
          participant["mbox"] = user.email;
          participant["key"] = key;
          groupedData[key] = participant;
        }
      } else {
        key = undefined;
      }
    } else {
      if (statement.actor.mbox != undefined) {
        // Key is email
        // Cutoff mailto:
        var key = statement.actor.mbox.substr(7).trim();
        if (groupedData[key] == undefined) {
          participant["mode"] = "mbox";
          participant["mbox"] = key;
          participant["key"] = key;
          if (statement.actor.name != undefined) {
            participant["username"] = statement.actor.name;
            participant["mode"] = "username";
          }
          groupedData[key] = participant;
        } else {
          if (
            statement.actor.name != undefined &&
            groupedData[key]["username"] == undefined
          ) {
            groupedData[key]["username"] = statement.actor.name;
            groupedData[key]["mode"] = "username";
          }
        }
      } else if (statement.actor.mbox_sha1sum != undefined) {
        // Key is sha1(email)
        var key = statement.actor.mbox_sha1sum;
        if (groupedData[key] == undefined) {
          participant["mode"] = "mbox_sha1sum";
          participant["mbox_sha1sum"] = key;
          participant["key"] = key;
          groupedData[key] = participant;
        }
      } else {
        // Key is group, session_id (if group is available), otherwise just session
        var group =
          statement.actor.group != undefined
            ? statement.actor.group.name
            : "global";
        if (
          statement.context != undefined &&
          statement.context.extensions != undefined &&
          statement.context.extensions["http://xerte.org.uk/sessionId"] !=
            undefined
        ) {
          var key =
            statement.context.extensions["http://xerte.org.uk/sessionId"];
          if (key == undefined) {
            key = statement.context.extensions[site_url + "sessionId"];
          }
          if (key != undefined) {
            key = group + " " + key;
            if (groupedData[key] == undefined) {
              participant["mode"] = "session";
              participant["sessionid"] = key;
              participant["key"] = key;
              groupedData[key] = participant;
            }
          }
        }
      }
    }
    if (key != undefined) {
      if (
        statement.context != undefined &&
        statement.context.extensions != undefined &&
        statement.context.extensions["http://xerte.org.uk/sessionId"] !=
          undefined
      ) {
        var attemptkey =
          statement.context.extensions["http://xerte.org.uk/sessionId"];
        if (groupedData[key]["attempts"][attemptkey] == undefined) {
          groupedData[key]["attempts"][attemptkey] = {
            key: attemptkey,
            parentattempt: null,
            subattempts: [],
            statementidxs: [],
          };
          groupedData[key]["attemptkeys"].push({
            key: attemptkey,
          });
        }
        groupedData[key]["statementidxs"].push(i);
        groupedData[key]["attempts"][attemptkey]["statementidxs"].push(i);
      }
    }
  });
  // prepare statistics
  var learningObjects = this.getLearningObjects();
  var url = "";
  if (learningObjects.length > 0) {
    url = learningObjects[0].url;
  }
  for (var user in groupedData) {
    var lastcompleted = null;
    var maxcompletedattempt = null;
    var maxcompletion = -1;
    for (var attempt in groupedData[user]["attempts"]) {
      var attemptdata = groupedData[user]["attempts"][attempt];
      // Try to find exited
      var statementidxs = this.getStatementsWithResultExtension(
        attemptdata.statementidxs,
        url
      );
      if (statementidxs[0] != undefined) {
        var statement = this.rawData[statementidxs[0]];
        if (
          statement.result != undefined &&
          statement.result.extensions[
            "http://xerte.org.uk/xapi/trackingstate"
          ] != undefined
        ) {
          var trackingState = JSON.parse(
            statement.result.extensions[
              "http://xerte.org.uk/xapi/trackingstate"
            ]
          );
          var xtresults = XTResults(true, trackingState);
          attemptdata["score"] = Math.round(
            (xtresults.averageScore * xtresults.completion) / 100
          );
          attemptdata["completedpercentage"] = xtresults.completion;
          attemptdata["start"] = xtresults.start;
          attemptdata["duration"] = this.userDuration(
            attemptdata.statementidxs
          );
          attemptdata["completedstatus"] = getCompletionStatus(trackingState);
          attemptdata["successstatus"] = getSuccessStatus(trackingState);
          attemptdata["trackingstate"] = trackingState;
          if (
            lastcompleted == null &&
            attemptdata["completedstatus"] == "completed"
          ) {
            lastcompleted = attempt;
          }
          if (attemptdata["completedpercentage"] > maxcompletion) {
            maxcompletion = attemptdata["completedpercentage"];
            maxcompletedattempt = attempt;
          }
        } else {
          attemptdata["score"] = statement.result.raw;
          attemptdata["completedpercentage"] = 0;
          attemptdata["start"] = statement.timestamp;
          attemptdata["duration"] = this.userDuration(
            attemptdata.statementidxs
          );
          attemptdata["completedstatus"] = "unknown";
          attemptdata["successstatus"] = "unknown";
        }
      } else {
        // No exited statement found
        // Get first and last statements
        var first =
          this.rawData[
            attemptdata.statementidxs[attemptdata.statementidxs.length - 1]
          ];
        var last = this.rawData[attemptdata.statementidxs[0]];
        attemptdata["score"] = 0;
        attemptdata["completedpercentage"] = 0;
        attemptdata["start"] = this.userStartTime(attemptdata.statementidxs);
        attemptdata["duration"] = this.userDuration(attemptdata.statementidxs);
        attemptdata["completedstatus"] = "unknown";
        attemptdata["successstatus"] = "unknown";
      }
    }
    if (lastcompleted != null) {
      attemptdata = groupedData[user]["attempts"][lastcompleted];
      groupedData[user]["score"] = attemptdata["score"];
      groupedData[user]["completedpercentage"] =
        attemptdata["completedpercentage"];
      groupedData[user]["start"] = attemptdata["start"];
      groupedData[user]["duration"] = attemptdata["duration"];
      groupedData[user]["completedstatus"] = attemptdata["completedstatus"];
      groupedData[user]["successstatus"] = attemptdata["successstatus"];
      groupedData[user]["usedattempt"] = lastcompleted;
    } else if (maxcompletedattempt != null) {
      attemptdata = groupedData[user]["attempts"][maxcompletedattempt];
      groupedData[user]["score"] = attemptdata["score"];
      groupedData[user]["completedpercentage"] =
        attemptdata["completedpercentage"];
      groupedData[user]["start"] = attemptdata["start"];
      groupedData[user]["duration"] = attemptdata["duration"];
      groupedData[user]["completedstatus"] = attemptdata["completedstatus"];
      groupedData[user]["successstatus"] = attemptdata["successstatus"];
      groupedData[user]["usedattempt"] = maxcompletedattempt;
    } else {
      var statementidxs = this.getExitedStatements(
        groupedData[user].statementidxs,
        url
      );
      if (statementidxs[0] != undefined) {
        var statement = this.rawData[statementidxs[0]];
        groupedData[user]["score"] = statement.result.raw;
        groupedData[user]["completedpercentage"] = 0;
        groupedData[user]["start"] = statement.timestamp;
        groupedData[user]["duration"] = statement.result.duration;
        groupedData[user]["completedstatus"] = "unknown";
        groupedData[user]["successstatus"] = "unknown";
      } else {
        // Get first statement
        var statement =
          this.rawData[
            groupedData[user].statementidxs[
              groupedData[user].statementidxs.length - 1
            ]
          ];
        groupedData[user]["score"] = 0;
        groupedData[user]["completedpercentage"] = 0;
        groupedData[user]["start"] = statement.timestamp;
        groupedData[user]["duration"] = 0;
        groupedData[user]["completedstatus"] = "unknown";
        groupedData[user]["successstatus"] = "unknown";
      }
    }

    // concat resumed session statements if needed and make a summary entry for attempts that were accomplished in 2 or more sessions.
    var attemptkeys = [];
    var attempts = [];
    var resumed = [];
    var activeResumed = false; // True if attempts should be part of an attempt done in more than one session
    var activeResumedSummary;
    var summarydata;
    for (var attempt in groupedData[user]["attempts"]) {
      var attemptdata = groupedData[user]["attempts"][attempt];
      if (typeof attemptdata["trackingstate"] != "undefined") {
        var trackingState = attemptdata["trackingstate"];
        if (
          typeof trackingState.resumedSessions != "undefined" &&
          trackingState.resumedSessions.length > 0
        ) {
          if (resumed[attempt] == undefined) {
            attempts[attempt + "-summary"] = JSON.parse(
              JSON.stringify(attemptdata)
            );
            summarydata = attempts[attempt + "-summary"];
            attemptkeys.push({
              key: attempt + "-summary",
            });

            activeResumed = true;
            activeResumedSummary = attempt + "-summary";
            attempts[attempt + "-summary"].key = attempt + "-summary";
            attemptdata["parentattempt"] = activeResumedSummary;

            var maxcompletion = 0;
            //summarydata['duration'] = 0;
            for (var i in trackingState.resumedSessions) {
              var session = trackingState.resumedSessions[i];
              resumed[session] = true;
              if (
                typeof groupedData[user]["attempts"][session] != "undefined"
              ) {
                groupedData[user]["attempts"][session]["parentattempt"] =
                  activeResumedSummary;
                if (
                  groupedData[user]["attempts"][session][
                    "completedpercentage"
                  ] > maxcompletion
                ) {
                  maxcompletion =
                    groupedData[user]["attempts"][session][
                      "completedpercentage"
                    ];
                }
                summarydata["duration"] +=
                  groupedData[user]["attempts"][session]["duration"];
                summarydata["subattempts"].push(session);
                summarydata["statementidxs"] = attemptdata[
                  "statementidxs"
                ].concat(
                  groupedData[user]["attempts"][session]["statementidxs"]
                );
              }
            }
            attemptdata["completedpercentage"] -= maxcompletion;
            if (
              groupedData[user]["usedattempt"] != undefined &&
              groupedData[user]["usedattempt"] == attempt
            ) {
              groupedData[user]["usedattempt"] = attempt + "-summary";
              groupedData[user]["duration"] = summarydata["duration"];
            }
          } else {
            // This is a one of the sessions already accounted for earlier
            // adapt completion
            var maxcompletion = 0;
            var maxduration = 0;
            for (var i in trackingState.resumedSessions) {
              var session = trackingState.resumedSessions[i];
              if (
                typeof groupedData[user]["attempts"][session] != "undefined"
              ) {
                groupedData[user]["attempts"][session]["parentattempt"] =
                  activeResumedSummary;
                if (
                  groupedData[user]["attempts"][session][
                    "completedpercentage"
                  ] > maxcompletion
                ) {
                  maxcompletion =
                    groupedData[user]["attempts"][session][
                      "completedpercentage"
                    ];
                }
              }
            }
            attemptdata["completedpercentage"] -= maxcompletion;
          }
        } else {
          activeResumed = false;
        }
      } else {
        if (activeResumed && attemptdata["completedstatus"] == "unknown") {
          attemptdata["parentattempt"] = activeResumedSummary;
        } else {
          activeResumed = false;
        }
      }
      attempts[attempt] = attemptdata;
      attemptkeys.push({
        key: attempt,
      });
    }
    groupedData[user]["attempts"] = attempts;
    groupedData[user]["attemptkeys"] = attemptkeys;
  }

  this.groups = groups;
  this.groupedData = groupedData;
  return groupedData;
};

DashboardState.prototype.groupByAccount = function (data) {
  var groupedData = [];

  data.forEach(function (statement, i) {
    if (statement.actor.mbox_sha1sum == undefined) {
      return;
    }
    var name = statement.actor.mbox_sha1sum;
    if (groupedData[name] == undefined) {
      groupedData[name] = [];
    }
    statement.actor.account = {};
    completeLearningObjectIdUrl = "";
    if (statement.context == undefined) {
      return;
    }
    extensions = statement.context.extensions;
    Object.keys(extensions).forEach(function (ext) {
      if (ext.endsWith("/learningObjectId")) {
        completeLearningObjectIdUrl = ext;
      }
    });
    if (completeLearningObjectIdUrl != "") {
      learningObjectUrl = extensions[completeLearningObjectIdUrl];
      statement.actor.account.homePage = learningObjectUrl;
    }
    groupedData[name].push(i);
  });
  this.groupedData = groupedData;
  return groupedData;
};

DashboardState.prototype.groupStatementsOnSession = function (statements) {
  var nStatements = [];
  var $this = this;
  statements.forEach(function (sList) {
    sList.forEach(function (s) {
      var session =
        $this.rawData[s].context.extensions["http://xerte.org.uk/sessionId"];
      if (nStatements[session] == undefined) {
        nStatements[session] = [];
        nStatements.length++;
      }
      nStatements[session].push(s);
    });
  });
  return nStatements;
};

DashboardState.prototype.calculateDuration = function (grouped_statements) {
  var $this = this;
  var totalDuration = 0;
  var total = 0;
  for (var i in grouped_statements) {
    var startedVerbs = ['http://adlnet.gov/expapi/verbs/initialized'];
    var exitedVerbs = [
      'http://adlnet.gov/expapi/verbs/exited',
      'http://adlnet.gov/expapi/verbs/scored',
    ];
    var statements = grouped_statements[i];
    statements.sort(function (a, b) {
      return (
        new Date($this.rawData[a].timestamp) -
        new Date($this.rawData[b].timestamp)
      );
    });
    var nStatements = [];
    for (var i = 0; i < statements.length; i++) {
      if (i == 0) {
        nStatements.push(statements[i]);
      } else if (
        exitedVerbs.indexOf(this.rawData[statements[i]].verb.id) >= 0
      ) {
        nStatements.push(statements[i]);
      }
    }
    for (var i = 0; i < nStatements.length; i += 2) {
      var start = this.rawData[nStatements[i]];
      var end = this.rawData[nStatements[i + 1]];
      var startTime = new Date(start.timestamp);
      if (end != undefined) {
        var endTime = new Date(end.timestamp);
        total++;
        totalDuration += (endTime - startTime) / 1000;
      }
    }
  }
  return totalDuration / total;
};

DashboardState.prototype.getLearningObjectsOnExited = function (data) {
  /*
    var data = data.sort(function(a, b) {
        return new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ?
            -1 : 1;
    });
    */
  var learningObjects = [];
  var learningObjectsFound = [];
  data.forEach(function (statementidx) {
    var statement = this.rawData[statementidx];
    var verb = statement.verb.id;
    if (verb == "http://adlnet.gov/expapi/verbs/exited") {
      if (
        statement.context != undefined &&
        statement.context.extensions[
          "http://xerte&46;org&46;uk/learningObjectTitle"
        ] != undefined &&
        statement.context.extensions[
          "http://xerte&46;org&46;uk/learningObjectId"
        ] != undefined
      ) {
        objectId =
          statement.context.extensions[
            "http://xerte&46;org&46;uk/learningObjectId"
          ];
        if (learningObjectsFound.indexOf(objectId) == -1) {
          learningObjectsFound.push(objectId);
          learningObjects.push({
            url: objectId,
            name: statement.context.extensions[
              "http://xerte&46;org&46;uk/learningObjectTitle"
            ],
          });
        }
      }
    }
  });
  this.learningObjects = learningObjects;
  return learningObjects;
};

DashboardState.prototype.getLearningObjects = function () {
  var $this = this;
  if (this.learningObjects != undefined) {
    return this.learningObjects;
  }

  var data = [];
  for (var i = 0; i < this.rawData.length; i++) {
    data[i] = i;
  }

  data = data.sort(function (a, b) {
    return new Date($this.rawData[a].timestamp).getTime() <
      new Date($this.rawData[b].timestamp).getTime()
      ? -1
      : 1;
  });

  var learningObjects = [];
  var learningObjectsFound = [];
  data.forEach(function (statementidx) {
    /*
        if (this.mode == "mbox_sha1sum" && statement.actor.mbox_sha1sum ==
            undefined) {
            return;
        }
        */
    var statement = $this.rawData[statementidx];
    var verb = statement.verb.id;
    if (verb == "http://adlnet.gov/expapi/verbs/launched") {
      var objectId = statement.object.id;
      if (
        learningObjectsFound.indexOf(objectId) == -1 &&
        statement.context != undefined &&
        statement.context.extensions[
          "http://xerte.org.uk/learningObjectTitle"
        ] != undefined
      ) {
        learningObjectsFound.push(objectId);
        learningObjects.push({
          url: objectId,
          name: statement.context.extensions[
            "http://xerte.org.uk/learningObjectTitle"
          ],
        });
      }
    }
  });
  this.learningObjects = learningObjects;
  return learningObjects;
};

DashboardState.prototype.getAllInteractions = function (data) {
  var learningObjects = this.getLearningObjects();
  var interactions = [];
  var lIndex = 0;
  if (data == undefined) {
    data = this.rawDatamap;
  }
  var $this = this;
  learningObjects.forEach(function (learningObject) {
    var iIndex = 0;
    var interactionObjects = [];
    var interactionObjectsFound = [];
    var children = [];
    for (
      var statementidx = data.length - 1;
      statementidx >= 0;
      statementidx--
    ) {
      var statement = $this.rawData[statementidx];
      var verb = statement.verb.id;
      if (verb == "http://adlnet.gov/expapi/verbs/initialized") {
        var objectId = statement.object.id;
        if (objectId.startsWith(learningObject.url)) {
          if (interactionObjectsFound.indexOf(objectId) == -1) {
            interactionObjectsFound.push(objectId);
            var subId = objectId.replace(learningObject.url, "");
            var subIdSplit = subId.split("/");
            var parent = "";
            if (subIdSplit.length == 3) {
              parent = learningObject.url + "/" + subIdSplit[1];
            }
            if (children[objectId] == undefined) {
              children[objectId] = [];
              children.length++;
            }
            var type = "page";

            if (parent != "") {
              type = "interaction";
              if (children[parent] == undefined) {
                children[parent] = [];
                children.length++;
              }
              children[parent].push(objectId);
            }

            var interaction_name;
            if (statement.object.definition.name.en != undefined) {
              interaction_name = statement.object.definition.name.en;
            } else if (statement.object.definition.name["en-US"] != undefined) {
              interaction_name = statement.object.definition.name["en-US"];
            } else {
              interaction_name = "";
            }
            interactionObjects.push({
              type: type,
              url: objectId,
              name: interaction_name,
              parent: parent,
              learningObjectIndex: lIndex,
              interactionObjectIndex: iIndex,
            });
            iIndex++;
          }
        }
      }
    }
    interactionObjects.forEach(function (l) {
      l.children = children[l.url];
    });
    interactions[learningObject.url] = interactionObjects;
    lIndex++;
  });
  interactions = this.filterNotPassedFailed(interactions);
  for (lo in interactions) {
    var lo_interactions = interactions[lo];
    var n_interactions = [];
    lo_interactions.forEach(function (parent) {
      if (parent.parent == "") {
        n_interactions.push(parent);
        lo_interactions.forEach(function (child) {
          if (parent.url == child.parent) {
            n_interactions.push(child);
          }
        });
      }
    });
    interactions[lo] = n_interactions;
  }
  this.interactions = interactions;

  return interactions;
};

DashboardState.prototype.filterNotPassedFailed = function (allInteractions) {
  var $this = this;
  var newInteractions = [];
  for (var interactionIndex in allInteractions) {
    var interactions = allInteractions[interactionIndex];
    newInteractions[interactionIndex] = [];
    interactions.forEach(function (interaction) {
      var statements = $this.rawData;
      var hasPassedOrFailed = false;
      var url = interaction.url;
      statements.forEach(function (s) {
        if (
          (s.object.id == url || url.indexOf(s.object.id) != -1) &&
          (s.verb.id == "http://adlnet.gov/expapi/verbs/failed" ||
            s.verb.id == "http://adlnet.gov/expapi/verbs/passed" ||
            s.verb.id == "http://adlnet.gov/expapi/verbs/scored" ||
            s.verb.id == "https://w3id.org/xapi/video/verbs/paused" ||
            s.verb.id == "https://w3id.org/xapi/video/verbs/played" ||
            s.verb.id == "http://adlnet.gov/expapi/verbs/answered")
        ) {
          hasPassedOrFailed = true;
        }
      });

      if (!hasPassedOrFailed && statements.length > 0) {
        //$this.rawData.filter(function(s) { return s.object.id != url});
        //for (user in $this.groupedData) {
        //    $this.groupedData[user].statements.filter(function(s) {return s.object.id != url});
        //}
      } else {
        newInteractions[interactionIndex].push(interaction);
      }
    });
  }
  return newInteractions;
};

DashboardState.prototype.getInteractions = function (learningObject) {
  if (this.interactions === undefined || Object.keys(this.interactions).length === 0) {
    this.getAllInteractions();
  }
  return this.interactions[learningObject];
};

// TODO check if userdata still works
DashboardState.prototype.getFilteredStatements = function (
  statementidxs,
  verb,
  learningObjectUrl
) {
  var statementidxList = this.getStatementidxsList(statementidxs, verb);
  var $this = this;
  statementidxList = statementidxList.filter(function (statementidx) {
    return $this.rawData[statementidx].object.id == learningObjectUrl;
  });
  return statementidxList;
};

// TODO, check
DashboardState.prototype.hasCompletedLearningObject = function (
  statementidxs,
  learningObject
) {
  return (
    this.getStatement(
      statementidxs,
      "http://adlnet.gov/expapi/verbs/completed"
    ) != undefined
  );
};

DashboardState.prototype.hasStartedLearningObject = function (
  statementidxs,
  learningObjectUrl
) {
  var statementidxList = this.getStatementidxsList(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/launched"
  );
  var $this = this;
  var res =
    statementidxList.filter(function (statementidx) {
      return $this.rawData[statementidx].object.id == learningObjectUrl;
    }).length > 0;
  return res;
};

DashboardState.prototype.getExitedStatements = function (
  statementidxs,
  learningObjectUrl
) {
  return this.getFilteredStatements(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/exited",
    learningObjectUrl
  );
};

DashboardState.prototype.getStatementsWithResultExtension = function (
  statementidxs,
  learningObjectUrl
) {
  var statementidxList = this.getStatementidxsList(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/exited"
  ).concat(
    this.getStatementidxsList(
      statementidxs,
      "http://adlnet.gov/expapi/verbs/completed"
    )
  );
  var $this = this;
  var res = statementidxList.filter(function (statementidx) {
    var statement = $this.rawData[statementidx];
    return statement.object.id == learningObjectUrl;
  });
  return res;
};

DashboardState.prototype.hasCompletedInteraction = function (
  statementidxs,
  interactionUrl
) {
  var statementidxList = this.getStatementidxsList(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/scored"
  )
    .concat(
      this.getStatementidxsList(
        statementidxs,
        "http://adlnet.gov/expapi/verbs/answered"
      )
    )
    .concat(
      this.getStatementidxsList(
        statementidxs,
        "https://w3id.org/xapi/video/verbs/paused"
      )
    );
  var $this = this;
  var res =
    statementidxList.filter(function (statementidx) {
      var statement = $this.rawData[statementidx];
      if (
        statement.object.id + "/video" == interactionUrl &&
        statement.verb.id == "https://w3id.org/xapi/video/verbs/paused"
      ) {
        return true;
      }
      return (
        statement.result != undefined &&
        statement.result.completion &&
        statement.object.id == interactionUrl
      );
    }).length > 0;
  return res;
};

DashboardState.prototype.hasCompletedNotJudgedInteraction = function (
  statementidxs,
  interactionUrl
) {
  var statementidxList = this.getStatementidxsList(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/scored"
  )
    .concat(
      this.getStatementidxsList(
        statementidxs,
        "http://adlnet.gov/expapi/verbs/answered"
      )
    )
    .concat(
      this.getStatementidxsList(
        statementidxs,
        "https://w3id.org/xapi/video/verbs/paused"
      )
    );
  var $this = this;
  var res =
    statementidxList.filter(function (statementidx) {
      var statement = $this.rawData[statementidx];
			let judge = true;
			if(statement.result != undefined && statement.result.extensions != undefined){
					judge = statement.result.extensions["http://xerte.org.uk/result/judge"] ?? true;
			}
      if (
        statement.object.id + "/video" == interactionUrl &&
        statement.verb.id == "https://w3id.org/xapi/video/verbs/paused"
      ) {
        return true && !judge;
      }
      return (
        statement.result != undefined &&
        statement.result.completion &&
        statement.object.id == interactionUrl &&
				!judge 
      );
    }).length > 0;
  return res;
};

DashboardState.prototype.hasPassedInteraction = function (
  statementidxs,
  interactionUrl
) {
  var statementidxList = this.getStatementidxsList(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/scored"
  ).concat(
    this.getStatementidxsList(
      statementidxs,
      "http://adlnet.gov/expapi/verbs/answered"
    )
  );
  var $this = this;
  var res =
    statementidxList.filter(function (statementidx) {
      var statement = $this.rawData[statementidx];
      return (
        statement.result != undefined &&
        statement.result.completion &&
        statement.result.success &&
        statement.object.id == interactionUrl
      );
    }).length > 0;

  // Check video
  //First check whther there are video statements in theis interaction
  if (interactionUrl.endsWith("/video")) {
    statementidxList = statementidxs.filter(function (statementidx) {
      var statement = $this.rawData[statementidx];
      return statement.object.id == interactionUrl;
    });
  } else {
    statementidxList = statementidxs.filter(function (statementidx) {
      var statement = $this.rawData[statementidx];
      return statement.object.id == interactionUrl + "/video";
    });
  }
  if (!res && statementidxList.length > 0) {
    // Get paused statements
    statementidxList = this.getStatementidxsList(
      statementidxList,
      "https://w3id.org/xapi/video/verbs/paused"
    );

    // Get duration of the video from extension https://w3id.org/xapi/video/extensions/length
    var lengthStatementIdxs = statementidxList.filter(function (statementidx) {
      var statement = $this.rawData[statementidx];
      return (
        statement.context != undefined &&
        statement.context.extensions != undefined &&
        statement.context.extensions[
          "https://w3id.org/xapi/video/extensions/length"
        ] &&
        statement.context.extensions[
          "https://w3id.org/xapi/video/extensions/length"
        ] != null
      );
    });
    if (lengthStatementIdxs.length > 0) {
      var statement = $this.rawData[lengthStatementIdxs[0]];
      var videoLength = parseInt(
        statement.context.extensions[
          "https://w3id.org/xapi/video/extensions/length"
        ]
      );
      var durationBlocks = this.getDurationBlocks(
        statementidxList,
        interactionUrl
      );
      var totalViewed = this.getProgressFromDurations(durationBlocks);
      if (totalViewed > 0) res = totalViewed / videoLength > 0.8;
      else res = false;
    }
  }
  return res;
};

DashboardState.prototype.getAllInteractionScores = function (
  statementidxs,
  interactionUrl
) {
  var scores = this.getInteractionScores(
    "http://adlnet.gov/expapi/verbs/scored",
    statementidxs,
    interactionUrl
  );
  //var scores = scores.concat(this.getInteractionScores("http://adlnet.gov/expapi/verbs/answered", userdata['key'], interactionUrl));
  return scores;
};

DashboardState.prototype.getAllScoreStatements = function (statementidxs) {
  var scores = this.getStatementidxsList(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/scored"
  );
  //var scores = scores.concat(this.getStatementsList(statements,
  //    "http://adlnet.gov/expapi/verbs/answered"));
  return scores;
};

DashboardState.prototype.getInteractionScores = function (
  verb,
  statementidxs,
  interactionUrl
) {
  var scores = [];
  var statementidxList = this.getStatementidxsList(statementidxs, verb);
  var $this = this;
  var scored = statementidxList.filter(function (statementidx) {
    return $this.rawData[statementidx].object.id == interactionUrl;
  });
  for (var index in scored) {
    var score = scored[index];
    scores.push(this.rawData[score].result.score.scaled);
  }
  return scores;
};

DashboardState.prototype.getAllDurations = function (
  statementidxs,
  interactionUrl
) {
  var durations = [];
  var statementidxList = this.getStatementidxsList(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/scored"
  );
  var $this = this;
  var durationList = statementidxList.filter(function (statementidx) {
    return $this.rawData[statementidx].object.id == interactionUrl;
  });
  for (var index in durationList) {
    var duration = durationList[index];
    durations.push(
      moment.duration(this.rawData[duration].result.duration).asSeconds()
    );
  }
  return durations;
};

DashboardState.prototype.consolidateSegments = function (pausedSegments) {
    // 1. Sort played segments on start time (first make a copy)
    if (pausedSegments.length == 0) {
        return 0;
    }
    var $this = this;
    csegments = pausedSegments.map(function(s) {
        var segments = $this.rawData[s].result.extensions["https://w3id.org/xapi/video/extensions/played-segments"].split("[,]");
        if (segments[0] == "") {
            return [];
        }
        return segments.map(function(segment) {
            return {
                start: Math.round(segment.split("[.]")[0]),
                end: Math.round(segment.split("[.]")[1])
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
        return (parseFloat(a.start) > parseFloat(b.start)) ? 1 : ((parseFloat(b.start) > parseFloat(a.start)) ? -1 : parseFloat(a.end) - parseFloat(b.end));
    });
    // 2. Combine the segments
    var csegments = [];
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
}

DashboardState.prototype.getDurationBlocks = function (
  statementidxs,
  interactionUrl
) {
  var $this = this;
  var lstatementidxs;
  if (interactionUrl.endsWith("/video")) {
    lstatementidxs = statementidxs.filter(function (statementidx) {
      return $this.rawData[statementidx].object.id == interactionUrl;
    });
  } else {
    lstatementidxs = statementidxs.filter(function (statementidx) {
      return $this.rawData[statementidx].object.id == interactionUrl + "/video";
    });
  }
  var statementidxList = this.getStatementidxsList(
    lstatementidxs,
    "https://w3id.org/xapi/video/verbs/paused"
  );
  var durations = statementidxList.map(function (statementidx) {
    return $this
      .rawData[statementidx].result.extensions["https://w3id.org/xapi/video/extensions/played-segments"];
  });
  if (durations.length > 0) {
    var segments = this.consolidateSegments(statementidxList);
    return segments;
  }
  return [];
};

DashboardState.prototype.getProgressFromDurations = function (segments) {
  var progress = 0;
  segments.forEach(function (segment) {
    progress += segment.end - segment.start;
  });
  return progress;
};

DashboardState.prototype.hasStartedInteraction = function (
  statementidxs,
  interaction
) {
  var statementidxList = this.getStatementidxsList(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/initialized"
  );
  var $this = this;
  return (
    statementidxList.filter(function (statementidx) {
      return $this.rawData[statementidx].object.id == interaction;
    }).length > 0
  );
};

// TODO: get last statement, not first, also check whether to return statment or index
DashboardState.prototype.getStatement = function (statementidxs, verb) {
  for (var i in statementidxs) {
    var statement = this.rawData[statementidxs[i]];
    if (statement.verb.id == verb) {
      return statement;
    }
  }
  return undefined;
};

DashboardState.prototype.getStatementidxsList = function (statementidxs, verb) {
  var foundStatements = [];
  for (var i in statementidxs) {
    var statement = this.rawData[statementidxs[i]];
    if (statement.verb.id == verb) {
      foundStatements.push(statementidxs[i]);
    }
  }
  return foundStatements;
};

DashboardState.prototype.getStatementsFromIdxs = function (statementidxs) {
  var foundStatements = [];
  for (var i in statementidxs) {
    var statement = this.rawData[statementidxs[i]];
    foundStatements.push(statement);
  }
  return foundStatements;
};

DashboardState.prototype.getStatementsList = function (statementidxs, verb) {
  var foundStatements = [];
  for (var i in statementidxs) {
    var statement = this.rawData[statementidxs[i]];
    if (statement.verb.id == verb) {
      foundStatements.push(statement);
    }
  }
  return foundStatements;
};

DashboardState.prototype.getInteractionStatements = function (interaction) {
  var statementidxs = [];
  for (var user in this.groupedData) {
    var userData = this.groupedData[user]["statementidxs"];
    for (var i in userData) {
      var statement = this.rawData[userData[i]];
      if (statement.object.id == interaction) {
        statementidxs.push(userData[i]);
      }
    }
  }
  return statementidxs;
};

DashboardState.prototype.getInteractionStatementsFromIdxs = function (
  statementidxs,
  interactionUrl
) {
  var idxs = [];
  for (var i in statementidxs) {
    if (this.rawData[i].object.id == interactionUrl) {
      idxs.push(i);
    }
  }
  return idxs;
};

DashboardState.prototype.selectInteractionById = function (
  interactions,
  interactionUrl
) {
  var res = undefined;
  for (var i = 0; i < interactions.length; i++) {
    if (interactions[i].url == interactionUrl) {
      res = interactions[i];
      break;
    }
  }
  return res;
};

DashboardState.prototype.getQuestion = function (interactionObjectUrl) {
  var question = undefined;
  var $this = this;
  var statementidxs = this.rawDatamap.filter(function (statementidx) {
    var statement = $this.rawData[statementidx];
    return (
      statement.object.id == interactionObjectUrl &&
      statement.verb.id == "http://adlnet.gov/expapi/verbs/answered"
    );
  });
  for (var i = 0; i < statementidxs.length; i++) {
    var statement = this.rawData[statementidxs[i]];
    if (question == undefined || question.interactionType == undefined) {
      question = statement.object.definition;
			if(question != undefined && statement.result != undefined && statement.result.extensions != undefined && statement.result.extensions["http://xerte.org.uk/result/judge"] != undefined){
					question.judge = statement.result.extensions["http://xerte.org.uk/result/judge"];
			}else {
					question.judge = true;
			}
      // Special case for openanswer
      if (
        question != undefined &&
        question.interactionType == undefined &&
        statement.object.definition.description["en-US"].indexOf("Model") >= 0
      ) {
        question.interactionType = "text";
      }
      question.interactionUrl = statement.object.id;
    } else {
      break;
    }
  }
  return question;
};

DashboardState.prototype.getQuestionResponses = function (
  interactionObjectUrl
) {
  var $this = this;

  let groupedEntries = Object.entries($this.groupedData);
  let answers = groupedEntries
    .flatMap(([key, value]) =>
      Object.entries(value.attempts)
        .filter(([aKey, aValue]) => aKey === value.usedattempt)
        .flatMap(([k, v]) =>
          v.statementidxs.filter(
            (idx) => $this.rawData[idx].object.id === interactionObjectUrl
            && $this.rawData[idx].verb.id === 'http://adlnet.gov/expapi/verbs/answered'
          )
        )
    )
  return answers;
};

DashboardState.prototype.getAnswers = function (
  statementidxs,
  interactionObjectUrl
) {
  var answers = [];
  var statementidxList = this.getStatementidxsList(
    statementidxs,
    "http://adlnet.gov/expapi/verbs/answered"
  );
  var $this = this;
  var answered = statementidxList.filter(function (statementidx) {
    var statement = $this.rawData[statementidx];
    return statement.object.id == interactionObjectUrl;
  });
  for (var index in answered) {
    var answer = this.rawData[answered[index]];
    answers.push(answer.result.response);
  }
  return answers;
};

DashboardState.prototype.getStatementsFromLearningObject = function (
  learningObjectUrl
) {
  var $this = this;
  var elemidxs = this.rawDatamap.filter(function (elemidx) {
    var elem = $this.rawData[elemidx];
    if (
      elem.context == undefined ||
      elem.context.extensions == undefined ||
      elem.context.extensions["http://xerte.org.uk/learningObjectId"] ==
        undefined
    ) {
      return false;
    }
    return (
      elem.context.extensions["http://xerte.org.uk/learningObjectId"] ==
      learningObjectUrl
    );
  });
  return elemidxs;
};

DashboardState.prototype.getStatementidxsFromGroupedData = function (
  interactionUrl
) {
  let groupedData = {};
  for (let key in this.groupedData) {
    let val = this.groupedData[key];
    if (
      this.currentGroup.group_id == 'all-groups' ||
      this.currentGroup.group_id ==
        this.getGroupFromStatements(val.statementidxs)
    ) {
      groupedData[key] = val;
    }
  }

  let groupedEntries = Object.entries(groupedData);
  let statements = groupedEntries
    .map(([key, value]) =>
      Object.entries(value.attempts)
        .filter(([aKey, aValue]) => aKey === value.usedattempt)
        .map(([k, v]) =>
          v.statementidxs.filter(
            (idx) => this.rawData[idx].object.id === interactionUrl
          )
        )
    )
  return statements;
}

DashboardState.prototype.stripHtml = function (
  inputText
) {
  const div = document.createElement("div");
  div.innerHTML = inputText;
  return div.firstChild.innerText ?? inputText;
}
