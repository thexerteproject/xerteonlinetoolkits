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
	p.item {
		padding: 5px;
		border:1pt black solid;
	}
	.page {
		display:block;
		border:1pt blue solid;
		padding:15px
	}
	.section {
		display:block;
		border:1pt black dashed;
		padding:15px
	}
	.item {
		display:block;
		border:1pt black dotted;
		padding:15px
	}
<?PHP
echo "</style>";
echo "<body>";

echo "<h1>".$data['documentName']."</h1>";
echo "<p>".$data['documentText']."</p>";

foreach ($data['pages'] as $pagekey => $pagevalue) {
	echo "<h2>".$pagevalue['pageName']."</h2>";
	echo "<p>".$pagevalue['pageText']."</p>";
	echo "<div class=\"page\">";

	foreach ($pagevalue['sections'] as $sectionkey => $sectionvalue) {
		echo "<div class=\"section\">";
		echo "<h3>".$sectionvalue['sectionName']."</h3>";
		echo "<p>".$sectionvalue['sectionText']."</p>";

		foreach ($sectionvalue["items"] as $itemkey => $itemvalue) {
			echo "<div class=\"item\">";
			echo "<h4>".$itemvalue['itemName']."</h4>";
			echo "<p>".$itemvalue['itemText']."</p>";
			echo "<p class=\"item\"><i>".$itemvalue['itemValue']."</i></p>";
			echo "</div>";
		}
		echo "</div>";
	}
	echo "</div>";
}

echo "</body>";
echo "</html>";