<?php

class XerteXWDBuilder
{
	// properties
	public  $basic_template = 'basic.xwd';
	public  $fname;
	public  $xml;
	public  $menuattrs;

	private function addChildNode(SimpleXMLElement $target, SimpleXMLElement $insert)
	{
		$target_dom = dom_import_simplexml($target);
		$insert_dom = $target_dom->ownerDocument->importNode(dom_import_simplexml($insert),true);
		return $target_dom->appendChild($insert_dom);
	}

	private function replaceChildNode(SimpleXMLElement $target, SimpleXMLElement $replacement)
	{
		$target_dom = dom_import_simplexml($target);
		$replacement_dom = $target_dom->ownerDocument->importNode(dom_import_simplexml($replacement), true);
		$p = $target_dom->parentNode;
		return $p->replaceChild($replacement_dom, $target_dom);
	}

	// Methods
	public function createTemplateXWD($name)
	{
		$this->fname = $name;
		$this->xml = simplexml_load_file($this->basic_template);
		$this->menuattrs = array();
	}

	public function loadTemplateXWD($name)
	{
		$this->fname = $name;
		$this->xml = simplexml_load_file($name);
		$str = $this->xml['menus'];
		$this->menuattrs = explode(",", $str);
		$count = count($this->menuattrs);
		for ($i=0; $i<$count; $i++)
		{
			$this->menuattrs[$i] = trim($this->menuattrs[$i]);
		}
		    for ($i=$count-1; $i>=0; $i--)
		{
		  if (strlen($this->menuattrs[$i]) == 0)
		  {
			unset($this->menuattrs[$i]);
		  }
		}
		$this->menuattrs = array_values($this->menuattrs);
	}

	public function addMenuAttr($attr)
	{
		foreach ($this->menuattrs as $menu)
		{
			if ($menu == $attr)
			{
				return;
			}
		}
		array_push($this->menuattrs, $attr);
		$str = "";
		$count = count($this->menuattrs);
		for($i=0; $i<$count; $i++)
		{
			if ($i>0)
			{
				$str .= ',';
			}
			$str .= $this->menuattrs[$i];
		}
		// Atttribute menus has to be present
		$this->xml['menus'] = $str;
	}

	public function addXwd($name, $replace, $verbose)
	{
		if ($verbose == 'true')
		{
			print("Adding file " . $name . "\n");
			if ($replace == 'true')
			{
				print("If the models are already present, they will be updated.\n");
			}
			else
			{
				print("If the models are already present, they will not be replaced, the template will not change.\n");
			}
		}
		else
		{
			$pos = strrpos($name, '/');
			$fname=substr($name, $pos + 1);
			$fname .= ":\n";
			print($fname);
		}
		$xwd = simplexml_load_file($name);
		if ($xwd->getName() != 'wizard')
		{
			print("The file is not a proper model .xwd file. Root node of the XML should be 'wizard'\n");
			return -1;
		}
		if (strlen($xwd['menus']) == 0)
		{
			if ($verbose == 'true')
			{
				print("The root element 'wizard' should have an attribute 'menus'\n");
			}
			else
			{
				print("    skipped!\n");
			}
			return -1;
		}
		$this->addMenuAttr((string)$xwd['menus']);
		$newnode = $xwd->xpath('/wizard/pageWizard/newNodes/*');
		if (count($newnode) == 0)
		{
			print("No elements found in element 'newNodes' of element pageWizard.\n");
			return -1;
		}
    // loop over the newnodes in wizard xwd, and make sure that 1 node has the same name as the model/xwd file
    $found = 'false';
    $pos = strrpos($fname, '.');
    $nodeName = substr($fname, 0, $pos);
    foreach($newnode as $child)
    {
      if ($nodeName == $child->getName())
      {
        $found = 'true';
      }
    }
    if ($found == 'false')
    {
      print("No element '" . $child->getName() . "' found in 'newNodes' of element pageWizard.\nThis model will not work, skipped!\n");
      return -1;
    }
		// loop over the newnodes in wizard xwd, and add it to the learningObject element of the pagetemplate
		// Normally there us only one
		foreach($newnode as $child)
		{
			$orgnode = $this->xml->xpath('/wizard/learningObject/newNodes/' . $child->getName());
			if (count($orgnode) == 1 && $replace != 'true')
			{
				print("WARNING: Model " . $child->getName() . " is already in the pageTemplate, aborted\n");
				return -1;
			}
			if (count($orgnode) == 1)
			{
				$this->replaceChildNode($orgnode[0], $child);
			}
			else
			{
				$target = current($this->xml->xpath('/wizard/learningObject/newNodes'));
				$this->addChildNode($target, $child);
			}
		}
		// Loop over all the toplevel children and add all (except the node pageWizard) to the Page template
		$nodes = $xwd->xpath('*[not(self::pageWizard)]');
		foreach($nodes as $node)
		{
			$orgnode = $this->xml->xpath('/wizard/' . $node->getName());
			if (count($orgnode) == 1 && $replace != 'true')
			{
				print("WARNING: Model " . $node->getName() . " is already in the pageTemplate, aborted\n");
				return -1;
			}
			if (count($orgnode) == 1)
			{
				printf("    Model " . $node->getName() . " is updated/replaced.\n");
				$this->replaceChildNode($orgnode[0], $node);
			}
			else
			{
				printf("    Model " . $node->getName() . " is added.\n");
				$this->addChildNode($this->xml, $node);
			}
		}
		return 0;
	}
}

?>
