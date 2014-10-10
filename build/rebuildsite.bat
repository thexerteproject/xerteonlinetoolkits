@echo off
.\php\php.exe -c .\php ..\website_code\php\rebuildtemplate.php ..\src\site\wizards\en-GB > convert.log
copy ..\src\site\wizards\en-GB\template.xwd ..\modules\site\parent_templates\site\wizards\en-GB\data.xwd

