var state;

function DashboardState(info) {
    this.info = info;
    this.conf = {
        "endpoint": info.lrs.lrsendpoint + '/',
        "user": info.lrs.lrskey,
        "password": info.lrs.lrssecret,
        "strictCallbacks": true
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
    if(this.pageSize == undefined){
        this.pageSize = 5;
    }
    this.currentGroup = {
        group_id: "all-groups"
    }
}

DashboardState.prototype.clear = function() {
    this.rawData = [];
    this.learningObjects = undefined;
    this.interactionObjects = undefined;
    this.groupedData = undefined;
    this.interactions = undefined;
    this.dashboard = new ADL.XAPIDashboard();
    this.pageIndex = 0;
};

DashboardState.prototype.getStatements = function(q, one, callback) {
    if (this.info.lrs.aggregate)
    {
        this.getStatementsAggregate(q, one, callback);
    }
    else {
        this.getStatementsxAPI(q, one, callback);
    }
};

DashboardState.prototype.getStatementsxAPI = function(q, one, callback) {
    //ADL.XAPIWrapper.log.debug = true;
    ADL.XAPIWrapper.changeConfig(this.conf);

    var search = ADL.XAPIWrapper.searchParams();
    var activities = q.activities;
    var query = q;
    $.each(q, function(i, value) {
        if(i != "activities")
            search[i] = value;
    });
    if (one) {
        search['limit'] = 1;
    } else {
        search['limit'] = 1000;
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
                if ($this.info.dashboard.anonymous) {
                    if (statement.actor.mbox != undefined) {
                        // Key is email
                        // cutoff mailto: and calc sha1:
                        var key = statement.actor.mbox.substr(7).trim();
                        var sha1 = toSHA1(key);
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

                            var sha1 = toSHA1(key);
                            statement.actor = {
                                'mbox_sha1sum': sha1
                            };

                            // remove group
                        }
                    }
                    body.statements[x].actor
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
                if(activities == undefined)
                {
                    activities = [];
                }
                activities[0] = undefined;
                activities = activities.filter(function(s) {return s != undefined})
                if(activities.length > 0)
                {
                    search = ADL.XAPIWrapper.searchParams();
                    search["activity"] = activities[0];
                    $.each(query, function(i, value) {
                        if(i != "activities" && i != "activity")
                            search[i] = value;
                    });
                    search['limit'] = limit;
                    ADL.XAPIWrapper.getStatements(search, null, getmorestatements);
                }else{
                    callback();
                }
            }
        }
    );
};

DashboardState.prototype.getStatementsAggregate = function(q, one, callback) {
    var role = "teacher";
    var matchLaunched = '{"statement.verb.id" : { "$eq" : "http://adlnet.gov/expapi/verbs/launched" } }';
    var matchCourse = '';
    if (typeof q['activities'] != "undefined")
    {

        if (q['activities'].length == 1)
        {
            matchCourse = '{ "statement.object.id" :  { "$regex" :  "^' + q['activities'][0].replace(/\//g, "\\/") + '$" } }';
        }
        else
        {
            matchCourse = '{ "statement.object.id" :  { "$regex" :  "^(';
            for (var i=0; i<q['activities'].length; i++)
            {
                matchCourse += q['activities'][i];
                if (i<q['activities'].length - 1)
                {
                    matchCourse += '|'
                }
            }
            matchCourse += ')$" } }';

        }
    }
    else if (typeof q['activity'] != "undefined")
    {
        matchCourse = '{ "statement.object.id" :  { ' + q['activity'] + '}';
    }

    var matchActor = '';
    if (typeof q['actor'] != "undefined")
    {
        matchActor = '{"statement.actor.mbox" : "mailto:' + q['actor'] + '"}';
    }
    var matchDateRange = '';
    if (typeof q['since'] != "undefined" && typeof q['until'] != "undefined") {
        matchDateRange = '{"timestamp": { "$gte": { "$dte": "' + q['since'] + '" }, "$lte": { "$dte": "' + q['until'] + '" }}}';
    }
    else if (typeof q['since'] != "undefined")
    {
        matchDateRange ='{"statement.timestamp": {"$gte": "' + q['since'] + '"}}';
    }
    else if (typeof q['until'] != "undefined")
    {
        matchDateRange = '{"statement.timestamp": {"$lte": "' + q['until'] + '"}}';
    }

    var startDate = moment(q['since']);
    var endDate = moment(q['until']);
    // Create a week array
    var periods = [];
    var currDate = endDate;
    var beginOfPeriod = moment(currDate).subtract(15, 'days').add(1, 'ms');
    while (startDate <= beginOfPeriod)
    {
        periods.push('{"timestamp": { "$gte": { "$dte": "' + beginOfPeriod.toISOString() + '" }, "$lte": { "$dte": "' + currDate.toISOString() + '" }}}');
        currDate = moment(currDate).subtract(15, 'days');
        beginOfPeriod = beginOfPeriod = moment(currDate).subtract(15, 'days').add(1, 'ms');
    }
    periods.push('{"timestamp": { "$gte": { "$dte": "' + startDate.toISOString() + '" }, "$lte": { "$dte": "' + currDate.toISOString() + '" }}}');

    // var project = '{"$project": { "statement.actor": 1, "statement.context" : 1, "statement.id" : 1, "statement.object" : 1,  "statement.timestamp" : 1, "statement.stored" : 1, "statement.verb" :  1, "_id": 0 }}';
    var project = '{"$project": { "statement": 1, "_id": 0 }}';
    var sort = '{"$sort" : {   "statement.timestamp": -1,   "_id": 1 }}';
    var auth = btoa(this.info.lrs.lrskey + ":" + this.info.lrs.lrssecret);
    this.clear();
    if (typeof q['verb'] != "undefined" && q['verb'] == "http://adlnet.gov/expapi/verbs/launched")
    {
        this.fetchData(q, role, [matchCourse, matchLaunched], matchActor, [sort, project], this.info.lrs.lrsendpoint + '?pipeline=', auth, periods, 0, callback, null, "#loader_text", XAPI_DASHBOARD_DATA_PREPARE_RETRIEVAL);
    }
    else {
        this.fetchData(q, role, [matchCourse, matchLaunched], matchActor, [sort, project], this.info.lrs.lrsendpoint + '?pipeline=', auth, periods, 0, callback, this.retrieveDataThroughAggregate, "#loader_text", XAPI_DASHBOARD_DATA_PREPARE_RETRIEVAL);
    }

};

DashboardState.prototype.retrieveDataThroughAggregate = function(q, dashboard_state, data, callback)
{
    var role = "teacher";
    var startDate = moment(q['since']);
    var endDate = moment(q['until']);

    var matchCourse = '';
    var related_activities = false;
    if (typeof q['related_activities'] != "undefined" && q['related_activities'] == true)
    {
        related_activities = true;
    }
    if (typeof q['activities'] != "undefined")
    {
        var postfix = '$';
        if (related_activities)
        {
            postfix = '(\/|$)'
        }

        if (q['activities'].length == 1)
        {
            matchCourse = '{ "statement.object.id" :  { "$regex" :  "^' + q['activities'][0].replace(/\//g, "\\/") + postfix + '" } }';
        }
        else
        {
            matchCourse = '{ "statement.object.id" :  { "$regex" :  "^(';
            for (var i=0; i<q['activities'].length; i++)
            {
                matchCourse += q['activities'][i];
                if (i<q['activities'].length - 1)
                {
                    matchCourse += '|'
                }
            }
            matchCourse += ')' + postfix + '" } }';

        }
    }
    else if (typeof q['activity'] != "undefined")
    {
        if (related_activities)
        {
            matchCourse = '{ "statement.object.id" :  { "$regex" :  "^' + q['activities'][0].replace(/\//g, "\\/") + '(\/|$)" } }';
        }
        else
        {
            matchCourse = '{ "statement.object.id" :  { ' + q['activity'] + '}';
        }
    }

    var matchActor = '';
    if (typeof q['actor'] != "undefined")
    {
        matchActor = '{"statement.actor.mbox" : "mailto:' + q['actor'] + '"}';
    }

    var matchVerb = '';
    if (typeof q['verb'] != "undefined")
    {
        matchVerb = '{"statement.verb.id" : { "$eq" : "http://adlnet.gov/expapi/verbs/launched" } }';
    }
    // Create a week array
    var periods = [];
    var currindex = 99;
    var currDate = endDate;
    var beginOfPeriod;
    while (currindex < data.length)
    {
        beginOfPeriod = moment(data[currindex].timestamp).add(1, 'ms');
        periods.push('{"timestamp": { "$gte": { "$dte": "' + beginOfPeriod.toISOString() + '" }, "$lte": { "$dte": "' + currDate.toISOString() + '" }}}');
        currDate = moment(data[currindex].timestamp);
        currindex += 100;
    }
    periods.push('{"timestamp": { "$gte": { "$dte": "' + startDate.toISOString() + '" }, "$lte": { "$dte": "' + currDate.toISOString() + '" }}}');
    var sort = '{"$sort" : {   "statement.timestamp": -1,   "_id": 1 }}';
    var project = '{"$project": { "statement": 1, "_id": 0 }}';
    var auth = btoa(dashboard_state.info.lrs.lrskey + ":" + dashboard_state.info.lrs.lrssecret);
    dashboard_state.clear();
    dashboard_state.fetchData(q, role,[matchCourse, matchVerb], matchActor, [sort, project],dashboard_state.info.lrs.lrsendpoint + '?pipeline=', auth, periods, 0, callback, null, "#loader_text", XAPI_DASHBOARD_DATA_RETRIEVE_DATA);
};

DashboardState.prototype.fetchData = function(q, role, matcharray, matchactor, otherstages, url, auth, periods, currperiod, orgcallback, callback, loaderid, label)
{
    var $this = this;
    var match = '{ "$match": {"$and" : [' + periods[currperiod];
    for (var i=0; i<matcharray.length; i++) {
        if (matcharray[i] != '') {
            match += ', ' + matcharray[i];
        }
    }
    match +=  ']}}';

    var pipeline = '[' +  match;
    for (var i=0; i<otherstages.length; i++)
    {
        pipeline += ', ' + otherstages[i];
    }
    pipeline += ']';

    $(loaderid).html(label + ' ' + Math.round(currperiod * 100 / periods.length) + '%');

    $.ajax
    ({
        type: "GET",
        url: url + encodeURIComponent(pipeline),
        dataType: 'text',
        headers: {
            "Authorization": "Basic " + auth
        },
        success: function (data) {
            if (currperiod + 1 < periods.length)
            {
                var rawData = JSON.parse(data.replace(/&46;/g, '.'));
                for (var i=0; i<rawData.length; i++)
                {
                    $this.rawData.push(rawData[i].statement);
                }
                $this.fetchData(q, role, matcharray, matchactor, otherstages, url, auth, periods, currperiod + 1, orgcallback, callback, loaderid, label);
            }
            else
            {
                var rawData = JSON.parse(data.replace(/&46;/g, '.'));
                for (var i=0; i<rawData.length; i++)
                {
                    $this.rawData.push(rawData[i].statement);
                }
                if (callback != null) {
                    callback(q, $this, $this.rawData, orgcallback);
                }
                else
                {
                    $(loaderid).html(XAPI_DASHBOARD_DATA_PREPARE_GRAPHS);
                    setTimeout(function() {
                        orgcallback($this.rawData);
                    }, 0);
                }
            }
        }
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

DashboardState.prototype.combineUrls = function()
{
    var url = site_url + this.info.template_id;
    var urls = [url];
    if (this.info.lrs.lrsurls != null && this.info.lrs.lrsurls != "undefined" && this.info.lrs.lrsurls != ""
        && this.info.lrs.site_allowed_urls != null && this.info.lrs.site_allowed_urls != "undefined" && this.info.lrs.site_allowed_urls != "") {
        $this = this;
        urls = [url].concat(this.info.lrs.lrsurls.split(",")).concat(this.info.lrs.site_allowed_urls.split(",").map(function(url) {return url + $this.info.template_id})).filter(function(url) {return url != ""});
    }
    var mapping = function(url)
    {
        return url;
    };
    if(urls.length > 1)
    {
        mapping = function(url)
        {
            urls.forEach(function(mUrl){
                url = url.replace(mUrl, urls[0]);
            });
            return url;
        }

    }
    for(index in this.rawData)
    {
        statement = this.rawData[index];
        statement.object.id = mapping(statement.object.id);
        if(statement.context != undefined)
        {
            statement.context.extensions["http://xerte.org.uk/learningObjectId"] = mapping(statement.context.extensions["http://xerte.org.uk/learningObjectId"]);
        }
        this.rawData[index] = statement;
    }
    return this.rawData;

}

DashboardState.prototype.filterStatements = function(data, handler) {
    return data.contents.filter(handler);
};

DashboardState.prototype.filterOnGroup = function(name) {
    return function(statement) {
        return statement.actor.objectType == "Group" && statement.actor.account
            .name == name;
    };
};

DashboardState.prototype.groupStatements = function(data) {
    var groupedData = {};

    if (data == undefined) {
        if (this.groupedData != undefined) {
            return this.groupedData;
        } else {
            data = this.rawData;
        }
    }
    groups = [];
    data.forEach(function(statement) {
        var attempt = {
            statements: []
        };

        if(statement.context.team != undefined)
        {
            var group = statement.context.team.account.name;
            if(groups.indexOf(group) == -1)
            {
                groups.push(group);
            }
        }
        if (statement.actor.mbox != undefined) {
            // Key is email
            // Cutoff mailto:
            var key = statement.actor.mbox.substr(7).trim();
            if (groupedData[key] == undefined) {
                attempt['mode'] = 'mbox';
                attempt['mbox'] = key;
                attempt['key'] = key;
                if (statement.actor.name != undefined) {
                    attempt['username'] = statement.actor.name;
                    attempt['mode'] = 'username';
                }
                groupedData[key] = attempt;
            } else {
                if (statement.actor.name != undefined && groupedData[key]['username'] == undefined) {
                    groupedData[key]['username'] = statement.actor.name;
                    groupedData[key]['mode'] = 'username';
                }
            }
            groupedData[key]['statements'].push(statement);
        } else if (statement.actor.mbox_sha1sum != undefined) {
            // Key is sha1(email)
            var key = statement.actor.mbox_sha1sum;
            if (groupedData[key] == undefined) {
                attempt['mode'] = 'mbox_sha1sum';
                attempt['mbox_sha1sum'] = key;
                attempt['key'] = key;
                groupedData[key] = attempt;
            }
            groupedData[key]['statements'].push(statement);
        } else {
            // Key is group, session_id (if group is available), otherwise just session
            var group = (statement.actor.group != undefined ? statement.actor.group.name : 'global');
            var key = statement.context.extensions['http://xerte.org.uk/sessionId'];
            if (key == undefined) {
                key = statement.context.extensions[site_url + "sessionId"];
            }
            if (key != undefined) {
                key = group + ' ' + key;
                if (groupedData[key] == undefined) {
                    attempt['mode'] = 'session';
                    attempt['sessionid'] = key;
                    attempt['key'] = key;
                    groupedData[key] = attempt;
                }
                groupedData[key]['statements'].push(statement);
            }
        }
    });
    this.groups = groups;
    this.groupedData = groupedData;
    return groupedData;
};

DashboardState.prototype.groupByAccount = function(data) {
    var groupedData = [];

    data.forEach(function(statement) {
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
        Object.keys(extensions).forEach(function(ext) {
            if (ext.endsWith("/learningObjectId")) {
                completeLearningObjectIdUrl = ext;
            }
        });
        if (completeLearningObjectIdUrl != "") {
            learningObjectUrl = extensions[completeLearningObjectIdUrl];
            statement.actor.account.homePage = learningObjectUrl;

        }
        groupedData[name].push(statement);
    });
    this.groupedData = groupedData;
    return groupedData;
};

DashboardState.prototype.groupStatementsOnSession = function(statements) {
    nStatements = [];
    statements.forEach(function(sList) {
        sList.forEach(function(s) {
            session = s.context.extensions["http://xerte.org.uk/sessionId"];
            if (nStatements[session] == undefined) {
                nStatements[session] = [];
                nStatements.length++;
            }
            nStatements[session].push(s);
        });
    });
    return nStatements;
};

DashboardState.prototype.calculateDuration = function(statements) {
    totalDuration = 0;
    total = 0;
    for (var i in statements) {
        startedVerbs = ["http://adlnet.gov/expapi/verbs/initialized"]
        exitedVerbs = ["http://adlnet.gov/expapi/verbs/exited", "http://adlnet.gov/expapi/verbs/scored"]
        statement = statements[i];
        statement.sort(function(a, b){
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
        var nStatements = [];
        for(var i = 0; i < statement.length; i++)
        {
            if(i == 0)
            {
                nStatements.push(statement[i])
            }else{
                if(
                    (startedVerbs.indexOf(statement[i].verb.id) >= 0 &&  exitedVerbs.indexOf(statement[i-1].verb.id) >= 0) ||
                    (exitedVerbs.indexOf(statement[i].verb.id) >= 0 &&  startedVerbs.indexOf(statement[i-1].verb.id) >= 0)
                )
                {
                    nStatements.push(statement[i]);
                }
            }
        }
        statement = nStatements;
        for(var i = 0; i < statement.length; i+=2) {

                start = statement[i];
                end = statement[i+1];
                startTime = new Date(start.timestamp);
                if(end != undefined){
                    endTime = new Date(end.timestamp);
                    total++;
                    totalDuration += (endTime - startTime) / 1000;
                }
        }
    }
    return totalDuration / total;
};

DashboardState.prototype.groupBySession = function(data) {
    var groupedData = [];
    data.forEach(function(statement) {
        if (statement.context == undefined) {
            return;
        }
        contextSessionUrl = "/sessionId";
        completeLearningObjectIdUrl = "";
        completeSessionUrl = "";
        extensions = statement.context.extensions;
        Object.keys(extensions).forEach(function(ext) {
            if (ext.endsWith(contextSessionUrl)) {
                completeSessionUrl = ext;
            }
        });
        Object.keys(extensions).forEach(function(ext) {
            if (ext.endsWith("/learningObjectId")) {
                completeLearningObjectIdUrl = ext;
            }
        });
        if (completeSessionUrl != "" &&
            (completeLearningObjectIdUrl != "" ||
                (statement.actor != undefined &&
                    statement.actor.account != undefined &&
                    statement.actor.account.homePage != undefined))) {
            sessionId = extensions[completeSessionUrl];

            if (groupedData[sessionId] == undefined) {
                groupedData[sessionId] = [];
                groupedData.length++;
            }
            statement.context.session = sessionId;
            groupedData[sessionId].push(statement);
        }
        if (completeLearningObjectIdUrl != "") {
            learningObjectUrl = extensions[completeLearningObjectIdUrl];
            if (statement.actor.account == undefined) {
                statement.actor.account = {};
            }
            statement.actor.account.homePage = learningObjectUrl;

        }
    });
    this.groupedData = groupedData;
    return groupedData;
};

DashboardState.prototype.getLearningObjectsOnExited = function(data) {
    /*
    var data = data.sort(function(a, b) {
        return new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ?
            -1 : 1;
    });
    */
    var learningObjects = []
    var learningObjectsFound = []
    data.forEach(function(statement) {
        var verb = statement.verb.id;
        if (verb == "http://adlnet.gov/expapi/verbs/exited") {

            if (statement.context != undefined &&
                statement.context.extensions[
                    "http://xerte&46;org&46;uk/learningObjectTitle"] !=
                undefined &&
                statement.context.extensions[
                    "http://xerte&46;org&46;uk/learningObjectId"] !=
                undefined
            ) {
                objectId = statement.context.extensions[
                    "http://xerte&46;org&46;uk/learningObjectId"];
                if (learningObjectsFound.indexOf(objectId) == -1) {
                    learningObjectsFound.push(objectId);
                    learningObjects.push({
                        url: objectId,
                        name: statement.context.extensions[
                            "http://xerte&46;org&46;uk/learningObjectTitle"
                        ]
                    });
                }
            }
        }

    });
    this.learningObjects = learningObjects;
    return learningObjects;
};


DashboardState.prototype.getLearningObjects = function(data) {
    if (data == undefined && this.learningObjects != undefined) {
        return this.learningObjects;
    }

    data = this.rawData;
    data = data.sort(function(a, b) {
        return new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ?
            -1 : 1;
    });

    learningObjects = [];
    learningObjectsFound = [];
    data.forEach(function(statement) {
        /*
        if (this.mode == "mbox_sha1sum" && statement.actor.mbox_sha1sum ==
            undefined) {
            return;
        }
        */
        verb = statement.verb.id;
        if (verb == "http://adlnet.gov/expapi/verbs/launched") {
            objectId = statement.object.id;
            if (learningObjectsFound.indexOf(objectId) == -1 &&
                statement.context != undefined && statement.context.extensions[
                    "http://xerte.org.uk/learningObjectTitle"] != undefined) {
                learningObjectsFound.push(objectId);
                learningObjects.push({
                    url: objectId,
                    name: statement.context.extensions[
                        "http://xerte.org.uk/learningObjectTitle"
                    ]
                });

            }
        }

    });
    this.learningObjects = learningObjects;
    return learningObjects;
};

DashboardState.prototype.getAllInteractions = function(data) {
    var learningObjects = this.getLearningObjects(data);
    var interactions = [];
    var lIndex = 0;
    if (data == undefined) {
        data = this.rawData;
    }
    learningObjects.forEach(function(learningObject) {
        var iIndex = 0;
        var interactionObjects = [];
        var interactionObjectsFound = [];
        var children = [];
        data.forEach(function(statement) {
            var verb = statement.verb.id;
            if (verb ==
                "http://adlnet.gov/expapi/verbs/initialized") {
                var objectId = statement.object.id;
                if (objectId.startsWith(learningObject.url)) {
                    if (interactionObjectsFound.indexOf(
                            objectId) == -1) {
                        interactionObjectsFound.push(objectId);
                        var subId = objectId.replace(learningObject
                            .url, "");
                        var subIdSplit = subId.split("/");
                        var parent = "";
                        if (subIdSplit.length == 3) {
                            parent = learningObject.url + "/" +
                                subIdSplit[1];
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
                        if(statement.object.definition.name.en != undefined)
                        {
                            interaction_name = statement.object.definition.name.en;
                        }else if(statement.object.definition.name["en-US"] != undefined)
                        {
                            interaction_name = statement.object.definition.name["en-US"]
                        }else{
                            interaction_name = "";
                        }
                        interactionObjects.push({
                            type: type,
                            url: objectId,
                            name: interaction_name,
                            parent: parent,
                            learningObjectIndex: lIndex,
                            interactionObjectIndex: iIndex
                        });
                        iIndex++;
                    }
                }
            }
        });
        interactionObjects.forEach(function(l) {
            l.children = children[l.url];
        });
        interactions[learningObject.url] = interactionObjects;
        lIndex++;
    });
    interactions = this.filterNotPassedFailed(interactions);
    for(lo in interactions){
        lo_interactions = interactions[lo];
        n_interactions = [];
        lo_interactions.forEach(function(parent){
            if(parent.parent == ""){
                n_interactions.push(parent);
                lo_interactions.forEach(function(child){
                    if(parent.url == child.parent)
                    {
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

DashboardState.prototype.filterNotPassedFailed = function(allInteractions) {
    $this = this;
    newInteractions = [];
    for (interactionIndex in allInteractions) {
        var interactions = allInteractions[interactionIndex];
        newInteractions[interactionIndex] = [];
        interactions.forEach(function(interaction) {
            statements = $this.rawData;
            hasPassedOrFailed = false;
            var url = interaction.url;
            statements.forEach(function(s) {
                if ((s.object.id == url || url.indexOf(s.object.id) != -1) && (s.verb.id == "http://adlnet.gov/expapi/verbs/failed" || s.verb.id ==
                        "http://adlnet.gov/expapi/verbs/passed" || s.verb.id ==
                        "http://adlnet.gov/expapi/verbs/scored" || s.verb.id == "https://w3id.org/xapi/video/verbs/paused" || s.verb.id ==
                        "https://w3id.org/xapi/video/verbs/played" || s.verb.id == "http://adlnet.gov/expapi/verbs/answered")) {
                    hasPassedOrFailed = true;
                }
            });

            if (!hasPassedOrFailed && statements.length > 0) {

                $this.rawData.filter(function(s) { return s.object.id != url});
                for (user in $this.groupedData) {
                    $this.groupedData[user].statements.filter(function(s) {return s.object.id != url});
                }

            } else {
                newInteractions[interactionIndex].push(interaction);
            }

        })
    }
    return newInteractions;
}

DashboardState.prototype.getInteractions = function(learningObject) {
    if (this.interactions == undefined) {
        this.getAllInteractions();
    }
    return this.interactions[learningObject];
};

DashboardState.prototype.getFilteredStatements = function(userdata, verb, learningObjectUrl) {
    var statements = userdata['statements'];
    var statementList = this.getStatementsList(statements, verb);
    statementList = statementList.filter(function(statement) {
        return statement.object.id == learningObjectUrl;
    });
    return statementList;
}

DashboardState.prototype.hasCompletedLearningObject = function(userdata, learningObject) {
    return this.getStatement(userdata['statements'],
        "http://adlnet.gov/expapi/verbs/completed") != undefined;
};

DashboardState.prototype.hasStartedLearningObject = function(userdata, learningObjectUrl) {
    var statements = userdata['statements'];
    var statementList = this.getStatementsList(statements,
        "http://adlnet.gov/expapi/verbs/launched");
    var res = statementList.filter(function(statement) {
        return statement.object.id == learningObjectUrl;
    }).length > 0;
    return res;
};

DashboardState.prototype.getExitedStatements = function(userdata, learningObjectUrl) {
    return this.getFilteredStatements(userdata, "http://adlnet.gov/expapi/verbs/exited", learningObjectUrl);
}

DashboardState.prototype.hasCompletedInteraction = function(userdata, interactionUrl) {
    var statements = userdata['statements'];
    var statementList = this.getStatementsList(statements,
        "http://adlnet.gov/expapi/verbs/scored");
    var res = statementList.filter(function(statement) {
        if(statement.object.id + "/video" == interactionUrl && statement.verb.id == "http://id.tincanapi.com/verb/viewed")
        {
            return true;
        }
        return statement.result != undefined && statement.result.completion &&
            statement.object.id == interactionUrl;
    }).length > 0;
    return res;
};

DashboardState.prototype.hasPassedInteraction = function(userdata, interactionUrl) {
    var statements = userdata['statements'];
    var statementList = this.getStatementsList(statements, "http://adlnet.gov/expapi/verbs/scored")
        .concat(this.getStatementsList(statements, "http://id.tincanapi.com/verb/viewed"));
    var res = statementList.filter(function(statement) {
        if(statement.object.id + "/video" == interactionUrl && statement.verb.id == "http://id.tincanapi.com/verb/viewed")
        {
            return statement.result.score.scaled > 0.55;
        }
        return statement.result != undefined && statement.result.completion &&
            statement.result.success &&
            statement.object.id == interactionUrl;
    }).length > 0;
    return res;
};

DashboardState.prototype.getAllInteractionScores = function(userdata, interactionUrl) {
    var scores = this.getInteractionScores("http://adlnet.gov/expapi/verbs/scored", userdata, interactionUrl);
    //var scores = scores.concat(this.getInteractionScores("http://adlnet.gov/expapi/verbs/answered", userdata['key'], interactionUrl));
    return scores;
};

DashboardState.prototype.getAllScoreStatements = function(statements) {
    var scores = this.getStatementsList(statements,
        "http://adlnet.gov/expapi/verbs/scored");
    //var scores = scores.concat(this.getStatementsList(statements,
    //    "http://adlnet.gov/expapi/verbs/answered"));
    return scores;
};

DashboardState.prototype.getInteractionScores = function(verb, userdata, interactionUrl) {
    var scores = [];
    var statements = userdata['statements'];
    var statementList = this.getStatementsList(statements, verb);
    var scored = statementList.filter(function(statement) {
        return statement.object.id == interactionUrl;
    });
    for (var index in scored) {
        var score = scored[index];
        scores.push(score.result.score.scaled);
    }
    return scores;
};

DashboardState.prototype.getAllDurations = function(userdata, interactionUrl) {
    var durations = [];
    var statements = userdata['statements'];
    var statementList = this.getStatementsList(statements, "http://adlnet.gov/expapi/verbs/scored");
    var durationList = statementList.filter(function(statement) {
        return statement.object.id == interactionUrl;
    });
    for (var index in durationList) {
        var duration = durationList[index];
        durations.push(moment.duration(duration.result.duration).asSeconds());
    }
    return durations;
};

DashboardState.prototype.consolidateSegments = function (pausedSegments) {
    // 1. Sort played segments on start time (first make a copy)
    if (pausedSegments.length == 0) {
        return 0;
    }
    csegments = pausedSegments.map(function(s) {
        segments = s.result.extensions["https://w3id.org/xapi/video/extensions/played-segments"].split("[,]");
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
    segments = [];
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
        while (i < segments.length && parseFloat(segment.end) >= parseFloat(segments[i].start)) {
            segment.end = segments[i].end;
            i++;
        }
        csegments.push(segment);
    }
    return csegments;
}

DashboardState.prototype.getDurationBlocks = function(userdata, interactionUrl)
{
    var statements = userdata['statements'].filter(function(statement) {
        return statement.object.id == interactionUrl + "/video";
    });
    var statementList = this.getStatementsList(statements, "https://w3id.org/xapi/video/verbs/paused");
    var durations = statementList.map(function(s) {return s.result.extensions["https://w3id.org/xapi/video/extensions/played-segments"]});
    if(durations.length > 0)
    {
        segments = this.consolidateSegments(statementList);
        return segments
    }
    return [];
}

DashboardState.prototype.hasStartedInteraction = function(userdata, interaction) {
    var statements = userdata['statements'];
    var statementList = this.getStatementsList(statements,
        "http://adlnet.gov/expapi/verbs/initialized");
    return statementList.filter(function(statement) {
        return statement.object.id == interaction;
    }).length > 0;
};

// TODO: get last statement, not first
DashboardState.prototype.getStatement = function(statements, verb) {
    for (var i in statements) {
        var statement = statements[i];
        if (statement.verb.id == verb) {
            return statement;
        }
    }
    return undefined;
};

DashboardState.prototype.getStatementsList = function(statements, verb) {
    var foundStatements = [];
    for (var i in statements) {
        var statement = statements[i];
        if (statement.verb.id == verb) {
            foundStatements.push(statement);
        }
    }
    return foundStatements;
};

DashboardState.prototype.getInteractionStatements = function(interaction) {
    var statements = [];
    for (var user in this.groupedData) {
        var userData = this.groupedData[user]['statements'];
        for (var i in userData) {
            var statement = userData[i];
            if (statement.object.id == interaction) {
                statements.push(statement);
            }
        }
    }
    return statements;
};

DashboardState.prototype.selectInteractionById = function(statements, interactionUrl) {
    res = undefined;
    statements.forEach(function(inter) {
        if (inter.url == interactionUrl) {
            res = inter;
        }
    });
    return res;
};

DashboardState.prototype.getQuestion = function(interactionObjectUrl) {
    var question = undefined;
    var statements = this.rawData.filter(function(statement) {
            return statement.object.id == interactionObjectUrl &&
                statement.verb.id == "http://adlnet.gov/expapi/verbs/answered";
        });
    for (var i=0; i<statements.length; i++)
    {
        var statement = statements[i];
        if (question == undefined || question.interactionType == undefined) {
            question = statement.object.definition;
            // Special case for openanswer
            if (question != undefined && question.interactionType == undefined && statement.object.definition.description["en-US"].indexOf("Model") >= 0 )
            {
                question.interactionType = 'text';
            }
            question.interactionUrl = statement.object.id;
        }
        else
        {
            break;
        }
    }
    return question;
};

DashboardState.prototype.getQuestionResponses = function(interactionObjectUrl) {
    var answers = [];
    this.rawData.filter(function(statement) {
        return statement.object.id == interactionObjectUrl &&
            statement.verb.id ==
            "http://adlnet.gov/expapi/verbs/answered";
    }).forEach(function(statement) {
        answers.push(statement);
    });
    return answers;
};

DashboardState.prototype.getAnswers = function(userdata, interactionObjectUrl) {
    var answers = [];
    var statements = userdata['statements'];
    var statementList = this.getStatementsList(statements,
        "http://adlnet.gov/expapi/verbs/answered");
    answered = statementList.filter(function(statement) {
        return statement.object.id == interactionObjectUrl;
    });
    for (var index in answered) {
        answer = answered[index];
        answers.push(answer.result.response);
    }
    return answers;
};


DashboardState.prototype.getStatementsFromLearningObject = function(learningObjectUrl) {
    elems = this.rawData.filter(function(elem) {
        if (elem.context == undefined ||
            elem.context.extensions == undefined ||
            elem.context.extensions[
                "http://xerte.org.uk/learningObjectId"] ==
            undefined
        ) {
            return false;
        }
        return elem.context.extensions[
                "http://xerte.org.uk/learningObjectId"] ==
            learningObjectUrl
    });
    return elems;
};
