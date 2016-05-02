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
        tmpid += ':' + encodeURIComponent(strippedName.replace(/ /g, "_"));
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
    this.correctanswer = "";
    this.correctfeedback = "";
    this.learneranswer = "";
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
        this.correctanswer = jsonObj.correctanswer;
        this.correctfeedback = jsonObj.correctfeedback;
        this.learneranswer = jsonObj.learneranswer;
        this.answerfeedback = jsonObj.answerfeedback;
        this.id = jsonObj.id;
        this.idx = jsonObj.idx;
    }

    function exit()
    {
        this.end = new Date();
        var duration = this.end.getTime() - this.start.getTime();
        this.state = "exited";
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
    this.pages_visited=0;
    this.start = new Date();
    this.duration_previous_attempts = 0;
    this.lo_type = "pages only";
    this.lo_passed = -1.0;
    this.lo_completed = "unknown";
    this.finished = false;
    this.interactions = new Array();

    this.setVars = setVars;
    this.find = find;
    this.findcreate = findcreate;
    this.findPage = findPage;
    this.findInteraction = findInteraction;
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
        if (ia_type != "page")
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

    function countInteractions(page_nr)
    {
        var count = 0;
        var id = makeId(page_nr, -1, 'page', "");
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].id.indexOf(id + ':interaction') == 0)
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
            if (this.scoremode == 'first' && sit.count > 1)
                return;

            // Record this action
            var id = makeId(sit.page_nr, sit.ia_nr, sit.ia_type, sit.ia_name);
            var currnrinteractions = this.scorm_nr_interactions();
            var index = this.id_to_interactionidx(id);
            var interaction = 'cmi.interactions.' + index + '.';

            sit.learneroptions = learneroptions;
            sit.learneranswer = learneranswer;
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
                            scormAnswerArray.push(entry.source.replace(/ /g, "_") + "." + entry.target.replace(/ /g, "_"));
                        }
                        var scorm_lanswer = scormAnswerArray.join(',');

                        // Do the same for the answer pattern
                        var scormCorrectArray = [];
                        var i=0;
                        for (i=0; i<sit.correctoptions.length; i++)
                        {
                            // Create ascii characters from option number and ignore answer string
                            var entry = sit.correctoptions[i];
                            scormCorrectArray.push(entry.source.replace(/ /g, "_") + "." + entry.target.replace(/ /g, "_"));
                        }
                        var scorm_canswer = scormCorrectArray.join(',');
                        res = setValue(interaction + 'type', 'matching');
                        res = setValue(interaction + 'correct_responses.0.pattern', scorm_canswer);
                        res = setValue(interaction + 'weighting', sit.weighting);
                        res = setValue(interaction + 'student_response', scorm_lanswer);
                        res = setValue(interaction + 'result', result);
                        break;
                    case 'multiplechoice':
                        var psit = this.findPage(sit.page_nr);
                        if (psit != null)
                        {
                            var pweighting = psit.weighting;
                            var nrquestions = psit.nrinteractions;
                        }
                        else
                        {
                            var pweighting = 1.0;
                            var nrquestions = 1.0;
                        }
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
                        for (i=0; i<sit.correctoptions.length; i++)
                        {
                            // Create ascii characters from option number and add answer string
                            scormCorrectArray.push(String.fromCharCode(parseInt(sit.correctoptions[i])+96));
                        }
                        var scorm_canswer = scormCorrectArray.join(',');
                        res = setValue(interaction + 'type', 'choice');
                        res = setValue(interaction + 'correct_responses.0.pattern', scorm_canswer);
                        res = setValue(interaction + 'weighting', Math.round(pweighting/nrquestions*100)/100);
                        res = setValue(interaction + 'student_response', scorm_lanswer);
                        res = setValue(interaction + 'result', (result ? 'correct' : 'wrong'));
                        break;
                    case 'numeric':
                        res = setValue(interaction + 'type', 'numeric');
                        res = setValue(interaction + 'correct_responses.0.pattern', '100');
                        res = setValue(interaction + 'weighting', sit.weighting);
                        res = setValue(interaction + 'student_response', sit.score);
                        res = setValue(interaction + 'result', sit.score);
                        break;
                    case 'text':
                        // Hmmm is this the page or the interaction itself
                        if (ia_nr < 0)
                        {
                            //This is the page
                            // Get the interaction, it is always assumed to be 0
                            var siti = this.findInteraction(page_nr, 0);
                            sit.correctanswer = siti.correctanswer;
                            sit.learneranswer = siti.learneranswer;
                        }

                        res = setValue(interaction + 'type', 'fill-in');
                        res = setValue(interaction + 'correct_responses.0.pattern', sit.correctanswer);
                        res = setValue(interaction + 'weighting', sit.weighting);
                        res = setValue(interaction + 'student_response', sit.learneranswer);
                        res = setValue(interaction + 'result', 'neutral');
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
            this.finishTracking(state.currentpageid);
        }
    }

    function getSuccessStatus()
    {
        if (this.lo_type != "pages only")
        {
            if (this.nrpages > this.pages_visited)
            {
                return 'incomplete';
            }
            else
            {
                if (this.getdScaledScore() > this.lo_passed)
                {
                    return "passed";
                }
                else
                {
                    return "failed";
                }
            }
        }
        else
        {
            if (this.nrpages <= this.pages_visited)
            {
                return "completed";
            }
            else
            {
                return 'incomplete';
            }
        }
    }

    function getdScaledScore()
    {
        return this.getdRawScore() / (this.getdMaxScore() - this.getdMinScore());
    }

    function getScaledScore()
    {
        return this.getdScaledScore() + "";
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
            return totalscore;
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
            var suspend_str = JSON.stringify(this);
            setValue('cmi.core.exit', 'suspend');
            setValue('cmi.suspend_data', suspend_str);

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
}

var state = new ScormTrackingState();

// Backward compatibility functions
function getValue(elementName){
    var result = String(doLMSGetValue(elementName));
    return result;
}

function setValue(elementName, value){
    var result = doLMSSetValue(elementName, value);
    return result;
}


function XTInitialise()
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

function XTGetMode()
{
    if (state.scormmode == "normal")
    {
        if (state.currentpageid)
        {
            var sit=state.find(state.currentpageid);
            if (sit != null)
            {
                if (sit.weighting > 0)
                    return "normal";
                else
                    return "not-tracking";
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
            state.lo_passed = Number(value);
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
        return state.exitInteraction(page_nr, -1, false, "", "", "", false);
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
            sit.weighting = parseInt(weighting);
            if (page_type != 'page')
            {
                state.lo_type = 'interactive';
            }
        }
    }
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

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback)
{
    if (state.scormmode == 'normal')
    {
        var sit = state.enter(page_nr, ia_nr, ia_type, ia_name);
        sit.correctoptions = correctoptions;
        sit.correctanswer = correctanswer;
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

function XTGetInteractionScore(page_nr, ia_nr, ia_type, ia_name)
{
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

    if (state.scormmode == 'normal' && (state.scoremode != 'first' || getValue('cmi.core.lesson_status') == "incomplete"))
    {
        var currentpageid = "";
        if (state.currentid)
        {
            var sit = state.find(currentid);
            // there is still an interaction open, close it
            if (sit != null)
            {
                state.exitInteraction(sit.page_nr, sit.ia_nr, false, "", "", "", false);
            }
        }
        if (state.currentpageid)
        {
            currentpageid = state.currentpageid;
            var sit = state.find(currentpageid);
            // there is still an interaction open, close it
            if (sit != null)
            {
                state.exitInteraction(sit.page_nr, sit.ia_nr, false, "", "", "", false);
            }
        }
        state.finishTracking(currentpageid);
    }
    doLMSFinish();
}
