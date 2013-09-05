@echo off
php\php.exe ..\website_code\php\rebuildtemplate.php ..\src\Nottingham\wizards\en-GB > convert.log
cp ..\src\Nottingham\wizards\en-GB\template.xwd ..\modules\xerte\parent_templates\Nottingham\wizards\en-GB\data.xwd
