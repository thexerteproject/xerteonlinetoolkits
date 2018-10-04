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
}

DashboardState.prototype.clear = function() {
    this.rawData = [];
    this.learningObjects = undefined;
    this.interactionObjects = undefined;
    this.groupedData = undefined;
    this.interactions = undefined;
    this.dashboard = new ADL.XAPIDashboard();
};

DashboardState.prototype.getStatements = function(q, one, callback) {

    //ADL.XAPIWrapper.log.debug = true;
    ADL.XAPIWrapper.changeConfig(this.conf);

    var search = ADL.XAPIWrapper.searchParams();
    $.each(q, function(i, value) {
        search[i] = value;
    });
    if (one) {
        search['limit'] = 1;
    } else {
        search['limit'] = 10000;
    }
    this.clear();
    var $this = this;
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
                callback();
            }
        }
    );
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
    data.forEach(function(statement) {
        var attempt = {
            statements: []
        };
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
    this.groupedData = groupedData;
    return groupedData;
};

DashboardState.prototype.groupByAccount = function(data) {
    var groupedData = [];

    data.forEach(function(statement) {
        if (statement.actor.mbox_sha1sum == undefined) {
            return;
        }
        name = statement.actor.mbox_sha1sum;
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
        statement = statements[i];
        if (statement.length == 2) {
            total++;
            start = statement[0];
            end = statement[1];
            startTime = new Date(start.timestamp);
            endTime = new Date(end.timestamp);
            totalDuration += (endTime - startTime) / 1000;
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


DashboardState.prototype.getLearningObjects = function(data = undefined) {
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

DashboardState.prototype.getAllInteractions = function(data = undefined) {
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
    this.interactions = interactions;

    return interactions;
};

DashboardState.prototype.filterNotPassedFailed = function(allInteractions) {
    $this = this;
    newInteractions = [];
    for (interactionIndex in allInteractions) {
        interactions = allInteractions[interactionIndex];
        newInteractions[interactionIndex] = [];
        interactions.forEach(function(interaction) {
            statements = $this.rawData;
            hasPassedOrFailed = false;
            url = interaction.url;
            statements.forEach(function(s) {
                if (s.object.id == url && (s.verb.id == "http://adlnet.gov/expapi/verbs/failed" || s.verb.id ==
                        "http://adlnet.gov/expapi/verbs/passed" || s.verb.id ==
                        "http://adlnet.gov/expapi/verbs/scored" || s.verb.id == "https://w3id.org/xapi/video/verbs/paused" || s.verb.id ==
                        "https://w3id.org/xapi/video/verbs/played" || s.verb.id == "http://adlnet.gov/expapi/verbs/answered")) {
                    hasPassedOrFailed = true;
                }
            });

            if (!hasPassedOrFailed && statements.length > 0) {

                $this.rawData.filter(s => s.object.id != url);
                for (user in $this.groupedData) {
                    $this.groupedData[user].statements.filter(s => s.object.id != url);
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
    res = statementList.filter(function(statement) {
        return statement.object.id == learningObjectUrl;
    }).length > 0;
    return res;
};

DashboardState.prototype.getExitedStatements = function(userdata, learningObjectUrl) {
    return this.getFilteredStatements(userdata, "http://adlnet.gov/expapi/verbs/exiteded", learningObjectUrl);
}

DashboardState.prototype.hasCompletedInteraction = function(userdata, interactionUrl) {
    var statements = userdata['statements'];
    var statementList = this.getStatementsList(statements,
        "http://adlnet.gov/expapi/verbs/scored");
    res = statementList.filter(function(statement) {
        return statement.result != undefined && statement.result.completion &&
            statement.object.id == interactionUrl;
    }).length > 0;
    return res;
};

DashboardState.prototype.hasPassedInteraction = function(userdata, interactionUrl) {
    var statements = userdata['statements'];
    var statementList = this.getStatementsList(statements, "http://adlnet.gov/expapi/verbs/scored");
    res = statementList.filter(function(statement) {
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
        statement = statements[i];
        if (statement.verb.id == verb) {
            return statement;
        }
    }
    return undefined;
};

DashboardState.prototype.getStatementsList = function(statements, verb) {
    foundStatements = [];
    for (var i in statements) {
        statement = statements[i];
        if (statement.verb.id == verb) {
            foundStatements.push(statement);
        }
    }
    return foundStatements;
};

DashboardState.prototype.getInteractionStatements = function(interaction) {
    statements = [];
    for (var user in this.groupedData) {
        userData = this.groupedData[user]['statements'];
        for (var i in userData) {
            statement = userData[i];
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
    this.rawData.filter(function(statement) {
            return statement.object.id == interactionObjectUrl &&
                statement.verb.id == "http://adlnet.gov/expapi/verbs/answered";
        })
        .forEach(function(statement) {
            if (question == undefined) {
                question = statement.object.definition;
            }

        });
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
