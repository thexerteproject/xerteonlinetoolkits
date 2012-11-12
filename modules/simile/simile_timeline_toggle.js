function simile_toggle(html_change,id){

	target_div = document.getElementById(id);

	if(html_change.innerHTML=="-"){

		target_div.style.display="none";
		html_change.innerHTML = "+";
		
	}else{
	
		target_div.style.display="block";
		html_change.innerHTML = "-";
		
	}

}