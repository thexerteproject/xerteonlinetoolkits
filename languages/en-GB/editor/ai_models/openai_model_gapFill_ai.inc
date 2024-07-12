<?php

    define("LEARNING_PROMPT_GAPFILL", "Generate 1 sentence on the subject of: Germany and return the text having highlighted the following types of words: nouns by encasing them in |");
    /*define("DEFAULT_PROMPT_GAPFILL", "Using the exact same xml layout generate 1 sentence appropriate for people in the following age-range: ,range, about the following subject: ,subject, . Encase the ,target, in | as in the example. The sentence should be no longer than ,legnth, words. Enter the sentance in the passage property of the gapFill element. The sentence must be different from ; ");*/
    define("DEFAULT_PROMPT_GAPFILL", "return this exactly:<gapFill passage='In |Germany|, there is a |bridge| called the |Rakotzbrücke| that creates a perfect |circle| when it is reflected in the |water|.'/>");
    define("LEARNING_RESULT_GAPFILL", "<gapFill passage='In |Germany|, there is a |bridge| called the |Rakotzbrücke| that creates a perfect |circle| when it is reflected in the |water|.'/>");