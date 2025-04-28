<?php

    define("LEARNING_PROMPT_BULLETS", "Generate a bulletpoint list of fruits in an xml friendly format!");
    define("DEFAULT_PROMPT_BULLETS", "Use the same xml layout exactly and generate ,nro, bulletpoints about ,subject, . ,additionalRequirements, . As much as possible, try to create the content in the following tone/style/voice: ,tone, . In terms of complexity of language and content, adapt the language level used in the response to people of the following age range/education level/language proficiency: ,range, . In terms of difficulty of the content, please try as much as possible to create content which is appropriately CHALLENGING for people with the following background/education level: ,eduLevel, . The returned xml must be one line with no characters denoting new lines or paragraphs. The returned xml must be one line with no characters denoting new lines or paragraphs.");
    define("LEARNING_RESULT_BULLETS", "<bullets name=\"Fruits\"><![CDATA[<p>Apple</p>

<p>Banana</p>

<p>Orange</p>

<p>Pomegranate</p>

<p>Kiwi</p>

<p>Mango</p>
]]></bullets>");
