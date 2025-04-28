<?php

    define("LEARNING_PROMPT_LEARNINGOBJECT_BOOTSTRAP", "Create a learning object in xml about active learning.");
    define("DEFAULT_PROMPT_LEARNINGOBJECT_BOOTSTRAP", "Make another learning object using the xml structure in the file I uploaded, this time on the following subject: ,subject,. Check the uploaded files and use 'template_learning_object' to see all the possibilities of the structure. Use some of the options there and the instructions to make a solid learning object (mini-course) on the subject. Make sure to use at least 4 different kinds of nodes. Do not repeat content between pages. Return only the XML in plain text. Do not use markdown. Do not return anything other than the xml.  ");
    define("LEARNING_RESULT_LEARNINGOBJECT_BOOTSTRAP", "To get an xml example, I need to know the specific xml structure your project supports. Please provide or specify the structure, and I can create an xml object on the subject for you.");
    define("LEARNING_PROMPT_LEARNINGOBJECT_STANDARD", "You will act as a technical teacher's assistant. In this scenario, you are helping a course instructor who is teaching educators about the importance of the following topic: Data Analysis in the classroom. Data Analysis, in this context, is defined as the collection of data about the learning process and interpretation of the results.
The goals for this course are:
Enable teachers to use digital data to provide students with feedback.
Help teachers adjust their lessons based on the digital data obtained.
Educate teachers on the advantages and disadvantages of different digital assessment instruments and guide them on when it is appropriate to use each one.

Given these requirements, please create a comprehensive course lesson. The teacher does not need an outline; instead, they need a full-fledged lesson on the topic, which they can edit as necessary. Ensure to include all the content using detailed text to cover each goal effectively.

Please write the lesson content using the following communication style:

Clear and concise - Ensure the information is straightforward and easy to understand.
Engaging and interactive - Include examples, scenarios, and questions to keep educators engaged.
Professional yet approachable - Maintain a tone that is knowledgeable but not overly formal.");
    define("DEFAULT_PROMPT_LEARNINGOBJECT_STANDARD", "In this new scenario, you are helping a course instructor who is teaching ,headers, .The course instructor uses a software that accepts specific xml structures as input. The course from your previous message was a good mix of complexity and easy-to-understand information. Now, you need to create a comprehensive course on a new subject but fit the content of the course into the xml. Make another learning object using the xml structure in the uploaded file, this time on the following subject: ,subject, with the following goals: ,goals, . As much as possible, try to create the content in the following tone/style/voice: ,tone, . In terms of complexity of language and content, adapt the response to people of the following age range/education level/language proficiency: ,range, . Check the uploaded files and use 'template_learning_object_STANDARD' to see all the possibilities of the STRUCTURE of the xml. ONLY use nodes which can be found in the file, anything else is not supported and therefore will cause catastrophic consequences.
    
    In the file, you will find \<text\> nodes like so: <\ text  name='Enter Page Title'\>
		<![CDATA[This is reserved for the generated course on the goals. Put the introduction to goal 1 here.]]>
	\</text\>. Only edit the text in the CDATA in this node (and other similar text nodes) and replace it with in-depth course content. You can also edit the name = 'Enter Page Title' portion to add an appropriate title for the page. Any content other than this can stay exactly the same - you are effectively editing the xml and not making undue alterations. You should add some html formatting within the CDATA - paragraphs, bold letters and the sort, to make for a better reading experience. Do not repeat content between pages. The content you generate should match the language of the subject and goals.
	It is possible that you will find another uploaded file which is different from 'template_learning_object_STANDARD'. In this case, make sure to check that file and use ONLY the content inside the file to fill out the XML. Only in the case where such a file can be found, you ,access, permission to use content outside of the uploaded file. 
	Return only the XML in plain text. Do not return any markdown. Do not format the xml using markdown. Do not use the following tags to encapsulate the xml: ```xml``` Do not return anything other than the xml in plain text (this is critically important!).");
    /*use below one for specific page*/
    define("LEARNING_RESULT_LEARNINGOBJECT_STANDARD","
Lesson: Utilizing Data Analysis in the Classroom
Introduction
Welcome to the lesson on the importance of Data Analysis in the classroom. In today's digital age, understanding and leveraging data can significantly enhance teaching effectiveness and student learning outcomes. This lesson will help you understand how to collect and interpret digital data about the learning process, provide actionable feedback to students, and adjust your teaching methods based on the data obtained. Additionally, you will learn about various digital assessment tools, their advantages and disadvantages, and when to use each one appropriately.

Section 1: Understanding Data Analysis in Education
What is Data Analysis?
Data analysis in education involves collecting data related to students' learning processes and interpreting it to make informed decisions about teaching strategies and student support. This data can include test scores, assignment grades, participation levels, and even engagement metrics from digital learning platforms.

Why is Data Analysis Important?
Personalized Feedback: Data analysis enables teachers to provide personalized feedback to students, helping them understand their strengths and areas for improvement.
Informed Instruction: By analyzing data, teachers can identify trends and patterns, allowing them to adjust their lessons to better meet the needs of their students.
Enhanced Engagement: Understanding how students interact with learning materials helps in creating more engaging and effective lesson plans.
Early Intervention: Data can highlight students who may need additional support, enabling timely interventions.
Section 2: Collecting Digital Data
Types of Data to Collect
Performance Data: Scores from quizzes, tests, and assignments.
Behavioral Data: Attendance, participation in discussions, and engagement in online activities.
Perceptual Data: Student feedback on lessons and teaching methods.
Process Data: Time spent on tasks, completion rates, and navigation patterns in online courses.
Tools for Data Collection
Learning Management Systems (LMS): Platforms like Google Classroom, Canvas, and Moodle offer built-in analytics to track student performance and engagement.
Online Assessment Tools: Tools like Kahoot!, Quizizz, and Socrative provide detailed reports on quiz results and student performance.
Survey Tools: Google Forms and SurveyMonkey can be used to gather perceptual data through student surveys.
Section 3: Interpreting Data and Providing Feedback
Analyzing Data
Identifying Trends: Look for patterns in performance data to identify topics or concepts that students struggle with.
Comparing Data: Compare data across different time periods or groups to evaluate the effectiveness of teaching methods.
Contextualizing Results: Consider external factors that may impact data, such as test difficulty, student health, or personal issues.
Providing Feedback
Timely and Specific: Feedback should be given as soon as possible and should be specific to the student's performance.
Actionable Suggestions: Provide clear suggestions on how students can improve.
Positive Reinforcement: Highlight what the student did well to encourage continued effort and engagement.
Example Scenario
Scenario: You notice that several students performed poorly on a recent math quiz.

Action:

Review the quiz results to identify common errors.
Provide individual feedback to each student, pointing out their mistakes and suggesting resources or strategies to help them improve.
Offer a follow-up session to go over the challenging concepts.
Section 4: Adjusting Lessons Based on Data
Using Data to Inform Instruction
Revisiting Concepts: If data shows that a significant number of students struggled with a particular topic, consider revisiting it in future lessons.
Differentiated Instruction: Use data to group students by ability and provide differentiated instruction to cater to their specific needs.
Pacing Adjustments: Adjust the pace of your lessons based on how quickly students are mastering the material.
Example Scenario
Scenario: Data indicates that students are spending a lot of time on a specific section of your online course.

Action:

Investigate the section to identify potential difficulties.
Simplify the content or provide additional resources, such as instructional videos or practice exercises.
Monitor the impact of these changes on student performance.
Section 5: Advantages and Disadvantages of Digital Assessment Tools
Advantages
Immediate Feedback: Many digital tools provide instant feedback, helping students learn from their mistakes right away.
Engagement: Interactive tools can make assessments more engaging and less intimidating.
Data-Rich Reports: Digital tools often offer detailed analytics that can provide deeper insights into student performance.
Disadvantages
Accessibility: Not all students may have equal access to digital tools, potentially leading to equity issues.
Technical Issues: Reliance on technology can sometimes result in technical difficulties that disrupt the assessment process.
Overemphasis on Quantitative Data: Digital assessments may focus too much on quantitative data, overlooking qualitative aspects of learning.
When to Use Different Tools
Formative Assessments: Use tools like Kahoot! and Quizizz for quick, interactive checks of student understanding during lessons.
Summative Assessments: Use more robust platforms like Google Forms or LMS quizzes for end-of-unit tests that require comprehensive data analysis.
Feedback and Surveys: Use survey tools to gather student feedback on teaching methods and course content.
Conclusion
Data analysis in education is a powerful tool that can enhance your teaching effectiveness and improve student learning outcomes. By collecting and interpreting digital data, providing actionable feedback, and adjusting your lessons based on this data, you can create a more engaging and supportive learning environment. Remember to consider the advantages and disadvantages of different digital assessment tools and choose the ones that best fit your teaching objectives and your students' needs.

Interactive Activity
Activity: Review a sample set of student data (provided by the instructor) and answer the following questions:

What trends do you notice in the data?
How would you provide feedback to students based on this data?
What adjustments would you make to your future lessons?
Thank you for your participation in this lesson. Feel free to ask any questions or seek further clarification on any of the topics covered. Happy teaching!");
    /*    define("LEARNING_PROMPT_LEARNINGOBJECT_STANDARD", "Create a learning object in xml about active learning.");
    define("DEFAULT_PROMPT_LEARNINGOBJECT_STANDARD", "Make another learning object using the xml structure in the file I uploaded, this time on the following subject: ,subject,. Check the uploaded files and use 'template_learning_object_STANDARD' to see all the possibilities of the STRUCTURE of the xml. ONLY use nodes which can be found in the file, anything else is not supported and therefore will cause catastrophic consequences. I repeat, only use nodes found in the file. YOUR GOAL is to follow the instructions here as well as those found within the file to create a course FOR the subject which can be used DIRECTLY! Make sure to use at least 4 different kinds of nodes. Do not repeat content between pages. To make it clearer, I have the following requests: make sure to include these pages: ,headers, . If no pages are specified, follow the example as close as possible. The GOAL of the xml learning project is to help the person who will read this achieve these goals: ,goals, . Return only the XML in plain text. Do not return any markdown. Do not format the xml using markdown. Do not return anything other than the xml in plain text (this is critically important!).");
    //use below one for specific page
    define("LEARNING_RESULT_LEARNINGOBJECT_STANDARD","To get an xml example, I need to know the specific xml structure your project supports. Please provide or specify the structure, and I can create an xml object on the subject for you.");
    //define("LEARNING_PROMPT_LEARNINGOBJECT_STANDARD", "Create an example of a learning object using xml consisting of several helpful and unique pages.");
    //define("DEFAULT_PROMPT_LEARNINGOBJECT_STANDARD", "Make another learning object using the exact same XML structure, this time on the following subject: ,subject,. Please make use of the different pages you mentioned in your previous response to make a solid mini-course on the subject. Make sure to use at least 4 different kinds of nodes. Do not repeat content between pages. Return only the XML in plain text. Do not use markdown. Do not return anything other than the xml.  ");
    /*use below one for specific page*/
    /*define("LEARNING_RESULT_LEARNINGOBJECT_STANDARD", "<learningObject
    editorVersion=\"3\" 
    targetFolder=\"Nottingham\" 
    name=\"x.x Domein | Competentie | niveau A/B/C\" 
    language=\"nl-NL\" 
    navigation=\"Historic\" 
    textSize=\"12\" 
    theme=\"bootcamp\" 
    themeIcons=\"false\" 
    displayMode=\"fill window\" 
    responsive=\"true\" 
    maxWidth=\"1600\" 
    progressBar=\"pBar\">
    
    <columnPage linkID=\"PG1658742827489\" name=\"Overzicht van de module\" unmarkForCompletion=\"true\" showTitles=\"true\">
        <nestedPage linkID=\"PG1658742838149\" align=\"Top\" text=\"
            &lt;p&gt;&lt;strong&gt;In deze module leer je:&lt;/strong&gt;&lt;/p&gt;
            &lt;p&gt;&lt;i class=&quot;fa fa-check&quot;&gt;&lt;/i&gt; test&lt;/p&gt;
            &lt;p&gt;&lt;i class=&quot;fa fa-check&quot;&gt;&lt;/i&gt; test&lt;/p&gt;
            &lt;p&gt;&lt;i class=&quot;fa fa-check&quot;&gt;&lt;/i&gt; test&lt;/p&gt;
        \"/>
        <nestedPage linkID=\"PG1658742834405\" align=\"Top\" text=\"
            &lt;p&gt;&lt;strong&gt;Informatie over de module&lt;/strong&gt;&lt;/p&gt;
            &lt;p&gt;&lt;i class=&quot;fa fa-star&quot;&gt;&lt;/i&gt; Domein [x + titel]&lt;/p&gt;
            &lt;p&gt;&lt;i class=&quot;fa fa-flag-o&quot;&gt;&lt;/i&gt; Competentie [x.x + titel]&lt;/p&gt;
            &lt;p&gt;&lt;i class=&quot;fa fa-clock-o&quot;&gt;&lt;/i&gt; xx minuten&lt;/p&gt;
            &lt;p&gt;&lt;i class=&quot;fa fa-mortar-board&quot;&gt;&lt;/i&gt; Niveau [A/B/C]&lt;/p&gt;
        \"/>
    </columnPage>
    <text linkID=\"PG1711698750089\" name=\"Introductie\">
        <![CDATA[<p><em>[Inleidende tekst]</em></p>
<p>&nbsp;</p>
<p><span style=\"color:#360d6f;\"><strong>Welke vragen ga je beantwoorden?</strong></span></p>
<p>De onderstaande vragen ga je voor jezelf beantwoorden in deze module.</p>
<p>&nbsp;</p>
<p><img alt=\"\" height=\"20%\" src=\"FileLocation + 'media/person1.jpg'\" style=\"float:left\" width=\"20%\" /></p>
<p><em><span class=\"fav2\"><i aria-hidden=\"true\" class=\"fa fa-quote-left \" style=\"color:rgb(123, 31, 255);\" title=\"Quote Left \"></i><span style=\"position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;\">Quote Left </span></span>&nbsp;Vraag 1&nbsp;&nbsp;<span class=\"fav2\"><i aria-hidden=\"true\" class=\"fa fa-quote-right \" style=\"color:rgb(123, 31, 255);\" title=\"Quote Right \"></i><span style=\"position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;\">Quote Right </span></span></em></p>
<p style=\"text-align: right;\">&nbsp;</p>
<p style=\"text-align: right;\">&nbsp;</p>
<p style=\"text-align: right;\"><em><span class=\"fav2\"><i aria-hidden=\"true\" class=\"fa fa-quote-left \" style=\"color:rgb(123, 31, 255);\" title=\"Quote Left \"></i><span style=\"position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;\">Quote Left </span></span>&nbsp;Vraag 2&nbsp;&nbsp;<span class=\"fav2\"><i aria-hidden=\"true\" class=\"fa fa-quote-right \" style=\"color:rgb(123, 31, 255);\" title=\"Quote Right \"></i><span style=\"position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;\">Quote Right </span></span></em><img alt=\"\" height=\"20%\" src=\"FileLocation + 'media/person2.jpg'\" style=\"float:right\" width=\"20%\" /></p>
<p>&nbsp;</p>]]>
    </text>
    <nav linkID=\"PG1711289492041\" name=\"Samenvatting\" type=\"Slide\" nextBtnTip=\"Volgende\" prevBtnTip=\"Vorige\" slideCount=\"Slide {i} van {n}\" panelWidth=\"Medium\" panelHeight=\"fill\" panelPos=\"Right\" buttonPos=\"Top\" collapsible=\"false\" unmarkForCompletion=\"true\" bgImage=\"FileLocation + 'media/Banner_betrouwbare-bronnen1.jpg'\" backgroundFit=\"cover\" bgImageAlpha=\"100\" bgImageDark=\"0\" bgImageGrey=\"false\">
        <navPage linkID=\"PG1711289492054\" text=\"
            &lt;p&gt;&lt;strong&gt;&lt;span style=&quot;color:#360d6f;&quot;&gt;Nu je de module hebt gevolgd, kun je:&lt;/span&gt;&lt;/strong&gt;&lt;/p&gt;
            &lt;p&gt;&lt;i class=&quot;fa fa-check&quot;&gt;&lt;/i&gt; ......&lt;/p&gt;
            &lt;p&gt;&lt;i class=&quot;fa fa-check&quot;&gt;&lt;/i&gt; .......&lt;/p&gt;
        \"/>
    </nav>
    <title linkID=\"PG1711366184839\" name=\"OVERLEG PROJECTTEAM Resultaat\" size=\"30\" unmarkForCompletion=\"true\">
        <![CDATA[<p>Nog toevoegen:</p>
<p><strong>Resultaatpagina en/of<br />Adaptieve Content Pagina</strong></p>]]>
    </title>
    <text linkID=\"PG1696770656144\" name=\"Colofon\" unmarkForCompletion=\"true\">
        <![CDATA[<p><strong><span class=\"fav2\"><i aria-hidden=\"true\" class=\"fa fa-copyright\" style=\"color:rgb(54, 13, 111);\" title=\"Copyright\"></i><span style=\"position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;\">Copyright</span></span>&nbsp;<span style=\"color:#360d6f;\">Auteur(s)</span></strong></p>
<p>Dit product is ontwikkeld voor de ICT-bootcamps 2.0 die worden uitgewerkt door Impact Connecting, Schoolmakers en DLearning in nauwe samenwerking met Kenniscentrum Digisprong.</p>
<p>&nbsp;</p>
<p><strong><span class=\"fav2\"><i aria-hidden=\"true\" class=\"fa fa-star\" style=\"color:rgb(54, 13, 111);\" title=\"Star\"></i><span style=\"position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;\">Star</span></span>&nbsp;<span style=\"color:#360d6f;\">Bronverwijzing</span></strong></p>
<p>Open hier <a href=\"#\" onclick=\"\">het overzicht</a> van de gebruikte bronnen.</p>
<p>&nbsp;</p>
<p><strong><span class=\"fav2\"><i aria-hidden=\"true\" class=\"fa fa-exclamation-circle\" style=\"color:rgb(54, 13, 111);\" title=\"Exclamation Circle\"></i><span style=\"position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;\">Exclamation Circle</span></span>&nbsp;<span style=\"color:#360d6f;\">Disclaimer</span></strong></p>
<p>We hebben ons best gedaan zoveel mogelijk rechtenvrij beeldmateriaal te gebruiken. Indien dit niet mogelijk is, hebben wij de beeldrechteigenaren proberen te achterhalen en hun om toestemming gevraagd. Mocht je menen rechten te hebben op beeldmateriaal, neem dan contact op met de inhoudsdeskundige van deze module.<br />&nbsp;</p>
<p><span class=\"fav2\"><i aria-hidden=\"true\" class=\"fa fa-copyright\" style=\"color:rgb(54, 13, 111);\" title=\"Copyright\"></i><span style=\"position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;\">Copyright</span></span><strong><span style=\"color:#360d6f;\">&nbsp;Licentie</span> <em><span style=\"background-color:#f1c40f;\">WELKE LICENTIE</span></em></strong></p>
<p>Deze module is uitgebracht als Open Leermateriaal en&nbsp;valt onder een <a href=\"#\" onclick=\"\">Creative&nbsp; Commons Naamsvermelding-GelijkDelen 4.0 Internationaal-licentie</a>.</p>
<p><a href=\"http://creativecommons.org/licenses/by-sa/4.0/\" rel=\"license\"><img alt=\"Creative Commons-Licentie\" src=\"https://i.creativecommons.org/l/by-sa/4.0/88x31.png\" style=\"border-width:0px; float:left\" /></a>Dit betekent dat je&nbsp;deze module vrij mag gebruiken en aanpassen, mits je&nbsp;de naam van de maker vermeldt en je, op jouw beurt, het nieuwe werk weer onder dezelfde voorwaarden deelt.</p>]]>
    </text>
     <embedDiv linkID=\"PG1711290980622\" name=\"Creative Commons Licentie ...\" src=\"https://creativecommons.org/licenses/by-sa/4.0/deed.nl\" linkPage=\"true\" linkTarget=\"lightbox\" headerHide=\"true\" footerHide=\"true\" reqProgress=\"false\" text=\"&lt;p&gt;&lt;em&gt;&lt;span style=&quot;background-color:#f1c40f;&quot;&gt;[Link aanpassen zodra bekend is welke licentie het wordt en deze tekst verwijderen zodat het hele venster gebruikt wordt]&lt;/span&gt;&lt;/em&gt;&lt;/p&gt;\" align=\"Left\" windowWidth=\"Large\"/>

    <text linkID=\"PG1696770671576\" name=\"Bronnenlijst\" linkPage=\"true\" linkTarget=\"lightbox\" headerHide=\"true\" footerHide=\"true\" reqProgress=\"false\">
        <![CDATA[<p><span style=\"color:#360d6f;\"><strong>In deze module zijn de volgende bronnen gebruikt:</strong></span></p>
<p><span class=\"fav2\"><i aria-hidden=\"true\" class=\"fa fa-star\" style=\"color:rgb(123, 31, 255);\" title=\"Star\"></i><span style=\"position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;\">Star</span></span>&nbsp;Afbeelding van Maklay62 via Pixabay (vraagteken)</p>
<p><span class=\"fav2\"><i aria-hidden=\"true\" class=\"fa fa-star\" style=\"color:rgb(123, 31, 255);\" title=\"Star\"></i><span style=\"position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;\">Star</span></span>&nbsp;Afbeelding van Andrea Piacquadio via Pexels</p>
<p><span class=\"fav2\"><i aria-hidden=\"true\" class=\"fa fa-star\" style=\"color:rgb(123, 31, 255);\" title=\"Star\"></i><span style=\"position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;\">Star</span></span>&nbsp;Afbeelding van Mike van Schoonderwalt via Pexels</p>]]>
    </text>
</learningObject>");*/
