<?php
/**
 * Merged wizard definition (.xwd) for the editor — used by REST wizard/definition and legacy callers.
 */

function wizard_evaluate_condition_expression($ctree)
{
    switch ($ctree['type']) {
        case "Literal":
            return $ctree['value'];
        case "LogicalExpression":
            if ($ctree['operator'] == "&&") {
                return wizard_evaluate_condition_expression($ctree['left']) && wizard_evaluate_condition_expression($ctree['right']);
            } else {
                return wizard_evaluate_condition_expression($ctree['left']) || wizard_evaluate_condition_expression($ctree['right']);
            }
        case "BinaryExpression":
            switch ($ctree['operator']) {
                case "==":
                    return wizard_evaluate_condition_expression($ctree['left']) == wizard_evaluate_condition_expression($ctree['right']);
                case "!=":
                    return wizard_evaluate_condition_expression($ctree['left']) != wizard_evaluate_condition_expression($ctree['right']);
                case "<":
                    return wizard_evaluate_condition_expression($ctree['left']) < wizard_evaluate_condition_expression($ctree['right']);
                case "<=":
                    return wizard_evaluate_condition_expression($ctree['left']) <= wizard_evaluate_condition_expression($ctree['right']);
                case ">":
                    return wizard_evaluate_condition_expression($ctree['left']) > wizard_evaluate_condition_expression($ctree['right']);
                case ">=":
                    return wizard_evaluate_condition_expression($ctree['left']) >= wizard_evaluate_condition_expression($ctree['right']);
                default:
                    return null;
            }
        case "MemberExpression":
            break;
        case "Identifier":
            if (isset($_REQUEST[$ctree['name']])) {
                return $_REQUEST[$ctree['name']];
            } else if (isset($_SESSION[$ctree['name']])) {
                return $_SESSION[$ctree['name']];
            } else {
                try {
                    $value = eval($ctree['name']);
                    return $value;
                } catch (Exception $e) {
                };
                return null;
            }
            break;
        default:
            return null;
    }
}

/**
 * @return string merged XWD XML
 */
function wizard_get_merged_xwd_xml($xwd_path)
{
    if (file_exists($xwd_path . "wizards/" . $_SESSION['toolkits_language'] . "/data.xwd")) {
        $xwd_file_path = $xwd_path . "wizards/" . $_SESSION['toolkits_language'] . "/data.xwd";
    } else if (file_exists($xwd_path . "wizards/en-GB/data.xwd")) {
        $xwd_file_path = $xwd_path . "wizards/en-GB/data.xwd";
    } else if (file_exists($xwd_path . "data.xwd")) {
        $xwd_file_path = $xwd_path . "data.xwd";
    } else {
        return '';
    }

    $plugin_path = "";
    if (file_exists($xwd_path . "wizards/plugins/" . $_SESSION['toolkits_language'])) {
        $plugin_path = $xwd_path . "wizards/plugins/" . $_SESSION['toolkits_language'];
    } else if (file_exists($xwd_path . "wizards/plugins/en-GB")) {
        $plugin_path = $xwd_path . "wizards/plugins/en-GB";
    }

    if ($plugin_path != "") {
        require_once(dirname(__FILE__) . '/../mergexml.php');
        $merged = new MergeXML();
        $merged->addFile($xwd_file_path);
        $plugin_files = scandir($plugin_path);
        foreach ($plugin_files as $plugin_file) {
            if (substr($plugin_file, -4) == ".xwd") {
                $xml = simplexml_load_file($plugin_path . "/" . $plugin_file);
                $condition = (string) $xml['cond'];
                _debug("Condition: " . $condition);
                if ($condition != null && $condition != "") {
                    require_once(dirname(__FILE__) . '/../phpep/PHPEP.php');
                    $phpep = new PHPEP($condition);
                    $ctree = $phpep->exec();
                    $result = wizard_evaluate_condition_expression($ctree);
                    _debug("Result of evalutaion of condition: " . ($result === true ? 'true' : ($result === false ? 'false' : $result)));
                    if ($result !== true) {
                        continue;
                    }
                }
                $merged->addFile($plugin_path . "/" . $plugin_file);
            }
        }
        return $merged->get(1);
    }

    return file_get_contents($xwd_file_path);
}
