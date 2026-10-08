<?PHP

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

	define("MANAGEMENT_SETTINGS", " settings");

    define("MANAGEMENT_VENDOR_AI_OPENAI", "OpenAI");
    define("MANAGEMENT_VENDOR_AI_MISTRAL", "Mistral");
    define("MANAGEMENT_VENDOR_AI_ANTHROPIC", "Anthropic");
    define("MANAGEMENT_VENDOR_AI_GEMINI", "Gemini");
    define("MANAGEMENT_VENDOR_ENCODING_OPENAIENC", "OpenAI");
    define("MANAGEMENT_VENDOR_ENCODING_MISTRALENC", "Mistral");
    define("MANAGEMENT_VENDOR_IMAGE_PEXELS", "Pexels");
    define("MANAGEMENT_VENDOR_IMAGE_PIXABAY", "Pixabay");
    define("MANAGEMENT_VENDOR_IMAGE_UNSPLASH", "Unsplash");
    define("MANAGEMENT_VENDOR_IMAGE_WIKIMEDIA", "Wikimedia Foundation");
    define("MANAGEMENT_VENDOR_IMAGEGEN_DALLE2", "Dalle 2");
    define("MANAGEMENT_VENDOR_IMAGEGEN_DALLE3", "Dalle 3");
    define("MANAGEMENT_VENDOR_IMAGEGEN_GPT1", "GPT Image 1");
    define("MANAGEMENT_VENDOR_TRANSCRIPTION_OPENAI", "OpenAI");
    define("MANAGEMENT_VENDOR_TRANSCRIPTION_GLADIA", "Gladia");

    define("MANAGEMENT_VENDOR", " vendors");

    define("MANAGEMENT_VENDOR_GROUP_AI", "AI Content Generation");
    define("MANAGEMENT_VENDOR_GROUP_IMAGE", "Image Retrieval");
    define("MANAGEMENT_VENDOR_GROUP_IMAGEGEN", "Image Generation");
    define("MANAGEMENT_VENDOR_GROUP_ENCODING", "Encoding");
    define("MANAGEMENT_VENDOR_GROUP_TRANSCRIPTION", "Transcription");


	define("MANAGEMENT_ENABLE_VENDOR", "Allow usage of ");

    define("MANAGEMENT_KEY_STATUS", "Currently there is no valid API key associated with this vendor, please add one in vendor_config");

    define("MANAGEMENT_ENABLE_SUBOPTIONS", "Select the desired suboptions for ");

    define("MANAGEMENT_AI_ETHICAL_STATEMENT_URL", "https://xot.xerte.org.uk/play_653");

    define("MANAGEMENT_AI_ETHICAL_STATEMENT_MESSAGE", "<h3>Ethical Statement</h3><p>The Xerte AI Ethical Use and Transparency Statement, as well as an AI form relevant for the use of Xerte's AI functioanlities in an organization, can be found here: </p>");

    define("MANAGEMENT_AI_ADMIN_GUIDE_URL", "https://xot.xerte.org.uk/play_651");

    define("MANAGEMENT_AI_ADMIN_GUIDE_MESSAGE", "<h3>Manual & Advice</h3><p>For detailed and up-to-date instructions, including recommended vendor combinations, suggestions and advice, please refer to the Xerte Assistant & AI Admin Guide: </p>");

    define("MANAGEMENT_AI_ADMIN_PREFERRED_MODEL", "Preferred Model");
    define("MANAGEMENT_AI_ADMIN_PREFERRED_MODEL_NOT_APPLICABLE", "Preferred model selection is not applicable for this provider.");
    define("MANAGEMENT_AI_ADMIN_PREFERRED_MODEL_TOOLTIP", "Listed models include all available models for a given vendor, even if the models are not of the corresponding type. Please make sure you choose a text completion model for the 'AI Content Generation' vendors, an encoding model for the 'Encoding' vendors, etc. For more information on model choices visit the associated vendor websites and/or the admin guide linked at the top of this page.");

    define("MANAGEMENT_AI_ADMIN_ERROR_VENDOR_CONFIG", "Configuration error: vendor_config.php is missing. Please visit the official admin guide for instructions on where and how to set up this file: ");;

    define("MANAGEMENT_AI_ADMIN_OPTIONS_READING_LEVEL", "Reading Level Options");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_EDUCATION_LEVEL", "Education Level Options");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_TONE_AND_STYLE", "Tone and Style Options");

    define("MANAGEMENT_AI_ADMIN_DEFAULT_AI_MODEL", "AI Model Default");
    define("MANAGEMENT_AI_ADMIN_DEFAULT_READING_LEVEL", "Reading Level Default");
    define("MANAGEMENT_AI_ADMIN_DEFAULT_EDUCATION_LEVEL", "Education Level Default");
    define("MANAGEMENT_AI_ADMIN_DEFAULT_TONE_AND_STYLE", "Tone and Style Default");

    define("MANAGEMENT_AI_ADMIN_OPTIONS_AND_DEFAULTS_HEADING", "AI Base Settings Options and Default Values");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_DESCRIPTION", "These options will show up as a drop-down menu on the learning object level for all users with the requisite role to access Xerte's AI Assistant features. Options are a comma-separated list, and are displayed in the same order that they are written here. The original values can be freely re-arranged and are translatable with the Xerte translation tool. Any custom-added values will be displayed as written here.");
    define("MANAGEMENT_AI_ADMIN_DEFAULTS_DESCRIPTION", "These are the default values of the base AI settings drop-down options. Only values which have previously been added as options in the lists above can be selected.");
    define("MANAGEMENT_AI_ADMIN_DEFAULTS_HEADING", "Default Values for New Learning Objects:");

    define("MANAGEMENT_AI_ADMIN_OPTIONS_CHOICES_READING_LEVEL_BEGINNER_A1", "Beginner A1");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_CHOICES_READING_LEVEL_BEGINNER_A2", "Beginner A2");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_CHOICES_READING_LEVEL_INTERMEDIATE_B1", "Intermediate B1");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_CHOICES_READING_LEVEL_INTERMEDIATE_B2", "Intermediate B2");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_CHOICES_READING_LEVEL_ADVANCED_C1", "Advanced C1");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_CHOICES_READING_LEVEL_ADVANCED_C2", "Advanced C2");

    define("MANAGEMENT_AI_ADMIN_OPTIONS_EDUCATION_LEVEL_MIDDLE_SCHOOL", "Middle School");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_EDUCATION_LEVEL_HIGH_SCHOOL", "High School");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_EDUCATION_LEVEL_VOCATIONAL", "Vocational");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_EDUCATION_LEVEL_BACHELORS", "Bachelors");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_EDUCATION_LEVEL_UNIVERSITY", "University");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_EDUCATION_LEVEL_MASTERS", "Masters");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_EDUCATION_LEVEL_PHD", "PhD");

    define("MANAGEMENT_AI_ADMIN_OPTIONS_TONE_AND_STYLE_FORMAL", "Formal");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_TONE_AND_STYLE_SEMI_FORMAL", "Semi-formal");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_TONE_AND_STYLE_INFORMAL", "Informal");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_TONE_AND_STYLE_ACTIVE", "Active");
    define("MANAGEMENT_AI_ADMIN_OPTIONS_TONE_AND_STYLE_PASSIVE", "Passive");
