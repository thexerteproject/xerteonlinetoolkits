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
        tmpid += ':' + encodeURIComponent(strippedName.replace(/^[a-zA-Z0-9_ ]/g, "").replace(/ /g, "_"));
        // Truncate to max 255 chars, this should be 4000
        tmpid = tmpid.substr(0,255);
    }
    return tmpid;
}

baseUrl = function()
{
    var pathname = window.location.href;
    var newPathname = pathname.split("/");
    var urlPath = "";
    for (var i = 0; i < newPathname.length -1; i++ )
    {
        urlPath += newPathname[i] + "/";
    }
    if (newPathname[0] != "http:" && newPathname[0] != "https:" && newPathname[0] != "localhost") {
        urlPath = "http://xerte.org.uk/";
    }
    return urlPath;
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
    this.templateId = -1;
    this.templateName = "";
    this.debug = false;
    this.sessionId = "";


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
    this.formatDate = formatDate;
    this.verifyResult = verifyResult;
    this.verifyEnterInteractionParameters = verifyEnterInteractionParameters;
    this.verifyExitInteractionParameters = verifyExitInteractionParameters;

    function initialise()
    {

    }

    function formatDate(d)
    {
        // Build a string of the form YYYY-MM-DDThh:mm:ss+hh:mm, where +hh:mm is the timezone offset
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
        var tzoffset = new Date().toString().match(/([-\+][0-9]+)\s/)[1];

        return d.getFullYear() + '-' + twoDigitMonth + '-' + twoDigitDate + 'T' + twoDigitHours + ':' + twoDigitMinutes + ':' + twoDigitSeconds + tzoffset;
    }

    function getCompletionStatus()
    {
        var completed = true;
        for(var i = 0; i<state.completedPages.length; i++)
        {
            if(state.completedPages[i] == false)
            {
                completed = false;
                break;
            }
            //if( i == state.completedPages.length-1 && state.completedPages[i] == true)
            //{
            //completed = true;
            //
        }

        if (completed)
        {
            return "completed";

        }
        else if(!completed)
        {
            return 'incomplete';
        }
        else
        {
            return "unknown"
        }
    }

    function getSuccessStatus()
    {
        if (this.lo_type != "pages only")
        {
            if (state.getScaledScore() > this.lo_passed)
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
            if (getCompletionStatus() == 'completed')
            {
                return "passed";
            }
            else
            {
                return "unknown";
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

    function enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback, page_name)
    {
        this.verifyEnterInteractionParameters(ia_type, ia_name, correctoptions, correctanswer, feedback);
        interaction = new XApiInteractionTracking(page_nr, ia_nr, ia_type, ia_name);
        interaction.enterInteraction(correctanswer, correctoptions, page_name);
        this.interactions.push(interaction);
    }

    function exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback, page_name)
    {
        var sit = this.findInteraction(page_nr, ia_nr);
        this.verifyExitInteractionParameters(sit, result, learneroptions, learneranswer, feedback);

        sit.exitInteraction(result,learneranswer, learneroptions, feedback, page_name);

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
     *        correctoptions contains an array of strings that are correct. With type text, array is assumed to be empty
     *        correctanswers is ignored
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
            verifyResult(result);
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

    function enterInteraction(correctAnswers, correctOptions, page_name)
    {
        this.correctAnswers = correctAnswers;
        this.correctOptions = correctOptions;
    }

    function exitInteraction(result, learnerAnswers, learnerOptions, feedback, page_name)
    {
        this.learnerAnswers = learnerAnswers;
        this.learnerOptions = learnerOptions;
        this.result = result;
        this.feedback = feedback;

        this.exitInteractionStamp = new Date();
        var id = baseUrl() + state.templateId + "/" + this.page_nr;
        var description = "Page " + page_nr;

        if (ia_nr >=0)
        {
            if (page_name != null && page_name != "") {
                if (ia_name != null && ia_name != "") {
                    id = baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_") + "/" + ia_name.replace(/ /g,"_");
                }
                else
                {
                    id = baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_") + "/" + ia_nr;
                }
            }
            else
            {
                if (ia_name != null && ia_name != "") {
                    id = baseUrl() + state.templateId + "/" + page_nr + "/" + ia_name.replace(/ /g,"_");
                }
                else
                {
                    id = state.baseUrl() + state.templateId + "/" + page_nr + "/" + ia_nr;
                }
            }
        }
        else
        {
            if (page_name != null && page_name != "")
            {
                id = baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_");
                description = page_name;
            }
        }
        var pageref = " page " + page_nr + " of object " + state.templateId + " of Xerte Installation " + baseUrl();
        if (page_name != null && page_name != "")
        {
            pageref = " page " + page_name + "(page " + page_nr + ") of object " + state.templateId + " of Xerte Installation " + baseUrl();
        }

        if (this.exit())
        {


            if (state.scoremode != 'first' || this.count <= 1) {

                if (!state.trackingmode != 'none'
                    && ((this.ia_nr < 0 && (state.trackingmode != 'full' || this.nrinteractions == 0))
                        || (this.ia_nr >= 0 && state.trackingmode == 'full'))) {
                    var statement = {
                        timestamp: this.end,
                        actor: actor,
                        verb: {
                            id: "http://adlnet.gov/expapi/verbs/answered",
                            display: {
                                "en-US": "answered"
                            }
                        },
                        object: {
                            objectType: "Activity",
                            id: id
                        }
                    };

                    var psit = state.findPage(this.page_nr);
                    if (psit != null) {
                        var pweighting = psit.weighting;
                        var nrinteractions = psit.nrinteractions;
                    }
                    else {
                        var pweighting = 1.0;
                        var nrinteractions = 1.0;
                    }
                    switch (this.ia_type) {
                        case 'match':
                            // We have an options as an array of objects with source and target
                            // and we have corresponding array of answers strings
                            // Construct answers like a:Answerstring
                            var scormAnswerArray = [];
                            var i = 0;
                            for (i = 0; i < learnerOptions.length; i++) {
                                // Create ascii characters from option number and ignore answer string
                                var entry = learnerOptions[i];
                                if (typeof(entry.source) == "undefined")
                                    entry.source = "";
                                scormAnswerArray.push(entry.source.replace(/ /g, "_") + "[.]" + entry.target.replace(/ /g, "_"));
                            }
                            var scorm_lanswer = scormAnswerArray.join('[,]');

                            // Do the same for the answer pattern
                            var sourceArray = [];
                            var targetArray = [];
                            var scormCorrectArray = [];
                            var i = 0;
                            for (i = 0; i < this.correctOptions.length; i++) {
                                // Create ascii characters from option number and ignore answer string
                                var entry = this.correctOptions[i];
                                sourceArray.push({
                                    id: entry.source.replace(/ /g, "_"),
                                    description: {
                                        "en-US": entry.source
                                    }
                                });
                                // Only add to target array if not already present
                                var found = false;
                                var targetid = entry.target.replace(/ /g, "_");
                                for (var j = 0; j < targetArray.length; j++) {
                                    if (targetid == targetArray[j]['id']) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    targetArray.push({
                                        id: entry.target.replace(/ /g, "_"),
                                        description: {
                                            "en-US": entry.target
                                        }
                                    });
                                }
                                scormCorrectArray.push(entry.source.replace(/ /g, "_") + "[.]" + entry.target.replace(/ /g, "_"));
                            }
                            var scorm_canswer = scormCorrectArray.join('[,]');
                            statement.object.definition =
                                {
                                    name: {
                                        "en-US": ia_name
                                    },
                                    description:
                                        {
                                            "en-US": "Matching interaction " + ia_name + " of " + pageref
                                        },
                                    type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                    interactionType: "matching",
                                    source: sourceArray,
                                    target: targetArray,
                                    correctResponsesPattern: [scorm_canswer]
                                };
                            statement.result = {
                                duration: calcDuration(this.start, this.end),
                                score: {
                                    raw: result.score,
                                    min: 0.0,
                                    max: 100.0,
                                    scaled: result.score / 100.0
                                },
                                response: scorm_lanswer,
                                success: result.success,
                                completion: true,
                                extensions:
                                    {
                                        "http://xerte.org.uk/result/match": scorm_lanswer
                                    }
                            };
                            break;
                        case 'multiplechoice':
                            // We have an options as an array of numbers
                            // and we have corresponding array of answers strings
                            // Construct answers like a:Answerstring
                            var scormAnswerArray = [];
                            var i = 0;
                            for (i = 0; i < learnerOptions.length; i++) {
                                var entry = learnerOptions[i]['answer'].replace(/ /g, "_");
                                scormAnswerArray.push(entry);
                            }
                            var scorm_lanswer = scormAnswerArray.join('[,]');

                            // Do the same for the answer pattern
                            var scormArray = [];
                            var scormCorrectArray = []
                            var i = 0;
                            for (i = 0; i < this.correctOptions.length; i++) {
                                var entry = {
                                    id: this.correctOptions[i].answer.replace(/ /g, "_"),
                                    description: {
                                        "en-US": this.correctOptions[i]['answer']
                                    }
                                };
                                scormArray.push(entry);
                                if (this.correctOptions[i].result) {
                                    scormCorrectArray.push(this.correctOptions[i].answer.replace(/ /g, "_"));
                                }
                            }
                            var scorm_canswer = [scormCorrectArray.join('[,]')];

                            statement.object.definition =
                                {
                                    name: {
                                        "en-US": ia_name
                                    },
                                    description:
                                        {
                                            "en-US": "Choice interaction " + ia_name + " of " + pageref
                                        },
                                    type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                    interactionType: "choice",
                                    choices: scormArray,
                                    correctResponsesPattern: scorm_canswer
                                };
                            statement.result = {
                                duration: calcDuration(this.start, this.end),
                                score: {
                                    raw: result.score,
                                    min: 0.0,
                                    max: 100.0,
                                    scaled: result.score / 100.0
                                },
                                response: scorm_lanswer,
                                success: result.success,
                                completion: true,
                                extensions:
                                    {
                                        "http://xerte.org.uk/result/multiplichoice": scorm_lanswer
                                    }
                            };
                            break;
                        case 'numeric':
                            statement.object.definition =
                                {
                                    name: {
                                        "en-US": ia_name
                                    },
                                    description:
                                        {
                                            "en-US": "Numeric interaction " + ia_name + " of " + pageref
                                        },
                                    type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                    interactionType: "numeric",
                                    correctResponsesPattern: ["0[:]100"]
                                };
                            if (ia_nr < 0)  // Page mode
                            {
                                statement.result = {
                                    duration: calcDuration(this.start, this.end),
                                    score: {
                                        raw: this.score,
                                        min: 0.0,
                                        max: 100.0,
                                        scaled: this.score / 100.0,
                                        response: this.score
                                    },
                                    success: (this.score >= state.lo_passed),
                                    completion: true
                                };
                            }
                            else { // Interaction mode
                                statement.result = {
                                    duration: calcDuration(this.start, this.end),
                                    score: {
                                        raw: result.score,
                                        min: 0.0,
                                        max: 100.0,
                                        scaled: result.score / 100.0
                                    },
                                    response: this.learnerAnswers,
                                    success: result.success,
                                    completion: true
                                };
                            }
                            break;
                        case 'text':
                        case 'fill-in':

                            // Hmmm is this the page or the interaction itself
                            if (ia_nr < 0) {
                                //This is the page
                                // Get the interaction, it is always assumed to be 0
                                var siti = state.findInteraction(page_nr, 0);
                                this.correctAnswers = siti.correctAnswers;
                                this.learnerAnswers = siti.learnerAnswers;
                            }
                            statement.object.definition =
                                {
                                    name: {
                                        "en-US": ia_name
                                    },
                                    description:
                                        {
                                            "en-US": "Fill-in interaction " + ia_name + " of " + pageref
                                        },
                                    type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                    interactionType: "fill-in",
                                    correctResponsesPattern: [this.correctAnswers]
                                };
                            if (this.ia_type == 'text') {
                                statement.result = {
                                    duration: calcDuration(this.start, this.end),
                                    success: result.success,
                                    completion: true
                                };
                            }
                            else {
                                statement.result = {
                                    duration: calcDuration(this.start, this.end),
                                    score: {
                                        raw: result.score,
                                        min: 0.0,
                                        max: 100.0,
                                        scaled: result.score / 100.0,
                                    },
                                    response: this.learnerAnswers,
                                    success: result.success,
                                    completion: true,
                                    extensions:
                                        {
                                            "http://xerte.org.uk/result/fill-in": this.learnerAnswers
                                        }
                                };
                            }
                            break;
                        case 'page':
                        default:
                            statement.verb = {
                                id: "http://adlnet.gov/expapi/verbs/interacted",
                                display: {
                                    "en-US": "interacted"
                                }
                            };
                            statement.object.definition =
                                {
                                    name: {
                                        "en": description
                                    },
                                    description:
                                        {
                                            "en": "Interaction with " + pageref
                                        }
                                };
                            var duration = calcDuration(this.start, this.end);
                            statement.result = {
                                duration: duration,
                                success: result.success,
                                completion: Math.abs(this.end.getTime() - this.start.getTime()) > state.page_timeout
                            };
                    }
                    var statementChecked = new TinCan.Statement(statement);
                    SaveStatement(statementChecked);
                    if (typeof statement.result.score != 'undefined')
                    {
                        var scoredstatement = {
                            timestamp: new Date(),
                            actor: actor,
                            verb: {
                                id: "http://adlnet.gov/expapi/verbs/scored",
                                display: {
                                    "en-US": "scored"
                                }
                            },
                            object: {
                                objectType: "Activity",
                                definition: {
                                    name: statement.object.definition.name,
                                    description: statement.object.definition.description
                                },
                                id: id
                            },
                            result: statement.result
                        };
                        var statementChecked = new TinCan.Statement(scoredstatement);
                        SaveStatement(statementChecked);
                    }
                }

                if (!surf_mode) {
                    var statement;
                    if (ia_nr >= 0) {
                        statement =
                            {
                                actor: actor,
                                verb: {
                                    id: "http://adlnet.gov/expapi/verbs/exited",
                                    display: {
                                        "en": "exited"
                                    }
                                },
                                object: {
                                    objectType: "Activity",
                                    id: id,
                                    definition: {
                                        name: {
                                            "en": ia_name
                                        }
                                    }
                                },
                                timestamp: new Date()
                            };

                    }
                    else
                    {
                        statement =
                            {
                                actor: actor,
                                verb: {
                                    id: "http://adlnet.gov/expapi/verbs/exited",
                                    display: {
                                        "en": "exited"
                                    }
                                },
                                object: {
                                    objectType: "Activity",
                                    id: id,
                                    definition: {
                                        name: {
                                            "en": description
                                        }
                                    }
                                },
                                timestamp: new Date()
                            };
                    }
                    statement = new TinCan.Statement(statement);
                    SaveStatement(statement);
                }
                if (surf_mode) {
                    var statement = new TinCan.Statement(
                        {
                            actor: actor,
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
                            object: {
                                objectType: "Activity",
                                id: id
                            },
                            context: {
                                extensions: {
                                    "http://lrs.surfuni.org/context/course": surf_course,
                                    "http://lrs.surfuni.org/context/recipe": surf_recipe,
                                    "http://lrs.surfuni.org/context/label": ""
                                }
                            },
                            timestamp: new Date()
                        }
                    );
                    SaveStatement(statement);
                    // If not a page
                    if (ia_nr >= 0) {
                        var statement = new TinCan.Statement(
                            {
                                actor: actor,
                                verb: {
                                    id: "http://adlnet.gov/expapi/verbs/scored",
                                    display: {
                                        "en-US": "Scored"
                                    }
                                },
                                object: {
                                    objectType: "Activity",
                                    id: id
                                },
                                result: {
                                    duration: calcDuration(this.start, this.end),
                                    completion: true,
                                    success: result.success,
                                    score: {
                                        scaled: result.score / 100.0,
                                        raw: result.score,
                                        min: 0.0,
                                        max: 100.0
                                    },
                                    duration: calcDuration(sit.start, sit.end),
                                },
                                context: {
                                    extensions: {
                                        "http://lrs.surfuni.org/context/course": surf_course,
                                        "http://lrs.surfuni.org/context/recipe": surf_recipe,
                                        "http://lrs.surfuni.org/context/label": ""
                                    }
                                },
                                timestamp: new Date()
                            });
                    }
                    SaveStatement(statement);
                }
            }
        }
    }

}


var state = new XApiTrackingState();
// enable debug for now
state.debug = true;

var scorm=false,
    lrsInstance,
    userEMail;

var surf_mode = false;
var surf_recipe, surf_course;

var answeredQs = [];

function XTInitialise()
{
    state.sessionId = new Date().getTime() + "" + Math.round(Math.random() * 10000000);
    // Initialise actor object
    if (studentidmode != undefined && typeof studentidmode == 'string')
    {
        studentidmode = parseInt(studentidmode);
    }
    if (studentidmode == undefined || (studentidmode <= 0 && studentidmode > 3))
    {
        // set actor to global group
        actor = {
                objectType: "Group",
                account: {
                    name: "global",
                    homePage: baseUrl() + state.templateId
                }
            };
    }
    else
    {
        if(username == undefined || username == "")
        {
            userEMail = "mailto:email@test.com"
        }else{
            userEMail = username;
        }
        if (typeof fullusername == 'undefined')
            fullusername = "Unknown";
        switch(studentidmode)
        {
            case 0: //mbox
                actor = {
                        objectType: "Agent",
                        mbox: userEMail
                    };
                break;
            case 1:
                actor = {
                        objectType: "Agent",
                        mbox_sha1sum: mboxsha1
                    };
                break;
            case 2:
                actor = {
                        objectType: "Agent",
                        mbox: userEMail,
                        name: fullusername
                    };
                break;
            case 3:
                actor = {
                        objectType: "Group",
                        account: {
                            name: groupname,
                            homePage: baseUrl() + state.templateId
                        }
                    };

        }
    }

    if (! state.initialised)
    {
        state.initialised = true;
        state.initialise();
    }
    state.mode = "normal";

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
            state.mode = "none";
        }
        TinCan.enableDebug();
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
                    actor: actor,
                    verb: {
                        id: "http://adlnet.gov/expapi/verbs/launched",
                        display: {
                            "en-US": "Launched"
                        }
                    },
                    object: {
                        objectType: "Activity",
                        id: baseUrl() + state.templateId
                       
                        //TODO: get the name for this activity
                    },
                    context: {
                         extensions: {
                            "http://xerte.org.uk/xapi/title" : x_params.name
                        }
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
                    actor: actor,
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
                    target: {
                        id: baseUrl() + state.templateId
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
                actor: actor,
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/logged-in",
                    display: {
                        "en-US": "Logged in"
                    }
                },
                target: {
                    id: baseUrl() + state.templateId
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
        case "templateId":
            state.templateId = value;
            break;
        case "templateName":
            state.templateName = value;
            break;
    }
}

function XTEnterPage(page_nr, page_name, page_type)
{
    state.enterPage(page_nr, -1, "page", page_name);
    this.pageStart = new Date();
    var id = baseUrl() + state.templateId + "/" + page_nr;
    var description = "Page " + page_nr;
    if (page_name != null && page_name != "")
    {
        id = baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_");
        description = page_name;
    }
    if (! surf_mode) {
        var statement = new TinCan.Statement(
            {
                actor: actor,
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/initialized",
                    display: {
                        "en": "initialized"
                    }
                },
                object: {
                    objectType: "Activity",
                    id: id,
                    definition:{
                        name:{
                            "en": description
                        }
                    }

                },
                timestamp: this.pageStart

            }
        );

        SaveStatement(statement);
    }
}

function XTExitPage(page_nr, page_name)
{
    var id = baseUrl() + state.templateId + "/" + page_nr;
    var description = "Page " + page_nr;
    if (page_name != null && page_name != "")
    {
        id = baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_");
        description = page_name;
    }
    var sit = state.findPage(page_nr);
    if (sit != undefined && sit != null) {
        state.exitInteraction(page_nr, -1, false, "", sit.score, "", false, page_name);
    }
}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting)
{
    state.setPageType(page_nr, page_type, nrinteractions, weighting);

}

function XTSetAttendance(page_nr, name, score, page_name)
{
    this.pageEnd = new Date();
    var id = baseUrl() + state.templateId + "/" + page_nr;
    if (page_name != null && page_name != "")
    {
        id = baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_");
    }
    var sit = state.findPage(page_nr);
    if (sit != null) {
        var statement = new TinCan.Statement(
            {
                actor: actor,
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/attended",
                    display: {
                        "en-US": "attended"
                    }
                },
                result: {
                    "score": {
                        "scaled": score / 100
                    },
                    "duration": calcDuration(sit.start, this.pageEnd),
                },
                object: {
                    objectType: "Activity",
                    id: id,
                    definition: {
                        name: {
                            "en": name
                        }
                    }
                },
                timestamp: this.pageEnd

            }
        );

        SaveStatement(statement);
    }
}

function XTSetPageScore(page_nr, score, page_name)
{
    state.setPageScore(page_nr, score);
    this.pageEnd = new Date();
    var id = baseUrl() + state.templateId + "/" + page_nr;
    var description = "Page " + page_nr;
    if (page_name != null && page_name != "")
    {
        id = baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_");
        description = page_name;
    }
    var statement = new TinCan.Statement(
        {
            actor: actor,
            verb: {
                id: "http://adlnet.gov/expapi/verbs/scored",
                display: {
                    "en-US": "scored"
                }
            },
            object: {
                objectType: "Activity",
                id: id,
                definition:{
                    name:{
                        "en": description
                    }
                }
            },
            result:{
                completion: true,
                success: score >= state.lo_passed,
                score: {
                    scaled: score / 100
                },
                duration: calcDuration(this.pageStart, this.pageEnd),
            },
            timestamp: this.pageEnd

        }
    );

    SaveStatement(statement);
}

function calcDuration(s, e)
{
    var delta = Math.abs(e.getTime() - s.getTime()) / 1000;

    var days = Math.floor(delta / 86400);
    delta -= days * 86400;
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    var seconds = delta;
    return "PT" + hours + "H" + minutes + "M" + seconds + "S"
}

function XTSetPageScoreJSON(page_nr, score, JSONGraph, page_name)
{
    state.setPageScore(page_nr, score);
    this.pageEnd = new Date();
    var id = baseUrl() + state.templateId + "/" + page_nr;
    var description = "Page " + page_nr;
    if (page_name != null && page_name != "")
    {
        id = baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_");
        description = page_name;
    }
    if (!surf_mode) {
        var statement = new TinCan.Statement(
            {
                actor: actor,
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/scored",
                    display: {
                        "en-US": "scored"
                    }
                },
                object: {
                    objectType: "Activity",
                    id: id,
                    description:{
                        name:{
                            "en": description
                        }
                    }
                },
                result: {
                    completion: true,
                    success: score >= state.lo_passed,
                    score: {
                        scaled: score / 100
                    },
                    duration: calcDuration(this.pageStart, this.pageEnd),
                    extensions: {
                        "http://xerte.org.uk/xapi/JSONGraph": JSONGraph
                    }
                },
                timestamp: this.pageEnd
            }
        );

        SaveStatement(statement);
    }
}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback, page_name)
{
    state.enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback, page_name);
    this.enterInteractionStamp = new Date();
    var id = baseUrl() + state.templateId + "/" + page_nr;
    var description = "Page " + page_nr;

    if (ia_nr >=0)
    {
        if (page_name != null && page_name != "") {
            if (ia_name != null && ia_name != "") {
                id = baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_") + "/" + ia_name.replace(/ /g,"_");
                description = ia_name;
            }
            else
            {
                baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_") + "/" + ia_nr;
                description = "";
            }
        }
        else
        {
            if (ia_name != null && ia_name != "") {
                id = baseUrl() + state.templateId + "/" + page_nr + "/" + ia_name.replace(/ /g,"_");
                description = ia_name;
            }
            else
            {
                baseUrl() + state.templateId + "/" + page_nr + "/" + ia_nr;
                description = "";
            }
        }
    }
    else
    {
        if (page_name != null && page_name != "")
        {
            id = baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_");
            description = page_name;
        }
    }
    var statement = new TinCan.Statement(
        {
            actor: actor,
            verb: {
                id: "http://adlnet.gov/expapi/verbs/initialized",
                display: {
                    "en-US": "initialized"
                }
            },
            object: {
                objectType: "Activity",
                id: id,
                definition:{
                    name:{
                        "en": description
                    }
                }
            },
            timestamp : this.enterInteractionStamp
        }
    );


    SaveStatement(statement);



}

function XTExitInteraction(page_nr, ia_nr, ia_type, result, learneranswer, feedback, page_name) {
    state.exitInteraction(page_nr, ia_nr, ia_type, result, learneranswer, feedback, page_name);
}

function XTGetInteractionScore(page_nr, ia_nr, ia_type, ia_name, page_name, callback)
{
    var stringObjects = [];
    //Get ID from the question
    //var idQ = this.x_currentPageXML.childNodes[ia_nr].getAttribute("linkID");

    var id = baseUrl() + state.templateId + "/" + page_nr;

    if (ia_nr >=0)
    {
        var id = baseUrl() + state.templateId + "/" + page_nr + "/" + ia_nr;
    }
    if (page_name != null && page_name != "")
    {
        // If this is an url, use as is
        if (page_name.substr(0, 4).toLowerCase() == "http")
        {
            id = page_name.replace(/ /g,"_");
        }
        else
        {
            id = baseUrl() + state.templateId + "/" + page_name.replace(/ /g,"_");
        }
    }
    var x = lrsInstance.queryStatements(
        {
            params: {
                verb: new TinCan.Verb(
                    {
                        id: "http://adlnet.gov/expapi/verbs/scored"
                    }
                ),
                activity: new TinCan.Activity(
                    {
                        id: id
                    }
                )
            },
            callback: function(err, sr) {
                var lastSubmit = null;
                for (x = 0; x < sr.statements.length; x++)
                {
                    //if (sr.statements[x].actor.mbox == userEMail && lastSubmit == null) {
                    //    lastSubmit = JSON.parse(sr.statements[x].result.extensions["http://xerte.org.uk/xapi/JSONGraph"]);
                    //}
                    stringObjects[x] = {};
                    stringObjects[x].timestamp = sr.statements[x].timestamp;
                    stringObjects[x].actor = sr.statements[x].actor;
                    stringObjects[x].result = sr.statements[x].result;
                    stringObjects[x].graph = JSON.parse(sr.statements[x].result.extensions["http://xerte.org.uk/xapi/JSONGraph"]);
                }
                //stringObjects.push(lastSubmit);
                if (err !== null) {
                    console.log("Failed to query statements: " + err);
                    // TODO: do something with error, didn't get statements
                    return;
                }
                if (sr.more !== null) {
                }
                callback(stringObjects);
            }
        }
    );
}
function XTGetInteractionCorrectAnswer(page_nr, ia_nr, ia_type, ia_name)
{
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
        var statement = new TinCan.Statement(
            {
                actor: actor,
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/exited",
                    display: {
                        "en": "Exited"
                    }
                },
                object: {
                    objectType: "Activity",
                    id: baseUrl() + state.templateId
                },
                timestamp: new Date()
            }
        );
        SaveStatement(statement, false);
        window.opener.innerWidth += 2;
        window.opener.innerWidth -= 2;
    }

    function SaveStatement(statement, async = true) {
        
        var key = baseUrl() + "sessionId";
        keyValuePairs = {};
        keyValuePairs[key] = state.sessionId;
        key = baseUrl() + "learningObject";
        keyValuePairs[key] = baseUrl() + state.templateId;
        extens = {"extensions" : keyValuePairs};
        contextExtens = new TinCan.Context(extens);
        if(statement.context == undefined)
        {
            statement.context = contextExtens;
        }else if(statement.context.extensions == undefined){
            statement.context.extensions = keyValuePairs;
        }else{
            statement.context.extensions[key] = state.sessionId;
        }
        statement.id = null;
        if(async){
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
        }else{
            lrsInstance.saveStatement(
                statement
            );
        }

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
                        var resultCorrect=false;
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
                        learnerAnswer = state.interactions[i].learnerAnswers[0] != undefined ? state.interactions[i].learnerAnswers[0].answer : "";
                        for (var j = 1; j < state.interactions[i].learnerAnswers.length; j++) {
                            learnerAnswer += "\n" + state.interactions[i].learnerAnswers[j.answer];
                        }
                        correctAnswer = "";
                        for (var j = 0; j < state.interactions[i].correctAnswers.length; j++) {
                            if (state.interactions[i].correctAnswers[j].result) {
                                if (correctAnswer.length > 0)
                                    correctAnswer += "\n";
                                correctAnswer += state.interactions[i].correctAnswers[j].answer;
                            }
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
        results.averageScore = state.getScaledScore() * 100;
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

