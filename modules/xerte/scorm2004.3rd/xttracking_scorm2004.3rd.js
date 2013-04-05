/**
 * Created with JetBrains PhpStorm.
 * User: tom
 * Date: 28-3-13
 * Time: 22:33
 * To change this template use File | Settings | File Templates.
 */

var scorm='2004';

function makeId(page_nr, ia_nr, ia_type, ia_name)
{
    var tmpid = 'urn:x-xerte:page-' + (page_nr + 1);
    if (ia_nr >= 0)
    {
        tmpid += ':interaction-' + (ia_nr + 1);
        if (ia_type.length > 0)
        {
            tmpid += '-' + ia_type;
        }
    }
    if (ia_name)
    {
        tmpid += ':' + encodeURIComponent(ia_name.replace(/ /g, "_"));
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
    this.correctoptions = "";
    this.correctanswer = "";
    this.correctfeedback = "";
    this.learneroptions = "";
    this.learneranswer = "";
    this.answerfeedback = "";
    this.id = makeId(page_nr, ia_nr, ia_type, ia_name);
    this.exit = exit;
    this.reenter = reenter;

    function exit()
    {
        this.end = new Date();
        duration = this.end.getTime() - this.start.getTime();
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
    this.currentid = "";
    this.trackingmode = "full";
    this.nrpages = 0;
    this.pages_visited=0;
    this.start = new Date();
    this.duration_previous_attempts = 0;
    this.lo_type = "pages only";
    this.lo_passed = "-1.0";
    this.lo_completed = "unknown";

    this.interactions = new Array();
    this.find = find;
    this.findcreate = findcreate;
    this.findPage = findPage;
    this.findInteraction = findInteraction;
    this.countInteractions = countInteractions;
    this.enter = enter;
    this.exit = exit;
    this.exitInteraction = exitInteraction;
    this.finishTracking = finishTracking;
    this.getCompletionStatus = getCompletionStatus;
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
    this.formatDuration = formatDuration;
    this.scorm_nr_comments = scorm_nr_comments;
    this.scorm_nr_interactions = scorm_nr_interactions;
    this.id_to_interactionidx = id_to_interactionidx;

    function findcreate(page_nr, ia_nr, ia_type, ia_name)
    {
        var tmpid = makeId(page_nr, ia_nr, ia_type, ia_name);
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].id == tmpid)
                return this.interactions[i];
        }
        // Not found
        sit =  new ScormInteractionTracking(page_nr, ia_nr, ia_type, ia_name);
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
        sit = this.findInteraction(page_nr, ia_nr);
        if (sit != null)
        {
            return sit.exit();
        }
        return false;
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
    function formatDuration(d)
    {
        // Format as a SCORM interval in seconds, i.e. 'PTs.sS'
        //round d[ms] to seconds in two decmals first
        var rounded_d = Math.round(d/10)/100;
        return 'PT'+rounded_d+'S';
    }

    function scorm_nr_comments()
    {
        return getValue('cmi.comments_from_learner._count');
    }

    function scorm_nr_interactions()
    {
        return getValue('cmi.interactions._count');
    }

    function id_to_interactionidx(id)
    {
        var count = scorm_nr_interactions();
        for (i=0; i<count; i++)
        {
            ia_id = getValue('cmi.interactions.' + i + '.id');
            if (ia_id == id)
            {
                // Found!
                return i;
            }
        }
        return count;
    }

    function exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback, force)
    {
        var sit = this.findInteraction(page_nr, ia_nr);
        if (sit != null && sit.exit())
        {
            // Record this action
            var id = makeId(sit.page_nr, sit.ia_nr, sit.ia_type, sit.ia_name);
            var currnrinteractions = this.scorm_nr_interactions();
            var index = this.id_to_interactionidx(id);
            var interaction = 'cmi.interactions.' + index + '.';

            sit.learneroptions = learneroptions;
            sit.learneranswer = learneranswer;
            sit.result = result;
            sit.answerfeedback = feedback;

            if (!this.trackingmode != 'none' && (sit.ia_type == 'page' || this.trackingmode=='full'))
            {
                res = setValue(interaction + 'id', id);
                res = setValue(interaction + 'timestamp', this.formatDate(sit.start));
                res = setValue(interaction + 'description', sit.ia_name);
                res = setValue(interaction + 'latency', this.formatDuration(sit.duration));

                switch (sit.ia_type)
                {
                    case 'multiplechoice':
                        var psit = this.findPage(sit.page_nr);
                        if (psit != null)
                        {
                            pweighting = psit.weighting;
                            nrquestions = psit.nrinteractions;
                        }
                        else
                        {
                            pweighting = 1.0;
                            nrquestions = 1.0;
                        }
                        // We have an options as numbers, separated by ';'
                        // and we have corresponding answers strings separated by ';'
                        // Construct answers like a:Answerstring
                        loptionsArray = learneroptions.split(';');
                        scormAnswerArray = [];
                        for (i=0; i<loptionsArray.length; i++)
                        {
                            // Create ascii characters from option number and ignore answer string
                            var entry = String.fromCharCode(parseInt(loptionsArray[i])+96);
                            scormAnswerArray.push(entry);
                        }
                        scorm_lanswer = scormAnswerArray.join('[,]');

                        // Do the same for the answer pattern
                        coptionsArray = sit.correctoptions.split(';');
                        scormCorrectArray = [];
                        for (i=0; i<coptionsArray.length; i++)
                        {
                            // Create ascii characters from option number and ignore answer string
                            var entry = String.fromCharCode(parseInt(coptionsArray[i])+96);
                            scormCorrectArray.push(entry);
                        }
                        scorm_canswer = scormCorrectArray.join('[,]');
                        res = setValue(interaction + 'type', 'choice');
                        res = setValue(interaction + 'correct_responses.0.pattern', scorm_canswer);
                        res = setValue(interaction + 'weighting', Math.round(pweighting/nrquestions*100)/100);
                        res = setValue(interaction + 'learner_response', scorm_lanswer);
                        res = setValue(interaction + 'result', (result ? 'correct' : 'incorrect'));
                        break;
                    case 'numeric':
                        res = setValue(interaction + 'type', 'numeric');
                        res = setValue(interaction + 'correct_responses.0.pattern', '100');
                        res = setValue(interaction + 'weighting', sit.weighting);
                        res = setValue(interaction + 'learner_response', sit.score);
                        res = setValue(interaction + 'result', sit.score);
                        break;
                    case 'page':
                    default:
                        res = setValue(interaction + 'type', 'other');
                        res = setValue(interaction + 'correct_responses.0.pattern', SCORM2004_VIEWED);
                        res = setValue(interaction + 'weighting', '0.0');
                        res = setValue(interaction + 'learner_response', SCORM2004_VIEWED);
                        res = setValue(interaction + 'result', 'neutral');
                }
            }
            if (sit.ia_nr < 0)
                this.pages_visited++;

            if(this.trackingmode == 'full')
            {
                var currnrcomments = this.scorm_nr_comments();
                var comment = 'cmi.comments_from_learner.' + currnrcomments + '.';
                var commentText = SCORM2004_LEFT_PAGE + ' ' + sit.page_ref;
                if (sit.ia_nr>=0)
                {
                    commentText += ', interaction ' + sit.ia_ref;
                }
                commentText += ': ' + sit.ia_name;
                res = setValue(comment + 'comment', commentText);
                res = setValue(comment + 'location', sit.page_ref);
                res = setValue(comment + 'timestamp', this.formatDate(new Date()));
            }
            res = persistData();
        }
        this.currentid = "";
    }

    function getCompletionStatus()
    {
        if (this.lo_completed == 'unknown')
        {
            if (this.nrpages <= this.pages_visited)
            {
                return "completed";
            }
            else if(this.pages_visited)
            {
                return 'incomplete';
            }
            else
            {
                return "unknown"
            }
        }
        else
        {
            return this.lo_completed;
        }
    }

    function getSuccessStatus()
    {
        if (this.lo_type != "pages only")
        {
            if (this.getScaledScore() > this.lo_passed)
            {
                return "passed";
            }
            else
            {
                return "failed";
            }
        }
        else
        {
            if (this.nrpages <= this.pages_visited)
            {
                return "passed";
            }
            else if(this.pages_visited)
            {
                return "unknown";
            }
            else
            {
                return "unknown";
            }
        }
        return "";
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
            return this.pages_visited;
        }
        else
        {
            var score = [];
            var weight = [];
            var totalweight = 0.0;
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
        if (this.lo_type == "pages only")
        {
            return this.nrpages;
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

    function finishTracking(currentid)
    {
        if (this.trackingmode != 'none')
        {

            setValue('cmi.completion_status', this.getCompletionStatus());
            setValue('cmi.success_status', this.getSuccessStatus());
            setValue('cmi.score.scaled', this.getScaledScore());
            setValue('cmi.score.raw', this.getRawScore());
            setValue('cmi.score.min', this.getMinScore());
            setValue('cmi.score.max', this.getMaxScore());

            var end = new Date();
            var duration = end.getTime() - this.start.getTime();
            setValue('cmi.session_time', this.formatDuration(duration));
            setValue('cmi.total_time', this.formatDuration(state.duration_previous_attempts + duration));

            if (String(getValue('cmi.exit')) == 'suspend')
            {
                setValue('cmi.suspend_data', currentid + ',' + duration);
            }
        }
    }
}

var state = new ScormTrackingState();

// Backward compatibility functions
function getValue(elementName){
    var result = String(retrieveDataValue(elementName));
    return result;
}

function setValue(elementName, value){
    var result = storeDataValue(elementName, value);
    return result;
}

function XTInitialise()
{
    initializeCommunication();
}

function XTTrackingSystem()
{
    return "SCORM 2004 3rd Ed.";
}

function XTLogin(login, passwd)
{
    return true;
}

function XTGetMode()
{
    var result = String(getValue("cmi.mode"));
    return result;
}

function XTGetUserName()
{
    var result = String(getValue("cmi.learner_name"));
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
            state.trackingmode = value;
            break;
        case "completed":
            state.lo_completed = value;
            break;
        case "objective_passed":
            state.lo_passed = value;
            break;
    }
}

function XTEnterPage(page_nr, page_name)
{
    var sit = state.enter(page_nr, -1, "page", page_name);
    if (state.trackingmode == 'full')
    {
        var currnrcomments = state.scorm_nr_comments();
        var comment = 'cmi.comments_from_learner.' + currnrcomments + '.';
        var commentText = SCORM2004_ENTERED_PAGE + ' ' + sit.page_ref;
        if (sit.ia_nr>0)
        {
            commentText += ', interaction ' + sit.ia_type + '-' + sit.ia_ref;
        }
        commentText += ': ' + sit.ia_name;
        result = setValue(comment + 'comment', commentText);
        result = setValue(comment + 'location', sit.page_ref);
        result = setValue(comment + 'timestamp', state.formatDate(new Date()));
        result = persistData();
    }
    state.currentid = sit.id;
}



function XTExitPage(page_nr)
{
    return state.exitInteraction(page_nr, -1, false, "", "", "", false);
}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting)
{
    sit = state.findPage(page_nr);
    if (sit != null)
    {
        sit.ia_type = page_type;

        sit.nrinteractions = nrinteractions;
        sit.weighting = weighting;
        if (page_type != 'page')
        {
            state.lo_type = 'interactive';
        }
    }
}

function XTSetPageScore(page_nr, score)
{
    sit = state.findPage(page_nr);
    if (sit != null)
    {
        sit.score = score;
    }
}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback)
{
    var sit = state.enter(page_nr, ia_nr, ia_type, ia_name);
    sit.correctoptions = correctoptions;
    sit.correctanswer = correctanswer;
    sit.correctfeedback = feedback;
}

function XTExitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback)
{
    return state.exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback, false);
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
    var currentid = "";
    if (state.currentid)
    {
        currentid = state.currentid;
        var sit = state.find(currentid);
        // there is still a page open, close it
        if (sit != null)
        {
            state.exitInteraction(sit.page_nr, sit.ia_nr, false, "", "", "", false);
        }
    }
    state.finishTracking(currentid);

    terminateCommunication();
}