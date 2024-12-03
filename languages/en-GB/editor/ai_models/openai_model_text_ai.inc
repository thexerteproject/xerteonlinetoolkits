<?php

    define("LEARNING_PROMPT_TEXT", "Generate a paragraph with some text about a digital data for personalized student feedback in xml.");
    define("DEFAULT_PROMPT_TEXT", "Use the same xml layout exactly and generate some text about ,subject, . ,additionalInstructions, . Use this text as an example for the content, but make sure to return it in the same xml layout as your previous response: ,exampleContent, . If the example is blank, just ignore it. As much as possible, try to create the content in the following tone/style/voice: ,tone, . In terms of complexity of language, adapt the response to people of the following age range/education level/language proficiency: ,range, . In terms of difficulty of the content, please try as much as possible to create content which is appropriately CHALLENGING for people with the following background/education level: ,eduLevel, . If there is an uploaded file you can access, you ,access, explicit permission to use the content outside of the uploaded file. The returned xml must be one line with no characters denoting new lines or paragraphs. The returned xml must be one line with no characters denoting new lines or paragraphs.");
    define("LEARNING_RESULT_TEXT", "<text name=\"Using Digital Data for Personalized Student Feedback\"><![CDATA[<p><strong>Using Digital Data for Personalized Student Feedback</strong></p>
<p>In this section, we will explore how to use digital data to provide students with constructive and personalized feedback. Digital data can include scores, participation levels, and engagement metrics from various online platforms.</p>

<p><strong>Why is it important?</strong></p>
<p>Digital data allows you to give timely and specific feedback, which can help students understand their strengths and areas for improvement. This will ultimately enhance their learning experience and boost their performance.</p>

<p><strong>What types of data can be used?</strong></p>
<ul>
    <li><strong>Performance Data:</strong> Such as test scores and assignment grades.</li>
    <li><strong>Behavioral Data:</strong> Including class participation, attendance, and engagement in online activities.</li>
    <li><strong>Perceptual Data:</strong> Collected through student surveys to gauge feedback on teaching methods and course content.</li>
</ul>

<p>Let's dive deeper into how you can leverage this data effectively.</p>]]></text>");
