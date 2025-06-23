<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
use Smalot\PdfParser\Parser;

interface DocumentLoader {
    public function load(): string;
}

class TextLoader implements DocumentLoader {
    private string $filePath;

    public function __construct(string $filePath) {
        $this->filePath = $filePath;
    }

    public function load(): string {
        return file_exists($this->filePath) ? file_get_contents($this->filePath) : '';
    }
}

class HtmlLoader implements DocumentLoader {
    private string $filePath;

    public function __construct(string $filePath) {
        $this->filePath = $filePath;
    }

    public function load(): string {
        return file_exists($this->filePath) ? strip_tags(file_get_contents($this->filePath)) : '';
    }
}

class CsvLoader implements DocumentLoader {
    private string $filePath;

    public function __construct(string $filePath) {
        $this->filePath = $filePath;
    }

    public function load(): string {
        if (!file_exists($this->filePath)) return '';

        $content = '';
        $file = fopen($this->filePath, 'r');
        while (($data = fgetcsv($file)) !== FALSE) {
            $content .= implode(" ", $data) . "\n";
        }
        fclose($file);
        return $content;
    }
}

class XmlLoader implements DocumentLoader {
    private string $filePath;

    public function __construct(string $filePath) {
        $this->filePath = $filePath;
    }

    public function load(): string {
        if (!file_exists($this->filePath)) return '';

        return $this->stripXMLTagsFromFile($this->filePath);
    }

    private function stripXMLTagsFromFile($filePath): string {
        $dom = new DOMDocument();
        // Suppress warnings for malformed XML, handle CDATA as text
        @$dom->load($filePath, LIBXML_NOCDATA);

        // If the file couldn't be loaded
        if (!$dom->documentElement) return '';

        $textContent = $this->extractTextAndAttributes($dom->documentElement);

        return trim($textContent);
    }

    private function extractTextAndAttributes($node): string {
        $allowedAttributes = [
            'name', 'text', 'goals', 'audience', 'prereq', 'howto', 'summary', 'nextsteps', 'pageintro', 'tip', 'side1', 'side2', 'txt', 'instruction', 'prompt', 'answer', 'intro', 'feedback', 'unit', 'question', 'hint', 'label', 'passage', 'initialtext', 'initialtitle', 'suggestedtext', 'suggestedtitle', 'generalfeedback', 'instructions', 'p1', 'p2', 'title', 'introduction', 'wrongtext', 'wordanswer', 'words', 'url', 'targetnew', 'linkid',
        ];

        $text = "";

        // Element node: show tag name and allowed attributes
        if ($node->nodeType == XML_ELEMENT_NODE) {
            $text .= ucfirst($node->nodeName) . ": ";
            if ($node->hasAttributes()) {
                foreach ($node->attributes as $attr) {
                    if (in_array(strtolower($attr->name), $allowedAttributes)) {
                        $text .= ucfirst($attr->name) . " = '" . $attr->value . "' ";
                    }
                }
            }
            $text .= "\n";
        }

        // Text or CDATA node: show value (CDATA will appear as plain text)
        if ($node->nodeType == XML_TEXT_NODE || $node->nodeType == XML_CDATA_SECTION_NODE) {
            $val = trim($node->nodeValue);
            if ($val !== '') {
                $text .= $val . "\n";
            }
        }

        // Recursively handle children
        if ($node->hasChildNodes()) {
            foreach ($node->childNodes as $child) {
                $text .= $this->extractTextAndAttributes($child);
            }
        }

        return $text;
    }
}

class DocxLoader implements DocumentLoader {
    private string $filePath;

    public function __construct(string $filePath) {
        $this->filePath = $filePath;
    }

    public function load(): string {
        if (!file_exists($this->filePath)) return '';

        $zip = new ZipArchive();
        if ($zip->open($this->filePath) === TRUE) {
            $xml = $zip->getFromName('word/document.xml');
            $zip->close();

            if ($xml) {
                // Remove XML tags and return the extracted text
                return strip_tags(str_replace('</w:p>', "\n", $xml));
            }
        }
        return '';
    }
}

class OdtLoader implements DocumentLoader {
    private string $filePath;

    public function __construct(string $filePath) {
        $this->filePath = $filePath;
    }

    public function load(): string {
        if (!file_exists($this->filePath)) return '';

        $zip = new ZipArchive();
        if ($zip->open($this->filePath) === TRUE) {
            $xml = $zip->getFromName('content.xml');
            $zip->close();

            if ($xml) {
                // Remove XML tags and return the extracted text
                return strip_tags(str_replace('</text:p>', "\n", $xml));
            }
        }
        return '';
    }
}

class XlsxLoader implements DocumentLoader {
    private string $filePath;

    public function __construct(string $filePath) {
        $this->filePath = $filePath;
    }

    public function load(): string {
        if (!file_exists($this->filePath)) return '';

        $zip = new ZipArchive();
        if ($zip->open($this->filePath) !== TRUE) return '';

        $sharedStrings = [];
        if ($zip->locateName('xl/sharedStrings.xml') !== false) {
            $xml = simplexml_load_string($zip->getFromName('xl/sharedStrings.xml'));
            foreach ($xml->si as $string) {
                $sharedStrings[] = (string) $string->t;
            }
        }

        $content = "";
        for ($i = 1; $i <= 10; $i++) { // Check up to 10 sheets (adjust as needed)
            $sheetName = "xl/worksheets/sheet{$i}.xml";
            if ($zip->locateName($sheetName) !== false) {
                $xml = simplexml_load_string($zip->getFromName($sheetName));
                foreach ($xml->sheetData->row as $row) {
                    $rowData = [];
                    foreach ($row->c as $cell) {
                        $value = isset($cell->v) ? (string) $cell->v : '';
                        $attr = (string) $cell['t'];
                        // Check if the value is in sharedStrings
                        if ($attr === 's' && isset($sharedStrings[$value])) {
                            $value = $sharedStrings[$value];
                        }
                        $rowData[] = $value;
                    }
                    $content .= implode("\t", $rowData) . "\n"; // Tab-separated
                }
            }
        }

        $zip->close();
        return trim($content);
    }
}

class PptxLoader implements DocumentLoader {
    private string $filePath;

    public function __construct(string $filePath) {
        $this->filePath = $filePath;
    }

    public function load(): string {
        if (!file_exists($this->filePath)) {
            return '';
        }

        $zip = new ZipArchive();
        if ($zip->open($this->filePath) !== TRUE) {
            return '';
        }

        $output_text = "";
        $slide_number = 1;
        // Loop through slide files: ppt/slides/slide1.xml, slide2.xml, etc.
        while (($xml_index = $zip->locateName("ppt/slides/slide{$slide_number}.xml")) !== false) {
            $xml_data = $zip->getFromIndex($xml_index);
            $dom = new DOMDocument();
            // Load XML with flags to suppress warnings and handle entities.
            $loaded = $dom->loadXML($xml_data, LIBXML_NOENT | LIBXML_XINCLUDE | LIBXML_NOERROR | LIBXML_NOWARNING);
            if ($loaded) {
                // Extract text by stripping the XML tags.
                $output_text .= strip_tags($dom->saveXML()) . "\n";
            }
            $slide_number++;
        }
        $zip->close();
        return trim($output_text);
    }
}

class PdfLoader implements DocumentLoader {
    private string $filePath;

    public function __construct(string $filePath) {
        $this->filePath = $filePath;
    }

    public function load(): string {
        if (!file_exists($this->filePath)) return '';

        $parser = new Parser();
        $pdf = $parser->parseFile($this->filePath);
        $text = $pdf->getText();

        return $text;
    }
}

class DocumentLoaderFactory {
    public static function getLoader(string $filePath): DocumentLoader {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        switch ($extension) {
            case 'txt':
                return new TextLoader($filePath);
            case 'html':
            case 'htm':
                return new HtmlLoader($filePath);
            case 'csv':
                return new CsvLoader($filePath);
            case 'xml':
                return new XmlLoader($filePath);
            case 'docx':
                return new DocxLoader($filePath);
            case 'odt':
                return new OdtLoader($filePath);
            case 'xlsx':
                return new XlsxLoader($filePath);
            case 'pptx':
                return new PptxLoader($filePath);
            case 'pdf':
                return new PdfLoader($filePath);
            default:
                throw new Exception("Unsupported file type: $extension");
        }
    }
}