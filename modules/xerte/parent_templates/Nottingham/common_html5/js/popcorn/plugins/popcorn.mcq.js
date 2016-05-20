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

*dealt with in mediaLesson.html

*/


(function (Popcorn) {
	Popcorn.plugin("mcq", function(options) {
		
		// define plugin wide variables / functions here
		var $target, $optHolder, $checkBtn, $feedbackDiv, media, selected, judge, autoEnable, questions;
		
		var finishTracking = function(options)
		{
			if(options.enableTracking == "true"){
				window.questionsAnswerd++;
				var allValid = true;
				for (var i=0; i<options.childNodes.length; i++)
				{
					var curValid = false;
					for(var j = 0;j<selected.length;j++)
					{
						if(i == selected[j] && options.childNodes[i].getAttribute("correct") == "false")
						{
							allValid = false;
						}
						if(i == selected[j] && options.childNodes[i].getAttribute("correct") == "true")
						{
							curValid = true;
						}
					}
					if(!curValid && options.childNodes[i].getAttribute("correct") == "true")
					{
						allValid = false;
					}
				}
				l_options = [];
				l_answers = [];
				l_feedback = [];
				$(selected).each(function(i, v){
					l_options.push((i+1)+"");
					l_answers.push(options.childNodes[v].getAttribute("text"));
					l_feedback.push("correct");
				});
				if(allValid)
				{
					correctQuestions++;
				}
				
				XTExitInteraction(x_currentPage, window.questions[options._id].nr, allValid, l_options, l_answers, l_feedback);
				if(window.questionsAnswerd == this.numOfQuestions)
				{
					scormScore = Math.ceil(correctQuestions / this.numOfQuestions * 100);
					XTSetPageScore(x_currentPage, scormScore);
				}
				mediaLesson.enableControls(media.media, true);
				
			}
		}
		
		var answerSelected = function() {
			// put together feedback string;
			var feedbackTxt = "",
				action = -1,
				enable = false;
			
			// general feedback
			if (options.feedback != undefined && options.feedback != "") {
				feedbackTxt += '<div class="feedback">' + x_addLineBreaks(options.feedback) + '</div>';
			}
			
			// selected option feedback
			for (var i=0; i<selected.length; i++) {
				var index = selected[i];
				if (options.childNodes[index].getAttribute("feedback") != undefined && options.childNodes[index].getAttribute("feedback") != "") {
					feedbackTxt += '<div class="feedback">' + x_addLineBreaks(options.childNodes[index].getAttribute("feedback")) + '</div>';
				}
				if ((options.childNodes[index].getAttribute("page") != undefined && options.childNodes[index].getAttribute("page") != "") || (options.childNodes[index].getAttribute("synch") != undefined && options.childNodes[index].getAttribute("synch") != "") || options.childNodes[index].getAttribute("play") == "true") {
					action = index;
				}
			}
			

			// feedback if question has true/false answers
			if (judge == true) {
				var fb;
				finishTracking(options);
				if (options.answerType == "multiple" && options.type == "radio") {
					fb = "multiRight";
					for (var i=0; i<options.childNodes.length; i++) {
						if ($.inArray(i, selected) >= 0) {
							if (options.childNodes[i].getAttribute("correct") == "false") {
								fb = "multiWrong";
								break;
							}
						} else {
							if (options.childNodes[i].getAttribute("correct") == "true") {
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
						if (options.childNodes[selected[i]].getAttribute("correct") == "false") {
							fb = "singleWrong";
							break;
						}
					}
					if (fb == "singleRight") {
						enable = true;
					}
				}
				
			
				feedbackTxt += options[fb] != "" ? '<div class="feedback">' + options[fb] + '</div>' : "";
			}
			
			if (options.childNodes[index].getAttribute("enable") == "true" || (enable == true && ((options.childNodes[index].getAttribute("page") == undefined || options.childNodes[index].getAttribute("page") == "") && (options.childNodes[index].getAttribute("synch") == undefined || options.childNodes[index].getAttribute("synch") == "")))) {
				// controls will be enabled if correct answer selected unless there is a 'go to page' or 'go to synch point' action associated with it
				mediaLesson.enableControls(media.media, true);
			}
			
			// automatically enable if the question has been set up so there's no answer that will enable them
			if (autoEnable == true) {
				mediaLesson.enableControls(media.media, true);
			}
			
			// show feedback if there is some, with button to do action afterwards (change page, media current time, play media)
			if (feedbackTxt != "") {
				var feedbackLabel = options.feedbackLabel != "" ? '<h5>' + options.feedbackLabel + '</h5>' : "";
				
				$feedbackDiv
					.html(feedbackLabel + feedbackTxt)
					.show();
				
				if (action >= 0) {
					$('<button>')
						.appendTo($feedbackDiv)
						.button({"label": options.continueBtnTxt != "" ? options.continueBtnTxt : "Continue"})
						.click(function() {
							doAction(action);
						});
				}
			
			// no feedback needed so do change page / play / change media current time immediately
			} else if (action >= 0) {
				doAction(action);
			}
		}
		
		
		
		var doAction = function(index) {
			if (options.childNodes[index].getAttribute("page") != undefined && options.childNodes[index].getAttribute("page") != "") {
				// change LO page
				var pageNum = x_lookupPage("linkID", options.childNodes[index].getAttribute("page"));
				if (pageNum != null) {
					x_navigateToPage(false, {type:"linkID", ID:options.childNodes[index].getAttribute("page")});
				} else if ($.isNumeric(options.childNodes[index].getAttribute("page"))) { // for backwards compatibility - page used to be number but now it uses pageList in editor
					x_changePage(options.childNodes[index].getAttribute("page") - 1)
				}
			} else {
				if (options.childNodes[index].getAttribute("synch") != undefined && options.childNodes[index].getAttribute("synch") != "") {
					// jump media position
					if (options.childNodes[index].getAttribute("synch")[0] == "+") { // relative to current position
						media.currentTime(media.currentTime() + Number(options.childNodes[index].getAttribute("synch").slice(1)));
					} else {
						media.currentTime(options.childNodes[index].getAttribute("synch"));
					}
				}
				if (options.childNodes[index].getAttribute("play") == "true") {
					// play media
					media.play();
				}
			}
			mediaLesson.enableControls(media.media, true);
		}
		
		return {
			_setup: function(options) {
				// setup code, fire on initialisation
				options.nr = questionNr;
				questionNr++;
				window.questions[options._id] = options;

				media = this;
				judge = false;
				autoEnable = true;
				var tempEnable = false;
				
				// is it to appear over media?
				if (options.overlay == "true" && (this.video != undefined || $(this.audio).closest(".mediaHolder").find(".audioImg").length > 0)) {
					var $parent;
					if (this.video != undefined) {
						$parent = $(this.media).parent();
					} else {
						$parent = $(this.media).closest(".mediaHolder").find(".audioImgHolder");
					}
					
					// move mcqHolder to overlay media
					$("#" + options.target)
						.appendTo($parent)
						.removeClass("contentBlock")
						.addClass("overlay");
					
					$target = $('<div class="holder"/>').appendTo($("#" + options.target));
				} else {
					$target = $("#" + options.target);
				}
				
				$target
					.append(options.name != "" ? '<h4>' + options.name + '</h4>' + x_addLineBreaks(options.text) : x_addLineBreaks(options.text))
					.hide();
				
				$optHolder = $('<div class="optionHolder"/>').appendTo($target);
				
				if ($(options.childNodes).length == 0) {
					$optHolder.html('<span class="alert">' + x_getLangInfo(x_languageData.find("errorQuestions")[0], "noA", "No answer options have been added") + '</span>');
				} else {
					// create answer options (could be buttons, radio list or drop down menu)
					$(options.childNodes).each(function(i) {
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
						
						if (options.type == "button") {
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
							if (options.type == "radio") {
								var type = "radio";
								if (options.answerType == "multiple") {
									type = "checkbox";
								}
								
								var $optGroup = $('<div class="optionGroup"></div>').appendTo($optHolder),
									$option = $('<input type="' + type + '" name="option" />').appendTo($optGroup),
									$optionTxt = $('<label class="optionTxt"/>').appendTo($optGroup);
								
								$option
									.attr({
										"id": options.target + "_option" + i,
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
										
										if(options.enableTracking != "true")
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
									.attr("for", options.target + "_option" + i)
									.data("option", $option);
								
							} else if (options.type == "list") {
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
											if(options._id.enableTracking != "true")
											{
												$checkBtn.show();
											}
											
											selected = [this.selectedIndex-1];
										})
										.css("font-size", $x_body.css("font-size"))
										.find("option").html(options.topOption);
									
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
					if (options.type != "button") {
						$checkBtn = $('<button class="mcqCheckBtn"></button>').appendTo($target);
						$checkBtn
							.button({
								"label":	options.checkBtnTxt != "" ? options.checkBtnTxt : "Check",
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
				
				if (options.line == "true") {
					if (options.position == "top") {
						$target.append("<hr/>");
					} else {
						$target.prepend("<hr/>");
					}
				}
			},
			
			start: function(event, options) {
				// fire on options.start
				correctOptions = [];
				correctAnswers = [];
				correctFeedback = [];
				$(options.childNodes).each(function(i, v){
					if(v.getAttribute("correct") == "true")
					{
						correctOptions.push((i+1)+"");
						correctAnswers.push(v.getAttribute("text"));
						correctFeedback.push("correct");
					}
					
				});
				XTEnterInteraction(x_currentPage, window.questions[options._id].nr, 'multiplechoice', options.text, correctOptions, correctAnswers, correctFeedback );
				if ($(options.childNodes).length > 0) {
					// reset any previous answers given
					if (options.type == "radio") {
						$optHolder.find("input:checked").each(function() {
							this.checked = false;
						});
					} else if (options.type == "list") {
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
					
					if (options.disable == "true") {
						mediaLesson.enableControls(this.media, false);
					} else {
						mediaLesson.enableControls(this.media, true);
					}
				}
				
				$target.show();
			},
			
			end: function(event, options) {
				// fire on options.end
				mediaLesson.enableControls(this.media, true);
				$target.hide();
			}
		};
		
	});
})(Popcorn);