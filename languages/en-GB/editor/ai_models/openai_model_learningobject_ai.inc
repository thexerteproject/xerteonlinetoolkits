<?php

    define("LEARNING_PROMPT_LEARNINGOBJECT_BOOTSTRAP", "Create a learning object in xml about active learning.");
    define("DEFAULT_PROMPT_LEARNINGOBJECT_BOOTSTRAP", "Make another learning object using the xml structure in the file I uploaded, this time on the following subject: ,subject,. Check the uploaded files and use 'template_learning_object' to see all the possibilities of the structure. Use some of the options there and the instructions to make a solid learning object (mini-course) on the subject. Make sure to use at least 4 different kinds of nodes. Do not repeat content between pages. Return only the XML in plain text. Do not use markdown. Do not return anything other than the xml.  ");
    define("LEARNING_RESULT_LEARNINGOBJECT_BOOTSTRAP", "To get an xml example, I need to know the specific xml structure your project supports. Please provide or specify the structure, and I can create an xml object on the subject for you.");
    define("LEARNING_PROMPT_LEARNINGOBJECT_STANDARD", "Create an example of a learning object using xml consisting of several helpful and unique pages.");
    define("DEFAULT_PROMPT_LEARNINGOBJECT_STANDARD", "Make another learning object using the exact same XML structure, this time on the following subject: ,subject,. Please make use of the different pages you mentioned in your previous response to make a solid mini-course on the subject. Make sure to use at least 4 different kinds of nodes. Do not repeat content between pages. Return only the XML in plain text. Do not use markdown. Do not return anything other than the xml.  ");
    /*use below one for specific page*/
    define("LEARNING_RESULT_LEARNINGOBJECT_STANDARD", "<learningObject
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
</learningObject>");
