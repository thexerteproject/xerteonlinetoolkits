<?php

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

        $xml = simplexml_load_file($this->filePath);
        return strip_tags($xml->asXML());
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
/*class OdtLoader implements DocumentLoader {
    private string $filePath;

    public function __construct(string $filePath) {
        $this->filePath = $filePath;
    }

    public function load(): string {
        if (!file_exists($this->filePath)) return '';

        $zip = new ZipArchive();
        if ($zip->open($this->filePath) === TRUE) {
            $xmlStream = $zip->getFromName('content.xml');
            $zip->close();

            if ($xmlStream) {
                return $this->extractText($xmlStream);
            }
        }
        return '';
    }

    private function extractText(string $xmlStream): string {
        $reader = new XMLReader();
        $reader->xml($xmlStream);
        $text = '';

        while ($reader->read()) {
            if ($reader->nodeType == XMLReader::TEXT || $reader->nodeType == XMLReader::CDATA) {
                $text .= $reader->value . "\n";
            }
        }
        $reader->close();
        return trim($text);
    }
}
*/

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

class DocumentLoaderFactory {
    public static function getLoader(string $filePath): DocumentLoader {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        return match ($extension) {
            'txt'  => new TextLoader($filePath),
            'html', 'htm' => new HtmlLoader($filePath),
            'csv'  => new CsvLoader($filePath),
            'xml'  => new XmlLoader($filePath),
            'docx'  => new DocxLoader($filePath),
            'odt'  => new OdtLoader($filePath),
            'xlsx'  => new XlsxLoader($filePath),
            default => throw new Exception("Unsupported file type: $extension"),
        };
    }
}