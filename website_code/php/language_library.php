<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Created by JetBrains PhpStorm.
 * User: tom
 * Date: 23-1-13
 * Time: 12:20
 * To change this template use File | Settings | File Templates.
 */
_load_language_file("/website_code/php/language_library.inc");

function languageInstalled($langcode)
{
    // Return true if the folder "languages/<code>"  or the folder "modules/xerte/parent_templates/Nottingham/wizards/<code>" exists
    return (is_dir(dirname(__FILE__) . "/../../languages/" . $langcode) || is_dir(dirname(__FILE__) . "/../../modules/xerte/parent_templates/Nottingham/wizards/" . $langcode));
}

function versionLanguageInstalled($langcode){
    $filePath = dirname(__FILE__) . "/../../languages/" . $langcode . "/version";
    $content = "";

    if(is_file($filePath)) {
        $fp = fopen($filePath, "r");
        
		//read the entire file
        $content = fread($fp, filesize($filePath));
        
        fclose($fp);
    }

    return $content;
}

function getLanguages()
{
    libxml_use_internal_errors(true);
    $xml = simplexml_load_file(dirname(__FILE__) . "/../../languages/language-config.xml");
    $langs = array();
    $xml_langs = $xml->xpath('/*/language');
    foreach ($xml_langs as $xml_lang)
    {
        if (languageInstalled((string)$xml_lang['code']))
        {
            $langs[(string)$xml_lang['code']] = (object)array(
                "name"  => (string)$xml_lang['name'],
                "version" => versionLanguageInstalled((string)$xml_lang['code'])
            );
        }
    }
    return $langs;
}

function getWizardfile($langcode)
{
    libxml_use_internal_errors(true);
    $xml = file_get_contents(dirname(__FILE__) . '/../../languages/language-config.xml');
    $xml = simplexml_load_string($xml);

    $xml_langs = $xml->xpath('/*/language');
    $wizardFile="";
    foreach ($xml_langs as $xml_lang)
    {
        if ((string)$xml_lang['code'] == $langcode)
        {
            $wizardFile = "languages/" . (string)$xml_lang['wizardfile'];
            break;
        }
        if ((string)$xml_lang['code'] == "en-GB")
        {
            $fallback = "languages/" . (string)$xml_lang['wizardfile'];
        }
    }
    if (!$wizardFile)
        $wizardFile = $fallback;
    return $wizardFile;
}

function getLanguageAbbreviation($langcode)
{
    $parts = explode('-', $langcode);
    return strtoupper($parts[0]);
}

function getLanguageFlagCountryCode($langcode)
{
    $map = array(
        'en-GB' => 'GB',
        'nl-NL' => 'NL',
        'nl-BE' => 'BE',
        'fr-FR' => 'FR',
        'es-ES' => 'ES',
        'cs-CZ' => 'CZ',
        'cy-GB' => 'GB',
        'pl-PL' => 'PL',
        'ru-RU' => 'RU',
        'nb-NO' => 'NO',
        'it-IT' => 'IT',
        'ja-JP' => 'JP',
        'pt-BR' => 'BR',
        'de-DE' => 'DE',
        'tr-TR' => 'TR',
        'uk-UA' => 'UA',
        'el-GR' => 'GR',
    );

    if (isset($map[$langcode])) {
        return $map[$langcode];
    }

    $parts = explode('-', $langcode);
    return strtoupper(isset($parts[1]) ? $parts[1] : $parts[0]);
}

function getLanguageFlagEmoji($langcode)
{
    $country = getLanguageFlagCountryCode($langcode);
    if (strlen($country) !== 2) {
        return '';
    }

    $first = 0x1F1E6 + ord($country[0]) - ord('A');
    $second = 0x1F1E6 + ord($country[1]) - ord('A');

    return mb_chr($first) . mb_chr($second);
}

function getLanguageFlagHtml($langcode)
{
    $country = strtolower(getLanguageFlagCountryCode($langcode));
    $flagPath = dirname(__FILE__) . "/../images/flags/{$country}.svg";

    if (is_file($flagPath)) {
        return '<img src="website_code/images/flags/' . htmlspecialchars($country) . '.svg" alt="" class="userbar-lang-flag-img" width="28" height="20">';
    }

    return '<span class="userbar-lang-flag" aria-hidden="true">' . getLanguageFlagEmoji($langcode) . '</span>';
}

function getLanguageDisplayLabel($langcode, $fullName)
{
    $labels = array(
        'en-GB' => 'English - UK',
        'nl-NL' => 'Nederlands - NL',
        'nl-BE' => 'Vlaams - BE',
        'fr-FR' => 'Français - FR',
        'es-ES' => 'Español - ES',
        'cs-CZ' => 'Czech - CZ',
        'cy-GB' => 'Cymraeg - UK',
        'pl-PL' => 'Polish - PL',
        'ru-RU' => 'Russian - RU',
        'nb-NO' => 'Norsk bokmål - NO',
        'it-IT' => 'Italiano - IT',
        'ja-JP' => 'Japanese - JP',
        'pt-BR' => 'Portugues - BR',
        'de-DE' => 'Deutsch - DE',
        'tr-TR' => 'Türkçe - TR',
        'uk-UA' => 'Українська - UA',
        'el-GR' => 'Ελληνικά - GR',
    );

    if (isset($labels[$langcode])) {
        return $labels[$langcode];
    }

    if (preg_match('/^(.+?)\s*\(/', $fullName, $matches)) {
        $parts = explode('-', $langcode);
        $region = strtoupper(isset($parts[1]) ? $parts[1] : $parts[0]);
        if ($langcode === 'en-GB') {
            $region = 'UK';
        }
        return trim($matches[1]) . ' - ' . $region;
    }

    return $fullName;
}

function getCurrentLanguageCode()
{
    if (isset($_SESSION['toolkits_language'])) {
        return $_SESSION['toolkits_language'];
    }
    return 'en-GB';
}

function display_language_userbar()
{
    $languages = getLanguages();
    $current = getCurrentLanguageCode();
    $currentAbbr = getLanguageAbbreviation($current);
    ?>
    <div class="userbar-item userbar-language">
        <i class="fa fa-globe userbar-globe-icon" aria-hidden="true"></i>
        <div class="userbar-dropdown language-dropdown">
            <button type="button" class="userbar-dropdown-toggle" aria-haspopup="true" aria-expanded="false" aria-label="<?PHP echo LANGUAGE_PROMPT; ?>">
                <span class="userbar-dropdown-label"><?php echo htmlspecialchars($currentAbbr); ?></span>
                <i class="fa fa-chevron-down userbar-chevron" aria-hidden="true"></i>
            </button>
            <div class="userbar-dropdown-menu" role="menu">
                <form action="" method="POST" class="general userbar-language-form">
                    <input type="hidden" name="language" id="language-input" value="<?php echo htmlspecialchars($current); ?>">
                    <ul class="userbar-dropdown-list">
                        <?php foreach ($languages as $key => $value) {
                            $active = ($key === $current) ? ' active' : '';
                            $label = getLanguageDisplayLabel($key, $value->name);
                            $flag = getLanguageFlagHtml($key);
                            ?>
                            <li role="none">
                                <button type="button" role="menuitem" class="userbar-dropdown-item userbar-language-item<?php echo $active; ?>" data-language="<?php echo htmlspecialchars($key); ?>">
                                    <?php echo $flag; ?>
                                    <span class="userbar-lang-label"><?php echo htmlspecialchars($label); ?></span>
                                </button>
                            </li>
                        <?php } ?>
                    </ul>
                </form>
            </div>
        </div>
    </div>
    <?php
}

function display_language_selectionform($formclass, $showLabel)
{
	$cssClass = $showLabel == false ? "sr-only" : "";
    if ($formclass != "")
    {
        ?>
        <form action='' method='POST' class="<?php echo $formclass; ?>">
        <label for="language-selector" class="<?php echo $cssClass; ?>"><?PHP echo LANGUAGE_PROMPT; ?> </label>
        <?php
    }
    else
    {
        ?>
        <form action='' method='POST'>
        <label for="language-selector" class="<?php echo $cssClass; ?>"><?PHP echo LANGUAGE_PROMPT; ?> </label> 
        <?php
    }
?>

        <select name='language' style="width:145px;margin:0 -2px 0 0;" id="language-selector" onchange="this.form.submit()">
          <?php
          /* I've just specified a random list of possible languages; "Nonsense" is minimal and just there so you can see the login page switch around */
          $languages = getLanguages();
          //$languages = array('en-GB' => 'English', 'nl-NL' => 'Nederlands', 'en-XX' => 'Nonsense', 'fr-FR' => 'French', 'es-ES' => 'Spanish', 'it-IT' => 'Italian', 'ca-ES' => "Catalan");
          foreach ($languages as $key => $value) {
              $selected = '';
              if (isset($_SESSION['toolkits_language']) && $_SESSION['toolkits_language'] == $key) {
                  $selected = " selected=selected ";
              }
              echo "<option value='{$key}' $selected>{$value->name}</option>\n";
          }
          ?>
        </select>
        <!--<input type='submit' class="xerte_button" value='<?PHP echo LANGUAGE_BUTTON_TEXT; ?>' name='submit'/>-->
    </form>
<?php
}
?>
