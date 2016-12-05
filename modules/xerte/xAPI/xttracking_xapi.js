//TODO: get user email, more verbs (passed/failed, completed, ect), define scormmode for xAPI
var scorm=false,
    lrsInstance,
    userEMail = "mailto:email@test.com";

var trackingMode = "none",
	mode = "none",
	scoremode = "first",
	nrpages,
	lo_completed,
	lo_passed;

function XTInitialise()
{
	
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
			alert("Failed LRS setup. Error: " + ex);
		}	
	}

	if(lrsInstance != undefined)
    {
		this.initStamp = new Date();
		
        var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/launched"
                },
                target: {
                    id: "http://rusticisoftware.github.com/TinCanJS"
                    //TODO: get the name for this activity
                },
                timestamp: this.initStamp
            }
        );

        SaveStatement(statement);
    }
}

function XTTrackingSystem()
{
    return "";
}

function XTLogin(login, passwd)
{
	this.loginStamp = new Date();
	
    var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/logged-in"
                },
                target: {
                    id: "http://rusticisoftware.github.com/TinCanJS"
                },
                timestamp: this.loginStamp
            }
        );
    
    SaveStatement(statement);
    
    // TODO: Compare the login and the password with credentials from the LRS.
	
    return true;
}

function XTGetMode()
{
    return mode;
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
            nrpages = value;
            break;
        case "tracking-mode":
            switch(value)
            {
                case 'full_first':
                    trackingmode = 'full';
                    scoremode = 'first';
                    mode = "normal";
                    break;
                case 'minimal_first':
                    trackingmode = 'minimal';
                    scoremode = 'first';
                    mode = "normal";
                    break;
                case 'full':
                    trackingmode = 'full';
                    scoremode = 'last';
                    mode = "normal";
                    break;
                case 'minimal':
                    trackingmode = 'minimal';
                    scoremode = 'last';
                    mode = "normal";
                    break;
                case 'none':
                    trackingmode = 'none';
                    mode = "no-tracking";
                    break;
            }
            break;
        case "completed":
            lo_completed = value;
            break;
        case "objective_passed":
        	lo_passed = Number(value);
            break;
    }
}

function XTEnterPage(page_nr, page_name)
{
	this.pageStart = new Date();
	
    var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/initialized"
                },
                target: {
                    id: "http://rusticisoftware.github.com/TinCanJS"
                },
                timestamp: this.pageStart              	
                
            }
        );
    
    SaveStatement(statement);
}

function XTExitPage(page_nr)
{
	this.exitPageStamp = new Date();
	
    var statement = new TinCan.Statement(
            {
                actor: {
                    mbox: userEMail
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/exited"
                },
                target: {
                    id: "http://rusticisoftware.github.com/TinCanJS"
                },
                timestamp: this.exitPageStamp
            }
        );
    
    SaveStatement(statement);
}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting)
{


}

function XTSetPageScore(page_nr, score)
{
	this.pageEnd = new Date();
	var pageDuration = this.pageEnd.getTime() - this.pageStart.getTime();
	
    var statement = new TinCan.Statement(
        {
            actor: {
                mbox: userEMail
            },
            verb: {
                id: "http://adlnet.gov/expapi/verbs/scored"
            },
            target: {
                id: "http://xerte.org.uk/xapi/questions/" + page_nr
            },
            result:{
                "completion": true,
	            "success": score >= lo_passed,
	            "score": {
	              "scaled": score / 100
	            },
            	"duration": pageDuration
            },
            timestamp: this.pageEnd
            
        }
    );

    SaveStatement(statement);
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
                id: "http://rusticisoftware.github.com/TinCanJS"
            }
        }
    );

    SaveStatement(statement);
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

function SaveStatement(statement)
{
	statement.id = null;
	lrsInstance.saveStatement(
        statement,
        {
            callback: function (err, xhr) {
                if (err !== null) {
                    if (xhr !== null) {
                        alert("Failed to save statement: " + xhr.responseText + " (" + xhr.status + ")");
                        // TODO: handle error accordingly when needed
                        return;
                    }

                    alert("Failed to save statement: " + err);
                    // TODO: handle error accordingly when needed
                    return;
                }

            }
        }
    );
}
