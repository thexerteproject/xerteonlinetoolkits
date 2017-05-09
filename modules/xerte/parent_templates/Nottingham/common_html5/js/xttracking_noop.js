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
 * Time: 11:47
 * To change this template use File | Settings | File Templates.
 */


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

function NoopTrackingState()
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


    function pageCompleted(page_nr)
    {
        var sit = state.findPage(page_nr);
        if (sit != null)
        {
            for (i=0; i<sit.nrinteractions; i++)
            {
                var sit2 = state.findInteraction(page_nr, i);
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
        return false;
    }

    function enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback)
    {
    	interaction = new NoopTracking(page_nr, ia_nr, ia_type, ia_name);
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
        var sit =  new NoopTracking(page_nr, ia_nr, ia_type, ia_name);
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

function NoopTracking(page_nr, ia_nr, ia_type, ia_name)
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





var state = new NoopTrackingState();

function XTInitialise()
{
	if (! state.initialised)
    {
        state.initialised = true;
        state.initialise();
    }
}

function XTTrackingSystem()
{
    return "";
}

function XTLogin(login, passwd)
{
    return true;
}

function XTGetMode()
{
    return "";
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
            break;
        case "tracking-mode":
            switch(value)
            {
                case 'full_first':
                    state.trackingmode = "full";
                    state.scoremode = "first";
                    //state.mode = "normal";
                    break;
                case 'minimal_first':
                	state.trackingmode = "minimal";
                	state.scoremode = "first";
                	//state.mode = "normal";
                    break;
                case 'full':
                	state.trackingmode = "full";
                	state.scoremode = "last";
                	//state.mode = "normal";
                    break;
                case 'minimal':
                	state.trackingmode = "minimal";
                	state.scoremode = "last";
                	//state.mode = "normal";
                    break;
                case 'none':
                	state.trackingmode = "none";
                	//state.mode = "no-tracking";
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
}

function XTExitPage(page_nr, pageName)
{
    var temp = false;
    var i = 0;

    state.exitInteraction(page_nr, -1, false, "", "", "", false);

    for(i=0; i<state.toCompletePages.length;i++)
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
        var sit = state.findInteraction(page_nr, -1);
        if (sit != null) {
            if (sit.ia_type == "result") {
                state.completedPages[i] = true;
            }
            else {
                state.completedPages[i] = state.pageCompleted(page_nr);
            }
        }
    }
}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting)
{
	state.setPageType(page_nr, page_type, nrinteractions, weighting);
}

function XTSetPageScore(page_nr, score)
{
	state.setPageScore(page_nr, score);
}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctanswer, feedback)
{
	state.enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctanswer, feedback);
}

function XTExitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback)
{
	state.exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback);
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
    window.opener.innerWidth+=2;
	window.opener.innerWidth-=2;
}

function XTResults()
{
    var completion = 0;
    var counter = 0;
    var completed;
    for(var i = 0; i< state.completedPages.length;i++)
    {
        if(state.completedPages[i] == true)
        {
            counter++;
        }
    }
    if(counter != 0)
    {
        completion = Math.round((counter/state.completedPages.length)*100);
    }
    else
    {
        completion = 0;
    }

    var results = {};
    results.mode = x_currentPageXML.getAttribute("resultmode");

    var score = 0,
    nrofquestions = 0,
    totalWeight = 0,
    totalDuration = 0;
    results.interactions = Array();

    for(i = 0; i < state.interactions.length-1; i++){
        score += state.interactions[i].score * state.interactions[i].weighting;
        if(state.interactions[i].ia_nr < 0 || state.interactions[i].nrinteractions > 0) {

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
        else if(results.mode == "full-results")
        {
            var subinteraction = {}

            var learnerAnswer, correctAnswer;
            switch (state.interactions[i].ia_type){
                case "match":
                    if (state.interactions[i].learnerOptions[0] == null)
                    {
                        learnerAnswer = "";
                    }
                    else
                    {
                        learnerAnswer = state.interactions[i].learnerOptions[0].source;
                    }
                    correctAnswer = state.interactions[i].correctOptions[0].source;
                    break;
                case "text":
                    learnerAnswer = state.interactions[i].learnerAnswers.join(", ");
                    correctAnswer = state.interactions[i].correctAnswers.join(", ");
                    break;
                case "multiplechoice":
                    learnerAnswer = state.interactions[i].learnerAnswers[0] != undefined ? state.interactions[i].learnerAnswers[0] : "";
                    for(var j = 1; j < state.interactions[i].learnerAnswers.length; j++)
                    {
                        learnerAnswer += "\n" + state.interactions[i].learnerAnswers[j];
                    }
                    correctAnswer = state.interactions[i].correctAnswers[0];
                    for(var j = 1; j < state.interactions[i].correctAnswers.length; j++)
                    {
                        correctAnswer += "\n" + state.interactions[i].correctAnswers[j];
                    }
                    break;
                case "numeric":

                    learnerAnswer = state.interactions[i].learnerAnswers;
                    correctAnswer = "NA";  // Not applicable
                    //TODO: We don't have a good example of an interactivity where the numeric type has a correctAnswer. Currently implemented for the survey page.
                    break;
                case "fill-in":
                    learnerAnswer = state.interactions[i].learnerAnswers;
                    correctAnswer = state.interactions[i].correctAnswers;
                    break;
            }
            subinteraction.question = state.interactions[i].ia_name;
            subinteraction.correct = state.interactions[i].result;
            subinteraction.learnerAnswer = learnerAnswer;
            subinteraction.correctAnswer = correctAnswer;
            results.interactions[nrofquestions-1].subinteractions.push(subinteraction);
        }
    }
    results.completion = completion;
    results.completion = completion;
    results.score = score;
    results.nrofquestions = nrofquestions;
    results.averageScore = state.getScaledScore()*100;
    results.totalDuration = Math.round(totalDuration / 1000);
    results.start = state.start.getDate() + "-" + (state.start.getMonth()+1) + "-" +state.start.getFullYear() + " " + state.start.getHours() + ":" + state.start.getMinutes();

    return results;
}
