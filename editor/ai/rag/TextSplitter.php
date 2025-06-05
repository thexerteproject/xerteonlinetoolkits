<?php
/**
 * Split a text string into chunks based on file type, preserving text integrity.
 *
 * TextSplitter functions as a utility for rag\BaseRAG.
 *
 * @param string $text     The input text content.
 * @param string $fileType The type/format of the content (e.g. 'txt', 'html', 'xml', 'json', 'md').
 * @return array           An array of text chunks.
 */

function splitTextByFileType(string $text, string $fileType, $maxSize): array {
    // Trim text to remove any leading/trailing whitespace that could affect splitting.
    $text = trim($text);
    if ($text === '') {
        return [];  // no content to split
    }

    //Max chunk size always represents characters
    $MAX_CHUNK_SIZE = $maxSize;

    switch (strtolower($fileType)) {
        case 'txt':
        case 'text':
            return splitPlainText($text, $MAX_CHUNK_SIZE);

        case 'html':
        case 'xml':
            return splitHtmlXml($text, $MAX_CHUNK_SIZE);

        case 'json':
            return splitJson($text, $MAX_CHUNK_SIZE);

        case 'md':
        case 'markdown':
            return splitMarkdown($text, $MAX_CHUNK_SIZE);

        case 'csv':
            return splitCsv($text, $maxSize);


        default:
            // Unsupported type: do a generic split by character limit.
            return splitByLength($text, $MAX_CHUNK_SIZE);
    }
}

/**
 * Split plain text into chunks by paragraphs, sentences, then smaller punctuation.
 */
function splitPlainText(string $text, int $maxSize): array {
    $chunks = [];

    // 1. Split by double newlines (paragraphs)
    $paragraphs = preg_split("/\n\s*\n/", $text) ?: [$text];
    foreach ($paragraphs as $para) {
        $para = trim($para);
        if ($para === '') continue;  // skip empty paragraphs

        if (strlen($para) <= $maxSize) {
            // Paragraph is within size, take it as a chunk
            $chunks[] = $para;
        } else {
            // 2. Paragraph too large, split by sentence delimiters (. ? !)
            $sentenceChunks = preg_split('/(?<=[.!?])\s+/', $para) ?: [$para];
            foreach ($sentenceChunks as $sentence) {
                $sentence = trim($sentence);
                if ($sentence === '') continue;

                if (strlen($sentence) <= $maxSize) {
                    $chunks[] = $sentence;
                } else {
                    // 3. Sentence still too large, split by smaller punctuation (, or ;)
                    $subSentences = preg_split('/(?<=,|;)\s+/', $sentence) ?: [$sentence];
                    foreach ($subSentences as $sub) {
                        $sub = trim($sub);
                        if ($sub === '') continue;

                        if (strlen($sub) <= $maxSize) {
                            $chunks[] = $sub;
                        } else {
                            // 4. Still too large, do generic chunking on this piece
                            $smallerChunks = splitByLength($sub, $maxSize);
                            foreach ($smallerChunks as $c) {
                                if ($c !== '') {
                                    $chunks[] = $c;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return $chunks;
}

/**
 * Split HTML/XML content into chunks by DOM element boundaries.
 */
function splitHtmlXml(string $html, int $maxSize): array {
    $chunks = [];
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $success = $dom->loadHTML($html, LIBXML_NOERROR | LIBXML_NOWARNING);
    libxml_clear_errors();
    if (!$success) {
        return splitPlainText($html, $maxSize);
    }
    $dom->encoding = 'UTF-8';

    $root = $dom->getElementsByTagName('body')->item(0);
    if (!$root) {
        $root = $dom->documentElement;
    }

    $buffer = '';
    foreach ($root->childNodes as $node) {
        // Serialize node to HTML (preserves structure)
        $htmlChunk = $dom->saveHTML($node);
        // If the node is a text node, treat as text, else as HTML
        if ($node->nodeType === XML_TEXT_NODE) {
            $htmlChunk = htmlspecialchars($node->textContent);
        }

        if (strlen($buffer) + strlen($htmlChunk) > $maxSize) {
            if (trim($buffer) !== '') {
                $chunks[] = $buffer;
                $buffer = '';
            }
            // If current node is itself too large, split further (recursively or as plain text)
            if (strlen($htmlChunk) > $maxSize) {
                if ($node->nodeType === XML_ELEMENT_NODE && trim($node->textContent) !== '') {
                    // Recursively split this element's content (get its inner HTML)
                    $innerHTML = '';
                    foreach ($node->childNodes as $child) {
                        $innerHTML .= $dom->saveHTML($child);
                    }
                    $innerChunks = splitHtmlXml($innerHTML, $maxSize);
                    foreach ($innerChunks as $c) {
                        $chunks[] = $c;
                    }
                } else {
                    // Split as plain text
                    $chunks = array_merge($chunks, splitPlainText($node->textContent, $maxSize));
                }
            } else {
                $buffer = $htmlChunk;
            }
        } else {
            $buffer .= $htmlChunk;
        }
    }
    if (trim($buffer) !== '') {
        $chunks[] = $buffer;
    }

    // Fallback: if still no chunks, treat as plain text
    if (empty($chunks)) {
        $textContent = trim($root->textContent);
        if ($textContent === '') return [];
        return splitPlainText($textContent, $maxSize);
    }
    return $chunks;
}

/**
 * Split JSON string into chunks along top-level structures (objects/arrays).
 */
function splitJson(string $json, int $maxSize): array {
    $chunks = [];

    // Attempt to decode JSON into PHP array/object
    $data = json_decode($json, true);
    if ($data === null) {
        // If JSON is invalid or cannot be decoded, treat it as plain text
        return splitByLength($json, $maxSize);
    }

    // If the decoded data is an array, split each element (or group if needed)
    if (is_array($data) && array_keys($data) === range(0, count($data) - 1)) {
        // This is a sequential array (numeric indices)
        foreach ($data as $element) {
            // Encode each element back to JSON string
            $elemJson = json_encode($element);
            if (!$elemJson) continue;
            if (strlen($elemJson) <= $maxSize) {
                $chunks[] = $elemJson;
            } else {
                // If an element's JSON is too large, we can try splitting that element further.
                // For simplicity, use plain text splitting on the element's JSON string.
                $chunks = array_merge($chunks, splitPlainText($elemJson, $maxSize));
            }
        }
    } elseif (is_array($data)) {
        // This is an associative array (JSON object in original)
        foreach ($data as $key => $value) {
            // Construct a small JSON object for each key-value pair.
            $pairJson = json_encode([$key => $value]);
            if (!$pairJson) continue;
            if (strlen($pairJson) <= $maxSize) {
                $chunks[] = $pairJson;
            } else {
                // If this field is too large (e.g., a large sub-array), split the value further.
                if (is_string($value)) {
                    // For a very large string value, do a plain text split on the string content.
                    $chunks = array_merge($chunks, splitPlainText($value, $maxSize));
                } else {
                    // For a nested object/array that's huge, recursively encode and split it.
                    $nestedJson = json_encode($value);
                    if ($nestedJson) {
                        if (strlen($nestedJson) <= $maxSize) {
                            $chunks[] = $nestedJson;
                        } else {
                            // Recurse by calling splitJson on the nested JSON string.
                            $chunks = array_merge($chunks, splitJson($nestedJson, $maxSize));
                        }
                    }
                }
            }
        }
    } else {
        // The JSON is a single primitive (string/number/boolean) or other non-array, non-object.
        // Treat it as text chunk (or split if it's a long string).
        $jsonStr = json_encode($data);
        if ($jsonStr !== false) {
            if (strlen($jsonStr) <= $maxSize) {
                $chunks[] = $jsonStr;
            } else {
                // If it's a very large string, split it by plain text rules.
                if (is_string($data)) {
                    $chunks = array_merge($chunks, splitPlainText($data, $maxSize));
                } else {
                    // Otherwise, just chunk the JSON string representation.
                    $chunks = array_merge($chunks, splitByLength($jsonStr, $maxSize));
                }
            }
        }
    }

    return $chunks;
}

/**
 * Split Markdown text into chunks by headings, then paragraphs, then list items.
 */
function splitMarkdown(string $markdown, int $maxSize): array {
    $chunks = [];
    $lines = preg_split("/\r?\n/", $markdown);
    if (!$lines) {
        // If somehow splitting fails, fallback to plain text
        return splitPlainText($markdown, $maxSize);
    }

    $currentChunk = '';
    $currentHeader = null;
    foreach ($lines as $line) {
        $trimLine = trim($line);

        // If this line is a Markdown heading
        if (preg_match('/^(#{1,6})\s+(.*)$/', $trimLine, $matches)) {
            // If we were building a chunk for a previous section, finalize it.
            if ($currentChunk !== '') {
                $chunks[] = rtrim($currentChunk);
            }
            // Start a new chunk with this heading.
            $currentChunk = $line . "\n";
            $currentHeader = $matches[1];  // capture the level (not used deeply here, but could be)
            continue;
        }

        // If we hit a blank line (paragraph break)
        if ($trimLine === '') {
            // Add the blank line to maintain paragraph separation in chunk text
            $currentChunk .= "\n";
            // If current chunk is big enough, we might choose to break here as well.
            // Check size; if exceeding max, break the chunk.
            if (strlen($currentChunk) > $maxSize) {
                $chunks[] = rtrim($currentChunk);
                $currentChunk = '';
            }
            continue;
        }

        // Non-heading, non-blank line:
        // Append line to current chunk.
        $currentChunk .= $line . "\n";

        // If this line is a list item and chunk is growing large, consider breaking.
        if (preg_match('/^[-*+]\s+|^\d+\.\s+/', $trimLine) && strlen($currentChunk) > $maxSize) {
            // If it's a bullet or numbered list item and chunk too large, break at this point.
            $chunks[] = rtrim($currentChunk);
            $currentChunk = '';
        }
    }
    // After loop, if there's any remaining chunk, add it.
    if ($currentChunk !== '') {
        // Trim trailing newline
        $chunks[] = rtrim($currentChunk);
    }

    // As an extra precaution, if any chunk is still over maxSize (perhaps a single very large paragraph),
    // apply plain text splitting to that chunk.
    $finalChunks = [];
    foreach ($chunks as $chunk) {
        if (strlen($chunk) > $maxSize) {
            // Split large markdown chunk by sentences/punctuation (treat as plain text for splitting).
            $finalChunks = array_merge($finalChunks, splitPlainText($chunk, $maxSize));
        } else {
            $finalChunks[] = $chunk;
        }
    }

    return $finalChunks;
}

/**
 * Split CSV text into chunks by grouping rows.
 */
function splitCsv(string $text, int $maxSize): array {
    // Split the CSV text by newlines into rows.
    $rows = explode("\n", $text);
    $chunks = [];
    $currentChunk = "";
    foreach ($rows as $row) {
        $row = trim($row);
        if ($row === "") continue;
        // If adding the row to the current chunk doesn't exceed the max size,
        // append it; otherwise, push the current chunk and start a new one.
        if (strlen($currentChunk . " " . $row) <= $maxSize) {
            $currentChunk .= ($currentChunk === "" ? "" : " ") . $row;
        } else {
            $chunks[] = $currentChunk;
            $currentChunk = $row;
        }
    }
    if (trim($currentChunk) !== "") {
        $chunks[] = $currentChunk;
    }
    return $chunks;
}

/**
 * Fallback: split a string into fixed-length chunks (trying not to break words).
 */
function splitByLength(string $text, int $maxSize): array {
    $text = trim($text);
    if ($text === '' || $maxSize <= 0) {
        return [$text];
    }
    $chunks = [];
    $length = strlen($text);
    if ($length <= $maxSize) {
        // No need to split
        return [$text];
    }

    $start = 0;
    while ($start < $length) {
        // Determine end index for this chunk
        $end = $start + $maxSize;
        if ($end >= $length) {
            $end = $length;
        } else {
            // If possible, adjust $end to not cut through a word
            $nextSpace = strrpos(substr($text, $start, $maxSize), ' ');
            if ($nextSpace !== false && $nextSpace > 0) {
                $end = $start + $nextSpace;
            }
        }
        $chunk = substr($text, $start, $end - $start);
        $chunks[] = $chunk;
        $start = $end;
    }
    return $chunks;
}

