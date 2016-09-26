<?PHP

$data = json_decode($_POST['data'], true);

$filename = "file";
if ($data["filename"]) $filename = $data["filename"];

header("Content-type: application/vnd.ms-word");
header("Content-Disposition: attachment;Filename=$filename.doc");

echo "<html>";
echo "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=Windows-1252\">";
echo "<style>";
?>
	h1 {
		color: purple;
	}
	h2 {
		color: blue;
	}
	h3 {
		color: red;
	}
	h4 {
		color: black;
	}
	p.item {
		padding: 5px;
	}
	.page {
		display:block;
		padding:15px
	}
	.section {
		display:block;
		border: black 1px solid;
		padding:15px
	}
	.item {
		display:block;
		padding:15px
	}
<?PHP
echo "</style>";
echo "<body>";

echo "<h1>".$data['documentName']."</h1>";
echo "<p>".$data['documentText']."</p>";

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
				if (strlen($itemvalue['itemValue']) > 0)
					echo "<p class=\"item\"><i>".$itemvalue['itemValue']."</i></p>";
				else
					echo "<p class=\"item\"><i>No answer given.</i></p>";
				echo "</div>";
			}
			if (array_key_exists('sectionName', $sectionvalue)) {
				echo "</div>";
			}
	}
	echo "</div>";
}

echo "</body>";
echo "</html>";