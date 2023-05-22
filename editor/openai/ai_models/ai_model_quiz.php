<?php
//quiz model using gpt-3.5 turbo

//generates dutch questions
$chat_url = "https://api.openai.com/v1/chat/completions";
$model = "gpt-3.5-turbo";
$q = "genereer 3 nederlandse multiple choice vragen over duitsland";
/*
 * readability example below
<quiz>
	<question prompt='Wat is de hoofdstad van Duitsland?' name='Question' type='Single Answer'>
		<option correct='true' text='Berlijn' name='Answer' feedback='Correct dit is de hoofdstad van Duitsland!'/>
		<option correct='false' text='Keulen' name='Answer' feedback='Helaas dit is een andere grote stad in duitsland'/>
	</question>
	<question prompt='Welke rivier stroomt door Berlijn?' name='Question' type='Single Answer'>
        <option correct='true' text='Rijn' name='Answer' feedback='Correct!'/>
		<option correct='false' text='Elbe' name='Answer' feedback='Helaas het juiste antwoord is de Rijn'/>
		<option correct='false' text='Spree' name='Answer' feedback='Helaas het juiste antwoord is de Rijn'/>
	</question>
	<question prompt='Welke Duitse stad staat bekend om zijn bierfeesten?' name='Question' type='Single Answer'>
		<option correct='true' text='München' name='Answer' feedback='Correct dit feest wordt eind november gehouden in München'/>
		<option correct='false' text='Hamburg' name='Answer' feedback='Helaas het juiste antwoord is München'/>
		<option correct='false' text='Keulen' name='Answer' feedback='Helaas het juiste antwoord is München'/>
	</question>
</quiz>
 *
 */

$object = "<quiz><question prompt='Wat is de hoofdstad van Duitsland?' name='Question' type='Single Answer'><option correct='true' text='Berlijn' name='Answer' feedback='Correct dit is de hoofdstad van Duitsland!'/><option correct='false' text='Keulen' name='Answer' feedback='Helaas dit is een andere grote stad in duitsland'/></question><question prompt='Welke rivier stroomt door Berlijn?' name='Question' type='Single Answer'><option correct='true' text='Rijn' name='Answer' feedback='Correct!'/><option correct='false' text='Elbe' name='Answer' feedback='Helaas het juiste antwoord is de Rijn'/><option correct='false' text='Spree' name='Answer' feedback='Helaas het juiste antwoord is de Rijn'/></question><question prompt='Welke Duitse stad staat bekend om zijn bierfeesten?' name='Question' type='Single Answer'><option correct='true' text='München' name='Answer' feedback='Correct dit feest wordt eind november gehouden in München'/><option correct='false' text='Hamburg' name='Answer' feedback='Helaas het juiste antwoord is München'/><option correct='false' text='Keulen' name='Answer' feedback='Helaas het juiste antwoord is München'/></question></quiz>";

$openAI_preset_models->type_list["quiz"] = ["payload" => ["model" => $model, "max_tokens" => 2048, "n" => 1, "temperature" => 0.2, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];
