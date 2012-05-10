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

  public function loadTemplateXML($name)
  {
    $this->fname = $name;
    $this->xml = simplexml_load_file($name);
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
