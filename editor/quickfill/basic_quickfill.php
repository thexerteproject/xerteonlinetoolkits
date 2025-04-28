<?php
class basicquickfill
{
    public function __construct()
    {

    }

    private function getXWDBaseDirectory($language)
    {
        // Get the current script's directory
        $currentDir = __DIR__;

        // Navigate back to "xot" directory
        $xotBaseDir = dirname($currentDir, 2); // Moves back twice to get xot

        // Construct the final XWD path
        //$xwdPath = $xotBaseDir . DIRECTORY_SEPARATOR . "src" . DIRECTORY_SEPARATOR . "Nottingham" . DIRECTORY_SEPARATOR . "wizards" . DIRECTORY_SEPARATOR . $language;
        $xwdPath = $xotBaseDir . DIRECTORY_SEPARATOR . "modules" . DIRECTORY_SEPARATOR . "xerte" . DIRECTORY_SEPARATOR . "parent_templates" . DIRECTORY_SEPARATOR . "Nottingham" . DIRECTORY_SEPARATOR . "wizards" . DIRECTORY_SEPARATOR . $language;

        // Ensure the directory exists
        if (!is_dir($xwdPath)) {
            throw new Exception("XWD directory not found: $xwdPath");
        }

        return $xwdPath;
    }

    private function getXWDFilePath($type, $basedir)
    {
        $type='data';
        $filePath = $basedir . DIRECTORY_SEPARATOR . $type . '.xwd';

        if (!file_exists($filePath)) {
            throw new Exception("XWD file not found for type: $type at path: $filePath");
        }

        return $filePath;
    }

    // Recursive function to build the XML string
    private function buildXml($node, $hierarchy, $parameters, $attributes = [], $depth = 0)
    {
        if ($depth > 50) { // arbitrary limit for debugging
            throw new Exception("Maximum recursion depth reached at node {$node}");
        }

        // Build the attributes string if any attributes are provided.
        $attrString = '';
        if (!empty($attributes)) {
            foreach ($attributes as $attr => $value) {
                $attrString .= " {$attr}=\"" . htmlspecialchars($value, ENT_QUOTES) . "\"";
            }
        }

        // Start with the opening tag including attributes.
        $xml = "<{$node}{$attrString}>";

        // Check if this node has defined children in the hierarchy
        if (isset($hierarchy[$node])) {
            foreach ($hierarchy[$node]['nodes'] as $childDef) {
                // Each child definition is expected to be an array with keys 'node' and optionally 'attributes'
                $childName = $childDef['node'];
                $childAttributes = isset($childDef['attributes']) ? $childDef['attributes'] : [];
                // Determine how many times this child should appear.
                // Defaults to 0 if no parameter is provided.
                $count = isset($parameters[$childName]) ? intval($parameters[$childName]) : 0;

                // Apply the "max" limit if it exists in topLevelAttributes
                if (isset($hierarchy[$childDef['node']]['topLevelAttributes']['max'])) {
                    $max = intval($hierarchy[$childDef['node']]['topLevelAttributes']['max']);
                    $count = min($count, $max);
                }

                // If duplicate is "false", set count to 0 if it's greater than 0
                if (isset($hierarchy[$node]['topLevelAttributes']['duplicate']) && $hierarchy[$node]['topLevelAttributes']['duplicate'] === "false" && $count > 0) {
                    $count = 0;
                }

                for ($i = 0; $i < $count; $i++) {
                    $xml .= $this->buildXml($childName, $hierarchy, $parameters, $childAttributes, $depth + 1);
                }
            }
        }

        // Append the closing tag of the current node
        $xml .= "</{$node}>";
        return $xml;
    }

    function processElement($element, &$map) {
        $topLevelAttributes = [];
        foreach ($element->attributes() as $attr => $value) {
            $topLevelAttributes[$attr] = (string)$value;
        }
        foreach ($element->children() as $child) {
            if ($child->getName() === 'newNodes') {
                //This way, we only add the top-level attributes of relevant nodes which have child nodes/subpages
                if (!isset($map[$element->getName()])){
                    $map[$element->getName()] = [
                        'topLevelAttributes' => $topLevelAttributes
                    ];
                }
                foreach ($child->children() as $newNode) {
                    // Extract the inner content, which may be wrapped in CDATA
                    $cdata = trim((string)$newNode);
                    if ($cdata) {
                        // Try to load the CDATA content as XML
                        $snippet = simplexml_load_string($cdata);
                        if ($snippet) {
                            $nodeName = $snippet->getName();
                            $attributes = [];
                            foreach ($snippet->attributes() as $attr => $value) {
                                $attributes[$attr] = (string)$value;
                            }
                            // Store both node name and attributes under the parent element name
                            $map[$element->getName()]['nodes'][] = [
                                'node'       => $nodeName, //note that this is the name of the CDATA node found within the <newNodes>
                                'attributes' => $attributes,
                            ];
                        }
                    } else {
                        // In case there's no CDATA, use the node directly
                        $nodeName = $newNode->getName();
                        $attributes = [];
                        foreach ($newNode->attributes() as $attr => $value) {
                            $attributes[$attr] = (string)$value;
                        }
                        $map[$element->getName()]['nodes'][] = [
                            'node'       => $nodeName, //note that this is the name of the CDATA node found within the <newNodes>
                            'attributes' => $attributes,
                        ];
                    }
                }
            }
            // Recursively process all child elements
            $this->processElement($child, $map);
        }
    }

    public function qf_request($type, $parameters, $language = 'en-GB')
    {
        $basedir=$this->getXWDBaseDirectory($language);
        $filePath = $this->getXWDFilePath($type, $basedir);
        $xmlString = file_get_contents($filePath);
        $xml = simplexml_load_string($xmlString);

        $hierarchy = [];

        $this->processElement($xml, $hierarchy);

        $finalxml = $this->buildXml($type, $hierarchy, $parameters, 0);
        return $finalxml;
    }
}
