//TODO: get user email, more verbs (passed/failed, completed, ect), define scormmode for xAPI

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
        tmpid += ':' + encodeURIComponent(strippedName.replace(/ /g, "_"));
        // Truncate to max 255 chars, this should be 4000
        tmpid = tmpid.substr(0,255);
    }
    return tmpid;
}

function XApiTrackingState()
{
    this.initialised = false;
    this.trackingmode = "full";
    this.mode = "normal";
    this.scoremode = 'first';
    this.nrpages = 0;
    this.toCompletePages = new Array();
    this.completedPages = new Array();
    this.start = new Date();
    this.interactions = new Array();
    this.lo_completed = 0;
    this.lo_passed = 0;
    this.page_timeout = 5000;



    this.initialise = initialise;
    this.pageCompleted = pageCompleted;
    this.getdScaledScore = getdScaledScore;
    this.getdRawScore = getdRawScore;
    this.getdMinScore = getdMinScore;
    this.getdMaxScore = getdMaxScore;
    this.getScaledScore = getScaledScore;
    this.getRawScore = getRawScore;
    this.getMinScore = getMinScore;
    this.getMaxScore = getMaxScore;
    this.setPageType = setPageType;
    this.setPageScore = setPageScore;
    this.enterInteraction = enterInteraction;
    this.exitInteraction = exitInteraction;
    this.findPage = findPage;
    this.findInteraction = findInteraction;
    this.findCreate = findCreate;
    this.enterPage = enterPage;

    function initialise()
    {

    }


    function getdScaledScore()
    {
        return this.getdRawScore() / (this.getdMaxScore() - this.getdMinScore());
    }

    function getScaledScore()
    {
        return Math.round(this.getdScaledScore()*100)/100 + "";
    }

    function getdRawScore()
    {
        if (this.lo_type == "pages only")
        {
            if (getSuccessStatus() == 'completed')
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
            for (i=0; i<this.nrpages; i++)
            {
                var sit = this.findPage(i);
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
        return this.getdRawScore() + "";
    }

    function getdMinScore()
    {
        if (this.lo_type == "pages only")
        {
            return 0.0;
        }
        else
        {
            return 0.0;
        }
    }

    function getMinScore()
    {
        return this.getdMinScore() + "";
    }

    function getdMaxScore()
    {
        if (this.lo_type == "pages only")
        {
            return 100.0;
        }
        else
        {
            return 100.0;
        }
    }

    function getMaxScore()
    {
        return this.getdMaxScore() + "";
    }

    function pageCompleted(sit)
    {
        for (i=0; i<sit.nrinteractions; i++)
        {
            var sit2 = state.findInteraction(sit.page_nr, i);
            if (sit2 == null || sit2.duration < 1000)
            {
                return false;
            }
        }
        if (sit.ia_type=="page" && sit.duration < state.page_timeout)
        {
            return false;
        }
        return true;
    }

    function enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback)
    {
        interaction = new XApiInteractionTracking(page_nr, ia_nr, ia_type, ia_name);
        interaction.enterInteraction(correctanswer, correctoptions);
        this.interactions.push(interaction);
    }

    function exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback)
    {
        var sit = this.findInteraction(page_nr, ia_nr);
        if(ia_nr != -1){
            sit.exitInteraction(result,learneranswer, learneroptions, feedback);
        }
        sit.exit();

        var temp = false;
        var i = 0;
        for(i; i<state.toCompletePages.length;i++)
        {
            var currentPageNr = state.toCompletePages[i];
            if(currentPageNr == page_nr)
            {
                temp = true;
                break;
            }
        }
        if(temp)
        {
            if (! state.completedPages[i]) {
                var sit = state.findInteraction(page_nr, -1);
                if (sit != null) {
                    // Skip result page completely
                    if (sit.ia_type == "result") {
                        state.completedPages[i] = state.pageCompleted(sit);
                    }
                }
            }
        }


    }

    function setPageType(page_nr, page_type, nrinteractions, weighting)
    {
        var sit = state.findPage(page_nr);
        if (sit != null)
        {
            sit.ia_type = page_type;

            sit.nrinteractions = nrinteractions;
            sit.weighting = parseFloat(weighting);
        }
    }

    function setPageScore(page_nr, score)
    {
        var sit = state.findPage(page_nr);
        if (sit != null && (state.scoremode != 'first' || sit.count < 1))
        {
            sit.score = score;
            sit.count++;
        }
    }

    function findPage(page_nr)
    {
        var id = makeId(page_nr, -1, 'page', "");
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].id.indexOf(id) == 0 && this.interactions[i].id.indexOf(id + ':interaction') < 0)
                return this.interactions[i];
        }
        return null;
    }

    function findInteraction(page_nr, ia_nr)
    {
        if (ia_nr < 0)
        {
            return this.findPage(page_nr);
        }
        var id = makeId(page_nr, ia_nr, "", "");
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].id.indexOf(id) == 0)
                return this.interactions[i];
        }
        return null;
    }



    function findCreate(page_nr, ia_nr, ia_type, ia_name)
    {
        var tmpid = makeId(page_nr, ia_nr, ia_type, ia_name);
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].id == tmpid)
                return this.interactions[i];
        }
        // Not found
        var sit =  new XApiInteractionTracking(page_nr, ia_nr, ia_type, ia_name);
        if (ia_type != "page" && ia_type != "result")
        {
            this.lo_type = "interactive";
            if (this.lo_passed == -1)
            {
                this.lo_passed = 0.55;
            }
        }

        this.interactions.push(sit);
        return sit;
    }

    function enterPage(page_nr, ia_nr, ia_type, ia_name)
    {
        var sit = this.findCreate(page_nr, ia_nr, ia_type, ia_name);
        return sit;
    }


}

function XApiInteractionTracking(page_nr, ia_nr, ia_type, ia_name)
{
    this.id = makeId(page_nr, ia_nr, ia_type, ia_name);
    this.page_nr = page_nr;
    this.ia_nr = ia_nr;
    this.ia_type = ia_type;
    this.ia_name = ia_name;
    this.start = new Date();
    this.end = this.start;
    this.count = 0;
    this.duration = 0;
    this.nrinteractions = 0;
    this.weighting = 0.0;
    this.score = 0.0;
    this.correctAnswers = [];
    this.learnerAnswers = [];
    this.learnerOptions = [];

    this.exit = exit;
    this.enterInteraction = enterInteraction;
    this.exitInteraction = exitInteraction;

    function exit()
    {
        this.end = new Date();
        var duration = this.end.getTime() - this.start.getTime();
        if (duration > 1000)
        {
            this.duration += duration;
            this.count++;
            return true;
        }
        else
        {
            return false;
        }

    }

    function enterInteraction(correctAnswers, correctOptions)
    {
        this.correctAnswers = correctAnswers;
        this.correctOptions = correctOptions;
    }

    function exitInteraction(result, learnerAnswers, learnerOptions, feedback)
    {
        this.learnerAnswers = learnerAnswers;
        this.learnerOptions = learnerOptions;
        this.result = result;
        this.feedback = feedback;
    }

}


var state = new XApiTrackingState();

var scorm=false,
    lrsInstance,
    userEMail;

var surf_mode = false;
var surf_recipe, surf_course;

var answeredQs = [];

function XTInitialise()
{
    if(username == undefined)
    {
       userEMail = "mailto:email@test.com"
    }else{
        userEMail = username;
    }
    if (! state.initialised)
    {
        state.initialised = true;
        state.initialise();
    }

    if(lrsInstance == undefined){
        try{
            lrsInstance = new TinCan.LRS(
                {
                    endpoint: lrsEndpoint,
                    username: lrsUsername,
                    password: lrsPassword,
                    allowFail: false,
                    version: "1.0.1"
                }
            );

        }
        catch(ex)
        {
            //alert("Failed LRS setup. Error: " + ex);
        }
    }
    if(surf_course != undefined && surf_recipe != undefined)
    {
        surf_mode = true;
    }

    if(lrsInstance != undefined)
    {
        this.initStamp = new Date();

        if (! surf_mode) {
            var statement = new TinCan.Statement(
                {
                    actor: {
                        mbox: userEMail
                    },
                    verb: {
                        id: "http://adlnet.gov/expapi/verbs/launched",
                        display: {
                            "en-US": "Launched"
                        }
                    },
                    target: {
                        id: "http://rusticisoftware.github.com/TinCanJS"
                        //TODO: get the name for this activity
                    },
                    timestamp: this.initStamp
                }
            );

            SaveStatement(statement);
        }
        if(surf_mode)
        {
            var statement = new TinCan.Statement(
                {
                    actor: {
                        mbox: userEMail
                    },
                    verb: {
                        id: "http://lrs.surfuni.org/verb/joined",
                        display: {
                            "en-US": "Joined"
                        }
                    },
                    object: {
                        objectType: "Activity",
                        id: "http://lrs.surfuni.org/object/course",
                        definition: {
                            name: {
                                "en-US": "Course"
                            }
                        }
                    },
                    context: {
                        extensions: {
                            "http://lrs.surfuni.org/context/course": surf_course,
                            "http://lrs.surfuni.org/context/recipe": surf_recipe,
                            "http://lrs.surfuni.org/context/label": ""
                        }
                    },
                    timestamp: this.initStamp
                }
            );
            SaveStatement(statement);
        }
    }
}

function XTTrackingSystem()
{
    return "";
}

function XTLogin(login, passwd)
{
    this.loginStamp = new Date();

    if (! surf_mode) {
        var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/logged-in",
                    display: {
                        "en-US": "Logged in"
                    }
                },
                target: {
                    id: "http://rusticisoftware.github.com/TinCanJS"
                },
                timestamp: this.loginStamp
            }
        );

        SaveStatement(statement);
    }
    // TODO: Compare the login and the password with credentials from the LRS.

    return true;
}

function XTGetMode()
{
    return state.mode;
}

function XTStartPage()
{
    return -1;
}

function XTGetUserName()
{
    return "";
}

function XTNeedsLogin()
{
    return false;
}

function XTSetOption(option, value)
{
    switch (option)
    {
        case "nrpages":
            state.nrpages = value;
            break;
        case "toComplete":
            state.toCompletePages = value;
            //completedPages = new Array(length(toCompletePages));
            for(i = 0; i< state.toCompletePages.length;i++)
            {
                state.completedPages[i] = "false";
            }

            break;
        case "tracking-mode":
            switch(value)
            {
                case 'full_first':
                    state.trackingmode = "full";
                    state.scoremode = "first";
                    state.mode = "normal";
                    break;
                case 'minimal_first':
                    state.trackingmode = "minimal";
                    state.scoremode = "first";
                    state.mode = "normal";
                    break;
                case 'full':
                    state.trackingmode = "full";
                    state.scoremode = "last";
                    state.mode = "normal";
                    break;
                case 'minimal':
                    state.trackingmode = "minimal";
                    state.scoremode = "last";
                    state.mode = "normal";
                    break;
                case 'none':
                    state.trackingmode = "none";
                    state.mode = "no-tracking";
                    break;
            }
            break;
        case "completed":
            state.lo_completed = value;
            break;
        case "objective_passed":
            state.lo_passed = Number(value);
            break;
        case "page_timeout":
            // Page timeout in seconds
            state.page_timeout = Number(value) * 1000;
            break;
    }
}

function XTEnterPage(page_nr, page_name)
{
    state.enterPage(page_nr, -1, "page", page_name);
    this.pageStart = new Date();

    if (! surf_mode) {
        var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/initialized",
                    display: {
                        "en-US": "Initialized"
                    }
                },
                target: {
                    id: "http://rusticisoftware.github.com/TinCanJS"
                },
                timestamp: this.pageStart

            }
        );

        SaveStatement(statement);
    }
}

function XTExitPage(page_nr, page_name)
{

    if (!surf_mode) {
        this.exitPageStamp = new Date();

        var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/exited",
                    display: {
                        "en-US": "Exited"
                    }
                },
                target: {
                    id: "http://rusticisoftware.github.com/TinCanJS"
                },
                timestamp: this.exitPageStamp
            }
        );

        SaveStatement(statement);
    }
    return state.exitInteraction(page_nr, -1, false, "", "", "", false);

}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting)
{
    state.setPageType(page_nr, page_type, nrinteractions, weighting);

}

function XTSetPageScore(page_nr, score) {
    state.setPageScore(page_nr, score);
    this.pageEnd = new Date();
    var pageDuration = this.pageEnd.getTime() - this.pageStart.getTime();

    var delta = Math.abs(this.pageEnd.getTime() - this.pageStart.getTime()) / 1000;

    var days = Math.floor(delta / 86400);
    delta -= days * 86400;
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    var seconds = delta % 60;

    if (!surf_mode) {
        var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/scored",
                    display: {
                        "en-US": "Scored"
                    }
                },
                target: {
                    id: "http://xerte.org.uk/xapi/questions/" + page_nr
                },
                result: {
                    "completion": true,
                    "success": score >= state.lo_passed,
                    "score": {
                        "scaled": score / 100
                    },
                    "duration": "P" + 0 + "Y" + 0 + "M" + days + "DT" + hours + "H" + minutes + "M" + seconds + "S",
                },
                timestamp: this.pageEnd

            }
        );

        SaveStatement(statement);
    }

}

    function XTSetPageScoreJSON(page_nr, score, JSONGraph) {
        state.setPageScore(page_nr, score);
        this.pageEnd = new Date();
        var pageDuration = this.pageEnd.getTime() - this.pageStart.getTime();

        var delta = Math.abs(this.pageEnd.getTime() - this.pageStart.getTime()) / 1000;

        var days = Math.floor(delta / 86400);
        delta -= days * 86400;
        var hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        var minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        var seconds = delta % 60;
        if (!surf_mode) {
            var statement = new TinCan.Statement(
                {
                    actor: {
                        mbox: userEMail
                    },
                    verb: {
                        id: "http://adlnet.gov/expapi/verbs/scored",
                        display: {
                            "en-US": "Scored"
                        }
                    },
                    target: {
                        id: "http://xerte.org.uk/xapi/questions/" + page_nr
                    },
                    result: {
                        "completion": true,
                        "success": score >= state.lo_passed,
                        "score": {
                            "scaled": score / 100
                        },
                        "duration": "P" + 0 + "Y" + 0 + "M" + days + "DT" + hours + "H" + minutes + "M" + seconds + "S",
                        "extensions": {
                            "http://xerte.org.uk/xapi/JSONGraph": JSONGraph
                        }
                    },
                    timestamp: this.pageEnd
                }
            );

            SaveStatement(statement);
        }
    }

    function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctanswer, feedback) {
        state.enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctanswer, feedback);
        this.enterInteractionStamp = new Date();

        if (!surf_mode) {
            var statement = new TinCan.Statement(
                {
                    actor: {
                        mbox: userEMail
                    },
                    verb: {
                        id: "http://adlnet.gov/expapi/verbs/attempted",
                        display: {
                            "en-US": "Attempted"
                        }
                    },
                    target: {
                        id: "http://xerte.org.uk/xapi/questions/" + page_nr
                    },
                    timestamp: this.enterInteractionStamp
                }
            );


            SaveStatement(statement);
        }
        if (surf_mode) {
            var statement = new TinCan.Statement(
                {
                    actor: {
                        mbox: userEMail
                    },
                    verb: {
                        id: "http://lrs.surfuni.org/verb/accessed",
                        display: {
                            "en-US": "Accessed"
                        }
                    },
                    object: {
                        objectType: "Activity",
                        id: "http://lrs.surfuni.org/object/assessment",
                        definition: {
                            name: {
                                "en-US": "Assessment"
                            }
                        }
                    },
                    context: {
                        extensions: {
                            "http://lrs.surfuni.org/context/course": surf_course,
                            "http://lrs.surfuni.org/context/recipe": surf_recipe,
                            "http://lrs.surfuni.org/context/label": ""
                        }
                    },
                    timestamp: this.initStamp
                }
            );
            SaveStatement(statement);
        }

    }

    function XTExitInteraction(page_nr, ia_nr, ia_type, result, learneranswer, feedback) {
        state.exitInteraction(page_nr, ia_nr, ia_type, result, learneranswer, feedback);
        if (($.inArray([page_nr, ia_nr], answeredQs) == -1 && state.scoremode == "first") || state.scoremode == "last") {

            this.exitInteractionStamp = new Date();

            if (!surf_mode) {
                var statement = new TinCan.Statement(
                    {
                        actor: {
                            mbox: userEMail
                        },
                        verb: {
                            id: "http://adlnet.gov/expapi/verbs/answered",
                            display: {
                                "en-US": "Answered"
                            }
                        },
                        target: {
                            id: "http://xerte.org.uk/xapi/questions/" + page_nr
                        },
                        result: {
                            "response": result + ""
                        },
                        timestamp: this.exitInteractionStamp
                    }
                );

                answeredQs.push([page_nr, ia_nr]);
                SaveStatement(statement);
            }
            if (surf_mode) {
                var statement = new TinCan.Statement(
                    {
                        actor: {
                            mbox: userEMail
                        },
                        verb: {
                            id: "http://lrs.surfuni.org/verb/submitted",
                            display: {
                                "en-US": "Submitted"
                            }
                        },
                        object: {
                            objectType: "Activity",
                            id: "http://lrs.surfuni.org/object/assessment",
                            definition: {
                                name: {
                                    "en-US": "Assessment"
                                }
                            }
                        },
                        context: {
                            extensions: {
                                "http://lrs.surfuni.org/context/course": surf_course,
                                "http://lrs.surfuni.org/context/recipe": surf_recipe,
                                "http://lrs.surfuni.org/context/label": ""
                            }
                        },
                        timestamp: this.initStamp
                    }
                );
                SaveStatement(statement);
                var statement = new TinCan.Statement(
                    {
                        actor: {
                            mbox: userEMail
                        },
                        verb: {
                            id: "http://lrs.surfuni.org/verb/accessed",
                            display: {
                                "en-US": "Accessed"
                            }
                        },
                        object: {
                            objectType: "Activity",
                            id: "http://lrs.surfuni.org/object/grade",
                            definition: {
                                name: {
                                    "en-US": "Grade"
                                }
                            }
                        },
                        result: {
                            "response": result[0]
                        },
                        context: {
                            extensions: {
                                "http://lrs.surfuni.org/context/course": surf_course,
                                "http://lrs.surfuni.org/context/recipe": surf_recipe,
                                "http://lrs.surfuni.org/context/label": ""
                            }
                        },
                        timestamp: this.initStamp
                    }
                );
                SaveStatement(statement);
                var statement = new TinCan.Statement(
                    {
                        actor: {
                            mbox: userEMail
                        },
                        verb: {
                            id: "http://lrs.surfuni.org/verb/accessed",
                            display: {
                                "en-US": "Accessed"
                            }
                        },
                        object: {
                            objectType: "Activity",
                            id: "http://lrs.surfuni.org/object/gradepoint",
                            definition: {
                                name: {
                                    "en-US": "Grade point"
                                }
                            }
                        },
                        result: {
                            "response": result + ""
                        },
                        context: {
                            extensions: {
                                "http://lrs.surfuni.org/context/course": surf_course,
                                "http://lrs.surfuni.org/context/recipe": surf_recipe,
                                "http://lrs.surfuni.org/context/label": ""
                            }
                        },
                        timestamp: this.initStamp
                    }
                );
                SaveStatement(statement);
                if (feedback != null) {
                    var statement = new TinCan.Statement(
                        {
                            actor: {
                                mbox: userEMail
                            },
                            verb: {
                                id: "http://lrs.surfuni.org/verb/accessed",
                                display: {
                                    "en-US": "Accessed"
                                }
                            },
                            object: {
                                objectType: "Activity",
                                id: "http://lrs.surfuni.org/object/feedback",
                                definition: {
                                    name: {
                                        "en-US": "Feedback"
                                    }
                                }
                            },
                            result: {
                                "response": feedback[0]
                            },
                            context: {
                                extensions: {
                                    "http://lrs.surfuni.org/context/course": surf_course,
                                    "http://lrs.surfuni.org/context/recipe": surf_recipe,
                                    "http://lrs.surfuni.org/context/label": ""
                                }
                            },
                            timestamp: this.initStamp
                        }
                    );
                    SaveStatement(statement);
                }
            }
        }
    }

    function XTGetInteractionScore(page_nr, ia_nr, ia_type, ia_name) {
        //Get ID from the question
        var idQ = this.x_currentPageXML.childNodes[ia_nr].getAttribute("linkID");
        var x = lrsInstance.queryStatements(
            {
                params: {
                    verb: new TinCan.Verb(
                        {
                            id: "http://adlnet.gov/expapi/verbs/answered"
                        }
                    ),
                    activity: (
                        {
                            id: "http://xerte.org.uk/xapi/questions/" + idQ
                        }
                    )
                },
                callback: function (err, sr) {

                    var stringObjects = [];

                    for (x = 0; x < sr.statements.length; x++) {
                        stringObjects[x] = sr.statements[x].originalJSON;
                    }

                    if (err !== null) {
                        console.log("Failed to query statements: " + err);
                        // TODO: do something with error, didn't get statements
                        return;
                    }
                    if (sr.more !== null) {
                    }
                }
            }
        );
    }

    function XTGetInteractionCorrectAnswer(page_nr, ia_nr, ia_type, ia_name) {
        return "";
    }

    function XTGetInteractionCorrectAnswerFeedback(page_nr, ia_nr, ia_type, ia_name) {
        return "";
    }

    function XTGetInteractionLearnerAnswer(page_nr, ia_nr, ia_type, ia_name) {
        return "";
    }

    function XTGetInteractionLearnerAnswerFeedback(page_nr, ia_nr, ia_type, ia_name) {
        return "";
    }

    function XTTerminate() {
        window.opener.innerWidth += 2;
        window.opener.innerWidth -= 2;
    }

    function SaveStatement(statement) {
        statement.id = null;
        lrsInstance.saveStatement(
            statement,
            {
                callback: function (err, xhr) {
                    if (err !== null) {
                        if (xhr !== null) {
                            //alert("Failed to save statement: " + xhr.responseText + " (" + xhr.status + ")");
                            // TODO: handle error accordingly when needed
                            return;
                        }

                        //alert("Failed to save statement: " + err);
                        // TODO: handle error accordingly when needed
                        return;
                    }

                }
            }
        );
    }

    function XTResults(fullcompletion) {
        var completion = 0;
        var nrcompleted = 0;
        var nrvisited = 0;
        var completed;
        $.each(state.completedPages, function (i, completed) {
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
                completion = Math.round((nrcompleted / state.toCompletePages.length) * 100);
            }
        }
        else {
            completion = 0;
        }

        var results = {};
        results.mode = x_currentPageXML.getAttribute("resultmode");

        var score = 0,
            nrofquestions = 0,
            totalWeight = 0,
            totalDuration = 0;
        results.interactions = Array();

        for (i = 0; i < state.interactions.length - 1; i++) {


            score += state.interactions[i].score * state.interactions[i].weighting;
            if (state.interactions[i].ia_nr < 0 || state.interactions[i].nrinteractions > 0) {

                var interaction = {};
                interaction.score = Math.round(state.interactions[i].score);
                interaction.title = state.interactions[i].ia_name;
                interaction.type = state.interactions[i].ia_type;
                interaction.correct = state.interactions[i].result;
                interaction.duration = Math.round(state.interactions[i].duration / 1000);
                interaction.weighting = state.interactions[i].weighting;
                interaction.subinteractions = Array();

                var j = 0;
                for (j; j < state.toCompletePages.length; j++) {
                    var currentPageNr = state.toCompletePages[j];
                    if (currentPageNr == state.interactions[i].page_nr) {
                        if (state.completedPages[j]) {
                            interaction.completed = "true";
                        }
                        else if (!state.completedPages[j]) {
                            interaction.completed = "false";
                        }
                        else {
                            interaction.completed = "unknown";
                        }
                    }
                }

                results.interactions[nrofquestions] = interaction;
                totalDuration += state.interactions[i].duration;
                nrofquestions++;
                totalWeight += state.interactions[i].weighting;

            }
            else if (results.mode == "full-results") {
                var subinteraction = {};

                var learnerAnswer, correctAnswer;
                switch (state.interactions[i].ia_type) {
                    case "match":
                        var resultCorrect;
                        for (var c = 0; c < state.interactions[i].correctOptions.length; c++) {
                            var matchSub = {}; //Create a subinteraction here for every match sub instead
                            correctAnswer = state.interactions[i].correctOptions[c].source + ' --> ' + state.interactions[i].correctOptions[c].target;
                            source = state.interactions[i].correctOptions[c].source;
                            if (state.interactions[i].learnerOptions.length == 0) {
                                learnerAnswer = source + ' --> ' + ' ';
                            }
                            else {
                                for (var d = 0; d < state.interactions[i].learnerOptions.length; d++) {
                                    if (source == state.interactions[i].learnerOptions[d].source) {
                                        learnerAnswer = source + ' --> ' + state.interactions[i].learnerOptions[d].target;
                                        break;
                                    }
                                    else {
                                        learnerAnswer = source + ' --> ' + ' ';
                                    }
                                }
                            }

                            matchSub.question = state.interactions[i].ia_name;
                            matchSub.correct = resultCorrect;
                            matchSub.learnerAnswer = learnerAnswer;
                            matchSub.correctAnswer = correctAnswer;
                            results.interactions[nrofquestions - 1].subinteractions.push(matchSub);
                        }

                        break;
                    case "text":
                        learnerAnswer = state.interactions[i].learnerAnswers.join(", ");
                        correctAnswer = state.interactions[i].correctAnswers.join(", ");
                        break;
                    case "multiplechoice":
                        learnerAnswer = state.interactions[i].learnerAnswers[0] != undefined ? state.interactions[i].learnerAnswers[0] : "";
                        for (var j = 1; j < state.interactions[i].learnerAnswers.length; j++) {
                            learnerAnswer += "\n" + state.interactions[i].learnerAnswers[j];
                        }
                        correctAnswer = state.interactions[i].correctAnswers[0];
                        for (var j = 1; j < state.interactions[i].correctAnswers.length; j++) {
                            correctAnswer += "\n" + state.interactions[i].correctAnswers[j];
                        }
                        break;
                    case "numeric":

                        learnerAnswer = state.interactions[i].learnerAnswers;
                        correctAnswer = "-";  // Not applicable
                        //TODO: We don't have a good example of an interactivity where the numeric type has a correctAnswer. Currently implemented for the survey page.
                        break;
                    case "fill-in":
                        learnerAnswer = state.interactions[i].learnerAnswers;
                        correctAnswer = state.interactions[i].correctAnswers;
                        break;
                }
                if (state.interactions[i].ia_type != "match") {
                    subinteraction.question = state.interactions[i].ia_name;
                    subinteraction.correct = state.interactions[i].result;
                    subinteraction.learnerAnswer = learnerAnswer;
                    subinteraction.correctAnswer = correctAnswer;
                    results.interactions[nrofquestions - 1].subinteractions.push(subinteraction);
                }
            }
        }
        results.completion = completion;
        results.completion = completion;
        results.score = score;
        results.nrofquestions = nrofquestions;
        results.averageScore = state.getScaledScore() * 100;
        results.totalDuration = Math.round(totalDuration / 1000);
        results.start = state.start.toLocaleString();
        $.ajax({
            type: "POST",
            url: window.location.href,
            data: {
                grade: results.averageScore / 100
            }
        });
        return results;
    }

