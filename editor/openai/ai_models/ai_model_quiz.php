<?php
//quiz model using gpt-3.5 turbo

//generates dutch questions
$chat_url = "https://api.openai.com/v1/chat/completions";
$model = "gpt-3.5-turbo";
$q = "genereer 3 nederlandse multiple choice vragen over duitsland";
/*
 * readability example below
<quiz>
	<question prompt='Wat is de hoofdstad van Duitsland?' name='vraag 1' type='Single Answer'>
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

$object = "<quiz><question prompt='Wat is de hoofdstad van Duitsland?' name='hoofdstad'><option correct='true' text='Berlijn' name='Berlijn' feedback='Correct dit is de hoofdstad van Duitsland!'/><option correct='false' text='Keulen' name='Keulen' feedback='Helaas dit is een andere grote stad in duitsland'/></question><question prompt='Welke rivier stroomt door Berlijn?' name='rivier'><option correct='false' text='Rijn' name='Rijn' feedback='Helaas de rijn stroomt ver naar het westen'/><option correct='false' text='Elbe' name='Answer' feedback='Helaas de Elbe stroom verder naar het zuiden'/><option correct='true' text='Spree' name='Spree' feedback='Correct!'/></question><question prompt='Welke Duitse stad staat bekend om zijn bierfeesten?' name='bierfeest'><option correct='true' text='München' name='München' feedback='Correct dit feest wordt eind november gehouden in München'/><option correct='false' text='Hamburg' name='Hamburg' feedback='Helaas dit klopt niet, in Hamburg vieren ze Hafengeburtstag'/><option correct='false' text='Keulen' name='Keulen' feedback='Helaas dit klopt niet, in Keulen vieren ze Kölner Karneval'/></question></quiz>";



$openAI_preset_models->type_list["quiz"] = ["payload" => ["model" => $model, "max_tokens" => 2048, "n" => 1, "temperature" => 0.2, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];

$openAI_preset_models->prompt_list["quiz"] = ['gebruik de zelfde layout, gebruik ', 'nra' , ' antwoorden per vraag, genereer ', 'nrq', ' nederlandse multiple choice vragen over ', 'subject' , ' met feedback'];