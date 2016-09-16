//TODO: get user email, more verbs (passed/failed, completed, ect), define scormmode for xAPI
var scorm=false,
    lrsInstance,
	lrsUsername = "",
	lrsPassword = "",
	lrsEndpoint = "",
    userEMail;

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
			console.log("Failed LRS setup. Error: " + ex);
		}	
	}

	if(lrsInstance != undefined)
    {
        var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/launched"
                },
                target: {
                    id: " "
                    //TODO: get the name for this activity
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
                    // TODO: do something with success (possibly ignore)
                }
            }
        );
    }
}

function XTTrackingSystem()
{
    return "";
}

function XTLogin(login, passwd)
{
    var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/logged-in"
                },
                target: {
                    id: "."
                }
            }
        );
    
    SaveStatement(statement);
    
    // TODO: Compare the login and the password with credentials from the LRS.
	
    return true;
}

function XTGetMode()
{
    return "normal";
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

}

function XTEnterPage(page_nr, page_name)
{
    var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/initialized"
                },
                target: {
                    id: "page " + page_nr + ": " + page_name + "."
                }
            }
        );
    
    SaveStatement(statement);
}

function XTExitPage(page_nr)
{
    var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/exited"
                },
                target: {
                    id: "page " + page_nr + "."
                }
            }
        );
    
    SaveStatement(statement);
}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting)
{


}

function XTSetPageScore(page_nr, score)
{
    var statement = new TinCan.Statement(
        {
            actor: {
                mbox: userEMail
            },
            verb: {
                id: "http://adlnet.gov/expapi/verbs/scored"
            },
            target: {
                id: score + " on activity " + page_nr + "."
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
                // TODO: do something with success (possibly ignore)
            }
        }
    );
}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctanswer, feedback)
{
	// TODO: Is there a statement needed here?
}

function XTExitInteraction(page_nr, ia_nr, ia_type, result, learneranswer, feedback)
{
    var statement = new TinCan.Statement(
        {
            actor: {
                mbox: userEMail
            },
            verb: {
                id: "http://adlnet.gov/expapi/verbs/answered"
            },
            target: {
                id: learneranswer + " on question " + ia_nr + "."
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
                // TODO: do something with success (possibly ignore)
            }
        }
    );
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