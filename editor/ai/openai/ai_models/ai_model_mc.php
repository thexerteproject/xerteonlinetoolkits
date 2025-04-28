<?php
//MC model using gpt-3.5 turbo

//DONT USE THIS ONE BAD EXAMPLE

//generates dutch questions
$chat_url = "https://api.openai.com/v1/chat/completions";
$model = "gpt-3.5-turbo";
$q = "genereer 1 nederlandse multiple choice vraag over duitsland";
/*
 * readability example below
 *
 * <MCObject>
 *      <correctResponse>
 *          <value>opt1</value>
 *      </correctResponse>
 *      <questions>
 *          <Qitem>
 *              <prompt>Wat is de hoofdstad van Duitsland?</prompt>
 *              <Option identifier='opt1'>Berlijn</Option>
 *              <Option identifier='opt2'>Keulen</Option>
 *          </Qitem>
 *      </questions>
 * </MCObject>
 *
 */

$object = "<MCObject><CorrectResponse><Value>opt1</Value></CorrectResponse><Questions><Qitem><Prompt>Wat is de hoofdstad van Duitsland?</Prompt><Option identifier='opt1'>Berlijn</Option><Option identifier='opt2'>Keulen</Option></Qitem></Questions></MCObject>";

$openAI_preset_models->type_list["mc"] = ["payload" => ["model" => $model, "max_tokens" => 1000, "n" => 1, "temperature" => 0.3, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];
