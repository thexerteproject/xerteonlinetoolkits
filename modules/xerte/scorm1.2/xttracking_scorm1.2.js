/**
 * Created with JetBrains PhpStorm.
 * User: tom
 * Date: 28-3-13
 * Time: 22:25
 * To change this template use File | Settings | File Templates.
 */

var scorm='true';
var tracking='first score';

function makeId(page_nr, ia_nr, ia_type, ia_name)
{
    var tmpid = 'urn:x-xerte:page-' + (page_nr + 1);
    if (ia_nr > 0)
    {
        tmpid += ':interaction-' + ia_type + '-' + ia_nr;
    }
    if (ia_name)
    {
        tmpid += ':' + encodeURIComponent(ia_name.replace(" ", "_"));
    }
    return tmpid;
}

// define a ScormTracking Object
function ScormInteractionTracking(page_nr, ia_nr, ia_type, ia_name)
{
    this.page_nr = page_nr;
    this.page_ref = page_nr+1;
    this.ia_nr = ia_nr;
    this.ia_name = ia_name;
    this.state = "entered";
    this.start = new Date();
    this.end = this.start;
    this.count = 0;
    this.duration = 0;
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
    this.fulltracking = true;
    this.nrpages = 0;
    this.pages_visited=0;
    this.start = new Date();
    this.duration_previous_attempts = 0;
    this.lo_type = "pages only";
    this.lo_passed = "-1.0";

    this.interactions = new Array();
    this.findcreate = findcreate;
    this.find = find;
    this.enter = enter;
    this.exit = exit;
    this.exitInteraction = exitInteraction;
    this.finishTracking = finishTracking;
    this.getSuccessStatus = getSuccessStatus;
    this.getScaledScore = getScaledScore;
    this.getRawScore = getRawScore;
    this.getMinScore = getMinScore;
    this.getMaxScore = getMaxScore;
    this.formatDate = formatDate;
    this.formatTime = formatTime;
    this.formatDuration = formatDuration;
    this.nr_interactions = nr_interactions;
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
        this.interactions[this.interactions.length] = sit;
        return sit;
    }

    function find(id)
    {
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].id == id)
                return this.interactions[i];
        }
        alert('Error: ' + id +  ' not found');
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

    function exit(id)
    {
        var sit = this.find(id);
        return sit.exit();
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
        var rounded_d = Math.round(d/10);
        var hours = Math.floor(rounded_d / 3600.0);
        var digitHours = hours + "";
        var minutes = Math.floor((rounded_d - hours*3600)/60.0);
        var twoDigitMinutes = minutes+"";
        if (twoDigitMinutes.length==1) twoDigitMinutes = "0"+twoDigitMinutes;
        var seconds = rounded_d - hours*3600 - minutes*60;
        var twoDigitSeconds = seconds + "";
        if (twoDigitSeconds.length==1) twoDigitSeconds = "0"+twoDigitSeconds;
        return hours + ':' + twoDigitMinutes + ':' + twoDigitSeconds;
    }

    function nr_interactions()
    {
        return getValue('cmi.interactions._count');
    }

    function id_to_interactionidx(id)
    {
        var count = nr_interactions();
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

    function exitInteraction(id, force)
    {
        if (this.exit(id))
        {
            // Record this action
            var sit = this.find(id);
            if (sit.state=='entered')
                alert("Something fishy is going on");
            var currnrinteractions = this.nr_interactions();
            var index = this.id_to_interactionidx(id);
            var newinteraction = (currnrinteractions == index);
            var interaction = 'cmi.interactions.' + index + '.';
            if (newinteraction)
            {
                result = setValue(interaction + 'id', id);
                result = setValue(interaction + 'time', this.formatTime(sit.start));
                result = setValue(interaction + 'type', 'true-false');
                result = setValue(interaction + 'correct_responses.0.pattern', 'true');
                result = setValue(interaction + 'weighting', '0.0');
                result = setValue(interaction + 'learner_response', 'true');
                result = setValue(interaction + 'result', 'neutral');
                if (sit.ia_nr == 0)
                    this.pages_visited++;
            }
            result = setValue(interaction + 'latency', this.formatDuration(sit.duration));
            if (this.fulltracking)
            {
                var comment = 'cmi.comments';
                var commentText = this.formatDate(new Date()) + ': ' + SCORM_LEFT_PAGE + ' ' + sit.page_ref;
                if (sit.ia_nr>0)
                {
                    commentText += ', interaction ' + sit.ia_nr;
                }
                commentText += ': ' + sit.ia_name;
                result = setValue(comment, commentText);
            }
            doLMSCommit();
        }
        this.currentid = "";
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
                return 'incomplete';
            }
        }
        return "";
    }

    function getScaledScore()
    {
        return getRawScore() / (getMaxScore() - getMinScore());
    }

    function getRawScore()
    {
        if (this.lo_type == "pages only")
        {
            return this.pages_visited;
        }
        return 0.0;
    }

    function getMinScore()
    {
        if (this.lo_type == "pages only")
        {
            return 0.0;
        }
        return 0.0;
    }

    function getMaxScore()
    {
        if (this.lo_type == "pages only")
        {
            return this.nrpages;
        }
        return 0.0;
    }

    function finishTracking(currentid)
    {
        var lessonStatus = this.getSuccessStatus();

        if (lessonStatus)
        {
            setValue('cmi.core.lesson_status', lessonStatus);
        }
        setValue('cmi.core.score.raw', this.getRawScore());
        setValue('cmi.core.score.min', this.getMinScore());
        setValue('cmi.core.score.max', this.getMaxScore());

        var end = new Date();
        var duration = end.getTime() - this.start.getTime();
        setValue('cmi.core.session_time', this.formatDuration(duration));
        setValue('cmi.core.total_time', this.formatDuration(this.duration_previous_attempts + duration));

        if (String(getValue('cmi.exit')) == 'suspend')
        {
            setValue('cmi.core.less_location', currentid);
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
    doLMSInitialize();
}

function XTLogin(login, passwd)
{
    return true;
}

function XTGetMode()
{
    var result = String(getValue("cmi.core.lesson.mode"));
    return result;
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
    if (option == 'nrpages')
    {
        state.nrpages = value;
    }
}

function XTEnterPage(page_nr, page_name)
{
    var sit = state.enter(page_nr, 0, "page", page_name);
    if (state.fulltracking)
    {
        var comment = 'cmi.comments';
        var commentText = state.formatDate(new Date()) + ': ' + SCORM_ENTERED_PAGE + ' ' + sit.page_ref;
        if (sit.ia_nr>0)
        {
            commentText += ', interaction ' + sit.ia_type + '-' + sit.ia_nr;
        }
        commentText += ': ' + sit.ia_name;
        result = setValue(comment, commentText);
        doLMSCommit();
    }
    state.currentid = sit.id;
}


function XTExitPage(page_nr, page_name)
{
    return state.exitInteraction(makeId(page_nr, 0, "page", page_name), false);
}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctanswer, feedback)
{

}

function XTExitInteraction(page_nr, ia_nr, is_type, ia_name, learneranswer, feedback)
{

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
        // there is still a page open, close it
        state.exitInteraction(state.currentid, false);
    }
    state.finishTracking(currentid);

    doLMSFinish();
}
