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
    this.start = new Date();
    this.interactions = new Array();
    this.lo_completed = 0;
    this.lo_passed = 0

    
    this.initialise = initialise;
    this.setPageType = setPageType;
    this.setPageScore = setPageScore;
    this.enterInteraction = enterInteraction
    this.exitInteraction = exitInteraction;
    this.findPage = findPage;
    this.findInteraction = findInteraction;
    this.findCreate = findCreate;
    this.enterPage = enterPage
    
    function initialise()
    {
    	
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
    		sit.exitInteraction(learneranswer, learneroptions);
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
    
    function exitInteraction(learnerAnswers, learnerOptions)
    {
    	this.learnerAnswers = learnerAnswers;
        this.learnerOptions = learnerOptions;
    	
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
    }
}

function XTEnterPage(page_nr, page_name)
{
	state.enterPage(page_nr, -1, "page", page_name);
}

function XTExitPage(page_nr)
{
	return state.exitInteraction(page_nr, -1, false, "", "", "", false);
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

function XTExitInteraction(page_nr, ia_nr, ia_type, result, learneranswer, feedback)
{
	state.exitInteraction(page_nr, ia_nr, ia_type, result, learneranswer, feedback);
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
	results = {};
	results.mode = x_currentPageXML.getAttribute("mode");
	
	score = 0;
	nrofquestions = 0;
	totalWeight = 0;
	totalDuration = 0;
	results.interactions = Array();

	for(i = 0; i < state.interactions.length-1; i++){
		score += state.interactions[i].score * state.interactions[i].weighting ;
		if(state.interactions[i].nrinteractions > 0)
		{
			interaction = {};
			interaction.score = Math.round(state.interactions[i].score);
			interaction.title = state.interactions[i].ia_name;
			interaction.duration = Math.round(state.interactions[i].duration / 1000);
			interaction.weighting = state.interactions[i].weighting;
			interaction.subinteractions = Array();
			results.interactions[nrofquestions] = interaction;
			totalDuration += state.interactions[i].duration;
			nrofquestions++;
			totalWeight += state.interactions[i].weighting;
			
		}else if(results.mode == "full-results")
		{
			subinteraction = {}

            var learnerAnswer, correctAnswer;
            switch (state.interactions[i].ia_type){
                case "match":
                    learnerAnswer = state.interactions[i].learnerOptions[0].target;
                    correctAnswer = state.interactions[i].correctOptions[0].target;
                    break;
                case "text":
                    learnerAnswer = state.interactions[i].learnerAnswers.join(", ");
                    correctAnswer = state.interactions[i].correctAnswers.join(", ");
                    break;
            }
            debugger;
			subinteraction.question = state.interactions[i].ia_name;
			subinteraction.learnerAnswer = learnerAnswer;
			subinteraction.correctAnswer = correctAnswer;
			results.interactions[nrofquestions-1].subinteractions.push(subinteraction);
		}
		
	}
	if(state.interactions.length == 0)
	{
		$("#questionScores").hide()
	}
	results.score = score;
	results.nrofquestions = nrofquestions;
	results.averageScore = Math.round(score / totalWeight);
	results.totalDuration = Math.round(totalDuration / 1000);
	results.start = state.start.getDate() + "-" + (state.start.getMonth()+1) + "-" +state.start.getFullYear() + " " + state.start.getHours() + ":" + state.start.getMinutes();

	return results;
}