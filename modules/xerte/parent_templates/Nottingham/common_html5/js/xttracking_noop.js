/**
 * Created with JetBrains PhpStorm.
 * User: tom
 * Date: 28-3-13
 * Time: 11:47
 * To change this template use File | Settings | File Templates.
 */

var scorm=false;

function XTInitialise()
{

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

}

function XTEnterPage(page_nr, page_name)
{
    //alert("Opening page " + page_nr + ": " + page_name);
}

function XTExitPage(page_nr)
{
    //alert("Leaving page " + page_nr + ": " + page_name);
}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting)
{

}

function XTSetPageScore(page_nr, score)
{

}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctanswer, feedback)
{

}

function XTExitInteraction(page_nr, ia_nr, ia_type, result, learneranswer, feedback)
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
    window.opener.innerWidth+=3;
    window.opener.innerWidth-=3;
}