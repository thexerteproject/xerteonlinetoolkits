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

*dealt with in interactiveVideo.html and in the medialesson.html

*/


(function (Popcorn) {
	Popcorn.plugin("mcq", function(options) {

		// define plugin wide variables / functions here
		var $target, $optHolder, $checkBtn, $feedbackDiv, $continueBtn, media, selected, judge, autoEnable, $showHs, $showLbl, $showHsActive, $learningObjectParent;
		
		// Score tracking Manager
		var finishTracking = function(options) {
			// Check the exercise and all individual questions
            var allValid = true;
            var ia_nr = Number(options.tracking_nr);
            var numOfQuestions = Number(options.total_questions);
            for (var i = 0; i < options.childNodes.length; i++) {
                var curValid = false;
                for (var j = 0; j < selected.length; j++) {
                    if (i == selected[j] && options.childNodes[i].getAttribute("correct") == "false") {
                        allValid = false;
                    }
                    if (i == selected[j] && options.childNodes[i].getAttribute("correct") == "true") {
                        curValid = true;
                    }
                }
                if (!curValid && options.childNodes[i].getAttribute("correct") == "true") {
                    allValid = false;
                }
			}
			
			// Xerte Tracking setup
            var l_options = [];
            var l_answers = [];
            var l_feedback = [];
            $(selected).each(function (i, v) {
                l_options.push({
					id: (v + 1) + "",
					answer: x_GetTrackingTextFromHTML(options.childNodes[v].getAttribute("text"), (v+1) + ""),
					result: options.childNodes[i].getAttribute("correct") === "true"
            	});

                l_answers.push(x_GetTrackingTextFromHTML(options.childNodes[v].getAttribute("text"), (v+1) + ""));
                l_feedback.push("");
            });
            $learningObjectParent.questions[ia_nr] = true;
            var scormScore = 0;
			var score = 0;
			for (var i=0; i<numOfQuestions; i++)
			{
				if ($learningObjectParent.questions[i])
				{
					score++;
				}
			}
			scormScore = Math.ceil(score / numOfQuestions * 100);
			var result =
			{
				success: allValid,
				score: scormScore
			};
			//Push results
			XTSetPageScore(x_currentPage, scormScore, x_currentPageXML.getAttribute("trackinglabel"));
			XTExitInteraction(x_currentPage, ia_nr, result, l_options, l_answers, l_feedback, x_currentPageXML.getAttribute("trackinglabel"));
            $learningObjectParent.enableControls(media.media, true);
        }
		
		// Feedback Manager
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
				
			
				feedbackTxt += options[fb] != "" ? '<div class="feedback"><p>' + options[fb] + '</p></div>' : "";
			}
			
			if (options.childNodes[index].getAttribute("enable") == "true" || (enable == true && ((options.childNodes[index].getAttribute("page") == undefined || options.childNodes[index].getAttribute("page") == "") && (options.childNodes[index].getAttribute("synch") == undefined || options.childNodes[index].getAttribute("synch") == "")))) {
				// controls will be enabled if correct answer selected unless there is a 'go to page' or 'go to synch point' action associated with it
				$learningObjectParent.enableControls(media.media, true);
			}
			
			// automatically enable if the question has been set up so there's no answer that will enable them
			if (autoEnable == true) {
				$learningObjectParent.enableControls(media.media, true);
			}
			
			// show feedback if there is some, with button to do action afterwards (change page, media current time, play media)
			if (feedbackTxt != "") {
				var feedbackLabel = options.feedbackLabel != "" ? '<h5>' + options.feedbackLabel + '</h5>' : "";
				
				$feedbackDiv
					.html(feedbackLabel + feedbackTxt)
					.show();
				$continueBtn.show();

				//#Warning: unused by Xerte at the current time.
				if (action >= 0) {
					$(".mcqContinueBtn").hide();
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
		
		// Media Action Manger (seek, pause, change LO)
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
			$learningObjectParent.enableControls(media.media, true);
		}
		
		return {
			_setup: function(options) {
				media = this;
				judge = false;
				autoEnable = true;
				var tempEnable = false;
				$learningObjectParent = eval(x_currentPageXML.nodeName);
				$target = $("#" + options.target);
				var $optionText = options.name !== "" ? '<h4>' + options.name + '</h4>' + x_addLineBreaks(options.text) : x_addLineBreaks(options.text);
				$target.hide();

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
                                "label": options.checkBtnTxt != "" ? options.checkBtnTxt : "Check",
                                "disabled": true
                            })
                            .click(function () {
                                answerSelected();
                                $checkBtn.hide();
                            });
                    }
					
					$feedbackDiv = $('<div class="mcqFeedback"></div>')
						.appendTo($target)
						.hide();

					$continueBtn = $('<button class="mcqContinueBtn"></button>').appendTo($target).hide();
					$continueBtn
						.button({
							"label": options.continueBtnTxt != "" ? options.continueBtnTxt : "Continue"
						})
						.click(function () {
							$target.hide();
							media.play();
                            if (options.overlayPan)
                                $target.parent().hide();
                        });

					$target.append('<div class="bottom"/>');
				}
				

				if (options.line == "true") {
					if (options.position == "top") {
						$target.append("<hr/>");
					} else {
						$target.prepend("<hr/>");
					}
				}
			
				if(options.overlayPan == "true")
				{
					$target.parent().hide();
					$target.hide();
					
                	if(options.optional == "true") {
						var $showHolder  = $('<div id="showHolder" />').appendTo($target);
						$showHs = $('<div class="Hs x_noLightBox showHotspot"/>').addClass(options.attrib.icon).appendTo($showHolder);
						$showHs.css({
							"background-color": options.attrib.colour1,
							"color": options.attrib.colour2,
						}).data({
							size: options.attrib.hsSize,
							colour2: options.attrib.colour1
						}).hover(function(){
							var $this = $(this);
							$this.css({
								'box-shadow': '0px 0px ' + ($this.data('size')/2) + 'px ' + $this.data('colour2'),
								'cursor': 'pointer',
								'z-index': 1000
							});
						},
						function() { // On end hover, remove glow effect
							$(this)
								.css({
									'box-shadow': 'none',
									'z-index': 1
								})
						});

						$showLbl = $("<div class='showLabel panel'>" + options.name + "</div>");
						if(options.attrib.tooltip == "label") {
							$showLbl.appendTo($showHolder);
						}
						else if(options.attrib.tooltip == "tooltip"){
							$showLbl.removeClass("showLabel").addClass("tooltip").appendTo($showHolder).hide();
							$('<div class="tipArrow arrowDown"/>').appendTo($showLbl);
							$showHs.hover(function(){
								$showLbl.show();
							}, function() {
								$showLbl.css({
									'box-shadow': 'none',
									'z-index': 1
								}).hide();
							});
						}
						$showHolder
							.click(function () {
								$target.parent().css({"padding": 5, "width": options._w + "%", "height": "auto", "overflow-x": "hidden"});
                                $("#overlay").show();
								$showHsActive = true;
                                $learningObjectParent.popcornInstance.media.pause();
                                $target.parent().addClass("qWindow").addClass("panel");
								$showHolder.hide();
								$optHolder.show();
								$target.prepend($optionText);
							});

					} else {
						$optHolder.show();
						$target.parent().css({"padding": 5});
					}
					// If not on overlay panel
					$optHolder.show();
				}
			},
			
			start: function(event, options) {
				// fire on options.start
				var correctOptions = [];
				var correctAnswers = [];
				var correctFeedback = [];
				var ia_nr = Number(options.tracking_nr);
				$(options.childNodes).each(function(i, v){
					correctOptions.push(
						{
							id: (i+1)+"",
							answer: x_GetTrackingTextFromHTML(v.getAttribute("text"), (i+1)+""),
							result: v.getAttribute("correct") == "true"
						}
						);
					if (v.getAttribute("correct") == "true" )
						correctAnswers.push(x_GetTrackingTextFromHTML(v.getAttribute("text"), (i+1)+""));
					correctFeedback.push(v.getAttribute("correct") == "true" ? "Correct" : "Incorrect");
				});
				var label=ia_nr+"";
				if (x_currentPageXML.getAttribute("trackinglabel") != null && x_currentPageXML.getAttribute("trackinglabel") != "")
				{
					label = x_currentPageXML.getAttribute("trackinglabel");
				}
				else
				{
					label = x_GetTrackingTextFromHTML(options.text, ia_nr + "");
				}
				XTEnterInteraction(x_currentPage, ia_nr, 'multiplechoice', label, correctOptions, correctAnswers, correctFeedback, x_currentPageXML.getAttribute("grouping"));
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
					if ($showHs) {
						$optHolder.hide();
						$checkBtn.hide();
					} else {
						formattedQuestionText = options.name != "" ? '<h4>' + options.name + '</h4>' + x_addLineBreaks(options.text) : x_addLineBreaks(options.text);
						if (!$target.html().includes(formattedQuestionText)) {
							$target.prepend(formattedQuestionText);
						}
                        if ($checkBtn) {
                            $checkBtn
                                .show()
                                .button("disable");
                        }
                    }
					
					if (options.disable == "true") {
						$learningObjectParent.enableControls(this.media, false);
					} else {
						$learningObjectParent.enableControls(this.media, true);
					}
				}
				if (options.overlayPan) {
					if ($showHsActive == true) {
						$target.parent().css({"margin-right" : "5px", "overflow-x": "hidden"});
					}

					if ($showHsActive == true || options.optional == "false" || options.optional == undefined) {
						$target.parent().addClass("qWindow").addClass("panel");
						$target.parent().css({
							"padding": "5px",
							"width" : options._w + "%",
							"overflow-x": "hidden"
						});
						$optHolder.show();
						$checkBtn.show();
					}
					else {
						var hh = $(".mainMedia").height();
						var size = options.attrib.hsSize;
						$showHs.css({
							"height"  :       (size * 0.008) * hh + "px",
							"width"   :       (size * 0.008) * hh + "px",
							"padding" :       (size * 0.001) * hh + "px",
							"border-radius" : (size / 2 + 1) * 0.01 * hh + "px",
							"font-size" : 	  (size * 0.007) * hh + "px",
						});
						if(options.attrib.tooltip == "label") {	
							// Cap the fontsize to reasonable values
							var fs = size * 0.4 <= 12 ? 12 : size * 0.4 > 32 ? 32 : size * 0.4;
							$showLbl.css({
								"padding": 5,
								"padding-left": (size * 0.55) * 0.01 * hh + 5,
								"left": (size * 0.005) * hh + 5,
								"top": (size * 0.005) * hh - 2,
								"font-size": fs
							});
						}
						else if(options.attrib.tooltip == "tooltip"){
							$showHs.hover(function(){
								$showLbl.css({
									"left": $showLbl.outerWidth()  * -0.5 + (size * 0.005 * hh),
									"top" : $showLbl.outerHeight() * -1,
									'box-shadow': 'none',
									"overflow" : 'hidden'
								}).show();
							}, function() {
								$showLbl.css({
									'box-shadow': 'none',
									'z-index': 1
								}).hide();
							});
						}
						$target.parent().css({
							"padding": 0,
							"height": 0
						});
					}
					$target.parent().css({
						"max-width": options._w + "%",
						"top": options._y + "%",
						"left": options._x + "%"
					}).show();
				}
				$target.show();
			},
			
			end: function(event, options) {
				
				// fire on options.end
				$learningObjectParent.enableControls(this.media, true);
                if (options.overlayPan) {
					$target.parent().removeClass("qWindow").removeClass("panel");
                	$target.parent().css( //The overlay panel
                	{
						"top": 0,
						"left": 0,
						"padding": 0,
						"height": "auto",
						"margin-right" : 0,
						"overflow-x": '',
						"overflow" : '',
						"max-width": ''
                	}).hide();
				}
				$target.hide();
			},
		};		
	});
})(Popcorn);