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

    define("MANAGEMENT_AI_ADMIN_GUIDE_URL", "https://xot.xerte.org.uk/play_651");

    define("MANAGEMENT_AI_ADMIN_GUIDE_MESSAGE", "<h3>Manual & Advice</h3><p>For detailed and up-to-date instructions, including recommended vendor combinations, suggestions and advice, please refer to the Xerte Assistant & AI Admin Guide: </p>");

    define("MANAGEMENT_AI_ADMIN_PREFERRED_MODEL", "Preferred Model");
    define("MANAGEMENT_AI_ADMIN_PREFERRED_MODEL_NOT_APPLICABLE", "Preferred model selection is not applicable for this provider.");
    define("MANAGEMENT_AI_ADMIN_PREFERRED_MODEL_TOOLTIP", "Listed models include all available models for a given vendor, even if the models are not of the corresponding type. Please make sure you choose a text completion model for the 'AI Content Generation' vendors, an encoding model for the 'Encoding' vendors, etc. For more information on model choices visit the associated vendor websites and/or the admin guide linked at the top of this page.");

    define("MANAGEMENT_AI_ADMIN_ERROR_VENDOR_CONFIG", "Configuration error: vendor_config.php is missing. Please visit the official admin guide for instructions on where and how to set up this file: ");;
