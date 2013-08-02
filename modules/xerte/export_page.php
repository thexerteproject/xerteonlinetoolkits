<?PHP

	_load_language_file("/modules/xerte/export_page.inc");

	echo "<p>" . XERTE_EXPORT_DESCRIPTION . "</p>";

    if (get_default_engine($_POST['template_id']) == 'javascript')
    {
        echo "<p><img id=\"html5\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:export_engine_toggle('html5')\" /> " . XERTE_EXPORT_HTML5 . "</p>";
        echo "<p><img id=\"flash\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:export_engine_toggle('flash')\" /> " . XERTE_EXPORT_FLASH . "</p>";
    }
    else
    {
        echo "<p><img id=\"html5\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:export_engine_toggle('html5')\" /> " . XERTE_EXPORT_HTML5 . "</p>";
        echo "<p><img id=\"flash\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:export_engine_toggle('flash')\" /> " . XERTE_EXPORT_FLASH . "</p>";
    }

    echo "<ol type='1'>";
    echo "<li>" . XERTE_EXPORT_ZIP . "<ul><li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', 'html5', 'flash', '" . $xerte_toolkits_site->site_url . url_return("export" , $_POST['template_id']) . "')\">" . XERTE_EXPORT_ZIP_LINK . "</button></li></ul></li><br />";
    echo "<li>" . XERTE_EXPORT_SCORM;
    echo "<ol type='a'>";
    echo "<li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', 'html5', 'flash', '" . $xerte_toolkits_site->site_url . url_return("scorm_rich" , $_POST['template_id']) . "')\">" . XERTE_EXPORT_SCORM_12_LINK . "</button></li><br/>";
    echo "<li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', 'html5', 'flash', '" . $xerte_toolkits_site->site_url . url_return("scorm2004" , $_POST['template_id']) . "')\">" . XERTE_EXPORT_SCORM_2004_LINK . "</button></li><br /></ol></li>";
    echo "<li>" . XERTE_EXPORT_ZIP_ARCHIVE . "<ul><li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', 'html5', 'flash', '" . $xerte_toolkits_site->site_url . url_return("export_full" , $_POST['template_id']) . "')\">" . XERTE_EXPORT_ZIP_ARCHIVE_LINK . "</button></li></ul><br /></li>";
    echo "</ol>";

?>