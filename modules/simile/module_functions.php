<?php 

/**
 * 
 * module functions page, shared functions for this module
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once(dirname(__FILE__) . '/../../config.php');

/**
 * 
 * Function dont_show_template
 * This function outputs the HTML for people have no rights to this template
 * @version 1.0
 * @author Patrick Lockley
 */
 
function simile_zone($zone, $counter, $data){

	if(count($zone)!=0&&$counter==0){

		?><p style="border-bottom:1px solid black;"><a class="toggle" onclick="javascript:simile_toggle(this, 'zone_<?PHP echo $counter; ?>');">+</a> | <?PHP echo $zone['simile_zone_start_' . $counter];  ?> - <?PHP echo $zone['simile_zone_stop_' . $counter];  ?> (Zone <?PHP echo $counter; ?>)</p>
		<div id="zone_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; display:none">
		<?PHP
		
	}else if(count($zone)!=0&&$counter!=0){

		?><p style="border-bottom:1px solid black;"><a class="toggle" onclick="javascript:simile_toggle(this, 'zone_<?PHP echo $counter; ?>');">+</a> | <?PHP echo $zone['simile_zone_start_' . $counter];  ?> - <?PHP echo $zone['simile_zone_stop_' . $counter];  ?> (Zone <?PHP echo $counter; ?>)</p>
		<div id="zone_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; display:none">
		<?PHP
		
	}else{
	
		?>
		<div id="zone_<?PHP echo $counter; ?>" style="margin:20px; padding:20px;">
		<?PHP
		
	}
	
	?>	<label><?PHP echo SIMILE_START; ?></label><input type="text" class="required" style="width:100%" id="simile_zone_start_<?PHP echo $counter; ?>" name="simile_zone_start_<?PHP echo $counter; ?>" value="<?PHP if(isset($zone['simile_zone_start_' . $counter])){  echo $zone['simile_zone_start_' . $counter]; } ?>" /><br />
		<label><?PHP echo SIMILE_STOP; ?></label><input type="text" class="required" style="width:100%" id="simile_zone_stop_<?PHP echo $counter; ?>" name="simile_zone_stop_<?PHP echo $counter; ?>" value="<?PHP if(isset($zone['simile_zone_stop_' . $counter])){ echo $zone['simile_zone_stop_' . $counter]; } ?>" /><br />
		<script type="text/javascript">
		
			if (window.addEventListener) {
				window.addEventListener("load", 
					function(){
			
						add_js_date_pick("simile_zone_start_<?PHP echo $counter; ?>");
						add_js_date_pick("simile_zone_stop_<?PHP echo $counter; ?>");
						
					}
				, false);
			}
			else if (window.attachEvent) {
			  window.attachEvent("onload",
				function(){

					add_js_date_pick_year("simile_zone_start_<?PHP echo $counter; ?>");
					add_js_date_pick_year("simile_zone_stop_<?PHP echo $counter; ?>");
					
				}
			  );
			} 
			
		</script>
		<label><?PHP echo SIMILE_WIDTH; ?></label><input type="text" class="required" style="width:100%" name="simile_zone_width_<?PHP echo $counter; ?>" value="<?PHP if(isset($zone['simile_zone_width_' . $counter])){ echo $zone['simile_zone_width_' . $counter]; }  ?>" /><br />
		<label><?PHP echo SIMILE_UNIT; ?></label>
		<select class="required" name="simile_zone_unit_<?PHP echo $counter; ?>">
			<option value="0" <?PHP if(isset($zone['simile_zone_unit_' . $counter])){ if($zone['simile_zone_unit_' . $counter]==0){ echo " selected "; } } ?> ><?PHP echo SIMILE_HOUR; ?></option>
			<option value="1" <?PHP if(isset($zone['simile_zone_unit_' . $counter])){ if($zone['simile_zone_unit_' . $counter]==1){ echo " selected "; } } ?> ><?PHP echo SIMILE_DAY; ?></option>
			<option value="2" <?PHP if(isset($zone['simile_zone_unit_' . $counter])){ if($zone['simile_zone_unit_' . $counter]==2){ echo " selected "; } } ?> ><?PHP echo SIMILE_MONTH; ?></option>
			<option value="3" <?PHP if(isset($zone['simile_zone_unit_' . $counter])){ if($zone['simile_zone_unit_' . $counter]==3){ echo " selected "; } } ?> ><?PHP echo SIMILE_YEAR; ?></option>
			<option value="4" <?PHP if(isset($zone['simile_zone_unit_' . $counter])){ if($zone['simile_zone_unit_' . $counter]==4){ echo " selected "; } } ?> ><?PHP echo SIMILE_DECADE; ?></option>
			<option value="5" <?PHP if(isset($zone['simile_zone_unit_' . $counter])){ if($zone['simile_zone_unit_' . $counter]==5){ echo " selected "; } } ?> ><?PHP echo SIMILE_CENTURY; ?></option>
		</select><br />
		<label><?PHP echo SIMILE_WIDTH; ?></label>
		<input type="text" length="10" class="required" name="simile_zone_interval_pixels_<?PHP echo $counter; ?>" value="<?PHP if(isset($zone['simile_zone_interval_pixels_' . $counter])){ echo $zone['simile_zone_interval_pixels_' . $counter]; }  ?>" /><br /><br />
		<?PHP 
		
			if(count($data['zones'])>1){
			
		?>
		<label><?PHP echo SIMILE_ZONE_GUIDE; ?></label>
		<select style="height:auto" name="simile_zones_sync_<?PHP echo $counter; ?>"><option value="-1"><?PHP echo SIMILE_ZONE_SYNC; ?></option>
		  <?PHP
					  
			for($x=0;$x<count($data['zones']);$x++){
			
				if(($x+1)!=$counter){

					?><option value="<?PHP echo $x; ?>" <?PHP 
																	
						if($x == $zone['simile_zone_sync_' . $counter]){
						
							echo " selected ";
							
						}
					
					?>>Zone <?PHP echo $x+1; ?></option><?PHP
					
				}
			
			}
		  
		  ?>			  
		  </select><br />	
		  <?PHP
		  
			}
			
		  ?>		
		<label><?PHP echo SIMILE_REMOVE; ?></label> <input type="checkbox" length="10" name="simile_zone_delete_<?PHP echo $counter; ?>" />
	</div>
	<?PHP	
} 
 
function simile_header(){
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
		<script type="text/javascript" src="modules/simile/jscolor/jscolor.js"></script>
		<script type="text/javascript" src="modules/simile/tinymce/tiny_mce.js"></script>
		<script type="text/javascript">
		
			function add_js_date_pick(id_string){			
				new JsDatePick({
					useMode:2,
					target:id_string,
					dateFormat:"%Y-%m-%d",
					yearsRange:[0,3000]
				});
			}
			
			function add_js_date_pick_year(id_string){			
				new JsDatePick({
					useMode:2,
					target:id_string,
					dateFormat:"%Y",
					yearsRange:[0,3000]
				});
			}
		</script>
		<script type="text/javascript">
			tinyMCE.init({
				// General options
				mode : "textareas",
				theme : "advanced",
				plugins : "autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,wordcount,advlist,autosave,visualblocks",

				// Theme options
				theme_advanced_buttons1 : "save,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,styleselect,formatselect,fontselect,fontsizeselect",
				theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor",
				theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen",
				theme_advanced_buttons4 : "insertlayer,moveforward,movebackward,absolute,|,styleprops,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,pagebreak,restoredraft,visualblocks",
				theme_advanced_toolbar_location : "top",
				theme_advanced_toolbar_align : "left",
				theme_advanced_statusbar_location : "bottom",
				theme_advanced_resizing : true,

				// Example content CSS (should be your site CSS)
				//content_css : "css/content.css",

				// Drop lists for link/image/media/template dialogs
				template_external_list_url : "lists/template_list.js",
				external_link_list_url : "lists/link_list.js",
				external_image_list_url : "lists/image_list.js",
				media_external_list_url : "lists/media_list.js",

				// Style formats
				style_formats : [
					{title : 'Bold text', inline : 'b'},
					{title : 'Red text', inline : 'span', styles : {color : '#ff0000'}},
					{title : 'Red header', block : 'h1', styles : {color : '#ff0000'}},
					{title : 'Example 1', inline : 'span', classes : 'example1'},
					{title : 'Example 2', inline : 'span', classes : 'example2'},
					{title : 'Table styles'},
					{title : 'Table row 1', selector : 'tr', classes : 'tablerow1'}
				],

				// Replace values for the template plugin
				
			});
		</script>    		
    	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title><?PHP echo SIMILE_EDIT_TITLE; ?></title>
		<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
		<link href="modules/simile/simile.css" media="screen" type="text/css" rel="stylesheet" />
		<script src="modules/simile/simile_timeline_toggle.js" type="text/javascript"></script>
		<link rel="stylesheet" type="text/css" media="all" href="modules/simile/datepicker/jsDatePick_ltr.min.css" />
		<script type="text/javascript" src="modules/simile/datepicker/jquery.1.4.2.js"></script>
		<script type="text/javascript" src="modules/simile/datepicker/jsDatePick.full.1.3.js"></script>
    </head>
<?PHP
} 

function dont_show_template(){

    _load_language_file("/modules/simile/module_functions.inc");

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <script src="modules/Xerte/javascript/swfobject.js"></script>
    <script src="website_code/scripts/opencloseedit.js"></script>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
    <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
    </head>

    <body>

    <div style="margin:0 auto; width:800px">
    <div class="edit_topbar" style="width:800px">
        <img src="website_code/images/edit_xerteLogo.jpg" style="margin-left:10px; float:left" />
        <img src="website_code/images/edit_UofNLogo.jpg" style="margin-right:10px; float:right" />
    </div>	
    <div style="margin:0 auto">
<?PHP

    echo XERTE_DISPLAY_FAIL;

    ?></div></div></body></html><?PHP

    die();

}

function display_timeline($data){

	?><div style="width:90%; margin:10px; padding:10px;" id="tl"></div><p id='simile_error'>Timeline hasn't displayed correctly - please check for javascript errors.</p>
	<script>
		
		var tl;
		
		<?PHP
			
			for($y=0;$y<count($data['zones']);$y++){
			
		?>
		
		var timeline_data_<?PHP echo $y; ?> = {  // save as a global variable
			'dateTimeFormat': 'iso8601',
			'wikiSection': "",

			'events' : [
			
				<?PHP
			
				for($x=0;$x<count($data['events']);$x++){
			
					if(isset($data['events'][$x]['simile_event_zones_' . $x])){

						if(is_array($data['events'][$x]['simile_event_zones_' . $x])){						
																		
							if(in_array($y, $data['events'][$x]['simile_event_zones_' . $x])){
				
							?>
						
							{
							 'start': '<?PHP echo @$data['events'][$x]['simile_event_start_' . $x]; ?>',
							 'end': '<?PHP echo @$data['events'][$x]['simile_event_end_' . $x]; ?>',
							 'durationEvent' : <?PHP if(@$data['events'][$x]['simile_event_durationevent_' . $x]=="on"){ echo "1"; }else{ echo "0"; } ?>,
							 'title': "<?PHP echo str_replace("\\","",@$data['events'][$x]['simile_event_title_' . $x]); ?>",
							 'description': "<?PHP echo str_replace("\\","",(trim(@$data['events'][$x]['simile_event_description_' . $x]))); ?>",
							 'image': '<?PHP echo @$data['events'][$x]['simile_event_image_' . $x]; ?>',
							 'link': '<?PHP echo @$data['events'][$x]['simile_event_link_' . $x]; ?>',
							 'color': "<?PHP echo @$data['events'][$x]['simile_event_color_' . $x]; ?>",
							 'textColor': "<?PHP echo @$data['events'][$x]['simile_event_color_' . $x]; ?>"
							}
							
							<?PHP
								
								for($z=0;$z<count($data['events']);$z++){
								
									if(isset($data['events'][$z]['simile_event_zones_' . $z])){

										if(is_array($data['events'][$z]['simile_event_zones_' . $z])){	
										
											/*print_r($data['events'][$z]['simile_event_zones_' . $z]);

											echo $y . "<Br />";
											
											echo $x+1 . "<Br />";*/

											if(in_array($y, $data['events'][$z]['simile_event_zones_' . $z])){
							
												if($z==$x&&$z!=(count($data['events'])-1)){
							
													echo ",";
													
												}
											
											}
											
										}
									
									}

								}
								
							}
						
						}
					
					}
				
				}
				
				?>
			]
			
		}
		
		<?PHP
			
			}
			
		?>

		function onLoad() {
		
			var tl_el = document.getElementById("tl");
			
			<?PHP
			
			for($y=0;$y<count($data['zones']);$y++){
			
			?>
			
				var eventSource<?PHP echo $y; ?> = new Timeline.DefaultEventSource();
				var theme<?PHP echo $y; ?> = Timeline.ClassicTheme.create();
				theme<?PHP echo $y; ?>.autoWidth = true; // Set the Timeline's "width" automatically.
									 // Set autoWidth on the Timeline's first band's theme,
									 // will affect all bands.
									 
				theme<?PHP echo $y; ?>.timeline_start = new Date(Date.UTC('<?PHP echo $data['simile_start']; ?>', 0, 1));
				theme<?PHP echo $y; ?>.timeline_stop  = new Date(Date.UTC('<?PHP echo $data['simile_stop']; ?>', 0, 1));	
				var d<?PHP echo $y; ?> = Timeline.DateTime.parseGregorianDateTime('<?PHP 
				
					if(!isset($data['simile_center'])){
				
						echo $data['zones'][$y]['simile_zone_start_' . $y]; 
						
					}else{
					
						echo $data['simile_center'];
					
					}
				
				?>');	
			
			<?PHP
			
			}
			
			?>
			
			var bandInfos = [
			
			<?PHP
			
			for($x=0;$x<count($data['zones']);$x++){
			
			?>
			
				Timeline.createBandInfo({
					width:          "100%", // set to a minimum, autoWidth will then adjust
					intervalUnit:   <?PHP
					
										switch($data['zones'][$x]['simile_zone_unit_' . $x]){
										
											case 0: echo " Timeline.DateTime.HOUR,"; break;
											case 1: echo " Timeline.DateTime.DAY,"; break;
											case 2: echo " Timeline.DateTime.MONTH,"; break;
											case 3: echo " Timeline.DateTime.YEAR,"; break;
											case 4: echo " Timeline.DateTime.DECADE,"; break;
											case 5: echo " Timeline.DateTime.CENTURY,"; break;
										
										}
					
									?>
					intervalPixels: <?PHP echo $data['zones'][$x]['simile_zone_interval_pixels_' . $x]; ?>,
					eventSource:    eventSource<?PHP echo $x; ?>,
					date:           d<?PHP echo $x; ?>,
					theme:          theme<?PHP echo $x; ?>,
					layout:         'original'  // original, overview, detailed
				})
				
				<?PHP
				
					if($x<(count($data['zones'])-1)){
					
						echo ",";
					
					}						
				
				}
				
				?>
				
				
			];
											
			<?PHP
			
			for($y=0;$y<count($data['zones']);$y++){
			
			?>
			
			  bandInfos[<?PHP echo $y; ?>].decorators = [
			
				<?PHP
			
				for($x=0;$x<count($data['zone_labels']);$x++){
				
					if(is_array($data['zone_labels'][$x]['simile_event_label_zones_' . $x])){
				
						if(in_array($y, $data['zone_labels'][$x]['simile_event_label_zones_' . $x])){
									
							?>
						
								new Timeline.SpanHighlightDecorator({
									startDate:  "<?PHP echo @$data['zone_labels'][$x]['simile_zone_label_startdate_' . $x]; ?>",
									endDate:    "<?PHP echo @$data['zone_labels'][$x]['simile_zone_label_enddate_' . $x]; ?>",
									startLabel: "<?PHP echo @$data['zone_labels'][$x]['simile_zone_label_startlabel_' . $x]; ?>",
									endLabel:   "<?PHP echo @$data['zone_labels'][$x]['simile_zone_label_endlabel_' . $x]; ?>",
									color:      "<?PHP echo @$data['zone_labels'][$x]['simile_zone_label_colour_' . $x]; ?>",
									opacity:    "<?PHP echo @$data['zone_labels'][$x]['simile_zone_label_opacity_' . $x]; ?>",
									theme:      theme0
								})
							
							<?PHP
							
								if($x<(count($data['zones'])-1)){
					
									echo ",";
					
								}
												
						}
				
					}
			
				}
							
				?>
												
			];

			<?PHP
			
			}
							
			?>		

			<?PHP
			
			for($y=0;$y<count($data['zones']);$y++){
			
				if(isset($data['zones'][$y]['simile_zone_sync_' . $y])){
			
					if($data['zones'][$y]['simile_zone_sync_' . $y]!="-1"&&$data['zones'][$y]['simile_zone_sync_' . $y]!=""){
					
				?>
				
					bandInfos[<?PHP echo $y; ?>].syncWith = <?PHP echo $data['zones'][$y]['simile_zone_sync_' . $y] ?>;
				
				<?PHP
				
					}
				
				}
			
			} 
			
			?>
										
			// create the Timeline
			tl = Timeline.create(tl_el, bandInfos, Timeline.HORIZONTAL);
							
			var url = '.'; // The base url for image, icon and background image
						   // references in the data

			<?PHP 
						   
				for($y=0;$y<count($data['zones']);$y++){
			
			?>
			
					eventSource<?PHP echo $y; ?>.loadJSON(timeline_data_<?PHP echo $y; ?>, url); // The data was stored into the 
													   // timeline_data variable.
			
			<?PHP
			
				}
			
			?>			   							   
			
			tl.layout(); // display the Timeline
		}
		
		onLoad();
		document.getElementById('simile_error').style.display = "none";

	</script><?PHP

	echo $data['simile_description'];
		
}

function simile_description($data, $preview){

	if($preview!=""){		
		
		echo "<textarea style='width:100%; height:200px' name='simile_description'>" . $data['simile_description'] . "</textarea>";
		
	}else{
		
		echo "<textarea style='width:100%; height:200px' name='simile_description'>Enter the description for the timeline here</textarea>";
		
	}
		
	echo "<p>" . SIMILE_DESC_TEXT . "</p></div>";

}

function simile_start_stop($data, $preview){
	
	if($preview!=""){
	
		?><label><?PHP echo SIMILE_START; ?></label><input class="required" type="text" name="simile_start" value="<?PHP echo $data['simile_start'];  ?>" /><label><?PHP echo SIMILE_STOP; ?></label><input class="required" type="text" id="simile_stop" name="simile_stop" value="<?PHP echo $data['simile_stop'];  ?>" /><label><?PHP echo SIMILE_CENTER; ?></label><input type="text" name="simile_center" value="<?PHP echo $data['simile_center'];  ?>" /><br />
		<?PHP
			
	}else{
	
		?><label><?PHP echo SIMILE_START; ?></label><input class="required" type="text" name="simile_start" /><label><?PHP echo SIMILE_STOP; ?></label><input class="required" type="text" id="simile_stop" name="simile_stop" /><label><?PHP echo SIMILE_CENTER; ?></label><input type="text" name="simile_center" /><?PHP
		
	}
	
	echo "<p>" . SIMILE_START_STOP_EXTRA . "</p>";
	echo "</div>";

}

function simile_buttons($preview){

	if($preview!==""){
				
		?><input type="submit" class="simile_button" name="preview" value="<? echo SIMILE_PREVIEW; ?>" />
		<input type="submit" class="simile_button" name="save" value="<? echo SIMILE_CONTINUE; ?>" />		
		<?PHP
				
	}else{
			
		?><input type="submit" class="simile_button" name="save" value="<? echo SIMILE_CONTINUE; ?>" />		
		<?PHP	
	}

}

function simile_zone_label($counter, $zone_label, $data){

	if(isset($zone_label['simile_zone_label_startdate_' . $counter])){	
	
		?>
		<p style="border-bottom:1px solid black;"><a class="toggle" onclick="javascript:simile_toggle(this, 'zone_label_<?PHP echo $counter; ?>');">+</a> | <?PHP if(isset($zone_label['simile_zone_label_startlabel_' . $counter])){ echo $zone_label['simile_zone_label_startlabel_' . $counter]; }  ?> - 	<?PHP if(isset($zone_label['simile_zone_label_endlabel_' . $counter])){  echo $zone_label['simile_zone_label_endlabel_' . $counter]; }  ?> (Zone <?PHP echo $counter; ?>)</p>
		<div id="zone_label_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; display:none">
		<?PHP
	}else{
		?>
		<div id="zone_label_<?PHP echo $counter; ?>" style="margin:20px; padding:20px;">
		<?PHP
	}
	
	?>
	  <label><?PHP echo SIMILE_ZONE_START_DATE; ?></label><input class="required" type="text" style="width:100%" id="simile_zone_label_startdate_<?PHP echo $counter; ?>" name="simile_zone_label_startdate_<?PHP echo $counter; ?>" value="<?PHP if(isset($zone_label['simile_zone_label_startdate_' . $counter])){ echo $zone_label['simile_zone_label_startdate_' . $counter]; } ?>" /><br />
	  <label><?PHP echo SIMILE_ZONE_END_DATE; ?></label><input class="required" type="text" style="width:100%" id="simile_zone_label_enddate_<?PHP echo $counter; ?>" name="simile_zone_label_enddate_<?PHP echo $counter; ?>" value="<?PHP if(isset($zone_label['simile_zone_label_enddate_' . $counter])){ echo $zone_label['simile_zone_label_enddate_' . $counter]; }  ?>" /><br />
	  <label><?PHP echo SIMILE_ZONE_START_LABEL; ?></label><input class="required" type="text" style="width:100%" id="simile_zone_label_startlabel_<?PHP echo $counter; ?>" name="simile_zone_label_startlabel_<?PHP echo $counter; ?>" value="<?PHP if(isset($zone_label['simile_zone_label_startlabel_' . $counter])){ echo $zone_label['simile_zone_label_startlabel_' . $counter]; } ?>" /><br />
	  <script type="text/javascript">

			if (window.addEventListener) {
				window.addEventListener("load", 
					function(){
			
						add_js_date_pick("simile_zone_label_startdate_<?PHP echo $counter; ?>");
						add_js_date_pick("simile_zone_label_enddate_<?PHP echo $counter; ?>");
						
					}
				, false);
			}
			else if (window.attachEvent) {
			  window.attachEvent("onload",
				function(){

					add_js_date_pick_year("simile_zone_label_startdate_<?PHP echo $counter; ?>");
					add_js_date_pick_year("simile_zone_label_enddate_<?PHP echo $counter; ?>");
					
				}
			  );
			} 
			
	  </script>
	  <label><?PHP echo SIMILE_ZONE_END_LABEL; ?></label><input type="text" style="width:100%" name="simile_zone_label_endlabel_<?PHP echo $counter; ?>" value="<?PHP if(isset($zone_label['simile_zone_label_endlabel_' . $counter])){ echo $zone_label['simile_zone_label_endlabel_' . $counter]; } ?>" /><br />
	  <label><?PHP echo SIMILE_ZONE_END_LABEL; ?></label><input type="text" style="width:100%" name="simile_zone_label_endlabel_<?PHP echo $counter; ?>" value="<?PHP if(isset($zone_label['simile_zone_label_endlabel_' . $counter])){ echo $zone_label['simile_zone_label_endlabel_' . $counter]; } ?>" /><br />
	  <label><?PHP echo SIMILE_ZONE_LABEL_CHOICE; ?></label>
	  <select style="height:auto" name="simile_event_label_zones_<?PHP echo $counter; ?>[]">
	  <?PHP
	  
		$zones = $data['zones'];
	  
		for($x=0;$x<count($zones);$x++){

			?><option value="<?PHP echo $x; ?>" <?PHP 
			
				if(isset($zone_label['simile_event_label_zones_' . $counter])){
			
					if(in_array($x, $zone_label['simile_event_label_zones_' . $counter])){
				
						echo " selected ";
				
					}	
					
				}
			
			?>>Zone <?PHP echo $x; ?></option><?PHP
		
		}
	  
	  ?>			  
	  </select><br />
	  <label><? echo SIMILE_COLOUR; ?></label><input class="color" type="text" length="6" name="simile_zone_label_colour_<?PHP echo $counter; ?>" value="<?PHP if(isset($zone_label['simile_zone_label_colour_' . $counter])){ echo $zone_label['simile_zone_label_colour_' . $counter]; } ?>" /><br />
	  <label><? echo SIMILE_OPACITY; ?></label><input type="text" length="3" name="simile_zone_label_opacity_<?PHP echo $counter; ?>" value="<?PHP if(isset($zone_label['simile_zone_label_opacity_' . $counter])){ echo $zone_label['simile_zone_label_opacity_' . $counter]; } ?>" /><br />		
	  <label><? echo SIMILE_REMOVE; ?></label> <input type="checkbox" length="10" name="simile_zone_label_delete_<?PHP echo $counter; ?>" />			  		
	</div>
	<?PHP

}

function simile_event($counter, $event, $data){

	if($counter==0&&isset($event['simile_event_title_' . $counter])){
	
		?><p style="border-bottom:1px solid black;"><a class="toggle" onclick="javascript:simile_toggle(this, 'event_<?PHP echo $counter; ?>');">+</a> | <?PHP echo $event['simile_event_title_' . $counter];  ?> (Event <?PHP echo $counter; ?>)</p>
		<div id="event_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; background:#eaeaea; display:none"><?PHP
	
	}else if($counter!=0&&isset($event['simile_event_title_' . $counter])){
	
		?><p style="border-bottom:1px solid black;"><a class="toggle" onclick="javascript:simile_toggle(this, 'event_<?PHP echo $counter; ?>');">+</a> | <?PHP echo $event['simile_event_title_' . $counter];  ?> (Event <?PHP echo $counter; ?>)</p>
		<div id="event_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; background:#eaeaea; display:none"><?PHP
	
	}else{
	
		?><div id="event_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; background:#eaeaea;"><?PHP
	
	}
	
	?><label><? echo SIMILE_EVENT_TITLE; ?></label><input class="required" type="text" size=100 length=100 style="width:100%" name="simile_event_title_<?PHP echo $counter; ?>" value="<?PHP if(isset($event['simile_event_title_' . $counter])){ echo stripslashes($event['simile_event_title_' . $counter]); } ?>" /><br />
	<label><? echo SIMILE_EVENT_DESCRIPTION; ?></label><textarea class="required" style="width:100%; height:50px" name="simile_event_description_<?PHP echo $counter; ?>"><?PHP if(isset($event['simile_event_description_' . $counter])){ echo stripslashes($event['simile_event_description_' . $counter]); } ?></textarea><br />
	<label><? echo SIMILE_EVENT_START; ?></label><input class="required" type="text" length="20" id="simile_event_start_<?PHP echo $counter; ?>" name="simile_event_start_<?PHP echo $counter; ?>" value="<?PHP if(isset($event['simile_event_start_' . $counter])){ echo $event['simile_event_start_' . $counter]; } ?>" />	
	<label><? echo SIMILE_EVENT_LATEST_START; ?></label><input type="text" length="20" id="simile_event_lateststart_<?PHP echo $counter; ?>" name="simile_event_lateststart_<?PHP echo $counter; ?>" value="<?PHP if(isset($event['simile_event_lateststart_' . $counter])){ echo $event['simile_event_lateststart_' . $counter]; } ?>" /><br />
	<label><? echo SIMILE_EVENT_EARLIEST_END; ?></label><input type="text" length="20" id="simile_event_earliestend_<?PHP echo $counter; ?>" name="simile_event_earliestend_<?PHP echo $counter; ?>" value="<?PHP if(isset($event['simile_event_earliestend_' . $counter])){ echo $event['simile_event_earliestend_' . $counter]; } ?>" /> 
	<label><? echo SIMILE_EVENT_END; ?></label><input type="text" length="20" id="simile_event_end_<?PHP echo $counter; ?>" name="simile_event_end_<?PHP echo $counter; ?>" value="<?PHP if(isset($event['simile_event_end_' . $counter])){ echo $event['simile_event_end_' . $counter]; } ?>" /><br />
	<script type="text/javascript">
	
		if (window.addEventListener) {
			window.addEventListener("load", 
			function(){
		
								add_js_date_pick("simile_event_start_<?PHP echo $counter; ?>");
								add_js_date_pick("simile_event_lateststart_<?PHP echo $counter; ?>");
								add_js_date_pick("simile_event_earliestend_<?PHP echo $counter; ?>");
								add_js_date_pick("simile_event_end_<?PHP echo $counter; ?>");
								
					}
			, false);
		}
		else if (window.attachEvent) {
		  window.attachEvent("onload",
							function(){
		
								add_js_date_pick("simile_event_start_<?PHP echo $counter; ?>");
								add_js_date_pick("simile_event_lateststart_<?PHP echo $counter; ?>");
								add_js_date_pick("simile_event_earliestend_<?PHP echo $counter; ?>");
								add_js_date_pick("simile_event_end_<?PHP echo $counter; ?>");
								
							}
		  );
		} 
	</script>				
	<label><? echo SIMILE_EVENT_DURATION_EVENT; ?></label></label><input type="checkbox" name="simile_event_durationevent_<?PHP echo $counter; ?>" <?PHP if(isset($event['simile_event_durationevent_' . $counter])){ if($event['simile_event_durationevent_' . $counter]=="on"){ echo " checked "; } } ?> /><br />								
	<label><? echo SIMILE_EVENT_LINK; ?></label><input style="width:100%" type="text" length="100" name="simile_event_link_<?PHP echo $counter; ?>" value="<?PHP if(isset($event['simile_event_link_' . $counter])){ echo  $event['simile_event_link_' . $counter]; } ?>" /><br />
	<label><? echo SIMILE_EVENT_IMAGE; ?></label><input style="width:100%" type="text" length="100" name="simile_event_image_<?PHP echo $counter; ?>" value="<?PHP if(isset($event['simile_event_image_' . $counter])){ echo $event['simile_event_image_' . $counter]; } ?>" /><br />				
	<label><? echo SIMILE_COLOUR; ?></label><input class="color" type="text" length="6" name="simile_event_color_<?PHP echo $counter; ?>" value="<?PHP if(isset($event['simile_event_color_' . $counter])){ echo $event['simile_event_color_' . $counter]; }else{ echo "000000"; } ?>" /><br />
	<label><? echo SIMILE_TEXT_COLOUR; ?></label><input class="color" type="text" length="6" name="simile_event_textcolor_<?PHP echo $counter; ?>" value="<?PHP if(isset($event['simile_event_textcolor_' . $counter])){ echo $event['simile_event_textcolor_' . $counter]; }else{ echo "000000"; } ?>" /><br />
	<label><? echo SIMILE_OPACITY; ?></label><input type="text" length="3" name="simile_event_opacity_<?PHP echo $counter; ?>" value="<?PHP if(isset($event['simile_event_opacity_' . $counter])){ echo $event['simile_event_opacity_' . $counter]; } ?>" /><br />
	<label><? echo SIMILE_ZONE_APPEAR_EVENTS; ?></label>
	<select class="required" style="height:auto" multiple="multiple" name="simile_event_zones_<?PHP echo $counter; ?>[]">
	  <?PHP
		
		$events = $data['events'];
		$zones = $data['zones'];
					  
		for($x=0;$x<count($zones);$x++){

			?><option value="<?PHP echo $x; ?>" <?PHP 
			
				if(isset($event['simile_event_zones_' . $counter])){
			
					if(in_array($x, $event['simile_event_zones_' . $counter])){
					
						echo " selected ";
					
					}else{
					
					
					}
				
				}else if($x==0){
								
					if(count($zones)==1){
						
						echo " selected ";
					
					}
				
				}
			
			?>>Zone <?PHP echo $x; ?></option><?PHP
		
		}
	  
	  ?>			  
	  </select><br />
	  <label><?PHP echo SIMILE_REMOVE; ?></label> <input type="checkbox" name="simile_event_delete_<?PHP echo $counter; ?>" />
	  </div>		
	<?PHP
						
	}

?>
