Font Awesome gives you scalable vector icons that can instantly be customized — size, color, drop shadow, and anything that can be done with the power of CSS.

Compatible with Font Awesome 4.3

# Installation


    1. Extract the downloaded file (fontawesome.zip)
    2. Copy the "fontawesome" folder to "ckeditor/plugins/" folder
    3. Open the file "ckeditor/config.js"
    4. Add theses lines:
        config.extraPlugins = 'widget,lineutils,fontawesome';
        config.contentsCss = 'path/to/your/font-awesome.css';
        config.allowedContent = true;
    5. In your HTML's <head> section add this code:
        <script>CKEDITOR.dtd.$removeEmpty['span'] = false;</script>
    6. Make sure to clear your browser's cache
    7. Done

# Dependencies
It requires the following plugins to work: [Widget](http://ckeditor.com/addon/widget), [Line Utilities](http://ckeditor.com/addon/lineutils), and [Color Dialog](http://ckeditor.com/addon/colordialog).

# Logs

    v1.2
        updating of font awesome
    v1.1
        updating of font awesome
    v1.0
        initial release
