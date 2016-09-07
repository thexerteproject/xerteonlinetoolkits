var scorm=false;
var lrsInstance;
var lrsUsername = "";
var lrsPassword = "";
var lrsEndpoint = "";


function XTInitialise()
{
	if(lrsInstance == undefined){
		try{
			lrsInstance = new TinCan.LRS(
				{
		            endpoint: lrsEndpoint,
		            username: lrsUsername,
		            password: lrsPassword,
		            allowFail: false
		        }
			);
		}
		catch(ex)
		{
			console.log("Failed lrs setup. Error: " + ex);
		}	
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
	//example from http://rusticisoftware.github.io/TinCanJS/
	var statement = new TinCan.Statement(
		    {
		        actor: {
		            mbox: "mailto:info@tincanapi.com"
		        },
		        verb: {
		            id: "http://adlnet.gov/expapi/verbs/experienced"
		        },
		        target: {
		            id: "http://rusticisoftware.github.com/TinCanJS"
		        }
		    }
		);
	lrsInstance.saveStatement(
		    statement,
		    {
		        callback: function (err, xhr) {
		            if (err !== null) {
		                if (xhr !== null) {
		                    console.log("Failed to save statement: " + xhr.responseText + " (" + xhr.status + ")");
		                    // TODO: do something with error, didn't save statement
		                    return;
		                }

		                console.log("Failed to save statement: " + err);
		                // TODO: do something with error, didn't save statement
		                return;
		            }

		            console.log("Statement saved");
		            // TOOO: do something with success (possibly ignore)
		        }
		    }
		);
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
    window.opener.innerWidth+=2;
	window.opener.innerWidth-=2;
}