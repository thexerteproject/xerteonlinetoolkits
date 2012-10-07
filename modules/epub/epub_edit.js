last_id = 1;

function edit_page(id){

	document.getElementById("editor_" + last_id).style.display = "none";

	last_id = id;

	target_div = document.getElementById("editor_" + id);

	if(target_div.style.display=="block"){

		target_div.style.display="none";
		
	}else{
	
		target_div.style.display="block";
		
	}

}

show_id = 1;

function show_page(id){

	document.getElementById("editor_" + show_id).style.display = "none";

	show_id = id;

	target_div = document.getElementById("editor_" + id);

	if(target_div.style.display=="block"){

		target_div.style.display="none";
		
	}else{
	
		target_div.style.display="block";
		
	}

}