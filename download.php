<?PHP

$data = json_decode($_POST['data'], true);

header("Content-type: application/vnd.ms-word");
header("Content-Disposition: attachment;Filename=file.doc");

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
<?PHP
echo "</style>";
echo "<body>";

echo "<h1>".$data['documentName']."</h1>";
echo "<p>".$data['documentText']."</p>";

foreach ($data['pages'] as $pagekey => $pagevalue) {
	echo "<h2>".$pagevalue['pageName']."</h2>";
	echo "<p>".$pagevalue['pageText']."</p>";

	foreach ($pagevalue['sections'] as $sectionkey => $sectionvalue) {
		echo "<h3>".$sectionvalue['sectionName']."</h3>";
		echo "<p>".$sectionvalue['sectionText']."</p>";

		foreach ($sectionvalue["items"] as $itemkey => $itemvalue) {
			echo "<h4>".$itemvalue['itemName']."</h4>";
			echo "<p>".$itemvalue['itemText']."</p>";
			echo "<p><i>".$itemvalue['itemValue']."</i></p>";
		}
	}
}

echo "</body>";
echo "</html>";