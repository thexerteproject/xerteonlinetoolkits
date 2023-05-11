<?php
//quiz model using gpt-3.5 turbo

//generates dutch questions
$chat_url = "https://api.openai.com/v1/chat/completions";
$model = "gpt-3.5-turbo";
$q = "genereer 3 nederlandse multiple choice vragen over duitsland";
/*
 * readability example below
 * //TODO old version
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
 *          <Qitem>
 *          <prompt>Welke rivier stroomt door Berlijn?</prompt>
 *              <Option identifier='opt1'>Rijn</Option>
 *              <Option identifier='opt2'>Elbe</Option>
 *              <Option identifier='opt3'>Spree</Option>
 *          </Qitem>
 *          <Qitem>
 *              <prompt>Welke Duitse stad staat bekend om zijn bierfeesten?</prompt>
 *              <Option identifier='opt1'>München</Option>
 *              <Option identifier='opt2'>Hamburg</Option>
 *              <Option identifier='opt3'>Keulen</Option>
 *          </Qitem>
 *      </questions>
 * </MCObject>
 *
 */

$object = "<quiz><question prompt='Wat is de hoofdstad van Duitsland?'><option identifier='true' text='Berlijn' /><option identifier='false' text='Keulen'/></question><question prompt='Welke rivier stroomt door Berlijn?'><option identifier='true' text='Rijn'/><option identifier='false' text='Elbe'/><option identifier='false' text='Spree'/></question><question prompt='Welke Duitse stad staat bekend om zijn bierfeesten?'><option identifier='true' text='München'/><option identifier='false' text='Hamburg'/><option identifier='false' text='Keulen'/></question></quiz>";

$openAI_preset_models->type_list["quiz"] = ["payload" => ["model" => $model, "max_tokens" => 1000, "n" => 1, "temperature" => 0.3, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];
