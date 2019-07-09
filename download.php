<?PHP

$data = json_decode($_POST['data'], true);

$filename = "file";
if ($data["filename"]) $filename = $data["filename"];



header('Content-type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '.DOC"');

echo "<html>";
echo "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=Windows-1252\">";
echo '<head>';
echo '<style>@page Section1 {size:'.$data['size'].';mso-page-orientation:'.$data['orientation'].';}div.Section1 {page:Section1;}</style>';
echo "<style>".$data['styles']."</style>";
echo '</head>';

echo "<body>";

echo "<div class=\"Section1\">";
echo "<h1>".$data['documentName']."</h1>";
echo "<p>".$data['documentText']."</p>";
echo "<p>".$data['documentIntro']."</p>";

foreach ($data['pages'] as $pagekey => $pagevalue) {
	echo "<h1>".$pagevalue['pageName']."</h1>";
	echo "<p>".$pagevalue['pageText']."</p>";
	echo "<div class=\"page\">";

	foreach ($pagevalue['sections'] as $sectionkey => $sectionvalue) {
			if (array_key_exists('sectionName', $sectionvalue)) {
				echo "<div class=\"section\">";
				echo "<h2>".$sectionvalue['sectionName']."</h2>";
				echo "<p>".$sectionvalue['sectionText']."</p>";
			}
			foreach ($sectionvalue["items"] as $itemkey => $itemvalue) {
				echo "<div class=\"item\">";
				echo "<h3>".$itemvalue['itemName']."</h3>";
				echo "<p>".$itemvalue['itemText']."</p>";
				echo "<p class=\"item\"><i>".$itemvalue['itemValue']."</i></p>";
				echo "</div>";
			}
			if (array_key_exists('sectionName', $sectionvalue)) {
				echo "</div>";
			}
	}
	echo "</div>";
}

echo "</div>";
echo "</body>";
echo "</html>";