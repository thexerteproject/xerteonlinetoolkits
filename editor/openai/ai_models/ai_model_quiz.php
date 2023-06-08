<?php
//quiz model using gpt-3.5 turbo

//generates dutch questions
$chat_url = "https://api.openai.com/v1/chat/completions";
$model = "gpt-3.5-turbo";
$q = "genereer 3 nederlandse multiple choice vragen over duitsland met feedback";
$object = "<quiz><question prompt='In welke stad staat het grootste treinstation van Duitsland?' name='treinstation'><option correct='true' text='Berlijn' feedback='Correct! In Berlijn staat het grootste treinstation van Duitsland.' /><option correct='false' text='Frankfurt' feedback='Helaas, Frankfurt heeft weliswaar een van de belangrijkste treinstations, maar het grootste treinstation staat in Berlijn.' /><option correct='false' text='Hamburg' feedback='Nee, Hamburg is weliswaar een belangrijke stad voor de trein, maar het grootste treinstation staat in Berlijn.' /></question><question prompt='Welk Duits automerk staat bekend om zijn sportauto’s?' name='automerk'><option correct='false' text='BMW' feedback='Nee, BMW heeft weliswaar sportieve auto’s, maar zij zijn niet het meest bekend om hun sportauto’s.' /><option correct='true' text='Porsche' feedback='Goed gedaan! Porsche is het Duitse automerk dat wereldwijd bekend staat om zijn sportauto’s.' /><option correct='false' text='Mercedes-Benz' feedback='Helaas, Mercedes-Benz is een bekend automerk, maar bekender om zijn luxere auto’s en niet zozeer om zijn sportauto’s.' /></question><question prompt='Wat is de grootste brouwerij van Duitsland?' name='brouwerij'><option correct='true' text='Anheuser-Busch InBev' feedback='Nee, dit is geen Duitse brouwerij. De grootste brouwerij van Duitsland is in handen van AB InBev.' /><option correct='false' text='Warsteiner' feedback='Helaas, Warsteiner is een bekend merk bier, maar niet de grootste brouwerij van Duitsland.' /><option correct='false' text='Bitburger' feedback='Bedankt voor het meedoen, maar Bitburger is ook niet de grootste brouwerij in Duitsland.' /></question></quiz>";


$openAI_preset_models->type_list["quiz"] = ["payload" => ["model" => $model, "max_tokens" => 3096, "n" => 1, "temperature" => 0.2, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];

$openAI_preset_models->prompt_list["quiz"] = ['gebruik precies de zelfde layout, gebruik ', 'nra' , ' antwoorden per vraag, genereer ', 'nrq', ' nederlandse multiple choice vragen over ', 'subject' , ' met feedback. De vragen moeten anders zijn dan; '];

$openAI_preset_models->multi_run[] = "quiz";