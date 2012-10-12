<?php

class XerteXMLInspector
{
  // Properties
  private  $fname;
  private  $xml;
  private  $models;
  private  $mediaIsUsed;

  private function addModel($model)
  {
    foreach ($this->models as $presentmodel)
    {
      if ($presentmodel == $model)
      {
        return;
      }
    }
    array_push($this->models, $model);
  }

  private function fixXmlFile($name)
  {
    $xmlcontents = file_get_contents($name);
    //_debug("1. " . $xmlcontents);
    // Ok replace known escape sequences to something without an '&'
    $xmlcontents = str_replace('&lt;', '%%%lt;', $xmlcontents);
    $xmlcontents = str_replace('&gt;', '%%%gt;', $xmlcontents);
    $xmlcontents = str_replace('&quot;', '%%%quot;', $xmlcontents);
    $xmlcontents = str_replace('&nbsp;', '%%%nbsp;', $xmlcontents);
    $xmlcontents = str_replace('&amp;', '%%%amp;', $xmlcontents);

    //_debug("2. " . $xmlcontents);
    // replace & with &amp;
    $xmlcontents = str_replace('&', '&amp;', $xmlcontents);

    // replace known escape sequences back
    $xmlcontents = str_replace('%%%lt;', '&lt;', $xmlcontents);
    $xmlcontents = str_replace('%%%gt;', '&gt;', $xmlcontents);
    $xmlcontents = str_replace('%%%quot;', '&quot;', $xmlcontents);
    $xmlcontents = str_replace('%%%nbsp;', '&nbsp;', $xmlcontents);
    $xmlcontents = str_replace('%%%amp;', '&amp;', $xmlcontents);

    //_debug("3. ". $xmlcontents);

    $res = file_put_contents($name, $xmlcontents);
    //_debug("4. " . $res);
  }

  public function loadTemplateXML($name)
  {
    $this->fname = $name;
    libxml_use_internal_errors(true);
    $this->xml = simplexml_load_file($name);
    if (!$this->xml)
    {
        _debug("Error detected in XML, try to fix...");
        $this->fixXmlFile($name);
        $this->xml = simplexml_load_file($name);
    }
    $this->models = array();
    $nodes = $this->xml->xpath('/*/*');
    foreach ($nodes as $node)
    {
      $this->addModel($node->getName());
    }
    $this->mediaIsUsed = false;
    $str = $this->xml['media'];
    if (strlen($str) > 0)
    {
       $this->mediaIsUsed = true;
    }
  }

  public function getUsedModels()
  {
    return $this->models;
  }

  public function mediaIsUsed()
  {
    return $this->mediaIsUsed;
  }

  public function modelUsed($model)
  {
    foreach ($this->models as $presentmodel)
    {
      if ($presentmodel == $model)
      {
        return true;
      }
    }
    return false;
  }
}

//$template = new XerteXMLInspector();
//$template->loadTemplateXML('template.xml');
//$models = $template->getUsedModels();
//foreach($models as $model)
//{
//	print($model . "\n");
//}

?>
