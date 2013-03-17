<?PHP

	_load_language_file("/modules/xerte/export_page.inc");

	echo "<p>" . XERTE_EXPORT_DESCRIPTION . "</p>";
    echo "<ol type='1'>";
    echo "<li>" . XERTE_EXPORT_ZIP . "<ul><li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', '" . $xerte_toolkits_site->site_url . url_return("export" , $_POST['template_id']) . "')\">" . XERTE_EXPORT_ZIP_LINK . "</button></li></li><br />";
    echo "<li>" . XERTE_EXPORT_SCORM . "<ol type='a'><li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', '" . $xerte_toolkits_site->site_url . url_return("scorm_rich" , $_POST['template_id']) . "')\">" . XERTE_EXPORT_SCORM_12_LINK . "</button></li><br/><li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', '" . $xerte_toolkits_site->site_url . url_return("scorm2004" , $_POST['template_id']) . "')\">" . XERTE_EXPORT_SCORM_2004_LINK . "</button></li><br /></ol></li>";
    echo "<li>" . XERTE_EXPORT_ZIP_ARCHIVE . "<ul><li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', '" . $xerte_toolkits_site->site_url . url_return("export_full" , $_POST['template_id']) . "')\">" . XERTE_EXPORT_ZIP_ARCHIVE_LINK . "</button></li><br /></li>";
    echo "</ol>";

?>