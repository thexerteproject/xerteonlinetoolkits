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

/* _____MCQ POPCORN PLUGIN_____
Adds question - can be radio buttons, drop down list or buttons
Can be on panel or overlay a video

required: target start name text type button|radio|list answerType single|multiple clearPanel* pauseMedia*
optional: end feedback position* line overlay
language: feedbackLabel singleRight singleWrong multiRight multiWrong checkBtnTxt continueBtnTxt topOption

childNodes (synchMCQOption):
required: text correct
optional: feedback page synch play enable

*dealt with in mediasiteLesson.html

*/


(function (Popcorn) {
	Popcorn.plugin("mcq", function(popOptions) {

		// define plugin wide variables / functions here
		var $target, $optHolder, $checkBtn, $feedbackDiv, media, selected, judge, autoEnable, questions;
		var finishTracking = function(popOptions) {
            var allValid = true;
            var ia_nr = Number(popOptions.tracking_nr);
            var numOfQuestions = Number(popOptions.total_questions);
            for (var i = 0; i < popOptions.childNodes.length; i++) {
                var curValid = false;
                for (var j = 0; j < selected.length; j++) {
                    if (i == selected[j] && popOptions.childNodes[i].getAttribute("correct") == "false") {
                        allValid = false;
                    }
                    if (i == selected[j] && popOptions.childNodes[i].getAttribute("correct") == "true") {
                        curValid = true;
                    }
                }
                if (!curValid && popOptions.childNodes[i].getAttribute("correct") == "true") {
                    allValid = false;
                }
            }
            var l_popOptions = [];
            var l_answers = [];
            var l_feedback = [];
            $(selected).each(function (i, v) {
                l_popOptions.push({
					id: (v + 1) + "",
					answer: x_GetTrackingTextFromHTML(popOptions.childNodes[v].getAttribute("text"), (v+1) + ""),
					result: popOptions.childNodes[i].getAttribute("correct") === "true"
            	});

                l_answers.push(x_GetTrackingTextFromHTML(popOptions.childNodes[v].getAttribute("text"), (v+1) + ""));
                l_feedback.push("");
            });
            mediasiteLesson.questions[ia_nr] = true;
            var scormScore = 0;
            if (ia_nr == numOfQuestions-1) {
                var score = 0;
                for (var i=0; i<numOfQuestions; i++)
                {
                    if (mediasiteLesson.questions[i])
                    {
                        score++;
                    }
                }
                scormScore = Math.ceil(score / numOfQuestions * 100);
            }
			var result =
				{
					success: allValid,
					score: scormScore
				};
            XTExitInteraction(x_currentPage, ia_nr, result, l_popOptions, l_answers, l_feedback, x_currentPageXML.getAttribute("trackinglabel"));
            XTSetPageScore(x_currentPage, scormScore, x_currentPageXML.getAttribute("trackinglabel"));
            mediasiteLesson.enableControls(media.media, true);
        }
		
		var answerSelected = function() {
			// put together feedback string;
			var feedbackTxt = "",
				action = -1,
				enable = false;
			
			// general feedback
			if (popOptions.feedback != undefined && popOptions.feedback != "") {
				feedbackTxt += '<div class="feedback">' + x_addLineBreaks(popOptions.feedback) + '</div>';
			}
			
			// selected option feedback
			for (var i=0; i<selected.length; i++) {
				var index = selected[i];
				if (popOptions.childNodes[index].getAttribute("feedback") != undefined && popOptions.childNodes[index].getAttribute("feedback") != "") {
					feedbackTxt += '<div class="feedback">' + x_addLineBreaks(popOptions.childNodes[index].getAttribute("feedback")) + '</div>';
				}
				if ((popOptions.childNodes[index].getAttribute("page") != undefined && popOptions.childNodes[index].getAttribute("page") != "") || (popOptions.childNodes[index].getAttribute("synch") != undefined && popOptions.childNodes[index].getAttribute("synch") != "") || popOptions.childNodes[index].getAttribute("play") == "true") {
					action = index;
				}
			}
			

			// feedback if question has true/false answers
			if (judge == true) {
				var fb;
				finishTracking(popOptions);
				if (popOptions.answerType == "multiple" && popOptions.type == "radio") {
					fb = "multiRight";
					for (var i=0; i<popOptions.childNodes.length; i++) {
						if ($.inArray(i, selected) >= 0) {
							if (popOptions.childNodes[i].getAttribute("correct") == "false") {
								fb = "multiWrong";
								break;
							}
						} else {
							if (popOptions.childNodes[i].getAttribute("correct") == "true") {
								fb = "multiWrong";
								break;
							}
						}
					}
					if (fb == "multiRight") {
						enable = true;
					}
					
				} else {
					fb = "singleRight";
					for (var i=0; i<selected.length; i++) {
						if (popOptions.childNodes[selected[i]].getAttribute("correct") == "false") {
							fb = "singleWrong";
							break;
						}
					}
					if (fb == "singleRight") {
						enable = true;
					}
				}
				
			
				feedbackTxt += popOptions[fb] != "" ? '<div class="feedback">' + popOptions[fb] + '</div>' : "";
			}

			if (popOptions.childNodes[index].getAttribute("enable") == "true" || (enable == true && ((popOptions.childNodes[index].getAttribute("page") == undefined || popOptions.childNodes[index].getAttribute("page") == "") && (popOptions.childNodes[index].getAttribute("synch") == undefined || popOptions.childNodes[index].getAttribute("synch") == "")))) {
				// controls will be enabled if correct answer selected unless there is a 'go to page' or 'go to synch point' action associated with it
				mediasiteLesson.enableControls(media.media, true);
			}
			
			// automatically enable if the question has been set up so there's no answer that will enable them
			if (autoEnable == true) {
				mediasiteLesson.enableControls(media.media, true);
			}
			
			// show feedback if there is some, with button to do action afterwards (change page, media current time, play media)
			if (feedbackTxt != "") {
				var feedbackLabel = popOptions.feedbackLabel != "" ? '<h5>' + popOptions.feedbackLabel + '</h5>' : "";
				
				$feedbackDiv
					.html(feedbackLabel + feedbackTxt)
					.show();
				
				if (action >= 0) {
					$('<button>')
						.appendTo($feedbackDiv)
						.button({"label": popOptions.continueBtnTxt != "" ? popOptions.continueBtnTxt : "Continue"})
						.click(function() {
							doAction(action);
						});
				}
			
			// no feedback needed so do change page / play / change media current time immediately
			} else if (action >= 0) {
				doAction(action);
			}
		};
		
		
		
		var doAction = function(index) {
			if (popOptions.childNodes[index].getAttribute("page") != undefined && popOptions.childNodes[index].getAttribute("page") != "") {
				// change LO page
				var pageNum = x_lookupPage("linkID", popOptions.childNodes[index].getAttribute("page"));
				if (pageNum != null) {
					x_navigateToPage(false, {type:"linkID", ID:popOptions.childNodes[index].getAttribute("page")});
				} else if ($.isNumeric(popOptions.childNodes[index].getAttribute("page"))) { // for backwards compatibility - page used to be number but now it uses pageList in editor
					x_changePage(popOptions.childNodes[index].getAttribute("page") - 1)
				}
			} else {
				if (popOptions.childNodes[index].getAttribute("synch") != undefined && popOptions.childNodes[index].getAttribute("synch") != "") {
					// jump media position
					if (popOptions.childNodes[index].getAttribute("synch")[0] == "+") { // relative to current position
						media.currentTime(media.currentTime() + Number(popOptions.childNodes[index].getAttribute("synch").slice(1)));
					} else {
						media.currentTime(popOptions.childNodes[index].getAttribute("synch"));
					}
				}
				if (popOptions.childNodes[index].getAttribute("play") == "true") {
					// play media
					media.play();
				}
			}
			mediasiteLesson.enableControls(media.media, true);
		}

		return {
			_setup: function(popOptions) {
				media = this;
				judge = false;
				autoEnable = true;
				var tempEnable = false;
				
				// is it to appear over media?
				if (popOptions.overlay == "true" && (this.video != undefined || $(this.audio).closest(".mediaHolder").find(".audioImg").length > 0)) {
					var $parent;
					if (this.video != undefined) {
						$parent = $(this.media).parent();
					} else {
						$parent = $(this.media).closest(".mediaHolder").find(".audioImgHolder");
					}
					
					// move mcqHolder to overlay media
					$("#" + popOptions.target)
						.appendTo($parent)
						.removeClass("contentBlock")
						.addClass("overlay");
					
					$target = $('<div class="holder"/>').appendTo($("#" + popOptions.target));
				} else {
					$target = $("#" + popOptions.target);
				}
				
				$target
					.append(popOptions.name != "" ? '<h4>' + popOptions.name + '</h4>' + x_addLineBreaks(popOptions.text) : x_addLineBreaks(popOptions.text))
					.hide();
				
				$optHolder = $('<div class="optionHolder"/>').appendTo($target);
				
				if ($(popOptions.childNodes).length == 0) {
					$optHolder.html('<span class="alert">' + x_getLangInfo(x_languageData.find("errorQuestions")[0], "noA", "No answer popOptions have been added") + '</span>');
				} else {
					// create answer popOptions (could be buttons, radio list or drop down menu)
					$(popOptions.childNodes).each(function(i) {
						if (judge == false && this.getAttribute("correct") == "true") {
							judge = true;
							autoEnable = false;
						}
						
						if (tempEnable == false && ((this.getAttribute("page") != undefined && this.getAttribute("page") != "") || (this.getAttribute("synch") == undefined && this.getAttribute("synch") == "") || this.getAttribute("play") == "true" || this.getAttribute("enable") == "true")) {
							tempEnable = true;
						}
						
						var authorSupport = "";
						if (x_params.authorSupport == "true") {
							if (this.getAttribute("synch") != undefined && this.getAttribute("synch") != "") {
								var skipTxt = x_currentPageXML.getAttribute("supportSkip") != undefined ? x_currentPageXML.getAttribute("supportSkip") : "skip";
								authorSupport += ' <span class="alert">[' + skipTxt + ":" + this.getAttribute("synch") + ']</span>';
							}
							if (this.getAttribute("page") != undefined && this.getAttribute("page") != "") {
								var pageNum = x_lookupPage("linkID", this.getAttribute("page")),
									skipTxt = x_currentPageXML.getAttribute("supportPage") != undefined ? x_currentPageXML.getAttribute("supportPage") : "page";
								if (pageNum != null) {
									authorSupport += ' <span class="alert">[' + skipTxt + ":" + x_pages[pageNum].getAttribute("name") + ']</span>';
								} else if ($.isNumeric(this.getAttribute("page"))) {
									authorSupport += ' <span class="alert">[' + skipTxt + ":" + this.getAttribute("page") + ']</span>';
								}
							}
						}
						
						if (popOptions.type == "button") {
							$('<button/>')
								.appendTo($optHolder)
								.button({"label": this.getAttribute("text") + authorSupport})
								.click(function() {
									$feedbackDiv.html("");
									selected = [i];
									
									answerSelected();
								});
							
							$optHolder.addClass("centre");
							
						} else {
							if (popOptions.type == "radio") {
								var type = "radio";
								if (popOptions.answerType == "multiple") {
									type = "checkbox";
								}
								
								var $optGroup = $('<div class="optionGroup"></div>').appendTo($optHolder),
									$option = $('<input type="' + type + '" name="option" />').appendTo($optGroup),
									$optionTxt = $('<label class="optionTxt"/>').appendTo($optGroup);
								
								$option
									.attr({
										"id": popOptions.target + "_option" + i,
										"value": this.getAttribute("text")
									})
									.data("index", i)
									.change(function() {
										$feedbackDiv.html("");
										var $selected = $optHolder.find("input:checked");
										
										if ($checkBtn.is(":enabled") && $selected.length == 0) {
											$checkBtn.button("disable");
										} else if ($checkBtn.is(":disabled") && $selected.length > 0) {
											$checkBtn.button("enable");
										}
										
										if(popOptions.enableTracking != "true")
										{
											$checkBtn.show();
										}
																				
										selected = [];
										$selected.each(function() {
											selected.push($(this).data("index"));
										});
									})
									.focusin(function() {
										$optGroup.addClass("highlight");
									})
									.focusout(function() {
										$optGroup.removeClass("highlight");
									});
								
								$optionTxt
									.html(x_addLineBreaks(this.getAttribute("text")) + authorSupport)
									.attr("for", popOptions.target + "_option" + i)
									.data("option", $option);
								
							} else if (popOptions.type == "list") {
								var $optGroup;
								
								if ($optHolder.find("select").length == 0) {
									$optGroup = $('<select></select>').appendTo($optHolder);
									
									$optGroup
										.append('<option>')
										.change(function() {
											$feedbackDiv.html("");
											
											if ($checkBtn.is(":enabled") && this.selectedIndex == 0) {
												$checkBtn.button("disable");
											} else if ($checkBtn.is(":disabled") && this.selectedIndex > 0) {
												$checkBtn.button("enable");
											}
											if(popOptions._id.enableTracking != "true")
											{
												$checkBtn.show();
											}
											
											selected = [this.selectedIndex-1];
										})
										.css("font-size", $x_body.css("font-size"))
										.find("option").html(popOptions.topOption);
									
								} else {
									$optGroup = $optHolder.find("select");
								}
								
								var $option = $('<option/>').appendTo($optGroup);
								
								$option
									.attr("value", this.getAttribute("text"))
									.html(this.getAttribute("text") + authorSupport);
							}
						}
					});
					
					if (tempEnable == true && autoEnable == true) { // prevent automatic enabling of controls if an answer has an action that will enable anyway
						autoEnable = false;
					}
					
					// unless it's a button question there needs to be a submit answer button
					if (popOptions.type != "button") {
						$checkBtn = $('<button class="mcqCheckBtn"></button>').appendTo($target);
						$checkBtn
							.button({
								"label":	popOptions.checkBtnTxt != "" ? popOptions.checkBtnTxt : "Check",
								"disabled":	true
							})
							.click(function() {
								answerSelected();
								$checkBtn.hide();
							});
					}
					
					$feedbackDiv = $('<div class="mcqFeedback"></div>')
						.appendTo($target)
						.hide();
					
					$target.append('<div class="bottom"/>');
				}
				
				if (popOptions.line == "true") {
					if (popOptions.position == "top") {
						$target.append("<hr/>");
					} else {
						$target.prepend("<hr/>");
					}
				}
			},
			
			start: function(event, popOptions) {
				// fire on popOptions.start
				var correctPopOptions = [];
				var correctAnswers = [];
				var correctFeedback = [];
				var ia_nr = Number(popOptions.tracking_nr);
				$(popOptions.childNodes).each(function(i, v){
					correctPopOptions.push(
						{
							id: (i+1)+"",
							answer: x_GetTrackingTextFromHTML(v.getAttribute("text"), (i+1)+""),
							result: v.getAttribute("correct") == "true"
						}
						);
					correctAnswers.push(x_GetTrackingTextFromHTML(v.getAttribute("text"), (i+1)+""));
					correctFeedback.push(v.getAttribute("correct") == "true" ? "Correct" : "Incorrect");
				});
				XTEnterInteraction(x_currentPage, ia_nr, 'multiplechoice', x_GetTrackingTextFromHTML(popOptions.text, ia_nr + ""), correctPopOptions, correctAnswers, correctFeedback, x_currentPageXML.getAttribute("trackinglabel"));
				if ($(popOptions.childNodes).length > 0) {
					// reset any previous answers given
					if (popOptions.type == "radio") {
						$optHolder.find("input:checked").each(function() {
							this.checked = false;
						});
					} else if (popOptions.type == "list") {
						$optHolder.find("select")[0].selectedIndex = 0;
					}
					selected = [];
					
					$feedbackDiv
						.html("")
						.hide()
						.find("button").remove();
					
					if ($checkBtn) {
						$checkBtn
							.show()
							.button("disable");
					}
					
					if (popOptions.disable == "true") {
						mediasiteLesson.enableControls(this.media, false);
					} else {
						mediasiteLesson.enableControls(this.media, true);
					}
				}
				$target.show();
			},
			
			end: function(event, popOptions) {
				// fire on popOptions.end
				mediasiteLesson.enableControls(this.media, true);
				$target.hide();
			}
		};
		
	});
})(Popcorn);