@echo off
.\php\php.exe -c .\php ..\website_code\php\rebuildtemplate.php ..\src\Nottingham\wizards\en-GB > convert.log
copy ..\src\Nottingham\wizards\en-GB\template.xwd ..\modules\xerte\parent_templates\Nottingham\wizards\en-GB\data.xwd
type convert.log
pause
