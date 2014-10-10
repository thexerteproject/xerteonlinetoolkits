#!/bin/sh
php ../website_code/php/rebuildtemplate.php ../src/site/wizards/en-GB > convert.log
cp ../src/site/wizards/en-GB/template.xwd ../modules/xerte/parent_templates/site/wizards/en-GB/data.xwd
