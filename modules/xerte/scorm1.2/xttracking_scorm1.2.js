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

/**
 * Created with JetBrains PhpStorm.
 * User: tom
 * Date: 28-3-13
 * Time: 22:25
 * To change this template use File | Settings | File Templates.
 */

var scorm = 'true';

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
        tmpid += ':' + encodeURIComponent(strippedName.replace(/[^a-zA-Z0-9_ ]/g, "").replace(/ /g, "_"));
        // Truncate to max 255 chars
        tmpid = tmpid.substr(0,255);
    }
    return tmpid;
}

// define a ScormTracking Object
function ScormInteractionTracking(page_nr, ia_nr, ia_type, ia_name)
{
    this.page_nr = page_nr;
    this.page_ref = page_nr+1;
    this.ia_nr = ia_nr;
    this.ia_type = ia_type;
    this.ia_name = ia_name;
    this.state = "entered";
    this.start = new Date();
    this.firstEntered = new Date();
    this.end = this.start;
    this.duration = 0;
    this.nrinteractions = 0;
    this.weighting = 0.0;
    this.score = 0.0;
    this.scoreTracked = false;
    this.result = 'unknown';
    this.correctOptions = [];
    this.correctAnswers = [];
    this.learnerOptions = [];
    this.learnerAnswers = [];
    this.id = makeId(page_nr, ia_nr, ia_type, ia_name);
    this.idx = -1;

    this.setVars = setVars;
    this.exit = exit;
    this.reenter = reenter;

    function setVars(jsonObj)
    {
        this.page_nr = jsonObj.page_nr;
        this.ia_nr = jsonObj.ia_nr;
        this.ia_type = jsonObj.ia_type;
        this.ia_name = jsonObj.ia_name;
        this.state = "exited";
        this.firstEntered = jsonObj.firstEntered != undefined ? new Date(jsonObj.firstEntered) : new Date();
        this.duration = jsonObj.duration != undefined ? jsonObj.duration : 0;
        this.nrinteractions = jsonObj.nrinteractions;
        this.weighting = jsonObj.weighting;
        this.score = jsonObj.score;
        this.scoreTracked = jsonObj.scoreTracked === true;
        this.result = jsonObj.result;
    }

    function exit()
    {
        if (this.state !== "entered") {
            return false;
        }
        this.end = new Date();
        var duration = this.end.getTime() - this.start.getTime();
        this.start = this.end;
        this.state = "exited";
        if (duration > 100)
        {
            this.duration += duration;
            return true;
        }
        else
        {
            return false;
        }

    }

    function reenter()
    {
        this.start = new Date();
        this.state = "entered";
    }
}

function ScormTrackingState()
{
    this.initialised = false;
    this.scormmode = "";
    this.currentpageid = "";
    this.trackingmode = "full";
    this.skipcomments = false;
    this.skipinteractions = false;
    this.scoremode = "last";
    this.nrpages = 0;
    this.toCompletePages = new Array();
    this.completedPages = new Array();
    this.start = new Date();
    this.firstEntered = new Date();
    this.lo_type = "pages only";
    this.lo_passed = -1.0;
    this.page_timeout = 0;
    this.page_completion = "attempt";
    this.finished = false;
    this.interactions = new Array();

    this.debug = false;

    this.setVars = setVars;
    this.pageCompleted = pageCompleted;
    this.find = find;
    this.findcreate = findcreate;
    this.findPage = findPage;
    this.findInteraction = findInteraction;
    this.findAllInteractions = findAllInteractions;
    this.countInteractions = countInteractions;
    this.enter = enter;
    this.exit = exit;
    this.exitInteraction = exitInteraction;
    this.finishTracking = finishTracking;
    this.storeSuspendData = storeSuspendData;
    this.initTracking = initTracking;
    this.getSuccessStatus = getSuccessStatus;
    this.getdScaledScore = getdScaledScore;
    this.getdRawScore = getdRawScore;
    this.getdMinScore = getdMinScore;
    this.getdMaxScore = getdMaxScore;
    this.getScaledScore = getScaledScore;
    this.getRawScore = getRawScore;
    this.getMinScore = getMinScore;
    this.getMaxScore = getMaxScore;
    this.formatDate = formatDate;
    this.formatTime = formatTime;
    this.formatDuration = formatDuration;
    this.scorm_nr_interactions = scorm_nr_interactions;
    this.id_to_interactionidx = id_to_interactionidx;
    this.verifyResult = verifyResult;
    this.verifyEnterInteractionParameters = verifyEnterInteractionParameters;
    this.verifyExitInteractionParameters = verifyExitInteractionParameters;

    function attemptRecorded(sit)
    {
        return sit != null && sit.result !== undefined && sit.result !== 'unknown';
    }

    function pageCompleted(sit)
    {
        var sits = this.findAllInteractions(sit.page_nr);
        if (sits.length != sit.nrinteractions)
        {
            return false;
        }
        if (sit.ia_type=="page") {
            if (sit.duration < this.page_timeout) {
                // time for page completion hasn't been reached
                return false;
            }
        } else if (this.page_completion !== "view") {
            for (let i = 0; i < sits.length; i++) {
                const interaction = this.interactions[sits[i]];
                if (interaction.result === undefined || interaction.result === "unknown") {
                    // interaction has not been attempted
                    return false;
                }
            }
        }
        return true;
    }

    function setVars(jsonStr)
    {
        if (jsonStr.length > 0)
        {
            var jsonObj = JSON.parse(jsonStr);
            this.currentpageid = jsonObj.currentpageid;
            this.completedPages=jsonObj.completedPages;
            this.firstEntered = jsonObj.firstEntered != undefined ? new Date(jsonObj.firstEntered) : new Date();
            if (typeof jsonObj.pageHistory != "undefined") {
                x_pageHistory = jsonObj.pageHistory;
            }
            if (typeof jsonObj.pagesViewed != "undefined") {
                x_restorePagesViewed(jsonObj.pagesViewed);
            }
            if (typeof jsonObj.pageStates != "undefined") {
                x_restorePageStates(jsonObj.pageStates);
            }

            this.interactions = new Array();
            var i=0;
            for (i=0; i<jsonObj.interactions.length; i++)
            {
                var jsonSit = jsonObj.interactions[i];
                var sit = new ScormInteractionTracking(jsonSit.page_nr, jsonSit.ia_nr, jsonSit.ia_type, jsonSit.ia_name);
                sit.setVars(jsonSit);
                this.interactions.push(sit);
            }
            this.lo_type = "pages only";
            for (i=0; i<this.interactions.length; i++) {
                var type = this.interactions[i].ia_type;
                if (type != "page" && type != "result") {
                    this.lo_type = "interactive";
                    break;
                }
            }
        }
    }

    function findcreate(page_nr, ia_nr, ia_type, ia_name)
    {
        var tmpid = makeId(page_nr, ia_nr, ia_type, ia_name);
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].id == tmpid)
                return this.interactions[i];
        }
        // Not found
        var sit =  new ScormInteractionTracking(page_nr, ia_nr, ia_type, ia_name);
        if (ia_type != "page" && ia_type != "result")
        {
            this.lo_type = "interactive";
        }
        if (this.lo_passed == -1)
        {
            this.lo_passed = 55;
        }
        this.interactions.push(sit);
        return sit;
    }

    function find(id)
    {
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].id == id)
                return this.interactions[i];
        }

        return null;
    }

    function findPage(page_nr)
    {
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].page_nr == page_nr && this.interactions[i].ia_nr == -1)
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
        for (let i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].page_nr == page_nr && this.interactions[i].ia_nr == ia_nr)
                return this.interactions[i];
        }
        return null;
    }

    function findAllInteractions(page_nr)
    {
        var i=0;
        tmpinteractions = [];
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].page_nr == page_nr && this.interactions[i].ia_nr != -1)
                tmpinteractions.push(i);
        }
        return tmpinteractions;
    }

    function countInteractions(page_nr)
    {
        var count = 0;
        var id = makeId(page_nr, -1, 'page', "");
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].page_nr == page_nr && this.interactions[i].ia_nr >=0)
                count++;
        }
        return count;
    }

    function enter(page_nr, ia_nr, ia_type, ia_name)
    {
        var sit = this.findcreate(page_nr, ia_nr, ia_type, ia_name);
        if (sit.state == "exited")
        {
            sit.reenter();
        }
        return sit;
    }

    function exit(page_nr, ia_nr)
    {
        var sit = this.findInteraction(page_nr, ia_nr);
        if (sit != null)
        {
            return sit.exit();
        }
        else
        {
            return false;
        }
    }

    function formatDate(d)
    {
        // Build a string of the form YYYY-MM-DDThh:mm:ss
        var twoDigitMonth = d.getMonth()+1+"";
        if(twoDigitMonth.length==1)  twoDigitMonth="0" +twoDigitMonth;
        var twoDigitDate = d.getDate() + "";
        if(twoDigitDate.length==1) twoDigitDate="0" +twoDigitDate;
        var twoDigitHours = d.getHours()+1+"";
        if (twoDigitHours.length==1) twoDigitHours = "0"+twoDigitHours;
        var twoDigitMinutes = d.getMinutes()+1+"";
        if (twoDigitMinutes.length==1) twoDigitMinutes = "0"+twoDigitMinutes;
        var twoDigitSeconds = d.getSeconds()+1+"";
        if (twoDigitSeconds.length==1) twoDigitSeconds = "0"+twoDigitSeconds;

        return d.getFullYear() + '-' + twoDigitMonth + '-' + twoDigitDate + 'T' + twoDigitHours + ':' + twoDigitMinutes + ':' + twoDigitSeconds;
    }

    function formatTime(d)
    {
        // Build a string of the form hh:mm:ss
        var twoDigitHours = d.getHours()+1+"";
        if (twoDigitHours.length==1) twoDigitHours = "0"+twoDigitHours;
        var twoDigitMinutes = d.getMinutes()+1+"";
        if (twoDigitMinutes.length==1) twoDigitMinutes = "0"+twoDigitMinutes;
        var twoDigitSeconds = d.getSeconds()+1+"";
        if (twoDigitSeconds.length==1) twoDigitSeconds = "0"+twoDigitSeconds;

        return twoDigitHours + ':' + twoDigitMinutes + ':' + twoDigitSeconds;
    }

    function formatDuration(d)
    {
        // Format as a SCORM interval in hhhh:mm:ss
        //round d[ms] to seconds first
        var rounded_d = Math.round(d/10)/100;
        var hours = Math.floor(rounded_d / 3600.0);
        var twoDigitHours = hours + "";
        if (twoDigitHours.length==1) twoDigitHours = "0"+twoDigitHours;
        var minutes = Math.floor((rounded_d - hours*3600)/60.0);
        var twoDigitMinutes = minutes+"";
        if (twoDigitMinutes.length==1) twoDigitMinutes = "0"+twoDigitMinutes;
        var seconds = Math.floor(rounded_d - hours*3600 - minutes*60);
        var twoDigitSeconds = seconds + "";
        if (twoDigitSeconds.length==1) twoDigitSeconds = "0"+twoDigitSeconds;
        var hundredsOfSeconds = Math.round((rounded_d - hours*3600 - minutes*60 - seconds)*100);
        var twoDigitHundredsOfSeconds = hundredsOfSeconds + "";
        if (twoDigitHundredsOfSeconds.length==1) twoDigitHundredsOfSeconds = "0" + twoDigitHundredsOfSeconds;
        if (twoDigitHundredsOfSeconds.length > 2) twoDigitHundredsOfSeconds = twoDigitHundredsOfSeconds.substr(0,2);
        return twoDigitHours + ':' + twoDigitMinutes + ':' + twoDigitSeconds + '.' + twoDigitHundredsOfSeconds;
    }

    function scorm_nr_interactions()
    {
        return getValue('cmi.interactions._count');
    }

    function id_to_interactionidx(id)
    {
        var count = scorm_nr_interactions();

        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].id == id)
            {
                // Found!
                if (this.interactions[i].idx < 0)
                {
                    //not written yet
                    return count;
                }
                else
                {
                    return this.interactions[i].idx;
                }
            }
        }
        return count;
    }

    function exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback, force)
    {
        var sit = this.findInteraction(page_nr, ia_nr);
        if (sit == null) {
            return;
        }

        // if the question was previously exited, reenter it so the answers can be saved properly
        if (ia_nr >= 0 && sit.state !== "entered" && (this.scoremode != "first" || !attemptRecorded(sit))) {
            var pageSit = this.findPage(page_nr);
            sit.reenter();
            if (pageSit != null) {
                sit.start = pageSit.start;
            }
        }

        if (sit.exit())
        {
            this.verifyExitInteractionParameters(sit, result, learneroptions, learneranswer, feedback);
            var updateAttemptData = true;
            if (ia_nr >= 0) {
                // first pass keeps the first recorded attempt / last pass always stores the most recent
                updateAttemptData = (this.scoremode != 'first' || !attemptRecorded(sit));
            }

            if (ia_nr < 0 || updateAttemptData) {
                sit.learnerOptions = learneroptions;
                sit.learnerAnswers = learneranswer;
                sit.result = result;
                sit.answerfeedback = feedback;
            }

            var writeCmi = (ia_nr >= 0 && updateAttemptData) ||
                (ia_nr < 0 && (this.scoremode != 'first' || sit.idx < 0));

            if (writeCmi && !this.skipinteractions && this.trackingmode != 'none'
                && ((sit.ia_nr < 0 && (this.trackingmode!='full' || sit.nrinteractions == 0))
                || (sit.ia_nr >= 0 && this.trackingmode == 'full')))
            {
                // Record this action
                var id = makeId(sit.page_nr, sit.ia_nr, sit.ia_type, sit.ia_name);
                var nrInteractions = parseInt(this.scorm_nr_interactions(), 10);
                if (isNaN(nrInteractions)) {
                    nrInteractions = 0;
                }
                var index = this.id_to_interactionidx(id);
                var isNew = (index >= nrInteractions);
                var interaction = 'cmi.interactions.' + index + '.';
                var res;

                if (isNew) {
                    res = setValue(interaction + 'id', id);
                    sit.idx = index;
                    res = setValue(interaction + 'time', this.formatDate(sit.start));
                    res = setValue(interaction + 'latency', this.formatDuration(sit.duration));
                } else {
                    sit.idx = index;
                }

                var psit = this.findPage(sit.page_nr);
                if (psit != null)
                {
                    var pweighting = psit.weighting;
                    var nrinteractions = psit.nrinteractions;
                }
                else
                {
                    var pweighting = 1.0;
                    var nrinteractions = 1.0;
                }

                var scormType = '';
                var scormCanswer = '';
                var scormLanswer = '';
                var scormResult = '';
                var scormWeighting = Math.round(pweighting/nrinteractions*100)/100;

                switch (sit.ia_type)
                {
                    case 'match':
                        // We have an options as an array of objects with source and target
                        // and we have corresponding array of answers strings
                        // Construct answers like a:Answerstring
                        var scormAnswerArray = [];
                        var i=0;
                        for (i=0; i<learneroptions.length; i++)
                        {
                            // Create ascii characters from option number and ignore answer string
                            var entry = learneroptions[i];
                            if (typeof(entry.source) == "undefined")
                                entry.source = "";

                            scormAnswerArray.push(entry.source.replace(/ /g, "_") + "." + entry.target.replace(/ /g, "_"));
                        }
                        var scormCorrectArray = [];
                        for (i=0; i<sit.correctOptions.length; i++)
                        {
                            // Create ascii characters from option number and ignore answer string
                            entry = sit.correctOptions[i];
                            scormCorrectArray.push(entry.source.replace(/ /g, "_") + "." + entry.target.replace(/ /g, "_"));
                        }
                        scormType = 'matching';
                        scormCanswer = scormCorrectArray.join(',');
                        scormLanswer = scormAnswerArray.join(',');
                        scormResult = (result.success ? 'correct' : 'wrong');
                        break;
                    case 'multiplechoice':
                        // We have an options as numbers, separated by ';'
                        // and we have corresponding answers strings separated by ';'
                        // Construct answers like a  (ignore answers, because we can't do anything with them in Scorm 1.2)

                        scormAnswerArray = [];
                        for (i=0; i<learneroptions.length; i++)
                        {
                            // Create ascii characters from option number and add answer string
                            scormAnswerArray.push(String.fromCharCode(parseInt(learneroptions[i])+96));
                        }
                        scormCorrectArray = [];
                        for (i=0; i<sit.correctOptions.length; i++)
                        {
                            // Create ascii characters from option number and add answer string
                            var entry;
                            if (sit.correctOptions[i]['result'])
                            {
                                entry = String.fromCharCode(parseInt(sit.correctOptions[i]['id'])+96);
                            }
                            scormCorrectArray.push(entry);
                        }
                        scormType = 'choice';
                        scormCanswer = scormCorrectArray.join(',');
                        scormLanswer = scormAnswerArray.join(',');
                        scormResult = (result.success ? 'correct' : 'wrong');
                        break;
                    case 'numeric':
                        scormType = 'numeric';
                        scormCanswer = '100';
                        if (ia_nr <0)  // Page mode
                        {
                            scormWeighting = Math.round(sit.weighting * 100) / 100;
                            scormLanswer = sit.score;
                            scormResult = Math.round(sit.score * 100) / 100;
                        }
                        else { // Interaction mode
                            scormLanswer = sit.learnerAnswers;
                            scormResult = Math.round(sit.learnerAnswers * 100) / 100;
                        }
                        break;
                    case 'text':
                    case 'fill-in':
                        // Hmmm is this the page or the interaction itself
                        if (ia_nr < 0)
                        {
                            //This is the page
                            // Get the interaction, it is always assumed to be 0
                            var siti = this.findInteraction(page_nr, 0);
                            sit.correctAnswers = siti.correctAnswers;
                            sit.learnerAnswers = siti.learnerAnswers;
                        }

                        scormType = 'fill-in';
                        scormCanswer = sit.correctAnswers;
                        scormWeighting = Math.round(pweighting/nrinteractions*100)/100;
                        scormLanswer = sit.learnerAnswers;
                        scormResult = (sit.ia_type == 'text') ? 'neutral' : (result.success ? 'correct' : 'wrong');
                        break;
                    case 'page':
                    default:
                        scormType = 'true-false';
                        scormCanswer = 'true';
                        scormWeighting = '0.0';
                        scormLanswer = 'true';
                        scormResult = 'neutral';
                }

                if (isNew) {
                    res = setValue(interaction + 'type', scormType);
                    res = setValue(interaction + 'correct_responses.0.pattern', scormCanswer);
                    res = setValue(interaction + 'weighting', scormWeighting);
                }
                res = setValue(interaction + 'student_response', scormLanswer);
                res = setValue(interaction + 'result', scormResult);
            }

            if (this.trackingmode == 'full' && !this.skipcomments)
            {
                var comment = 'cmi.comments';
                var commentText = this.formatDate(new Date()) + ': ' + SCORM_LEFT_PAGE + ' ' + sit.page_ref;
                if (sit.ia_nr>0)
                {
                    commentText += ', interaction ' + sit.ia_nr;
                }
                commentText += ': ' + sit.ia_name + '\n';
                res = setValue(comment, commentText);
                if (res == _NotImplementedError)
                {
                    this.skipcomments = true;
                }
            }

            if (ia_nr < 0) {
                var temp = false;
                var i = 0;
                for (i = 0; i < state.toCompletePages.length; i++) {
                    var currentPageNr = state.toCompletePages[i];
                    if (currentPageNr == page_nr) {
                        temp = true;
                        break;
                    }
                }
                if (temp) {
                    if (!state.completedPages[i]) {
                        var sit = state.findInteraction(page_nr, -1);
                        if (sit != null) {
                            // Skip results page ompletely
                            if (sit.ia_type != "result") {
                                state.completedPages[i] = state.pageCompleted(sit);
                            }
                        }
                    }
                }
            }

            this.storeSuspendData();
        }
    }

    function getCompletionStatus()
    {
        if (state.completedPages.length == 0) {
            return "incomplete";
        }
        for (var i=0; i<state.completedPages.length; i++) {
            if (state.completedPages[i] != true) {
                return "incomplete";
            }
        }
        return "completed";
    }

    function getSuccessStatus()
    {
        if (getCompletionStatus() != "completed") {
            return "incomplete";
        }
        if (state.getScaledScore() == 0) {
            return "completed";
        }
        if (state.getdScaledScore() > (this.lo_passed / 100)) {
            return "passed";
        }
        return "failed";
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
            return getCompletionStatus() == "completed" ? 100 : 0;
        }
        else
        {
            var score = [];
            var weight = [];
            var totalweight = 0.0;
            var i;
            // Walk passed the pages
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
        return 100.0;
    }

    function getMaxScore()
    {
        return this.getdMaxScore() + "";
    }

    function storeSuspendData()
    {
        this.pageHistory = x_pageHistory;
        this.pagesViewed = x_pagesViewed();
        this.pageStates = x_pageStates;
        setValue('cmi.core.lesson_status', this.getSuccessStatus());
        setValue('cmi.core.exit', 'suspend');

        // SCORM 1.2 only allows for 4kb of suspend data
        // try to minimise the amount of data sent in suspend_data
        // only store that data required to later restore project

        // if project contains a results page, store extra data only required to restore the project overview section of the results page
        let resultsPage = false;
        x_pages.each(function() {
            if (this.nodeName === "results") {
                resultsPage = true;
                return false;
            }
        });

        const requiredInteractions = this.interactions.map(function (sit) {
            const interactionObject = {
                page_nr: sit.page_nr,
                ia_nr: sit.ia_nr,
                ia_type: sit.ia_type,
                ia_name: sit.ia_name,
                nrinteractions: sit.nrinteractions,
                weighting: sit.weighting,
                score: sit.score,
                scoreTracked: sit.scoreTracked,
                result: sit.result
            }

            // we won't save the interaction level detail needed by results page as that will quickly take us over the limit
            if (resultsPage) {
                $.extend(interactionObject, {
                    firstEntered: sit.firstEntered,
                    duration: sit.duration
                });
            }

            return interactionObject;
        });

        const requiredData = {
            currentpageid: this.currentpageid,
            completedPages: this.completedPages,
            firstEntered: this.firstEntered,
            interactions: requiredInteractions,
            pageStates: this.pageStates,
            pagesViewed: this.pagesViewed,
            pageHistory: this.pageHistory
        };

        let suspend_str = JSON.stringify(requiredData);
        let compressed = compressSuspendData(suspend_str);
        console.log("SCORM suspend_data raw/compressed: " + suspend_str.length + "/" + compressed.length);

        // this might not always work as the limits aren't this exact but try to stop the suspend_str length causing save to fail
        if (compressed.length <= 4096) {
            console.log(suspend_str);
            setValue('cmi.suspend_data', compressed);
        } else {
            delete requiredData.pageStates;
            delete requiredData.pageHistory;
            suspend_str = JSON.stringify(requiredData);
            compressed = compressSuspendData(suspend_str);
            console.log("suspend_data is too large - drop data");
            console.log("SCORM suspend_data raw/compressed: " + suspend_str.length + "/" + compressed.length);
            if (compressed.length <= 4096) {
                console.log(suspend_str);
                setValue('cmi.suspend_data', compressed);
            } else {
                console.log("suspend_data is still too large");
            }
        }

        var supported = getValue('cmi.core.score._children');
        setValue('cmi.core.score.raw', this.getRawScore());
        if (supported.indexOf('min') >= 0)
        {
            setValue('cmi.core.score.min', this.getMinScore());
        }
        if (supported.indexOf('max') >= 0)
        {
            setValue('cmi.core.score.max', this.getMaxScore());
        }
        var end = new Date();
        var duration = end.getTime() - this.start.getTime();
        setValue('cmi.core.session_time', this.formatDuration(duration));
        doLMSCommit();
    }
    function finishTracking(currentid)
    {
        this.currentpageid = currentid;
        this.storeSuspendData();
    }

    function initTracking()
    {
        console.log("SCORM entry: ", getValue('cmi.entry'));
        console.log("SCORM suspend_data: ", getValue('cmi.suspend_data'));
        if (getValue('cmi.core.entry') == 'resume')
        {
            var suspend_str = getValue('cmi.suspend_data');
            if (suspend_str.length > 0)
            {
                this.setVars(decompressSuspendData(suspend_str));
            }
        }
        var interactions_supported = getValue('cmi.interactions._children');
        if (interactions_supported == _NotImplementedError)
        {
            this.skipinteractions = true;
        }
        else
        {
            if (interactions_supported.indexOf('id') < 0
                || interactions_supported.indexOf('time') < 0
                || interactions_supported.indexOf('type') < 0
                || interactions_supported.indexOf('correct_responses') < 0
                || interactions_supported.indexOf('weighting') < 0
                || interactions_supported.indexOf('student_response') < 0
                || interactions_supported.indexOf('result') < 0
                || interactions_supported.indexOf('latency') < 0)
            {
                this.skipinteractions = true;
            }
        }
    }
    /**
     * Check whether result has the valid structure and contents
     * @param result
     *
     * result should be an object with a boolean field success and a float field score
     */
    function verifyResult(result)
    {
        if (this.debug)
        {
            if (typeof result != 'object' || typeof result['success'] != 'boolean' || typeof result['score'] != 'number' || result['score'] < 0.0 || result['score'] > 100.0)
            {
                console.log("Invalid result structure: " + result);
            }
        }
    }

    /**
     *
     * @param ia_type
     * @param ia_name
     * @param correctoptions
     * @param correctanswer
     * @param feedback
     *
     *  correctoptions and correctanswer depends on the sit_iatype
     *
     *  1. matching
     *      correctoptions: array of objects with source and target strings
     *              [
     *              {
     *                  source: 'lettuce',
     *                  target: 'vegetable'
     *              },
     *              {
     *                  source: 'apple',
     *                  target: 'fruit'
     *              },
     *              {
     *                  source: 'pear',
     *                  target: 'vegetable'
     *              }
     *              ]
     *      correctanswer: array of matching representation
     *              [
     *              'lettuce --> vegetable',
     *              'apple --> fruit',
     *              'pear --> fruit'
     *              ]
     *
     *   2. multiplechoice
     *       correctoptions: array of objects containg all possible options numbered "1" to max nr of options.
     *              [
     *              {
     *                  id: '1',
     *                  answer: 'London',
     *                  result: true
     *              },
     *              {
     *                  id: '2',
     *                  answer: 'Paris',
     *                  result: false
     *              },
     *              {
     *                  id: '3',
     *                  answer: 'Amsterdam',
     *                  result: false
     *              }
     *              ]
     *       correctanswers contains an array with the answer string of the above structure
     *              [
     *                  'London',
     *                  'Paris',
     *                  'Amsterdam'
     *              ]
     *
     *    3. numeric
     *        correctoptions is ignored
     *        correctanswers is ignored
     *
     *    4. text, fill-in
     *        correctoptions is ignored
     *        correctanswers contains an array of strings that are correct. With type text, array is assumed to be empty
     *
     *    5. page
     *         correctoptions is ignored
     *         correctanswers is ignored
     *
     *    6. default
     *          flag warning
     *
     */
    function verifyEnterInteractionParameters(ia_type, ia_name, correctoptions, correctanswer, feedback)
    {
        if (this.debug) {
            switch(ia_type)
            {
                case 'match':
                    /*
                    *  1. matching
                    *      correctoptions: array of objects with source and target strings
                    *              [
                    *              {
                    *                  source: 'lettuce',
                    *                  target: 'vegetable'
                    *              },
                    *              {
                    *                  source: 'apple',
                    *                  target: 'fruit'
                    *              },
                    *              {
                    *                  source: 'pear',
                    *                  target: 'fruit'
                    *              }
                    *              ]
                    *      learneranswer: array of matching representation
                    *              [
                    *              'lettuce --> vegetable',
                    *              'apple --> fruit',
                    *              'pear --> fruit'
                    *              ]
                    */
                    if (typeof correctoptions == 'object')
                    {
                        for (var i=0; i<correctoptions.length; i++)
                        {
                            var item = correctoptions[i];
                            if (typeof item != 'object' || typeof item['source'] != 'string' || typeof item['target'] != 'string')
                            {
                                console.log("Invalid structure for correctoptions for type match: " + correctoptions);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for correctoptions for type match: " + correctoptions);
                    }
                    if (typeof correctanswer == 'object')
                    {
                        for (var i=0; i<correctanswer.length; i++)
                        {
                            var item = correctanswer[i];
                            if (typeof item != 'string')
                            {
                                console.log("Invalid structure for correctanswer for type match: " + correctanswer);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for correctanswer for type match: " + correctanswer);
                    }
                    break;
                case 'multiplechoice':
                    /*
                     * 2. multiplechoice
                     *       correctoptions: array of objects containg all possible options numbered "1" to max nr of options.
                     *              [
                     *              {
                     *                  id: '1',
                     *                  answer: 'London',
                     *                  result: true
                     *              },
                     *              {
                     *                  id: '2',
                     *                  answer: 'Paris',
                     *                  result: false
                     *              },
                     *              {
                     *                  id: '3',
                     *                  answer: 'Amsterdam',
                     *                  result: false
                     *              }
                     *              ]
                     *       correctanswers contains an array with the answer string of the above structure
                     *              [
                     *                  'London',
                     *                  'Paris',
                     *                  'Amsterdam'
                     *              ]
                     */
                    if (typeof correctoptions == 'object')
                    {
                        for (var i=0; i<correctoptions.length; i++)
                        {
                            var item = correctoptions[i];
                            if (typeof item != 'object' || typeof item['id'] != 'string' || typeof item['answer'] != 'string' || typeof item['result'] != 'boolean')
                            {
                                console.log("Invalid structure for correctoptions for type multiplechoice: " + correctoptions);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for correctoptions for type multiplechoice: " + correctoptions);
                    }
                    if (typeof correctanswer == 'object')
                    {
                        for (var i=0; i<correctanswer.length; i++)
                        {
                            var item = correctanswer[i];
                            if (typeof item != 'string')
                            {
                                console.log("Invalid structure for correctanswer for type multiplechoice: " + correctanswer);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for correctanswer for type multiplechoice: " + correctanswer);
                    }
                    break;
                case 'numeric':
                    /**
                     * 3. numeric
                     *        correctoptions is ignored
                     *        correctanswers is ignored
                     */
                    // Nothing to check
                    break;
                case 'text':
                case 'fill-in':
                    /**
                     * 4. text, fill-in
                     *        correctoptions contains an array of strings that are correct. With type text, array is assumed to be empty
                     *        correctanswers is ignored
                     *
                     */
                    if (typeof correctoptions == 'object')
                    {
                        for (var i=0; i<correctoptions.length; i++)
                        {
                            var item = correctoptions[i];
                            if (typeof item != 'string')
                            {
                                console.log("Invalid structure for correctoptions for type multiplechoice: " + correctoptions);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for correctoptions for type multiplechoice: " + correctoptions);
                    }
                    break;
                case 'page':
                case 'result':
                    /**
                     * 5. page
                     *         correctoptions is ignored
                     *         correctanswers is ignored
                     */
                    // Nothing to check
                    break;

                default:
                    console.log("Invalid ia_type " + ia_type + " entering interaction.");
                    break;
            }
        }
    }


    /**
     * Routine to verify the structures of result, learneroptions and learneranswer given sit.ia_type
     * @param sit
     * @param result
     * @param learneroptions
     * @param learneranswer
     * @param feedback
     *
     *  result should be an object
     *          {
     *              success: true,
     *              score: 100.0
     *          }
     *
     *  learneroptions and learneranswer depends on the sit_iatype
     *
     *  1. matching
     *      learneroptions: array of objects with source and target strings
     *              [
     *              {
     *                  source: 'lettuce',
     *                  target: 'vegetable'
     *              },
     *              {
     *                  source: 'apple',
     *                  target: 'fruit'
     *              },
     *              {
     *                  source: 'pear',
     *                  target: 'vegetable'
     *              }
     *              ]
     *      learneranswer: array of matching representation
     *              [
     *              'lettuce --> vegetable',
     *              'apple --> fruit',
     *              'pear --> vegetable'
     *              ]
     *
     *   2. multiplechoice
     *       learneroptions: array of objects indicating selected options numbered "1" to max nr of options. Therer are only more than one entries, if there are multiple answers allowed
     *              [
     *              {
     *                  id: '2',
     *                  answer: 'Paris'
     *                  result: false
     *              }
     *              ]
     *       learneranswers contains an array with the answer string of the above structure
     *              [
     *                  'Paris'
     *              ]
     *
     *    3. numeric
     *        learneroptions: ignored
     *        learneranswer contains a number between 0 and 100
     *
     *    4. text, fill-in
     *        learneroptions is ignored
     *        learneranswers contains the selected/entered text
     *
     *    5. page
     *         learneroptions is ignored
     *         learneranswers is ignored
     *
     *    6. default
     *          flag warning
     *
     */
    function verifyExitInteractionParameters(sit, result, learneroptions, learneranswer, feedback)
    {
        if (this.debug) {
            this.verifyResult(result);
            switch(sit.ia_type)
            {
                case 'match':
                    /*
                    *  1. matching
                    *      learneroptions: array of objects with source and target strings
                    *              [
                    *              {
                    *                  source: 'lettuce',
                    *                  target: 'vegetable'
                    *              },
                    *              {
                    *                  source: 'apple',
                    *                  target: 'fruit'
                    *              },
                    *              {
                    *                  source: 'pear',
                    *                  target: 'vegetable'
                    *              }
                    *              ]
                    *      learneranswer: array of matching representation
                    *              [
                    *              'lettuce --> vegetable',
                    *              'apple --> fruit',
                    *              'pear --> vegetable'
                    *              ]
                    */
                    if (typeof learneroptions == 'object')
                    {
                        for (var i=0; i<learneroptions.length; i++)
                        {
                            var item = learneroptions[i];
                            if (typeof item != 'object' || typeof item['source'] != 'string' || typeof item['target'] != 'string')
                            {
                                console.log("Invalid structure for learneroptions for type match: " + learneroptions);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for learneroptions for type match: " + learneroptions);
                    }
                    if (typeof learneranswer == 'object')
                    {
                        for (var i=0; i<learneranswer.length; i++)
                        {
                            var item = learneranswer[i];
                            if (typeof item != 'string')
                            {
                                console.log("Invalid structure for learneranswer for type match: " + learneranswer);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for learneranswers for type match: " + learneranswer);
                    }
                    break;
                case 'multiplechoice':
                    /*
                     * 2. multiplechoice
                     *       learneroptions: array of objects indicating selected options numbered "1" to max nr of options. Therer are only more than one entries, if there are multiple answers allowed
                     *              [
                     *              {
                     *                  id: '2',
                     *                  answer: 'Paris'
                     *                  result: false
                     *              }
                     *              ]
                     *       learneranswers contains an array with the answer string of the above structure
                     *              [
                     *                  'Paris'
                     *              ]
                     */
                    if (typeof learneroptions == 'object')
                    {
                        for (var i=0; i<learneroptions.length; i++)
                        {
                            var item = learneroptions[i];
                            if (typeof item != 'object' || typeof item['id'] != 'string' || typeof item['answer'] != 'string' || typeof item['result'] != 'boolean')
                            {
                                console.log("Invalid structure for learneroptions for type multiplechoice: " + learneroptions);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for learneroptions for type multiplechoice: " + learneroptions);
                    }
                    if (typeof learneranswer == 'object')
                    {
                        for (var i=0; i<learneranswer.length; i++)
                        {
                            var item = learneranswer[i];
                            if (typeof item != 'string')
                            {
                                console.log("Invalid structure for learneranswer for type multiplechoice: " + learneranswer);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for learneranswers for type multiplechoice: " + learneranswer);
                    }
                    break;
                case 'numeric':
                    /**
                     * 3. numeric
                     *        learneroptions: ignored
                     *        learneranswer contains a number between 0 and 100
                     */
                    if (typeof learneranswer != 'number')
                    {
                        console.log("Invalid structure for learneranswers for type numeric: " + learneranswer);
                    }
                    break;
                case 'text':
                case 'fill-in':
                    /**
                     * 4. text, fill-in
                     *        learneroptions is ignored
                     *        learneranswers contains the selected/entered text
                     *
                     */
                    if (typeof learneranswer != 'string')
                    {
                        console.log("Invalid structure for learneranswers for type fill-in: " + learneranswer);
                    }
                case 'page':
                case 'result':
                    /**
                     * 5. page
                     *         learneroptions is ignored
                     *         learneranswers is ignored
                     */
                    // Nothing to check
                    break;
                default:
                    console.log("Invalid ia_type " + sit.ia_type + " exiting interaction.");
                    break;
            }
        }
    }

}

var state = new ScormTrackingState();
// enable debug for now
state.debug = true;

// Backward compatibility functions
function getValue(elementName){
    var result = String(doLMSGetValue(elementName));
    return result;
}

function setValue(elementName, value){
    var result = doLMSSetValue(elementName, value);
    return result;
}


function XTInitialise(category) {
    // Tom Reijnders 2022-10-06: Trying to handle tracking of standalone pages where the page is a page of the same LO
    // Specifically when the standalone page is shown in a lightbox
    // We make use of the fact that in javascript, assigning a variable is done through reference, so we actually
    // point the state variable (of the standalone page) to the parent state variable (of the main LO)
    try {
        if (parent != self && parent.x_TemplateId != undefined && parent.x_TemplateId == x_TemplateId && parent.state != undefined) {
            state = parent.state;
        }
    } catch (e) {
        // Do nothing
    }
    if (!state.initialised) {
        state.initialised = true;
        doLMSInitialize();
        state.initTracking();
        state.scormmode = String(getValue("cmi.core.lesson_mode"));
    }
}

function XTTrackingSystem()
{
    return "SCORM 1.2";
}

function XTLogin(login, passwd)
{
    return true;
}

function XTGetMode()
{
    return state.scormmode;
}

function XTStartPage()
{
    if (getValue('cmi.core.entry') == 'resume' && state.scormmode == "normal")
    {
        var currentid = state.currentpageid;
        state.currentpageid = "";
        var sit = state.find(currentid);
        if (sit != null) {
            if ($.inArray(sit.page_nr, x_normalPages) == -1) {
                if (x_pageHistory.length > 0) {
                    return x_pageHistory[x_pageHistory.length - 1];
                } else {
                    return x_normalPages[0];
                }
            }
            return sit.page_nr;
        } else {
            return -1;
        }
    }
    else
    {
        return -1;
    }
}

function XTGetUserName()
{
    var result = String(getValue("cmi.core.student_name"));
    return result;
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
            for(var i = 0; i< state.toCompletePages.length;i++)
            {
                state.completedPages[i] = false;
            }
            break;
        case "tracking-mode":
            switch(value)
            {
                case 'full':
                    state.trackingmode = 'full';
                    break;
                case 'minimal':
                    state.trackingmode = 'minimal';
                    break;
                case 'none':
                    state.trackingmode = 'none';
                    break;
            }
            break;
        case "score-mode":
            switch(value)
            {
                case 'single':
                    state.scoremode = 'first';
                    break;
                case 'multiple':
                    state.scoremode = 'last';
                    break;
            }
            break;
        case "objective_passed":
            if (Number(value) <= 1) {
                state.lo_passed = Number(value) * 100;
            }
            break;
        case "page_timeout":
            // Page timeout in seconds
            state.page_timeout = Number(value) * 1000;
            break;
        case "page_completion":
            state.page_completion = value;
            break;
    }
}

function XTEnterPage(page_nr, page_name, grouping)
{
    if (state.scormmode == 'normal')
    {
        var sit = state.enter(page_nr, -1, "page", page_name);
        if (state.trackingmode == 'full')
        {
            var comment = 'cmi.comments';
            var commentText = state.formatDate(new Date()) + ': ' + SCORM_ENTERED_PAGE + ' ' + sit.page_ref;
            if (sit.ia_nr>0)
            {
                commentText += ', interaction ' + sit.ia_type + '-' + sit.ia_nr;
            }
            commentText += ': ' + sit.ia_name + '\n';
            var result = setValue(comment, commentText);
        }
        state.currentpageid = sit.id;
    }
}


function XTExitPage(page_nr)
{
    if (state.scormmode == 'normal')
    {
        state.exitInteraction(page_nr, -1, {score:0, success:true}, "", "", "", false);
    }
}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting)
{
    if (state.scormmode == 'normal')
    {
        var sit = state.findPage(page_nr);
        if (sit != null)
        {
            sit.ia_type = page_type;

            sit.nrinteractions = nrinteractions;
            sit.weighting = parseFloat(weighting);
            if (page_type != 'page')
            {
                state.lo_type = 'interactive';
            }
        }
    }
}

function XThelperConsolidateSegments(videostate)
{
    // 1. Sort played segments on start time (first make a copy)
    var segments = $.extend(true, [], videostate.segments);
    segments.sort(function(a,b) {return (a.start > b.start) ? 1 : ((b.start > a.start) ? -1 : 0);} );
    // 2. Combine the segments
    var csegments = [];
    var i=0;
    while(i<segments.length) {
        var segment = $.extend(true, {}, segments[i]);
        i++;
        while (i<segments.length && segment.end >= segments[i].start) {
            segment.end = segments[i].end;
            i++;
        }
        csegments.push(segment);
    }
    return csegments;
}

function XThelperDetermineProgress(videostate)
{
    var csegments = XThelperConsolidateSegments(videostate);
    var videoseen = 0;
    for (var i=0; i<csegments.length; i++)
    {
        videoseen += csegments[i].end - csegments[i].start;
    }
    // normalized between 0 and 1
    if (!isNaN(videostate.duration) && videostate.duration > 0) {
        return Math.round(videoseen / videostate.duration * 100.0) / 100.0;
    }
    return 0.0;
}

function XTVideo(page_nr, name, block_name, verb, videostate, grouping) {
    return;
}

function XTSetPageScore(page_nr, score)
{
    if (state.scormmode == 'normal')
    {
        var sit = state.findPage(page_nr);
        if (sit != null && (state.scoremode != 'first' || sit.scoreTracked !== true))
        {
            sit.score = score;
            sit.scoreTracked = true;

            if (sit.ia_type != "result") {
                for (var i=0; i<state.toCompletePages.length; i++) {
                    if (state.toCompletePages[i] == page_nr) {
                        if (!state.completedPages[i]) {
                            state.completedPages[i] = state.pageCompleted(sit);
                        }
                        break;
                    }
                }
            }

            state.storeSuspendData();
        }
    }
}

function XTSetPageScoreJSON(page_nr, score, JSONGraph) {
    XTSetPageScore(page_nr, score);
}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback, grouping, context)
{
    if (state.scormmode == 'normal')
    {
        state.verifyEnterInteractionParameters(ia_type, ia_name, correctoptions, correctanswer, feedback);
        var sit = state.enter(page_nr, ia_nr, ia_type, ia_name);
        sit.correctOptions = correctoptions;
        sit.correctAnswers = correctanswer;
        //sit.currentid = sit.id;
    }
}

function XTExitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback)
{
    if (state.scormmode == 'normal')
    {
        return state.exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback, false);
    }
}

function XTGetInteractionScore(page_nr, ia_nr, ia_type, ia_name, full_id, callback, q)
{
    callback(null);
    return 0;
}
function XTGetInteractionCorrectAnswer(page_nr, ia_nr, ia_type, ia_name)
{
    return "";
}

function XTGetInteractionCorrectAnswerFeedback(page_nr, ia_nr, ia_type, ia_name)
{
    return "";
}

function XTGetInteractionLearnerAnswer(page_nr, ia_nr, ia_type, ia_name)
{
    return "";
}

function XTGetInteractionLearnerAnswerFeedback(page_nr, ia_nr, ia_type, ia_name)
{
    return "";
}


function XTTerminate()
{
    if (state.finished) return;
    state.finished = true;

    if (state.scormmode == 'normal')
    {
        var currentpageid = state.currentpageid;
        x_endPageTracking(false, -1);

        // This code is probably obsolete, leave it in to allow for more testing
        state.finishTracking(currentpageid, false);
        doLMSFinish();
    }
}

function XTResults() {
    const nrcompleted = state.completedPages.filter(Boolean).length;
    const completion = nrcompleted > 0 ? Math.round((nrcompleted / state.toCompletePages.length) * 100) : 0;

    var results = {};
    results.mode = x_currentPageXML.getAttribute("resultmode");

    var score = 0,
        nrofquestions = 0,
        totalWeight = 0,
        totalDuration = 0;
    results.interactions = Array();

    for (i = 0; i < state.interactions.length; i++) {
        score += state.interactions[i].score * state.interactions[i].weighting;
        if (state.interactions[i].ia_nr < 0 || state.interactions[i].nrinteractions > 0) {

            var interaction = {};
            interaction.page_nr = state.interactions[i].page_nr;
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
            if (state.interactions[i].ia_type != "result") {
                totalDuration += state.interactions[i].duration;
            }
            nrofquestions++;
            totalWeight += state.interactions[i].weighting;

        }
        else if (results.mode == "full-results") {
            // details of interaction are only needed if an attempt has been made
            // if project is resumed, the learnerAnswers & correctOptions will not be available to minimise suspend_str so we can't display them
            if (state.interactions[i].result === undefined || state.interactions[i].result === "unknown" || (state.interactions[i].learnerAnswers.length === 0 && state.interactions[i].correctOptions.length === 0)) {
                continue;
            }
            var subinteraction = {};

            var learnerAnswer, correctAnswer;
            switch (state.interactions[i].ia_type) {
                case "match":
                    // If unique targets, match answers by target, otherwise match by source
                    const targets = [];
                    for (let j = 0; j < state.interactions[i].correctOptions.length; j++) {
                        targets.push(state.interactions[i].correctOptions[j].target);
                    }
                    // Check whether values of targets are unique
                    const uniqueTargets = targets.length === new Set(targets).size;
                    for (var c = 0; c < state.interactions[i].correctOptions.length; c++) {
                        var matchSub = {}; //Create a subinteraction here for every match sub instead
                        correctAnswer = state.interactions[i].correctOptions[c].source + ' --> ' + state.interactions[i].correctOptions[c].target;
                        let source = state.interactions[i].correctOptions[c].source;
                        let target = state.interactions[i].correctOptions[c].target;
                        if (state.interactions[i].learnerOptions.length == 0) {
                            if (uniqueTargets) {
                                learnerAnswer = ' --> ' + target;
                            }
                            else {
                                learnerAnswer = source + ' --> ' + ' ';
                            }
                        }
                        else {
                            for (var d = 0; d < state.interactions[i].learnerOptions.length; d++) {
                                if (uniqueTargets)
                                {
                                    if (target == state.interactions[i].learnerOptions[d].target) {
                                        learnerAnswer = state.interactions[i].learnerOptions[d].source + ' --> ' + target;
                                        break;
                                    } else {
                                        learnerAnswer = ' --> ' + target;
                                    }
                                }
                                else
                                {
                                    if (source == state.interactions[i].learnerOptions[d].source) {
                                        learnerAnswer = source + ' --> ' + state.interactions[i].learnerOptions[d].target;
                                        break;
                                    } else {
                                        learnerAnswer = source + ' --> ' + ' ';
                                    }
                                }
                            }
                        }

                        matchSub.question = state.interactions[i].ia_name;
                        matchSub.correct = (learnerAnswer === correctAnswer);
                        matchSub.learnerAnswer = learnerAnswer;
                        matchSub.correctAnswer = correctAnswer;
                        matchSub.judge = (state.interactions[i].result != null && state.interactions[i].result.judge != null ? state.interactions[i].result.judge : true);
                        results.interactions[nrofquestions - 1].subinteractions.push(matchSub);
                    }
                    break;
                case "text":
                    learnerAnswer = state.interactions[i].learnerAnswers;
                    correctAnswer = state.interactions[i].correctAnswers;
                    break;
                case "multiplechoice":
                    learnerAnswer = state.interactions[i].learnerAnswers[0] != undefined ? state.interactions[i].learnerAnswers[0] : "";
                    for (var j = 1; j < state.interactions[i].learnerAnswers.length; j++) {
                        learnerAnswer += "\n" + state.interactions[i].learnerAnswers[j];
                    }
                    correctAnswer = "";
                    for (var j = 0; j < state.interactions[i].correctAnswers.length; j++) {
                        if (correctAnswer.length > 0)
                            correctAnswer += "\n";
                        correctAnswer += state.interactions[i].correctAnswers[j];
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
                subinteraction.correct = state.interactions[i].result.success;
                subinteraction.learnerAnswer = learnerAnswer;
                subinteraction.correctAnswer = correctAnswer;
                subinteraction.judge = (state.interactions[i].result != null && state.interactions[i].result.judge != null ? state.interactions[i].result.judge : true);
                results.interactions[nrofquestions - 1].subinteractions.push(subinteraction);
            }
        }
    }
    results.completion = completion;
    results.score = score;
    results.nrofquestions = nrofquestions;
    results.averageScore = Math.round(state.getdScaledScore() * 10000.0)/100.0;
    results.totalDuration = Math.round(totalDuration / 1000);
    results.start = state.firstEntered.toLocaleString();

    return results;
}

function compressSuspendData(str) {
    return "Z1:" + LZString.compressToBase64(str);
}
function decompressSuspendData(str) {
    if (str.indexOf("Z1:") === 0) {
        const data = LZString.decompressFromBase64(str.substring(3));
        return data == null ? "" : LZString.decompressFromBase64(str.substring(3));
    }
    return str;
}

