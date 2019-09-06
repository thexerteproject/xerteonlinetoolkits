//TODO: get user email, more verbs (passed/failed, completed, ect), define scormmode for xAPI

function makeId(page_nr, ia_nr, ia_type, ia_name) {
    var tmpid = 'urn:x-xerte:p-' + (page_nr + 1);
    if (ia_nr >= 0) {
        tmpid += ':' + (ia_nr + 1);
        if (ia_type.length > 0) {
            tmpid += '-' + ia_type;
        }
    }

    if (ia_name) {
        // ia_nam can be HTML, just extract text from it
        var div = $("<div>").html(ia_name);
        var strippedName = div.text();
        tmpid += ':' + encodeURIComponent(strippedName.replace(
            /[^a-zA-Z0-9_ ]/g, "").replace(/ /g, "_"));
        // Truncate to max 255 chars, this should be 4000
        tmpid = tmpid.substr(0, 255);
    }
    return tmpid;
}

baseUrl = function() {
    var pathname = window.location.href;
    var newPathname = pathname.split("/");
    var urlPath = "";
    for (var i = 0; i < newPathname.length - 1; i++) {
        urlPath += newPathname[i] + "/";
    }
    if (newPathname[0] != "http:" && newPathname[0] != "https:" &&
        newPathname[0] != "localhost") {
        urlPath = "http://xerte.org.uk/";
    }
    return urlPath;
}

function XApiTrackingState() {
    this.initialised = false;
    this.currentid = "";
    this.currentpageid = "";
    this.trackingmode = "full";
    this.forcetrackingmode = false;
    this.scoremode = 'first';
    this.nrpages = 0;
    this.toCompletePages = new Array();
    this.completedPages = new Array();
    this.start = new Date();
    this.interactions = new Array();
    this.lo_completed = 0;
    this.lo_type = "pages only";
    this.lo_passed = -1.0;
    this.page_timeout = 0;
    this.templateId = -1;
    this.templateName = "";
    this.debug = false;
    this.sessionId = "";
    this.category = "";
    this.language = "en";

    this.initialise = initialise;
    this.getCompletionStatus = getCompletionStatus;
    this.getCompletionPercentage = getCompletionPercentage;
    this.getSuccessStatus = getSuccessStatus;
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
    this.find = find;
    this.findPage = findPage;
    this.findInteraction = findInteraction;
    this.findAllInteractions = findAllInteractions;
    this.findCreate = findCreate;
    this.enterPage = enterPage;
    this.formatDate = formatDate;
    this.verifyResult = verifyResult;
    this.verifyEnterInteractionParameters = verifyEnterInteractionParameters;
    this.verifyExitInteractionParameters = verifyExitInteractionParameters;

    function initialise() {

    }

    function formatDate(d) {
        // Build a string of the form YYYY-MM-DDThh:mm:ss+hh:mm, where +hh:mm is the timezone offset
        var twoDigitMonth = d.getMonth() + 1 + "";
        if (twoDigitMonth.length == 1) twoDigitMonth = "0" + twoDigitMonth;
        var twoDigitDate = d.getDate() + "";
        if (twoDigitDate.length == 1) twoDigitDate = "0" + twoDigitDate;
        var twoDigitHours = d.getHours() + 1 + "";
        if (twoDigitHours.length == 1) twoDigitHours = "0" + twoDigitHours;
        var twoDigitMinutes = d.getMinutes() + 1 + "";
        if (twoDigitMinutes.length == 1) twoDigitMinutes = "0" +
            twoDigitMinutes;
        var twoDigitSeconds = d.getSeconds() + 1 + "";
        if (twoDigitSeconds.length == 1) twoDigitSeconds = "0" +
            twoDigitSeconds;
        var tzoffset = new Date().toString().match(/([-\+][0-9]+)\s/)[1];

        return d.getFullYear() + '-' + twoDigitMonth + '-' + twoDigitDate + 'T' +
            twoDigitHours + ':' + twoDigitMinutes + ':' + twoDigitSeconds +
            tzoffset;
    }

    function getCompletionStatus() {
        var completed = true;
        for (var i = 0; i < this.completedPages.length; i++) {
            if (this.completedPages[i] == false) {
                completed = false;
                break;
            }
            //if( i == state.completedPages.length-1 && state.completedPages[i] == true)
            //{
            //completed = true;
            //
        }

        if (completed) {
            return "completed";

        } else if (!completed) {
            return 'incomplete';
        } else {
            return "unknown"
        }
    }

    function getCompletionPercentage() {
        var completed = true;
        var completedpages = 0;
        if (this.completedPages.length == 0) {
            return 0;
        }
        for (var i = 0; i < this.completedPages.length; i++) {
            if (this.completedPages[i] == true) {
                completedpages++;
            }
        }
        return (completedpages / this.completedPages.length) * 100.0;
    }

    function getSuccessStatus() {
        if (this.lo_type != "pages only") {
            if (this.getScaledScore() > (this.lo_passed / 100)) {
                return "passed";
            } else {
                return "failed";
            }
        } else {
            if (this.getCompletionStatus() == 'completed') {
                return "passed";
            } else {
                return "unknown";
            }
        }
    }


    function getdScaledScore() {
        return this.getdRawScore() / (this.getdMaxScore() - this.getdMinScore());
    }

    function getScaledScore() {
        return Math.round(this.getdScaledScore() * 100) / 100 + "";
    }

    function getdRawScore() {
        if (this.lo_type == "pages only") {
            if (this.getCompletionStatus() == 'completed')
                return 100;
            else
                return 0;
        } else {
            var score = [];
            var weight = [];
            var totalweight = 0.0;
            // Walk passed the pages
            var i = 0;
            for (i = 0; i < this.nrpages; i++) {
                var sit = this.findPage(i);
                if (sit != null && sit.weighting > 0) {
                    totalweight += sit.weighting;
                    score.push(sit.score);
                    weight.push(sit.weighting);
                }
            }
            var totalscore = 0.0;
            if (totalweight > 0.0) {
                for (i = 0; i < score.length; i++) {
                    totalscore += (score[i] * weight[i]);
                }
                totalscore = totalscore / totalweight;
            } else {
                // If the weight is 0.0, set the score to 100
                totalscore = 100.0;
            }
            return Math.round(totalscore * 100) / 100;
        }
    }

    function getRawScore() {
        return this.getdRawScore() + "";
    }

    function getdMinScore() {
        if (this.lo_type == "pages only") {
            return 0.0;
        } else {
            return 0.0;
        }
    }

    function getMinScore() {
        return this.getdMinScore() + "";
    }

    function getdMaxScore() {
        if (this.lo_type == "pages only") {
            return 100.0;
        } else {
            return 100.0;
        }
    }

    function getMaxScore() {
        return this.getdMaxScore() + "";
    }

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
    
    function enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions,
        correctanswer, feedback, grouping) {
        this.verifyEnterInteractionParameters(ia_type, ia_name, correctoptions,
            correctanswer, feedback);
        interaction = new XApiInteractionTracking(page_nr, ia_nr, ia_type,
            ia_name);
        interaction.enterInteraction(correctanswer, correctoptions, grouping);
        this.interactions.push(interaction);
        this.currentid = interaction.id;
    }

    function exitInteraction(page_nr, ia_nr, result, learneroptions,
        learneranswer, feedback, page_name) {
        if (ia_nr < 0) {
            this.currentpageid = "";
        } else {
            this.currentid = "";
        }

        var sit = this.findInteraction(page_nr, ia_nr);
        this.verifyExitInteractionParameters(sit, result, learneroptions,
            learneranswer, feedback);

        sit.exitInteraction(result, learneranswer, learneroptions, feedback,
            page_name);

        if (ia_nr < 0) {
            var temp = false;
            var i = 0;
            for (i; i < state.toCompletePages.length; i++) {
                var currentPageNr = state.toCompletePages[i];
                if (currentPageNr == page_nr) {
                    temp = true;
                    break;
                }
            }
            if (temp) {
                if (!this.completedPages[i]) {
                    var sit = this.findInteraction(page_nr, -1);
                    if (sit != null) {
                        // Skip result page completely
                        if (sit.ia_type != "result") {
                            this.completedPages[i] = this.pageCompleted(sit);
                        }
                    }
                }
            }
        }

    }

    function setPageType(page_nr, page_type, nrinteractions, weighting) {
        var sit = this.findPage(page_nr);
        if (sit != null) {
            sit.ia_type = page_type;

            sit.nrinteractions = nrinteractions;
            sit.weighting = parseFloat(weighting);
            if (page_type != 'page') {
                state.lo_type = 'interactive';
            }
        }
    }

    function setPageScore(page_nr, score) {
        var sit = this.findPage(page_nr);
        if (sit != null && (this.scoremode != 'first' || sit.count < 1)) {
            sit.score = score;
        }
    }

    function find(id) {
        var i = 0;
        for (i = 0; i < this.interactions.length; i++) {
            if (this.interactions[i].id == id)
                return this.interactions[i];
        }

        return null;
    }

    function findPage(page_nr) {
        var id = makeId(page_nr, -1, 'page', "");
        var i = 0;
        for (i = 0; i < this.interactions.length; i++) {
            if (this.interactions[i].id.indexOf(id) == 0 && this.interactions[i]
                .id.indexOf(id + ':interaction') < 0)
                return this.interactions[i];
        }
        return null;
    }

    function findInteraction(page_nr, ia_nr) {
        if (ia_nr < 0) {
            return this.findPage(page_nr);
        }
        var id = makeId(page_nr, ia_nr, "", "");
        var i = 0;
        for (i = 0; i < this.interactions.length; i++) {
            if (this.interactions[i].id.indexOf(id) == 0)
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

    function findCreate(page_nr, ia_nr, ia_type, ia_name) {
        var tmpid = makeId(page_nr, ia_nr, ia_type, ia_name);
        var i = 0;
        for (i = 0; i < this.interactions.length; i++) {
            if (this.interactions[i].id == tmpid)
                return this.interactions[i];
        }
        // Not found
        var sit = new XApiInteractionTracking(page_nr, ia_nr, ia_type, ia_name);
        if (ia_type != "page" && ia_type != "result") {
            this.lo_type = "interactive";
        }
        if (this.lo_passed == -1) {
            this.lo_passed = 55;
        }


        this.interactions.push(sit);
        return sit;
    }

    function enterPage(page_nr, ia_nr, ia_type, ia_name) {
        var sit = this.findCreate(page_nr, ia_nr, ia_type, ia_name);
        this.currentpageid = sit.id;

        return sit;
    }
    /**
     * Check whether result has the valid structure and contents
     * @param result
     *
     * result should be an object with a boolean field success and a float field score
     */
    function verifyResult(result) {
        if (this.debug) {
            if (typeof result != 'object' || typeof result['success'] !=
                'boolean' || typeof result['score'] != 'number' || result[
                    'score'] < 0.0 || result['score'] > 100.0) {
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
     *  1. match
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
    function verifyEnterInteractionParameters(ia_type, ia_name, correctoptions,
        correctanswer, feedback) {
        if (this.debug) {
            switch (ia_type) {
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
                    if (typeof correctoptions == 'object') {
                        for (var i = 0; i < correctoptions.length; i++) {
                            var item = correctoptions[i];
                            if (typeof item != 'object' || typeof item['source'] !=
                                'string' || typeof item['target'] != 'string') {
                                console.log(
                                    "Invalid structure for correctoptions for type match: " +
                                    correctoptions);
                            }
                        }
                    } else {
                        console.log(
                            "Invalid structure for correctoptions for type match: " +
                            correctoptions);
                    }
                    if (typeof correctanswer == 'object') {
                        for (var i = 0; i < correctanswer.length; i++) {
                            var item = correctanswer[i];
                            if (typeof item != 'string') {
                                console.log(
                                    "Invalid structure for correctanswer for type match: " +
                                    correctanswer);
                            }
                        }
                    } else {
                        console.log(
                            "Invalid structure for correctanswer for type match: " +
                            correctanswer);
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
                    if (typeof correctoptions == 'object') {
                        for (var i = 0; i < correctoptions.length; i++) {
                            var item = correctoptions[i];
                            if (typeof item != 'object' || typeof item['id'] !=
                                'string' || typeof item['answer'] != 'string' ||
                                typeof item['result'] != 'boolean') {
                                console.log(
                                    "Invalid structure for correctoptions for type multiplechoice: " +
                                    correctoptions);
                            }
                        }
                    } else {
                        console.log(
                            "Invalid structure for correctoptions for type multiplechoice: " +
                            correctoptions);
                    }
                    if (typeof correctanswer == 'object') {
                        for (var i = 0; i < correctanswer.length; i++) {
                            var item = correctanswer[i];
                            if (typeof item != 'string') {
                                console.log(
                                    "Invalid structure for correctanswer for type multiplechoice: " +
                                    correctanswer);
                            }
                        }
                    } else {
                        console.log(
                            "Invalid structure for correctanswer for type multiplechoice: " +
                            correctanswer);
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
                    if (typeof correctoptions == 'object') {
                        for (var i = 0; i < correctoptions.length; i++) {
                            var item = correctoptions[i];
                            if (typeof item != 'string') {
                                console.log(
                                    "Invalid structure for correctoptions for type multiplechoice: " +
                                    correctoptions);
                            }
                        }
                    } else {
                        console.log(
                            "Invalid structure for correctoptions for type multiplechoice: " +
                            correctoptions);
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
                    console.log("Invalid ia_type " + ia_type +
                        " entering interaction.");
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
     *        learneranswer contains a number between 0 and 100 as a string
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
    function verifyExitInteractionParameters(sit, result, learneroptions,
        learneranswer, feedback) {
        if (this.debug) {
            this.verifyResult(result);
            switch (sit.ia_type) {
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
                    if (typeof learneroptions == 'object') {
                        for (var i = 0; i < learneroptions.length; i++) {
                            var item = learneroptions[i];
                            if (typeof item != 'object' || typeof item['source'] !=
                                'string' || typeof item['target'] != 'string') {
                                console.log(
                                    "Invalid structure for learneroptions for type match: " +
                                    learneroptions);
                            }
                        }
                    } else {
                        console.log(
                            "Invalid structure for learneroptions for type match: " +
                            learneroptions);
                    }
                    if (typeof learneranswer == 'object') {
                        for (var i = 0; i < learneranswer.length; i++) {
                            var item = learneranswer[i];
                            if (typeof item != 'string') {
                                console.log(
                                    "Invalid structure for learneranswer for type match: " +
                                    learneranswer);
                            }
                        }
                    } else {
                        console.log(
                            "Invalid structure for learneranswers for type match: " +
                            learneranswer);
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
                    if (typeof learneroptions == 'object') {
                        for (var i = 0; i < learneroptions.length; i++) {
                            var item = learneroptions[i];
                            if (typeof item != 'object' || typeof item['id'] !=
                                'string' || typeof item['answer'] != 'string' ||
                                typeof item['result'] != 'boolean') {
                                console.log(
                                    "Invalid structure for learneroptions for type multiplechoice: " +
                                    learneroptions);
                            }
                        }
                    } else {
                        console.log(
                            "Invalid structure for learneroptions for type multiplechoice: " +
                            learneroptions);
                    }
                    if (typeof learneranswer == 'object') {
                        for (var i = 0; i < learneranswer.length; i++) {
                            var item = learneranswer[i];
                            if (typeof item != 'string') {
                                console.log(
                                    "Invalid structure for learneranswer for type multiplechoice: " +
                                    learneranswer);
                            }
                        }
                    } else {
                        console.log(
                            "Invalid structure for learneranswers for type multiplechoice: " +
                            learneranswer);
                    }
                    break;
                case 'numeric':
                    /**
                     * 3. numeric
                     *        learneroptions: ignored
                     *        learneranswer contains a number between 0 and 100
                     */
                    if (typeof learneranswer != 'number') {
                        console.log(
                            "Invalid structure for learneranswers for type numeric: " +
                            learneranswer);
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
                    if (typeof learneranswer != 'string') {
                        console.log(
                            "Invalid structure for learneranswers for type fill-in: " +
                            learneranswer);
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
                    console.log("Invalid ia_type " + sit.ia_type +
                        " exiting interaction.");
                    break;
            }
        }
    }
}

function XApiInteractionTracking(page_nr, ia_nr, ia_type, ia_name) {
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
    this.grouping = "";
    this.correctAnswers = [];
    this.learnerAnswers = [];
    this.learnerOptions = [];

    this.exit = exit;
    this.enterInteraction = enterInteraction;
    this.exitInteraction = exitInteraction;
    this.getPageId = getPageId;
    this.getPageDescription = getPageDescription;
    this.getxApiId = getxApiId;
    this.getxApiDescription = getxApiDescription;

    function getPageId() {
        if (this.ia_nr < 0) {
            // This is a page, use ia_name if set
            if (this.ia_name != null && this.ia_name != "") {
                return baseUrl() + state.templateId + "/" + this.ia_name.replace(
                    /[\/ ]/g, "_");
            }
        } else {
            var sitp = state.findPage(this.page_nr);
            if (sitp != null) {
                return sitp.getPageId();
            }
        }
        return baseUrl() + state.templateId + "/" + this.page_nr;
    }

    function getPageDescription() {
        if (this.ia_nr < 0) {
            // This is a page, use ia_name if set
            if (this.ia_name != null && this.ia_name != "") {
                return $("<div>").html(this.ia_name).text();
            }
        } else {
            var sitp = state.findPage(this.page_nr);
            if (sitp != null) {
                return sitp.getPageDescription();
            }
        }
        return "Page " + this.page_nr;
    }

    function getxApiId() {
        var id = this.getPageId();
        if (this.ia_nr >= 0) {
            if (this.ia_name != null && this.ia_name != "") {
                return id + "/" + this.ia_name.replace(/[\/ ]/g, "_");
            } else {
                return id + "/" + this.ia_nr;
            }
        } else {
            return id;
        }
    }

    function getxApiDescription() {
        if (this.ia_nr >= 0) {
            if (this.ia_name != null && this.ia_name != "") {
                return $("<div>").html(this.ia_name).text();
            } else {
                return "Interactivity " + this.ia_nr;
            }
        } else {
            return this.getPageDescription();
        }
    }

    function exit() {
        this.end = new Date();
        var duration = this.end.getTime() - this.start.getTime();
        if (duration > 100) {
            this.duration += duration;
            this.count++;
            return true;
        } else {
            return false;
        }

    }

    function enterInteraction(correctAnswers, correctOptions, grouping) {
        this.correctAnswers = correctAnswers;
        this.correctOptions = correctOptions;

        if (typeof grouping != "undefined" && grouping != "" && grouping !=
            null) {
            this.grouping = grouping;
        } else {
            this.grouping = "";
        }

        var id = this.getxApiId();
        var description = this.getxApiDescription();

        var statement = {
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
                definition: {
                    name: {
                        "en": description
                    }
                }
            },
            timestamp: this.enterInteractionStamp
        };
        statement.object.definition.name[state.language] = description;

        if (this.grouping != "") {
            statement.context = {
                contextActivities: {
                    grouping: [{
                        id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
                        objectType: "Activity"
                    }]
                }
            };
        }
        SaveStatement(statement);

    }

    function exitInteraction(result, learnerAnswers, learnerOptions, feedback) {
        this.learnerAnswers = learnerAnswers;
        this.learnerOptions = learnerOptions;
        this.result = result;
        this.feedback = feedback;

        var pagename = this.getPageDescription();

        var pageref = " page " + this.page_nr + " of object " + state.templateId +
            " of Xerte Installation " + baseUrl();
        if (pagename.substr(0, 4) != "Page") {
            pageref = " page \"" + pagename + "\" (page " + this.page_nr +
                ") of object " + state.templateId + " of Xerte Installation " +
                baseUrl();
        }
        var id = this.getxApiId();
        var description = this.getxApiDescription();

        if (this.exit()) {
            if (state.scoremode != 'first' || this.count <= 1) {

                if (!state.trackingmode != 'none' && ((this.ia_nr < 0 && (state
                        .trackingmode != 'full' || this.nrinteractions ==
                        0)) || (this.ia_nr >= 0 && state.trackingmode ==
                        'full'))) {

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
                    } else {
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
                                scormAnswerArray.push(entry.source.replace(/ /g,
                                    "_") + "[.]" + entry.target.replace(
                                    / /g, "_"));
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
                                var entryobject = {
                                    id: entry.source.replace(/ /g, "_"),
                                    description: {
                                        "en-US": entry.source
                                    }
                                };
                                entryobject.description[state.language] = entry.source;
                                sourceArray.push(entryobject);
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
                                    var targetObj = {
                                        id: entry.target.replace(/ /g,
                                            "_"),
                                        description: {
                                            "en-US": entry.target
                                        }
                                    };
                                    targetObj.description[state.language] = entry.target;
                                    targetArray.push(targetObj);
                                }
                                scormCorrectArray.push(entry.source.replace(
                                    / /g, "_") + "[.]" + entry.target.replace(
                                    / /g, "_"));
                            }
                            var scorm_canswer = scormCorrectArray.join('[,]');
                            statement.object.definition = {
                                name: {
                                    "en-US": description
                                },
                                description: {
                                    "en-US": "Matching interaction " + description + " of " + pageref
                                },
                                type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                interactionType: "matching",
                                source: sourceArray,
                                target: targetArray,
                                correctResponsesPattern: [scorm_canswer]
                            };
                            statement.object.definition.name[state.language] = description;
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
                                extensions: {
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
                                var entry = learnerOptions[i]['answer'].replace(
                                    / /g, "_");
                                scormAnswerArray.push(entry);
                            }
                            var scorm_lanswer = scormAnswerArray.join('[,]');

                            // Do the same for the answer pattern
                            var scormArray = [];
                            var scormCorrectArray = [];
                            var i = 0;
                            for (i = 0; i < this.correctOptions.length; i++) {
                                var entry = {
                                    id: this.correctOptions[i].answer.replace(
                                        / /g, "_"),
                                    description: {
                                        "en-US": this.correctOptions[i][
                                            'answer'
                                        ]
                                    }
                                };
                                entry.description[state.language] = this.correctOptions[i]['answer'];
                                scormArray.push(entry);
                                if (this.correctOptions[i].result) {
                                    scormCorrectArray.push(this.correctOptions[
                                        i].answer.replace(/ /g, "_"));
                                }
                            }
                            var scorm_canswer = [scormCorrectArray.join('[,]')];

                            statement.object.definition = {
                                name: {
                                    "en-US": description
                                },
                                description: {
                                    "en-US": "Choice interaction " + description +
                                        " of " + pageref
                                },
                                type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                interactionType: "choice",
                                choices: scormArray,
                                correctResponsesPattern: scorm_canswer
                            };
                            statement.object.definition.name[state.language] = description;
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
                                extensions: {
                                    "http://xerte.org.uk/result/multiplichoice": scorm_lanswer
                                }
                            };
                            break;
                        case 'numeric':
                            statement.object.definition = {
                                name: {
                                    "en-US": description
                                },
                                description: {
                                    "en-US": "Numeric interaction " + description +
                                        " of " + pageref
                                },
                                type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                interactionType: "numeric",
                                correctResponsesPattern: ["0[:]100"]
                            };
                            statement.object.definition.name[state.language] = description;
                            if (this.ia_nr < 0) // Page mode
                            {
                                statement.result = {
                                    duration: calcDuration(this.start, this
                                        .end),
                                    score: {
                                        raw: this.score,
                                        min: 0.0,
                                        max: 100.0,
                                        scaled: this.score / 100.0
                                    },
                                    response: this.score + "",
                                    success: (this.score >= state.lo_passed),
                                    completion: true
                                };
                            } else { // Interaction mode
                                statement.result = {
                                    duration: calcDuration(this.start, this
                                        .end),
                                    score: {
                                        raw: result.score,
                                        min: 0.0,
                                        max: 100.0,
                                        scaled: result.score / 100.0
                                    },
                                    response: this.learnerAnswers + "",
                                    success: result.success,
                                    completion: true
                                };
                            }
                            break;
                        case 'text':
                        case 'fill-in':

                            // Hmmm is this the page or the interaction itself
                            if (this.ia_nr < 0) {
                                //This is the page
                                // Get the interaction, it is always assumed to be 0
                                var siti = state.findInteraction(this.page_nr,
                                    0);
                                this.correctAnswers = siti.correctAnswers;
                                this.learnerAnswers = siti.learnerAnswers;
                            }
                            statement.object.definition = {
                                name: {
                                    "en-US": description
                                },
                                description: {
                                    "en-US": "Fill-in interaction " + description +
                                        " of " + pageref
                                },
                                type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                interactionType: "fill-in",
                                correctResponsesPattern: [this.correctAnswers]
                            };
                            statement.object.definition.name[state.language] = this.ia_name;
                            if (this.ia_type == 'text') {
                                statement.result = {
                                    duration: calcDuration(this.start, this
                                        .end),
                                    score: {
                                        raw: result.score,
                                        min: 0.0,
                                        max: 100.0,
                                        scaled: result.score / 100.0,
                                    },
                                    response: this.learnerAnswers,
                                    success: result.success,
                                    completion: true,
                                    extensions: {
                                        "http://xerte.org.uk/result/text": this
                                            .learnerAnswers
                                    }
                                };
                                statement.object.definition = {
                                    name: {
                                        "en-US": this.ia_name
                                    },
                                    description: {
                                        "en-US": "Model answer interaction " +
                                            this.ia_name + " of " + pageref
                                    }
                                };
                                statement.object.definition.name[state.language] = this.ia_name;
                            } else {
                                statement.result = {
                                    duration: calcDuration(this.start, this
                                        .end),
                                    score: {
                                        raw: result.score,
                                        min: 0.0,
                                        max: 100.0,
                                        scaled: result.score / 100.0
                                    },
                                    response: this.learnerAnswers,
                                    success: result.success,
                                    completion: true,
                                    extensions: {
                                        "http://xerte.org.uk/result/fill-in": this
                                            .learnerAnswers
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
                            statement.object.definition = {
                                name: {
                                    "en": description
                                },
                                description: {
                                    "en": "Interaction with " + pageref
                                }
                            };
                            statement.object.definition.name[state.language] = description;
                            var duration = calcDuration(this.start, this.end);
                            statement.result = {
                                duration: duration,
                                success: result.success,
                                completion: Math.abs(this.end.getTime() -
                                    this.start.getTime()) > state.page_timeout
                            };
                    }
                    if (this.grouping != "") {
                        statement.context = {
                            contextActivities: {
                                grouping: [{
                                    id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
                                    objectType: "Activity"
                                }]
                            }
                        };
                    }
                    SaveStatement(statement);
                    if (typeof statement.result.score != 'undefined') {
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
                                    description: statement.object.definition
                                        .description
                                },
                                id: id
                            },
                            result: statement.result
                        };
                        if (this.grouping != "") {
                            scoredstatement.context = {
                                contextActivities: {
                                    grouping: [{
                                        id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
                                        objectType: "Activity"
                                    }]
                                }
                            };
                        }
                        SaveStatement(scoredstatement);
                    }
                }


                if (surf_mode) {
                    var statement = {
                        actor: actor,
                        verb: {
                            id: "http://lrs.surfuni.org/verb/submitted",
                            display: {
                                "en-US": "Submitted"
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
                    };
                    if (this.grouping != "") {
                        statement.context.contextActinities = {
                            grouping: [{
                                id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
                                objectType: "Activity"
                            }]
                        };
                    }
                    SaveStatement(statement);
                    // If not a page
                    if (this.ia_nr >= 0) {
                        var statement = {
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
                                duration: calcDuration(sit.start, sit.end)
                            },
                            context: {
                                extensions: {
                                    "http://lrs.surfuni.org/context/course": surf_course,
                                    "http://lrs.surfuni.org/context/recipe": surf_recipe,
                                    "http://lrs.surfuni.org/context/label": ""
                                }
                            },
                            timestamp: new Date()
                        };
                        if (this.grouping != "") {
                            statement.context.contextActivities = {
                                grouping: [{
                                    id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
                                    objectType: "Activity"
                                }]
                            };
                        }
                        SaveStatement(statement);
                    }
                }
            }
        }
        if (!surf_mode) {
            var statement;
            if (this.ia_nr >= 0) {
                statement = {
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
                statement.object.definition.name[state.language] = description;

            } else {
                statement = {
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
                statement.object.definition.name[state.language] = description;
            }
            if (this.grouping != "") {
                statement.context = {
                    contextActivities: {
                        grouping: [{
                            id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
                            objectType: "Activity"
                        }]
                    }
                };
            }
            SaveStatement(statement);
        }
    }
    this.grouping = "";
}


var state = new XApiTrackingState();
// enable debug for now
state.debug = true;

var scorm = false,
    lrsInstance,
    userEMail;

var surf_mode = false;
var surf_recipe, surf_course;

var answeredQs = [];

function XTInitialise(category) {
    state.sessionId = new Date().getTime() + "" + Math.round(Math.random() *
        10000000);
    // Initialise actor object
    if (typeof studentidmode != "undefined" && typeof studentidmode == 'string') {
        studentidmode = parseInt(studentidmode);
    }
    if (typeof studentidmode == "undefined" || (studentidmode <= 0 && studentidmode > 3)) {
        // set actor to global group
        actor = {
            objectType: "Group",
            account: {
                name: "global",
                homePage: baseUrl() + state.templateId
            }
        };
    } else {
        if (typeof username == "undefined" || username == "") {
            userEMail = "mailto:email@test.com"
        } else {
            userEMail = "mailto:" + username;
        }
        if (typeof fullusername == 'undefined')
            fullusername = "Unknown";
        if (typeof groupname != "undefined" && groupname != "") {
            state.group = {
                objectType: "Group",
                account: {
                    name: groupname,
                    homePage: baseUrl()
                }
            };
        } else {
            state.group = "";
        }
        if (typeof coursename != "undefined" && coursename != "") {
            state.course = {
                id: baseUrl() + 'course/' + coursename
            };
            state.coursename = coursename;
        } else {
            state.course = "";
            state.coursename = "";
        }
        if (typeof modulename != "undefined" && modulename != "") {
            state.module = {
                id: baseUrl() + 'module/' + modulename
            };
            state.modulename = modulename;
        } else {
            state.module = "";
            state.modulename = "";
        }
        switch (studentidmode) {
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
                if (groupname != undefined && groupname != "") {
                    actor = {
                        objectType: "Group",
                        account: {
                            name: groupname,
                            homePage: baseUrl() + state.templateId
                        }
                    };
                } else {
                    actor = {
                        objectType: "Group",
                        account: {
                            name: "global",
                            homePage: baseUrl() + state.templateId
                        }
                    };
                }

        }
    }

    if (!state.initialised) {
        state.initialised = true;
        state.initialise();
    }
    state.mode = "normal";
    if (typeof category != "undefined" && category != "") {
        state.category = category;
    } else {
        state.category = "";
    }
    if (x_params.language != "undefined" && x_params.language != "")
    {
        state.language=x_params.language.substr(0,2);
    }

    //    if(lrsInstance == undefined){
    try {
        /*
        lrsInstance = new TinCan.LRS(
            {
                endpoint: lrsEndpoint,
                username: lrsUsername,
                password: lrsPassword,
                allowFail: false,
                version: "1.0.2"
            }
        );
        */

        // // Check if aggretate is set for the lrsEndpoint, than assume this is learning locker and change normal API accordingly and save aggregate for XTGetStatements
        // if (lrsEndpoint.indexOf("api/statements/aggregate/") >= 0)
        // {
        //     state.aggregate = true;
        //     state.lrsAggregateEndpoint = lrsEndpont;
        //     apos = lrsEndpoint.indexOf("api/statements/aggregate");
        //     lrsEndpoint = lrsEndpoint.substr(0, lrsEndpoint.Length - apos) + 'data/xAPI';
        // }
        // else {
        //     state.aggregate = false;
        // }
        var conf = {
            "endpoint": lrsEndpoint + '/',
            "user": lrsUsername,
            "password": lrsPassword,
            "strictCallbacks": true
        };
        ADL.XAPIWrapper.log.debug = true;
        ADL.XAPIWrapper.changeConfig(conf);

    } catch (ex) {
        //alert("Failed LRS setup. Error: " + ex);
        state.mode = "none";
    }
    //TinCan.enableDebug();
    //    }
    if (surf_course != undefined && surf_recipe != undefined) {
        surf_mode = true;
    }

    //    if(lrsInstance != undefined)
    //    {
    this.initStamp = new Date();

    if (!surf_mode) {
        var statement = {
            actor: actor,
            verb: {
                id: "http://adlnet.gov/expapi/verbs/launched",
                display: {
                    "en-US": "launched"
                }
            },
            object: {
                objectType: "Activity",
                id: baseUrl() + state.templateId,
                definition: {
                    name: {
                        "en": x_params.name
                    }
                }
            },
            timestamp: this.initStamp
        };
        statement.object.definition.name[state.language] = x_params.name;

        SaveStatement(statement);
    }
    if (surf_mode) {
        var statement = {
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
        };
        SaveStatement(statement);
    }
    //    }
}

function XTTrackingSystem() {
    return "xAPI";
}

function XTLogin(login, passwd) {
    this.loginStamp = new Date();

    if (!surf_mode) {
        var statement = {
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
        };

        SaveStatement(statement);
    }
    // TODO: Compare the login and the password with credentials from the LRS.

    return true;
}

function XTGetMode(extended) {
    if (state.forcetrackingmode === 'true')
    {
        if (extended != null && (extended == true || extended == 'true'))
        {
            return state.mode;
        }
        else {
            return "normal";
        }
    }
    else
        return "";
}

function XTStartPage() {
    return -1;
}

function XTGetUserName() {
    return "";
}

function XTNeedsLogin() {
    return false;
}

function XTSetOption(option, value) {
    switch (option) {
        case "nrpages":
            state.nrpages = value;
            break;
        case "toComplete":
            state.toCompletePages = value;
            //completedPages = new Array(length(toCompletePages));
            for (i = 0; i < state.toCompletePages.length; i++) {
                state.completedPages[i] = false;
            }

            break;
        case "tracking-mode":
            switch (value) {
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
            if (Number(value) <= 1) {
                state.lo_passed = Number(value) * 100;
            }
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
        case "force_tracking_mode":
            state.forcetrackingmode = value;
            break;
        case "course":
            // If overruled by request parameters (or LTI) do not use coursename, else set coursename and course
            if (state.coursename != "" && value != undefined && value != "")
            {
                state.course = {
                    id: baseUrl() + 'course/' + value
                };
                state.coursename = value;
            }
            break;
        case "module":
            // If overruled by request parameters (or LTI) do not use coursename, else set coursename and course
            if (state.modulename != "" && value != undefined && value != "")
            {
                state.module = {
                    id: baseUrl() + 'modules/' + value
                };
                state.modulename = value;
            }
            break;
    }
}

function XTEnterPage(page_nr, page_name) {
    var sitp = state.enterPage(page_nr, -1, "page", page_name);
    this.pageStart = new Date();
    var id = sitp.getPageId();
    var description = sitp.getPageDescription();

    if (!surf_mode) {
        var statement = {
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
                definition: {
                    name: {
                        "en": description
                    }
                }

            },
            timestamp: this.pageStart

        };
        statement.object.definition.name[state.language] = description;
        SaveStatement(statement);
    }
}

function XTExitPage(page_nr) {
    var sit = state.findPage(page_nr);
    if (sit != undefined && sit != null) {
        state.exitInteraction(page_nr, -1, {
            score: 0,
            success: true
        }, "", sit.score, "");
    }
}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting) {
    state.setPageType(page_nr, page_type, nrinteractions, weighting);

}

function XTSetViewed(page_nr, name, score) {
    if (isNaN(score) || typeof score != "number") {
        score = 0.0;
    }
    this.pageEnd = new Date();
    var sit = state.findPage(page_nr);
    if (sit != null) {
        var id = sit.getPageId();
        var statement = {
            actor: actor,
            verb: {
                id: "http://id.tincanapi.com/verb/viewed",
                display: {
                    "en-US": "viewed"
                }
            },
            result: {
                "score": {
                    min: 0.0,
                    max: 100.0,
                    raw: score,
                    scaled: score / 100
                },
                "duration": calcDuration(sit.start, this.pageEnd)
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

        };
        statement.object.definition.name[state.language] = name;

        SaveStatement(statement);
        state.setPageScore(page_nr, score);
    }
}

function XThelperConsolidateSegments(videostate) {
    // 1. Sort played segments on start time (first make a copy)
    var segments = $.extend(true, [], videostate.segments);
    segments.sort(function(a, b) {
        return (parseFloat(a.start) > parseFloat(b.start)) ? 1 : ((parseFloat(b.start) > parseFloat(a.start)) ? -1 : parseFloat(a.end) - parseFloat(b.end));
    });
    // 2. Combine the segments
    var csegments = [];
    var i = 0;
    while (i < segments.length) {
        var segment = $.extend(true, {}, segments[i]);
        i++;
        while (i < segments.length && parseFloat(segment.end) >= parseFloat(segments[i].start)) {
            segment.end = segments[i].end;
            i++;
        }
        csegments.push(segment);
    }
    /*
    var segstr = "[";
    for (var i=0; i<csegments.length; i++)
    {
        if (i>0)
            segstr += ", ";
        segstr += "(" + csegments[i].start + ", " + csegments[i].end + ")";
    }
    segstr += "]";
    console.log("Consolidated segments: " + segstr);
    */
    return csegments;
}

function XThelperDetermineProgress(videostate) {
    var csegments = XThelperConsolidateSegments(videostate);
    var videoseen = 0;
    for (var i = 0; i < csegments.length; i++) {
        videoseen += csegments[i].end - csegments[i].start;
    }
    // normalized between 0 and 1
    if (!isNaN(videostate.duration) && videostate.duration > 0) {
        return Math.round(videoseen / videostate.duration * 100.0) / 100.0;
    }
    return 0.0;
}

function XTVideo(page_nr, name, block_name, verb, videostate) {
    var id = baseUrl() + state.templateId + "/" + page_nr + "/video";
    var pagename = "Page " + page_nr;
    if (name != null && name != "") {
        id = baseUrl() + state.templateId + "/" + name.replace(/[\/ ]/g, "_") + "/video";
        pagename = name;
    }

    switch (verb) {

        case "initialized":
            state.videostart = new Date();
            var statement = {
                "actor": actor,
                "verb": {
                    "id": "http://adlnet.gov/expapi/verbs/initialized",
                    "display": {
                        "en-US": "initialized"
                    }
                },
                "object": {
                    "id": id,
                    "definition": {
                        "name": {
                            "en-US": "Video of " + pagename
                        },
                        "description": {
                            "en-US": "Watching video on " + pagename
                        },
                        "type": "https://w3id.org/xapi/video/activity-type/video"
                    },
                    "objectType": "Activity"
                },
                "context": {
                    "contextActivities": {
                        "category": [{
                            "id": "https://w3id.org/xapi/video"
                        }]
                    },
                    "extensions": {
                        "https://w3id.org/xapi/video/extensions/session-id": state.sessionId
                    }
                }
            };
            statement.object.definition.name[state.language] = pagename;
            SaveStatement(statement);
            break;
        case "played":
            var statement = {
                "actor": actor,
                "verb": {
                    "id": "https://w3id.org/xapi/video/verbs/played",
                    "display": {
                        "en-US": "played"
                    }
                },
                "object": {
                    "id": id,
                    "definition": {
                        "name": {
                            "en-US": "Video of " + pagename
                        },
                        "description": {
                            "en-US": "Watching video on " + pagename
                        },
                        "type": "https://w3id.org/xapi/video/activity-type/video"
                    },
                    "objectType": "Activity"
                },
                "result": {
                    "extensions": {
                        "https://w3id.org/xapi/video/extensions/time": videostate.time
                    },
                    "duration": calcDuration(state.videostart, new Date())
                },
                "context": {
                    "contextActivities": {
                        "category": [{
                            "id": "https://w3id.org/xapi/video"
                        }]
                    },
                    "extensions": {
                        "https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
                        "https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
                    }
                }
            };
            statement.object.definition.name[state.language] = pagename;
            SaveStatement(statement);
            break;
        case "paused":
            var played_segments = "";
            for (var i = 0; i < videostate.segments.length; i++) {
                if (i > 0) {
                    played_segments += "[,]"
                }
                played_segments += videostate.segments[i].start + "[.]" + videostate.segments[i].end;
            }
            var statement = {
                "actor": actor,
                "verb": {
                    "id": "https://w3id.org/xapi/video/verbs/paused",
                    "display": {
                        "en-US": "paused"
                    }
                },
                "object": {
                    "id": id,
                    "definition": {
                        "name": {
                            "en-US": "Video of " + pagename
                        },
                        "description": {
                            "en-US": "Watching video on " + pagename
                        },
                        "type": "https://w3id.org/xapi/video/activity-type/video"
                    },
                    "objectType": "Activity"
                },
                "result": {
                    "extensions": {
                        "https://w3id.org/xapi/video/extensions/time": videostate.time,
                        "https://w3id.org/xapi/video/extensions/progress": XThelperDetermineProgress(videostate),
                        "https://w3id.org/xapi/video/extensions/played-segments": played_segments
                    },
                    "duration": calcDuration(state.videostart, new Date())
                },
                "context": {
                    "contextActivities": {
                        "category": [{
                            "id": "https://w3id.org/xapi/video"
                        }]
                    },
                    "extensions": {
                        "https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
                        "https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
                    }
                }
            };
            statement.object.definition.name[state.language] = pagename;
            SaveStatement(statement);
            break;
        case "seeked":
            var statement = {
                "actor": actor,
                "verb": {
                    "id": "https://w3id.org/xapi/video/verbs/seeked",
                    "display": {
                        "en-US": "seeked"
                    }
                },
                "object": {
                    "id": id,
                    "definition": {
                        "name": {
                            "en-US": "Video of " + pagename
                        },
                        "description": {
                            "en-US": "Watching video on " + pagename
                        },
                        "type": "https://w3id.org/xapi/video/activity-type/video"
                    },
                    "objectType": "Activity"
                },
                "result": {
                    "extensions": {
                        "https://w3id.org/xapi/video/extensions/time-from": videostate.prevTime,
                        "https://w3id.org/xapi/video/extensions/time-to": videostate.time
                    },
                    "duration": calcDuration(state.videostart, new Date())
                },
                "context": {
                    "contextActivities": {
                        "category": [{
                            "id": "https://w3id.org/xapi/video"
                        }]
                    },
                    "extensions": {
                        "https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
                        "https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
                    }
                }
            };
            statement.object.definition.name[state.language] = pagename;
            SaveStatement(statement);
            break;
        case "interacted":
            break;
        case "exit": // Not really the verb. will send termintaed or completed depending on state
            var played_segments = "";
            for (var i = 0; i < videostate.segments.length; i++) {
                if (i > 0) {
                    played_segments += "[,]"
                }
                played_segments += videostate.segments[i].start + "[.]" + videostate.segments[i].end;
            }
            var progress = XThelperDetermineProgress(videostate);
            // 3. Determine whther to use completed or terminated
            if (progress >= 99.9) {
                // Use completed
                var statement = {
                    "actor": actor,
                    "verb": {
                        "id": "http://adlnet.gov/expapi/verbs/completed",
                        "display": {
                            "en-US": "completed"
                        }
                    },
                    "object": {
                        "id": id,
                        "definition": {
                            "name": {
                                "en-US": "Video of " + pagename
                            },
                            "description": {
                                "en-US": "Watching video on " + pagename
                            },
                            "type": "https://w3id.org/xapi/video/activity-type/video"
                        },
                        "objectType": "Activity"
                    },
                    "result": {
                        "extensions": {
                            "https://w3id.org/xapi/video/extensions/time": videostate.time,
                            "https://w3id.org/xapi/video/extensions/progress": progress,
                            "https://w3id.org/xapi/video/extensions/played-segments": played_segments
                        },
                        "completion": true,
                        "duration": calcDuration(state.videostart, new Date())
                    },
                    "context": {
                        "contextActivities": {
                            "category": [{
                                "id": "https://w3id.org/xapi/video"
                            }]
                        },
                        "extensions": {
                            "https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
                            "https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
                        }
                    }
                };
                statement.object.definition.name[state.language] = pagename;
            } else {
                // use terminated, so first send paused as according to standards (if not already sent)
                if (state.prevVerb != "paused") {
                    var statement = {
                        "actor": actor,
                        "verb": {
                            "id": "https://w3id.org/xapi/video/verbs/paused",
                            "display": {
                                "en-US": "paused"
                            }
                        },
                        "object": {
                            "id": id,
                            "definition": {
                                "name": {
                                    "en-US": "Video of " + pagename
                                },
                                "description": {
                                    "en-US": "Watching video on " + pagename
                                },
                                "type": "https://w3id.org/xapi/video/activity-type/video"
                            },
                            "objectType": "Activity"
                        },
                        "result": {
                            "extensions": {
                                "https://w3id.org/xapi/video/extensions/time": videostate.time,
                                "https://w3id.org/xapi/video/extensions/progress": XThelperDetermineProgress(videostate),
                                "https://w3id.org/xapi/video/extensions/played-segments": played_segments
                            },
                            "duration": calcDuration(state.videostart, new Date())
                        },
                        "context": {
                            "contextActivities": {
                                "category": [{
                                    "id": "https://w3id.org/xapi/video"
                                }]
                            },
                            "extensions": {
                                "https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
                                "https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
                            }
                        }
                    };
                    statement.object.definition.name[state.language] = pagename;
                    SaveStatement(statement);
                }
                var statement = {
                    "actor": actor,
                    "verb": {
                        "id": "http://adlnet.gov/expapi/verbs/terminated",
                        "display": {
                            "en-US": "terminated"
                        }
                    },
                    "object": {
                        "id": id,
                        "definition": {
                            "name": {
                                "en-US": "Video of " + pagename
                            },
                            "description": {
                                "en-US": "Watching video on " + pagename
                            },
                            "type": "https://w3id.org/xapi/video/activity-type/video"
                        },
                        "objectType": "Activity"
                    },
                    "result": {
                        "extensions": {
                            "https://w3id.org/xapi/video/extensions/time": videostate.time,
                            "https://w3id.org/xapi/video/extensions/progress": progress,
                            "https://w3id.org/xapi/video/extensions/played-segments": played_segments
                        },
                        "duration": calcDuration(state.videostart, new Date())
                    },
                    "context": {
                        "contextActivities": {
                            "category": [{
                                "id": "https://w3id.org/xapi/video"
                            }]
                        },
                        "extensions": {
                            "https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
                            "https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
                        }
                    }
                };
                statement.object.definition.name[state.language] = pagename;
            }
            SaveStatement(statement);
            break;

    }
    state.prevVerb = verb;
}

function XTSetPageScore(page_nr, score) {
    state.setPageScore(page_nr, score);
    this.pageEnd = new Date();
    var sitp = state.findPage(page_nr);
    if (sitp != null) {
        var id = sitp.getPageId();
        var description = sitp.getPageDescription();
        var statement = {
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
                definition: {
                    name: {
                        "en": description
                    }
                }
            },
            result: {
                completion: true,
                success: score >= state.lo_passed,
                score: {
                    min: 0.0,
                    max: 100.0,
                    raw: score,
                    scaled: score / 100
                },
                duration: calcDuration(this.pageStart, this.pageEnd)
            },
            timestamp: this.pageEnd

        };
        SaveStatement(statement);
    }
}

function calcDuration(s, e) {
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

function XTSetPageScoreJSON(page_nr, score, JSONGraph) {
    state.setPageScore(page_nr, score);
    this.pageEnd = new Date();
    var sitp = state.findPage(page_nr);
    if (sitp != null) {
        var id = sitp.getPageId();
        var description = sitp.getPageDescription();
        var duration = calcDuration(this.pageStart, this.pageEnd);
        var endtime = this.pageEnd;
        if (!surf_mode) {
            var statement = {
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
                    definition: {
                        name: {
                            "en": description
                        }
                    }
                },
                result: {
                    completion: true,
                    success: score >= state.lo_passed,
                    score: {
                        min: 0.0,
                        max: 100.0,
                        raw: score,
                        scaled: score / 100
                    },
                    duration: duration,
                    extensions: {
                        "http://xerte.org.uk/xapi/JSONGraph": JSONGraph
                    }
                },
                timestamp: endtime
            };
            SaveStatement(statement);

            // save score for each class
            var graph = JSON.parse(JSONGraph);
            $.each(graph.classnames, function(i, classname) {
                var id = sitp.getPageId() + "/" + classname.replace(/ /g, "_");
                var classdescription = description + "(class=" + classname + ")";
                var value = graph.classvalues[i];
                // Round to two decimals
                value = Math.round(value * 100.0) / 100.0;
                var statement = {
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
                        definition: {
                            name: {
                                "en": classdescription
                            }
                        }
                    },
                    result: {
                        completion: true,
                        success: value >= state.lo_passed,
                        score: {
                            min: 0.0,
                            max: 100.0,
                            raw: value,
                            scaled: Math.round(value) / 100.0
                        },
                        duration: duration
                    },
                    timestamp: endtime
                };

                SaveStatement(statement);

            });

        }
    }
}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions,
    correctanswer, feedback, grouping) {
    state.enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions,
        correctanswer, feedback, grouping);
}

function XTExitInteraction(page_nr, ia_nr, result, learneroptions,
    learneranswers, feedback) {
    state.exitInteraction(page_nr, ia_nr, result, learneroptions,
        learneranswers, feedback);
}

function XTGetInteractionScore(page_nr, ia_nr, ia_type, ia_name, full_id,
    callback, q) {
    var stringObjects = [];
    //Get ID from the question
    //var idQ = this.x_currentPageXML.childNodes[ia_nr].getAttribute("linkID");

    var id = baseUrl() + state.templateId + "/" + page_nr;

    if (ia_nr >= 0) {
        var id = baseUrl() + state.templateId + "/" + page_nr + "/" + ia_nr;
    }
    if (full_id != null && full_id != "") {
        // If this is an url, use as is
        if (full_id.substr(0, 4).toLowerCase() == "http") {
            id = full_id.replace(/ /g, "_");
        } else {
            id = baseUrl() + state.templateId + "/" + full_id.replace(/ /g, "_");
        }
    }
    /*
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
    */
    var search = ADL.XAPIWrapper.searchParams();
    search['verb'] = "http://adlnet.gov/expapi/verbs/scored";
    search['activity'] = id;
    $.each(q, function(i, value) {
        search[i] = value;
    });

    var stringObject = {};
    ADL.XAPIWrapper.getStatements(search, null,
        function getmore(err, res, body) {
            var lastSubmit = null;

            for (x = 0; x < body.statements.length; x++) {
                //if (sr.statements[x].actor.mbox == userEMail && lastSubmit == null) {
                //    lastSubmit = JSON.parse(sr.statements[x].result.extensions["http://xerte.org.uk/xapi/JSONGraph"]);
                //}
                stringObject = {};

                stringObject.timestamp = body.statements[x].timestamp;
                stringObject.actor = body.statements[x].actor;
                stringObject.result = body.statements[x].result;
                stringObject.graph = JSON.parse(body.statements[x].result.extensions[
                    "http://xerte.org.uk/xapi/JSONGraph"]);
                stringObjects.push(stringObject);
            }
            //stringObjects.push(lastSubmit);
            if (err !== null) {
                console.log("Failed to query statements: " + err);
                // TODO: do something with error, didn't get statements
                return;
            }
            if (body.more && body.more !== "") {
                ADL.XAPIWrapper.getStatements(null, body.more, getmore);
            } else {
                callback(stringObjects);
            }
        }
    );
}

function XTGetStatements(q, one, callback) {
    var search = ADL.XAPIWrapper.searchParams();
    var group = "";
    if (q['group'] != undefined)
    {
        group = q['group'];
        delete q['group'];
    }
    $.each(q, function(i, value) {
        search[i] = value;
    });
    if (one) {
        search['limit'] = 1;
    } else {
        search['limit'] = 1000;
    }
    var statements = [];
    ADL.XAPIWrapper.getStatements(search, null,
        function getmorestatements(err, res, body) {
            var lastSubmit = null;

            for (x = 0; x < body.statements.length; x++) {
                //if (sr.statements[x].actor.mbox == userEMail && lastSubmit == null) {
                //    lastSubmit = JSON.parse(sr.statements[x].result.extensions["http://xerte.org.uk/xapi/JSONGraph"]);
                //}
                if (group != ""
                    && body.statements[x].context.team != undefined
                    && body.statements[x].context.team.account != undefined
                    && body.statements[x].context.team.account.name != undefined
                    && body.statements[x].context.team.account.name != group)
                {
                    continue;
                }
                statements.push(body.statements[x]);
            }
            //stringObjects.push(lastSubmit);
            if (err !== null) {
                console.log("Failed to query statements: " + err);
                // TODO: do something with error, didn't get statements
                return;
            }
            if (res.more && res.more !== "") {
                ADL.XAPIWrapper.getStatements(null, res.more, getmorestatements);
            } else {
                callback(statements);
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
    if (!state.finished && state.initialised) {
        // End tracking of page
        x_endPageTracking(false, -1);

        // This code is probably obsolete, leave it in to allow for more testing
        var currentpageid = "";
        state.finished = true;
        if (state.currentid) {
            var sit = state.find(state.currentid);
            // there is still an interaction open, close it
            if (sit != null) {
                state.exitInteraction(sit.page_nr, sit.ia_nr, {
                        success: false,
                        score: 0
                    }, "", 0, "",
                    false);
            }
        }
        if (state.currentpageid) {
            currentpageid = state.currentpageid;
            var sit = state.find(state.currentpageid);
            // there is still an interaction open, close it
            if (sit != null) {
                state.exitInteraction(sit.page_nr, sit.ia_nr, {
                        success: false,
                        score: 0
                    }, "", 0, "",
                    false);
            }

        }

        // Save completed when a learning object is completed
        if (state.getCompletionStatus() == "completed") {
            var statement = {
                actor: actor,
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/completed",
                    display: {
                        "en-US": "completed"
                    }
                },
                object: {
                    objectType: "Activity",
                    id: baseUrl() + state.templateId,
                    definition: {
                        name: {
                            "en": x_params.name
                        }
                    }
                },
                result: {
                    completion: true,
                    success: (state.getSuccessStatus() == "passed"),
                    score: {
                        min: 0.0,
                        max: 100.0,
                        raw: state.getdRawScore(),
                        scaled: state.getdScaledScore()
                    },
                    duration: calcDuration(state.start, new Date()),
                    extensions: {
                        "http://xerte.org.uk/xapi/trackingstate": JSON.stringify(state)
                    }
                },
                timestamp: new Date()
            };
            statement.object.definition.name[state.language] = x_params.name;
            SaveStatement(statement, false);
            if (state.getSuccessStatus() == "passed") {
                // Sen passsed
                var statement = {
                    actor: actor,
                    verb: {
                        id: "http://adlnet.gov/expapi/verbs/passed",
                        display: {
                            "en-US": "passed"
                        }
                    },
                    object: {
                        objectType: "Activity",
                        id: baseUrl() + state.templateId,
                        definition: {
                            name: {
                                "en": x_params.name
                            }
                        }
                    },
                    result: {
                        completion: true,
                        success: true,
                        score: {
                            min: 0.0,
                            max: 100.0,
                            raw: state.getdRawScore(),
                            scaled: state.getdScaledScore()

                        },
                        duration: calcDuration(state.start, new Date())
                    },
                    timestamp: new Date()
                };
                statement.object.definition.name[state.language] = x_params.name;
                SaveStatement(statement, false);
            } else {
                // Send failed
                var statement = {
                    actor: actor,
                    verb: {
                        id: "http://adlnet.gov/expapi/verbs/failed",
                        display: {
                            "en-US": "failed"
                        }
                    },
                    object: {
                        objectType: "Activity",
                        id: baseUrl() + state.templateId,
                        definition: {
                            name: {
                                "en": x_params.name
                            }
                        }
                    },
                    result: {
                        completion: true,
                        success: false,
                        score: {
                            min: 0.0,
                            max: 100.0,
                            raw: state.getdRawScore(),
                            scaled: state.getdScaledScore()

                        },
                        duration: calcDuration(state.start, new Date()),
                    },
                    timestamp: new Date()
                };
                statement.object.definition.name[state.language] = x_params.name;
                SaveStatement(statement, false);
            }
            // Save scored
            var statement = {
                actor: actor,
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/scored",
                    display: {
                        "en-US": "scored"
                    }
                },
                object: {
                    objectType: "Activity",
                    id: baseUrl() + state.templateId,
                    definition: {
                        name: {
                            "en": x_params.name
                        }
                    }
                },
                result: {
                    completion: true,
                    success: (state.getSuccessStatus() == "passed"),
                    score: {
                        min: 0.0,
                        max: 100.0,
                        raw: state.getdRawScore(),
                        scaled: state.getdScaledScore()

                    },
                    duration: calcDuration(state.start, new Date())
                },
                timestamp: new Date()
            };
            statement.object.definition.name[state.language] = x_params.name;
            SaveStatement(statement, false);

        }

        // Save exited
        var statement = {
            actor: actor,
            verb: {
                id: "http://adlnet.gov/expapi/verbs/exited",
                display: {
                    "en": "exited"
                }
            },
            object: {
                objectType: "Activity",
                id: baseUrl() + state.templateId,
                definition: {
                    name: {
                        "en": x_params.name
                    }
                }
            },
            result: {
                completion: (state.getCompletionStatus() == 'completed'),
                success: (state.getSuccessStatus() == 'passed'),
                score: {
                    min: 0.0,
                    max: 100.0,
                    raw: state.getdRawScore(),
                    scaled: state.getdScaledScore()
                },
                extensions: {
                    "http://xerte.org.uk/xapi/trackingstate": JSON.stringify(
                        state)
                },
                duration: calcDuration(state.start, new Date())
            },
            timestamp: new Date()
        };
        statement.object.definition.name[state.language] = x_params.name;
        SaveStatement(statement, false);
        if (typeof lti_enabled !== 'undefined' && lti_enabled) {
            // Send ajax request to store grade through LTI to gradebook
            var url = window.location.href;
            if (url.indexOf("lti_launch.php") >= 0) {
                url = url.replace("lti_launch.php", "website_code/php/lti/sendgrade.php");
            } else if (url.indexOf("lti2_launch.php") >= 0) {
                url = url.replace("lti2_launch.php", "website_code/php/lti/sendgrade.php");
            } else {
                url = "";
            }
            if (url.length > 0) {
                $.ajax({
                        method: "POST",
                        url: url,
                        data: {
                            grade: state.getdScaledScore()
                        }
                    })
                    .done(function(msg) {
                        //alert("Data Saved: " + msg);
                    });
            }
        }
    }
}

function SaveStatement(statement, async) {
    var key = "http://xerte.org.uk/sessionId";
    extension = {
        "http://xerte.org.uk/sessionId": state.sessionId,
        "http://xerte.org.uk/learningObjectId": baseUrl() + state.templateId,
        "http://xerte.org.uk/learningObjectTitle": $("<div>").html(x_params.name).text() + " (" +
            state.templateId + ")"
    };
    if (state.coursename != "") {
        extension["http://xerte.org.uk/course"] = state.coursename;
    }
    if (state.modulename != "") {
        extension["http://xerte.org.uk/module"] = state.modulename;
    }
    if (typeof statement.context == "undefined") {
        statement.context = {
            "extensions": extension
        };
    } else if (typeof statement.context.extensions == "undefined") {
        statement.context.extensions = extension;
    } else {
        // Loop over all keys in extension and add to existing extension
        $.each(extension, function(key, value) {
            statement.context.extensions[key] = value;
        });
    }
    var parentId = baseUrl() + state.templateId;
    if (statement.object.id != parentId) {
        if (typeof statement.context.contextActivities == "undefined") {
            statement.context.contextActivities = {};
        }
        var parentObj = {
            "definition": {
                "name": {
                    "en-US": x_params.name + " (" + state.templateId + ")"
                }
            },
            "id": parentId,
            "objectType": "Activity"
        };
        parentObj.definition.name[state.language] = x_params.name + " (" + state.templateId + ")";
        statement.context.contextActivities.parent = [parentObj];
    }
    if (state.category != "") {
        //Place Xerte Category in contextActivities/Other, NOT in categoryContext/category, because that is used for different puposes by xAPI
        if (typeof statement.context.contextActivities == "undefined") {
            statement.context.contextActivities = {};
        }
        if (typeof statement.context.contextActivities.other == "undefined") {
            statement.context.contextActivities.other = [{
                id: baseUrl() + state.category.replace(/[\/ ]/g, "_")
            }];
        } else {
            statement.context.contextActivities.other.push({
                id: baseUrl() + state.category.replace(/[\/ ]/g, "_")
            });
        }
    }
    if (state.course != "") {
        //Place course in contextActivities/Other
        if (typeof statement.context.contextActivities == "undefined") {
            statement.context.contextActivities = {};
        }
        if (typeof statement.context.contextActivities.other == "undefined") {
            statement.context.contextActivities.other = [state.course];
        } else {
            statement.context.contextActivities.other.push(state.course);
        }
    }
    if (state.module != "") {
        //Place module in contextActivities/Other
        if (typeof statement.context.contextActivities == "undefined") {
            statement.context.contextActivities = {};
        }
        if (typeof statement.context.contextActivities.other == "undefined") {
            statement.context.contextActivities.other = [state.module];
        } else {
            statement.context.contextActivities.other.push(state.module);
        }
    }
    if (state.group != "") {
        // Place in context team
        statement.context.team = state.group;
    }

    /*
    statement = new TinCan.Statement(statement);
    statement.id = null;
    if (typeof async == 'undefined')
    {
        async = true;
    }
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
    */
    statement.id = null;
    statement.timestamp = new Date();
    if (typeof async == 'undefined') {
        async = true;
    }
    if (async) {
        ADL.XAPIWrapper.sendStatement(statement, function(err, res, body) {
            ADL.XAPIWrapper.log("[" + body.id + "]: " + res.status +
                " - " + res.statusText);
        });
    } else {
        var res = ADL.XAPIWrapper.sendStatement(statement);
        ADL.XAPIWrapper.log("[" + res.id + "]: " + res.xhr.status + " - " + res
            .xhr.statusText);
    }

}

function XTResults(fullcompletion) {
    var completion = 0;
    var nrcompleted = 0;
    var nrvisited = 0;
    var completed;
    $.each(state.completedPages, function(i, completed) {
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
        } else {
            completion = Math.round((nrcompleted / state.toCompletePages.length) *
                100);
        }
    } else {
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
        if (state.interactions[i].ia_nr < 0 || state.interactions[i].nrinteractions >
            0) {

            var interaction = {};
            interaction.score = Math.round(state.interactions[i].score);
            interaction.title = state.interactions[i].ia_name;
            interaction.type = state.interactions[i].ia_type;
            interaction.correct = state.interactions[i].result;
            interaction.duration = Math.round(state.interactions[i].duration /
                1000);
            interaction.weighting = state.interactions[i].weighting;
            interaction.subinteractions = Array();

            var j = 0;
            for (j; j < state.toCompletePages.length; j++) {
                var currentPageNr = state.toCompletePages[j];
                if (currentPageNr == state.interactions[i].page_nr) {
                    if (state.completedPages[j]) {
                        interaction.completed = "true";
                    } else if (!state.completedPages[j]) {
                        interaction.completed = "false";
                    } else {
                        interaction.completed = "unknown";
                    }
                }
            }

            results.interactions[nrofquestions] = interaction;
            totalDuration += state.interactions[i].duration;
            nrofquestions++;
            totalWeight += state.interactions[i].weighting;

        } else if (results.mode == "full-results") {
            var subinteraction = {};

            var learnerAnswer, correctAnswer;
            switch (state.interactions[i].ia_type) {
                case "match":
                    for (var c = 0; c < state.interactions[i].correctOptions.length; c++) {
                        var matchSub = {}; //Create a subinteraction here for every match sub instead
                        correctAnswer = state.interactions[i].correctOptions[c]
                            .source + ' --> ' + state.interactions[i].correctOptions[
                                c].target;
                        source = state.interactions[i].correctOptions[c].source;
                        if (state.interactions[i].learnerOptions.length == 0) {
                            learnerAnswer = source + ' --> ' + ' ';
                        } else {
                            for (var d = 0; d < state.interactions[i].learnerOptions
                                .length; d++) {
                                if (source == state.interactions[i].learnerOptions[
                                        d].source) {
                                    learnerAnswer = source + ' --> ' + state.interactions[
                                        i].learnerOptions[d].target;
                                    break;
                                } else {
                                    learnerAnswer = source + ' --> ' + ' ';
                                }
                            }
                        }

                        matchSub.question = state.interactions[i].ia_name;
                        matchSub.correct = (learnerAnswer === correctAnswer);
                        matchSub.learnerAnswer = learnerAnswer;
                        matchSub.correctAnswer = correctAnswer;
                        results.interactions[nrofquestions - 1].subinteractions
                            .push(matchSub);
                    }

                    break;
                case "text":
                    learnerAnswer = state.interactions[i].learnerAnswers;
                    correctAnswer = state.interactions[i].correctAnswers;
                    break;
                case "multiplechoice":
                    learnerAnswer = state.interactions[i].learnerAnswers[0] !=
                        undefined ? state.interactions[i].learnerAnswers[0] :
                        "";
                    for (var j = 1; j < state.interactions[i].learnerAnswers.length; j++) {
                        learnerAnswer += "\n" + state.interactions[i].learnerAnswers[
                            j];
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
                    correctAnswer = "-"; // Not applicable
                    //TODO: We don't have a good example of an interactivity where the numeric type has a correctAnswer. Currently implemented for the survey page.
                    break;
                case "fill-in":
                    learnerAnswer = state.interactions[i].learnerAnswers;
                    correctAnswer = state.interactions[i].correctAnswers;
                    break;
            }
            if (state.interactions[i].ia_type != "match" && state.interactions[i].result != undefined) {
                subinteraction.question = state.interactions[i].ia_name;
                subinteraction.correct = state.interactions[i].result.success;
                subinteraction.learnerAnswer = learnerAnswer;
                subinteraction.correctAnswer = correctAnswer;
                results.interactions[nrofquestions - 1].subinteractions.push(
                    subinteraction);
            }
        }
    }
    results.completion = completion;
    results.score = score;
    results.nrofquestions = nrofquestions;
    results.averageScore = Math.round(state.getdScaledScore() * 10000.0) / 100.0;
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
