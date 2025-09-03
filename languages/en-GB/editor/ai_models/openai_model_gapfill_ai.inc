<?php

    define("LEARNING_PROMPT_GAPFILL", "Generate 1 sentence on the subject of: Germany and return the text having highlighted the following types of words: nouns by encasing them in |");
    define("DEFAULT_PROMPT_GAPFILL", "
You need to perform either task 1 or task 2, but never both. You are to completely ignore the description of any task which is not your current task. Your current task is: ,tasknr,


Task 1 description: Using the exact same xml layout generate 1 sentence appropriate for people in the following age-range: ,range, about the following subject: ,subject, . As much as possible, try to create the content in the following tone/style/voice: ,tone, . In terms of complexity of the language used, adapt the response to people of the following age range/education level/language proficiency: ,range, . In terms of difficulty of the content, please try as much as possible to create a sentence which is appropriately CHALLENGING for people with the following background/education level: ,eduLevel, . ,additionalInstructions, The returned xml must be one line with no characters denoting new lines or paragraphs. The sentence should be no longer than ,legnth, words. Only fill out the 'passage' property of the gapFill element. The returned sentence should not have anything marked with |.


Task 2 description: Use the exact same xml layout. Your sentence is: ,sentence, . Ignore any | signs which are already in the sentence. Instead, encase all words in the given sentence which belong to the following group: ,target, in straight horizontal lines (|), following the same notation you had in your previous response. Do not encase any words which cannot be counted as part of the group: ,target, ! Only fill out the 'passage' property of the gapFill element!  ,additionalInstructions, The returned xml must be one line with no characters denoting new lines or paragraphs.");
    //define("DEFAULT_PROMPT_GAPFILL", "return this exactly:<gapFill passage='In |Germany|, there is a |bridge| called the |Rakotzbrücke| that creates a perfect |circle| when it is reflected in the |water|.'/>");
    define("LEARNING_RESULT_GAPFILL", "<gapFill passage='In |Germany|, there is a |bridge| called the |Rakotzbrücke| that creates a perfect |circle| when it is reflected in the |water|.'/>");