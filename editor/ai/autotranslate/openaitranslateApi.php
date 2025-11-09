<?php
//openai api master class
//file name must be $api . translateApi.php for example openaitranslateApi.php when adding new api
class openaitranslateApi
{
    function __construct() {
        require_once (str_replace('\\', '/', __DIR__) . "/../../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
    }

    private function stripXMLTagsFromFile($filePath) {
        // Load the XML from the file into DOMDocument
        $dom = new DOMDocument();
        if (!file_exists($filePath)) {
            return (object)["status" => "error", "message" => "error when locating data.xml file, checked file path:" . $filePath];
        }

        $dom->load($filePath, LIBXML_NOCDATA);

        // Initialize an array to store the attribute mapping
        $attributeMap = [];

        // Traverse through the elements and map text from allowed attributes
        $this->extractTextAndMapAttributes($dom->documentElement, '', $attributeMap);

        // Return the map of attribute locations and their text values
        return $attributeMap;
    }

    private function extractTextAndMapAttributes($node, $xpath = '', &$attributeMap = [], &$elementCount = []) {
        // Define the list of allowed attributes you want to translate
        $allowedAttributes = [
            'name', 'text', 'goals', 'audience', 'prereq', 'howto', 'summary', 'nextsteps', 'pageIntro', 'tip', 'side1', 'side2', 'txt', 'instruction', 'prompt', 'answer', 'intro', 'feedback', 'unit', 'question', 'hint', 'label', 'passage', 'initialText', 'initialTitle', 'suggestedText', 'suggestedTitle', 'generalFeedback', 'instructions', 'p1', 'p2', 'title', 'introduction', 'wrongText', 'wordAnswer', 'words',
        ];

        // Build the current XPath for the node
        // Track element occurrences to handle duplicates
        if ($node->nodeType == XML_ELEMENT_NODE) {
            // Generate the element path with an index if it’s a duplicate
            $elementName = $node->nodeName;
            $elementPath = $xpath . '/' . $elementName;

            // If we've seen this path before, increment the counter; otherwise, initialize it
            if (isset($elementCount[$elementPath])) {
                $elementCount[$elementPath]++;
            } else {
                $elementCount[$elementPath] = 1;
            }

            // Add the position index if there are multiple occurrences
            $indexedPath = $elementPath;
            if ($elementCount[$elementPath] > 1) {
                $indexedPath .= '[' . $elementCount[$elementPath] . ']';
            }

            // Map attributes if they are allowed
            if ($node->hasAttributes()) {
                foreach ($node->attributes as $attr) {
                    if (in_array(strtolower($attr->name), $allowedAttributes) && trim($attr->value) !== '') {
                        $attributeMap["$indexedPath/@{$attr->name}"] = $attr->value;
                    }
                }
            }
        } else if ($node->nodeType == XML_CDATA_SECTION_NODE){
            if (trim($node->data) !== '') {
                $attributeMap["$xpath/CDATA"] = $node->data;
            }
        } else if ($node->nodeType == XML_TEXT_NODE){
            if (trim($node->data) !== '') {
                $attributeMap["$xpath/TEXT"] = $node->data;
            }
        }


        // Traverse child nodes recursively
        if ($node->hasChildNodes()) {
            foreach ($node->childNodes as $child) {
                $this->extractTextAndMapAttributes($child, $indexedPath, $attributeMap, $elementCount); // Recursive call
            }
        }
    }

    private function prepareURL($uploadPath){
        $basePath = __DIR__ . '/../../../'; // Moves up from ai -> editor -> xot
        $finalPath = realpath($basePath . $uploadPath);

        if ($finalPath === false) {
            throw new Exception("File does not exist: $finalPath");
        }

        return $finalPath;
    }

    private function replaceTranslatedText($filePath, $translatedMap)
    {
        // Step 1: Load the XML into DOMDocument
        $dom = new DOMDocument();
        if (!file_exists($filePath)) {
            return (object)["status" => "error", "message" => "File not found: " . $filePath];
        }

        $dom->load($filePath, LIBXML_NOCDATA);

        // Step 2: Use DOMXPath to navigate and update the XML structure
        $xpathObj = new DOMXPath($dom);

        // Step 3: Loop through the translated map and update each entry in the XML
        foreach ($translatedMap as $xpath => $translatedText) {
            // Check for attribute, CDATA, or text node path
            if (strpos($xpath, '/@') !== false) {
                // Attribute update
                $xpathParts = explode('/@', $xpath);
                $elementXpath = $xpathParts[0];
                $attributeName = $xpathParts[1];

                // Find the element and update the attribute
                $elements = $xpathObj->query($elementXpath);
                if ($elements->length > 0) {
                    foreach ($elements as $element) {
                        $element->setAttribute($attributeName, $translatedText);
                    }
                }
            } else if (strpos($xpath, '/TEXT') !== false) {
                // Text node update
                $elementXpath = str_replace('/TEXT', '', $xpath); // Remove /TEXT to get element path
                $elements = $xpathObj->query($elementXpath);
                if ($elements->length > 0) {
                    foreach ($elements as $element) {
                        // Remove existing text nodes, then set new text
                        while ($element->firstChild) {
                            $element->removeChild($element->firstChild);
                        }
                        $element->appendChild($dom->createTextNode($translatedText));
                    }
                }
            } else if (strpos($xpath, '/CDATA') !== false) {
                // CDATA section update
                $elementXpath = str_replace('/CDATA', '', $xpath); // Remove /CDATA to get element path
                $elements = $xpathObj->query($elementXpath);
                if ($elements->length > 0) {
                    foreach ($elements as $element) {
                        // Remove existing children and set new CDATA
                        while ($element->firstChild) {
                            $element->removeChild($element->firstChild);
                        }
                        $cdataNode = $dom->createCDATASection($translatedText);
                        $element->appendChild($cdataNode);
                    }
                }
            }
        }

        // Step 4: Instead of saving, return the updated XML as a string
        $updatedXml = $dom->saveXML(); // This will return the XML as a string

        // Return success response with the modified XML
        return (object)[
            "status" => "success",
            "message" => "XML translated successfully.",
            "newXml" => $updatedXml // Include the new XML string in the response
        ];
    }

    private function translateBatch($texts, $target_language)
    {
        $openAiKey = $this->xerte_toolkits_site->openai_key;

        // Use a unique delimiter unlikely to appear in normal text
        $uniqueDelimiter = "@@@###@@@";
        $numberedTexts = array_map(fn($text, $index) => "ID_{$index}: {$text}", $texts, array_keys($texts));
        $concatenatedText = implode("\n{$uniqueDelimiter}\n", $numberedTexts);

        $systemMessage = "You are an AI translator. Translate each text segment from English to " . $target_language . ". Segments are identified by 'ID_x:' and separated by '{$uniqueDelimiter}'. Translate each fully without skipping anything, even if it seems redundant. Return each translation separated by '{$uniqueDelimiter}', and include the 'ID_x:' labels in your output.";

        $userMessage = [
            ["role" => "system", "content" => $systemMessage],
            ["role" => "user", "content" => $concatenatedText]
        ];

        $apiInput = [
            "model" => "gpt-4o-mini",
            "temperature" => 0.2,
            "messages" => $userMessage
        ];

        $data = json_encode($apiInput);

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, "https://api.openai.com/v1/chat/completions");
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$openAiKey}",
            "Content-Type: application/json"
        ]);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

        $result = curl_exec($curl);
        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);
            return (object)["status" => "error", "message" => "cURL error: " . $error_msg];
        }

        curl_close($curl);
        $resultDecoded = json_decode($result);

        if (isset($resultDecoded->error)) {
            return (object)["status" => "error", "message" => "OpenAI API error: " . $resultDecoded->error->message];
        }

        // Split translations using the unique delimiter
        $translatedText = $resultDecoded->choices[0]->message->content;
        $translatedTexts = preg_split('/\s*' . preg_quote($uniqueDelimiter, '/') . '\s*/', $translatedText);

        // Remove unique identifiers (ID_x:) after translation
        $translatedTexts = array_map(fn($text) => preg_replace('/^ID_\d+:\s*/', '', $text), $translatedTexts);

        return array_map('trim', $translatedTexts);
    }

    private function translateInBatches($texts, $target_language, $batchSize = 2000)
    {
        $allTranslatedTexts = [];

        // Break texts into batches based on the batch size
        $currentBatch = [];
        $currentLength = 0;

        foreach ($texts as $text) {
            $currentLength += strlen($text); // Approximate token count by character length
            $currentBatch[] = $text;

            // If current batch size exceeds the batchSize, send the batch for translation
            if ($currentLength > $batchSize) {
                $batchResult = $this->translateBatch($currentBatch, $target_language);
                if ($batchResult->status === "error") {
                    return $batchResult; // Return error if translation fails
                }

                // Append each translation in the batch to the main result
                $allTranslatedTexts = array_merge($allTranslatedTexts, $batchResult);

                // Reset for the next batch
                $currentBatch = [];
                $currentLength = 0;
            }
        }

        // Handle the last batch without adding a trailing delimiter
        if (!empty($currentBatch)) {
            $batchResult = $this->translateBatch($currentBatch, $target_language);
            if ($batchResult->status === "error") {
                return $batchResult; // Return error if translation fails
            }

            // Append each translation in the last batch directly, without adding a delimiter after
            $allTranslatedTexts = array_merge($allTranslatedTexts, $batchResult);
        }

        return $allTranslatedTexts; // Return array with delimiters only between batches
    }

    // Public function to handle the request
    public function tr_request($base_url, $target_language)
    {
        $baseUrl = rtrim($base_url, '/'); // Trim any trailing slash
        $xmlLoc = $this->prepareURL($baseUrl . "/data.xml");

        // Step 1: Extract the text and attributes to be translated
        $attributeMap = $this->stripXMLTagsFromFile($xmlLoc); // Extracts a map of XPath => Text

        if (!$attributeMap) {
            return (object)[
                "status" => "error",
                "message" => "Error extracting XML attributes for translation."
            ];
        }

        // Step 2: Collect all the texts to be translated in batch
        $textsToTranslate = []; // List of all texts to be translated
        foreach ($attributeMap as $xpath => $text) {
            $textsToTranslate[] = $text; // Collect texts for batch processing
        }

        // Step 3: Determine if we need batching due to token limits
        $batchSizeLimit = 4000; // Define a reasonable batch size limit based on OpenAI's token limits
        $totalLength = array_sum(array_map('strlen', $textsToTranslate)); // Get total length of all texts

        if ($totalLength > $batchSizeLimit) {
            // Use `translateInBatches` to handle large amounts of text
            $translatedTexts = $this->translateInBatches($textsToTranslate, $target_language, $batchSizeLimit);
        } else {
            // Use `translateBatch` to translate all texts in one go
            $translatedTexts = $this->translateBatch($textsToTranslate, $target_language);
        }

        // Check if translation succeeded
        if (is_object($translatedTexts) && $translatedTexts->status === "error") {
            return (object)[
                "status" => "error",
                "message" => "Translation failed: " . $translatedTexts->message
            ];
        }

        // Step 4: Map the translated texts back to their original XPaths
        $translatedMap = [];
        $i = 0;
        foreach ($attributeMap as $xpath => $text) {
            $translatedMap[$xpath] = $translatedTexts[$i++]; // Match translation with original XPath
        }

        // Step 5: Get the updated XML string without saving to a file
        $result = $this->replaceTranslatedText($xmlLoc, $translatedMap);

        // Return the translated XML string in the response
        return $result -> newXml;
    }
}
