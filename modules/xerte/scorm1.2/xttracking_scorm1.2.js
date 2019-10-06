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
    this.ia_ref = ia_nr+1;
    this.ia_type = ia_type;
    this.ia_name = ia_name;
    this.state = "entered";
    this.start = new Date();
    this.end = this.start;
    this.count = 0;
    this.duration = 0;
    this.nrinteractions = 0;
    this.weighting = 0.0;
    this.score = 0.0;
    this.result = 'unknown';
    this.complete = false;
    this.correctOptions = [];
    this.correctAnswers = [];
    this.correctfeedback = "";
    this.learnerOptions = [];
    this.learnerAnswers = [];
    this.answerfeedback = "";
    this.id = makeId(page_nr, ia_nr, ia_type, ia_name);
    this.idx = -1;

    this.setVars = setVars;
    this.exit = exit;
    this.reenter = reenter;

    function setVars(jsonObj)
    {
        this.page_nr = jsonObj.page_nr;
        this.page_ref = jsonObj.page_ref;
        this.ia_nr = jsonObj.ia_nr;
        this.ia_ref = jsonObj.ia_ref;
        this.ia_type = jsonObj.ia_type;
        this.ia_name = jsonObj.ia_name;
        this.state = jsonObj.state;
        this.start = new Date(jsonObj.start);
        this.end = new Date(jsonObj.end);
        this.count = jsonObj.count;
        this.duration = jsonObj.duration;
        this.nrinteractions = jsonObj.nrinteractions;
        this.weighting = jsonObj.weighting;
        this.score = jsonObj.score;
        this.result = jsonObj.result;
        this.complete = jsonObj.complete;
        this.correctOptions = jsonObj.correctOptions;
        this.correctAnswers = jsonObj.correctAnswers;
        this.correctfeedback = jsonObj.correctfeedback;
        this.learnerOptions = jsonObj.learnerOptions;
        this.learnerAnswers = jsonObj.learnerAnswers;
        this.answerfeedback = jsonObj.answerfeedback;
        this.id = jsonObj.id;
        this.idx = jsonObj.idx;
    }

    function exit()
    {
        this.end = new Date();
        var duration = this.end.getTime() - this.start.getTime();
        this.state = "exited";
        if (duration > 100)
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
    this.currentid = "";
    this.currentpageid = "";
    this.trackingmode = "full";
    this.skipcomments = false;
    this.skipinteractions = false;
    this.scoremode = "first";
    this.nrpages = 0;
    this.toCompletePages = new Array();
    this.completedPages = new Array();
    this.pages_visited=0;
    this.start = new Date();
    this.duration_previous_attempts = 0;
    this.lo_type = "pages only";
    this.lo_passed = -1.0;
    this.page_timeout = 0;
    this.lo_completed = "unknown";
    this.finished = false;
    this.interactions = new Array();
    this.debug = false;

    this.setVars = setVars;
    this.getVars = getVars;
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


    function pageCompleted(sit)
    {
        var sits = this.findAllInteractions(sit.page_nr);
        if (sits.length != sit.nrinteractions)
        {
            return false;
        }
        if (sit.ia_type=="page" && sit.duration < this.page_timeout)
        {
            return false;
        }
        return true;
    }




    function setVars(jsonStr)
    {
        if (jsonStr.length > 0)
        {
            var jsonObj = JSON.parse(jsonStr);
            // Do NOT touch scormmode, don't touch start and don't touch finished
            this.currentid = jsonObj.currentid;
            this.currentpageid = jsonObj.currentpageid;
            this.trackingmode = jsonObj.trackingmode;
            this.scoremode = jsonObj.scoremode;
            this.nrpages = jsonObj.nrpages;
            this.pages_visited=jsonObj.pages_visited;
//            this.start = new Date(jsonObj.start);
            this.duration_previous_attempts = jsonObj.duration_previous_attempts;
            this.lo_type = jsonObj.lo_type;
            this.lo_passed = jsonObj.lo_passed;
            this.page_timout = jsonObj.page_timeout;
            this.lo_completed = jsonObj.lo_completed;
//            this.finished = jsonObj.finished;
            this.interactions = new Array();
            var i=0;
            for (i=0; i<jsonObj.interactions.length; i++)
            {
                var jsonSit = jsonObj.interactions[i];
                var sit = new ScormInteractionTracking(jsonSit.page_nr, jsonSit.ia_nr, jsonSit.ia_type, jsonSit.ia_name);
                sit.setVars(jsonSit);
                this.interactions.push(sit);
            }
        }
    }

    function getVars()
    {
        // SCORM 1.2 only allows for 4kb of suspend data, so do not store all interaction data , but just the bare minimum to be able to resume.
        var jsonObj = {};
        jsonObj.currentid = this.currentid;
        jsonObj.currentpageid = this.currentpageid;
        jsonObj.trackingmode = this.trackingmode;
        jsonObj.scoremode = this.scoremode;
        jsonObj.nrpages = this.nrpages;
        jsonObj.pages_visited=this.pages_visited;
//            this.start = new Date(jsonObj.start);
        jsonObj.duration_previous_attempts = this.duration_previous_attempts;
        jsonObj.lo_type = this.lo_type;
        jsonObj.lo_passed = this.lo_passed;
        jsonObj.page_timout = this.page_timeout;
        jsonObj.lo_completed = this.lo_completed;
//            this.finished = jsonObj.finished;
        jsonObj.interactions = new Array();

        // Only push the cureent page interaction
        var sit = this.find(this.currentpageid);
        jsonObj.interactions.push(sit);
        /*
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            var jsonSit = this.interactions[i];
            // Only create empty interactions, to make string as short as possible
            var sit = new ScormInteractionTracking(jsonSit.page_nr, jsonSit.ia_nr, jsonSit.ia_type, jsonSit.ia_name);

            //sit.setVars(jsonSit);
            jsonObj.interactions.push(sit);
        }
         */
        return JSON.stringify(jsonObj);
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
        var i=0;
        for (i=0; i<this.interactions.length; i++)
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
        if (ia_nr <0)
        {
            this.currentpageid = "";
        }
        else
        {
            this.currentid = "";
        }

        if (sit != null && sit.exit())
        {
            this.verifyExitInteractionParameters(sit, result, learneroptions, learneranswer, feedback);
            if (this.scoremode == 'first' && sit.count > 1)
                return;

            // Record this action
            var id = makeId(sit.page_nr, sit.ia_nr, sit.ia_type, sit.ia_name);
            var currnrinteractions = this.scorm_nr_interactions();
            var index = this.id_to_interactionidx(id);
            var interaction = 'cmi.interactions.' + index + '.';

            sit.learnerOptions = learneroptions;
            sit.learnerAnswers = learneranswer;
            sit.result = result;
            sit.answerfeedback = feedback;

            if (!this.skipinteractions && this.trackingmode != 'none'
                && ((sit.ia_nr < 0 && (this.trackingmode!='full' || sit.nrinteractions == 0))
                || (sit.ia_nr >= 0 && this.trackingmode == 'full')))
            {
                var res = setValue(interaction + 'id', id);
                sit.idx = index;
                res = setValue(interaction + 'time', this.formatTime(sit.start));
                res = setValue(interaction + 'latency', this.formatDuration(sit.duration));

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
                        var scorm_lanswer = scormAnswerArray.join(',');

                        // Do the same for the answer pattern
                        var scormCorrectArray = [];
                        var i=0;
                        for (i=0; i<sit.correctOptions.length; i++)
                        {
                            // Create ascii characters from option number and ignore answer string
                            var entry = sit.correctOptions[i];
                            scormCorrectArray.push(entry.source.replace(/ /g, "_") + "." + entry.target.replace(/ /g, "_"));
                        }
                        var scorm_canswer = scormCorrectArray.join(',');
                        res = setValue(interaction + 'type', 'matching');
                        res = setValue(interaction + 'correct_responses.0.pattern', scorm_canswer);
                        res = setValue(interaction + 'weighting', Math.round(pweighting/nrinteractions*100)/100);
                        res = setValue(interaction + 'student_response', scorm_lanswer);
                        res = setValue(interaction + 'result', (result.success ? 'correct' : 'wrong'));
                        break;
                    case 'multiplechoice':
                        // We have an options as numbers, separated by ';'
                        // and we have corresponding answers strings separated by ';'
                        // Construct answers like a  (ignore answers, because we can't do anything with them in Scorm 1.2)

                        var scormAnswerArray = [];
                        var i=0;
                        for (i=0; i<learneroptions.length; i++)
                        {
                            // Create ascii characters from option number and add answer string
                            scormAnswerArray.push(String.fromCharCode(parseInt(learneroptions[i])+96));
                        }
                        var scorm_lanswer = scormAnswerArray.join(',');

                        // Do the same for the answer pattern
                        var scormCorrectArray = [];
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
                        var scorm_canswer = scormCorrectArray.join(',');
                        res = setValue(interaction + 'type', 'choice');
                        res = setValue(interaction + 'correct_responses.0.pattern', scorm_canswer);
                        res = setValue(interaction + 'weighting', Math.round(pweighting/nrinteractions*100)/100);
                        res = setValue(interaction + 'student_response', scorm_lanswer);
                        res = setValue(interaction + 'result', (result.success ? 'correct' : 'wrong'));
                        break;
                    case 'numeric':
                        res = setValue(interaction + 'type', 'numeric');
                        res = setValue(interaction + 'correct_responses.0.pattern', '100');
                        if (ia_nr <0)  // Page mode
                        {
                            res = setValue(interaction + 'weighting', Math.round(sit.weighting*100)/100);
                            res = setValue(interaction + 'student_response', sit.score);
                            res = setValue(interaction + 'result', Math.round(sit.score*100)/100);
                        }
                        else { // Interaction mode
                            res = setValue(interaction + 'weighting', Math.round(pweighting/nrinteractions*100)/100);
                            res = setValue(interaction + 'student_response', sit.learneranswer);
                            res = setValue(interaction + 'result', Math.round(sit.learneranswer * 100) / 100);
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

                        res = setValue(interaction + 'type', 'fill-in');
                        res = setValue(interaction + 'correct_responses.0.pattern', sit.correctAnswers);
                        res = setValue(interaction + 'weighting', Math.round(pweighting/nrinteractions*100)/100);
                        res = setValue(interaction + 'student_response', sit.learnerAnswers);
                        if (sit.ia_type=='text') {
                            res = setValue(interaction + 'result', 'neutral');
                        }
                        else {
                            res = setValue(interaction + 'result',(result.success ? 'correct' : 'wrong'));
                        }
                        break;
                    case 'page':
                    default:
                        res = setValue(interaction + 'type', 'true-false');
                        res = setValue(interaction + 'correct_responses.0.pattern', 'true');
                        res = setValue(interaction + 'weighting', '0.0');
                        res = setValue(interaction + 'student_response', 'true');
                        res = setValue(interaction + 'result', 'neutral');
                }
            }

            if (sit.ia_nr < 0 && sit.count==1)
                this.pages_visited++;

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
            //this.finishTracking(state.currentpageid);
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
        }
    }

    function getSuccessStatus()
    {
        var completed = false;
        for(var i = 0; i<state.completedPages.length; i++)
        {
            if(state.completedPages[i] == false)
            {
                break;
            }
            if( i == state.completedPages.length-1 && state.completedPages[i] == true)
            {
                completed = true;
            }
        }

        if (!completed)
        {

            return 'incomplete';
        }
        else if(state.getScaledScore() == 0)
        {
            return "completed";
        }
        else
        {
            if (state.getdScaledScore() > (this.lo_passed / 100)) {
                return "passed";
            }
            else {
                return "failed";
            }
        }

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
            if (this.getSuccessStatus() == 'incomplete')
                return 0;
            else
                return 100;
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

    function finishTracking(currentid)
    {
        if (this.trackingmode != 'none')
        {
            var lessonStatus = this.getSuccessStatus();

            setValue('cmi.core.lesson_status', lessonStatus);
            state.currentpageid = currentid;
            var suspend_str = this.getVars();
            if (lessonStatus == 'incomplete') {
                setValue('cmi.core.exit', 'suspend');
                setValue('cmi.suspend_data', suspend_str);
            }
            else
            {
                setValue('cmi.core.exit', '');
                setValue('cmi.suspend_data', suspend_str);
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
    }

    function initTracking()
    {
        if (getValue('cmi.core.entry') == 'resume')
        {
            var suspend_str = getValue('cmi.suspend_data');
            if (suspend_str.length > 0)
            {
                this.setVars(suspend_str);
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


function XTInitialise(category)
{
    if (! state.initialised)
    {
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

function XTGetMode(extended)
{
    if (state.scormmode == "normal")
    {
        if (state.currentpageid)
        {
            var sit=state.find(state.currentpageid);
            if (state.trackingmode !== 'none') {
                if (extended != null && (extended == true || extended == 'true'))
                {
                    if (state.scoremode == 'first')
                        return "normal";
                    else
                        return "normal_last";
                }
                else {
                    return "normal";
                }
            }
            else
            {
                return "tracking";
            }
        }
        return "tracking";
    }
    return state.scormmode;
}

function XTStartPage()
{
    if (getValue('cmi.core.entry') == 'resume')
    {
        var currentid = state.currentpageid;
        state.currentpageid = "";
        var sit = state.find(currentid);
        if (sit != null)
            return sit.page_nr;
        else
            return -1;
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
                case 'full_first':
                    state.trackingmode = 'full';
                    state.scoremode = 'first';
                    break;
                case 'minimal_first':
                    state.trackingmode = 'minimal';
                    state.scoremode = 'first';
                    break;
                case 'full':
                    state.trackingmode = 'full';
                    state.scoremode = 'last';
                    break;
                case 'minimal':
                    state.trackingmode = 'minimal';
                    state.scoremode = 'last';
                    break;
                case 'none':
                    state.trackingmode = 'none';
                    break;
            }
            break;
        case "completed":
            state.lo_completed = value;
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
    }
}

function XTEnterPage(page_nr, page_name)
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

function XTSetViewed(page_nr, name, score) {
    if (isNaN(score) || typeof score != "number")
    {
        score = 0.0;
    }
    if (state.scormmode == 'normal')
    {
        var sit = state.findPage(page_nr);
        if (sit != null && (state.scoremode != 'first' || sit.count < 1))
        {
            sit.score = score;
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

function XTVideo(page_nr, name, block_name, verb, videostate) {
    return;
}

function XTSetPageScore(page_nr, score)
{
    if (state.scormmode == 'normal')
    {
        var sit = state.findPage(page_nr);
        if (sit != null && (state.scoremode != 'first' || sit.count < 1))
        {
            sit.score = score;
        }
    }
}

function XTSetPageScoreJSON(page_nr, score, JSONGraph) {
    XTSetPageScore(page_nr, score);
}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback, grouping)
{
    if (state.scormmode == 'normal')
    {
        state.verifyEnterInteractionParameters(ia_type, ia_name, correctoptions, correctanswer, feedback);
        var sit = state.enter(page_nr, ia_nr, ia_type, ia_name);
        sit.correctOptions = correctoptions;
        sit.correctAnswers = correctanswer;
        sit.correctfeedback = feedback;
        sit.currentid = sit.id;
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
    if (state.scormmode == 'normal')
    {
        if (!state.finished)
        {
            var currentpageid = state.currentpageid;

            // End tracking of page
            x_endPageTracking(false, -1);

            // This code is probably obsolete, leave it in to allow for more testing
            state.finishTracking(currentpageid, false);
        }
    }
    doLMSFinish();
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
                        matchSub.correct = (learnerAnswer === correctAnswer);
                        matchSub.learnerAnswer = learnerAnswer;
                        matchSub.correctAnswer = correctAnswer;
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
                results.interactions[nrofquestions - 1].subinteractions.push(subinteraction);
            }
        }
    }
    results.completion = completion;
    results.score = score;
    results.nrofquestions = nrofquestions;
    results.averageScore = Math.round(state.getdScaledScore() * 10000.0)/100.0;
    results.totalDuration = Math.round(totalDuration / 1000);
    results.start = state.start.toLocaleString();

    //$.ajax({
    //    type: "POST",
    //    url: window.location.href,
    //    data: {
    //        grade: results.averageScore / 100
    //    }
    //});

    return results;
}

