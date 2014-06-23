#!/bin/sh

sed s/CKEDITOR.plugins.setLang\(\ \'mathjax\'/CKEDITOR.plugins.setLang\(\ \'extmathjax\'/ < $1 > $1.tmp
mv $1.tmp $1
