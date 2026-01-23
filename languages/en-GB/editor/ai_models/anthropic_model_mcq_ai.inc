<?php

    define("LEARNING_PROMPT_MCQ", "Generate 3 possible answers to the question: 'In which city is the largest train station in Germany'.");
    define("DEFAULT_PROMPT_MCQ", "Using the exact same xml layout generate ,aoa, possible answers (each answer presented as an option node  using the correct, name, text and feedback attributes to store the information --- it should be a child node of the mcq node!) for the following question ,sentence,.
    
    In this case, it is ,useOwnQuestion, that you should, instead of using the above provided question, generate your OWN question based on this subject: ,subject, and fill out the 'prompt' field with it.
    
    The question should have:
    1. ** ,nrTrueAnswers, correct answer(s)** that accurately responds to the question, using precise terminology.
    2. **Incorrect answers (distractors)** that:
   - Are misleading but related to the topic, with terms or concepts closely connected to the correct answer.
   - Reflect **realistic misunderstandings** or **partial truths** that might sound logical but ultimately miss the mark.
   - Could represent **common misconceptions** or **reasonable but flawed solutions** in the subject area.
   - Avoid being obviously wrong (e.g., avoid extreme options like “cutting salaries” for improving dropout rates).
    3. **Feedback** for each answer option, clearly explaining why it’s correct or incorrect, ideally providing additional context that enhances understanding of the topic.
    As much as possible, try to create the content in the following tone/style/voice: ,tone, . In terms of complexity of language, adapt the response to people of the following age range/education level/language proficiency: ,range, . In terms of difficulty of the content, please try as much as possible to create content which is appropriately CHALLENGING for people with the following background/education level: ,eduLevel, . ,additionalInstructions,  Return only the xml. The returned xml must be one line with no characters denoting new lines or paragraphs.
    
    if ,nrTrueAnswers, is greater than 1, make sure to change the type attribute in the mcq node to: type=\"Multiple Answer\"");
    define("LEARNING_RESULT_MCQ", "<mcq prompt=\"In which city is the largest train station in Germany?\" type=\"Single Answer\"><option correct=\"true\" name=\"Berlin\" text=\"Berlin\" feedback=\"'Correct! The largest train station in Germany is located in Berlin.\"/><option correct=\"false\" name=\"Frankfurt\" text=\"Frankfurt\" feedback=\"Unfortunately, Frankfurt has one of the most important train stations, but the largest train station is located in Berlin.\" /><option correct=\"false\" name=\"Hamburg\" text=\"Hamburg\" feedback=\"No, Hamburg is an important city for the train, but the largest train station is located in Berlin.\"/></mcq>");