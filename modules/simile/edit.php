<?php
/**
 * allows the site to edit a simile module
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */


function output_editor_code($row_edit, $xerte_toolkits_site, $read_status, $version_control){

    require_once("config.php");

    _load_language_file("/modules/simile/edit.inc");

    $row_username = db_query_one("select username from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?" , array($row_edit['user_id']));

    if(empty($row_username)) {
        die("Invalid user id ?");
    }

    /**
     * create the preview xml used for editing
     */

	if(file_exists($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/preview.inc")){

		$preview = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/preview.inc";
		
	}else{
	
		$preview = "";
	
	}
	
	$data = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/preview.inc";
 
    if(!file_exists($preview) && file_exists($data)){
        copy($data, $preview);
        chmod($preview, 0777);
    }

    /**
     * set up the onunload function used in version control
     */

?>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title><?PHP echo SIMILE_EDIT_TITLE; ?></title>
		<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
		<script src="modules/simile/simile_timeline_toggle.js" type="text/javascript"></script>
    </head>

    <body>
	<div style="float:left; position:relative; clear:both; width:100%;">
	<form method="POST" action="preview.php?template_id=<?PHP echo $row_edit['template_id']; ?>">
	<input type="hidden" name="save_path" value="<?PHP echo $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name']; ?>" />
	<?PHP
		
	echo "<div style='margin:10 0; padding:10; background:#eee'>";	
	echo "<h2>Timeline Description</h2>";

	if($preview!=""){
	
		$data = unserialize(file_get_contents($preview));
	
		echo "<textarea style='width:100%; height:200px' name='simile_description'>" . $data['simile_description'] . "</textarea>";
	
	}else{
	
		echo "<textarea style='width:100%; height:200px' name='simile_description'>Enter the description for the timeline here</textarea>";
	
	}
	
	echo "<p>" . SIMILE_DESC_TEXT . "</p>";
	echo "</div>";
	
	echo "<div style='margin:10 0; padding:10; background:#eee'>";
	echo "<h2>" . SIMILE_START_STOP . "</h2>";
	
	if($preview!=""){
	
		?><label><?PHP echo SIMILE_START; ?></label><input type="text" length="4" name="simile_start" value="<?PHP echo $data['simile_start'];  ?>" /><br />
		<label><?PHP echo SIMILE_STOP; ?></label><input type="text" length="4" name="simile_stop" value="<?PHP echo $data['simile_stop'];  ?>" /><br />
		<?PHP
			
	}else{
	
		?><label><?PHP echo SIMILE_START; ?></label><input type="text" length="4" name="simile_start" /><br />
		<label><?PHP echo SIMILE_STOP; ?></label><input type="text" length="4" name="simile_stop" /><br /><?PHP
		
	}

	echo "<p>" . SIMILE_START_STOP_EXTRA . "</p>";
	echo "</div>";
	
	echo "<div style='margin:10 0; padding:10; background:#eee'>";
	echo "<h2>" . SIMILE_ZONE . "</h2>";
	echo "<p>" . SIMILE_ZONE_EXPLAIN . "</p>";
	
	if($preview!=""){
	
		if(isset($data['zones'])){
	
			$zones = $data['zones'];
			
			$counter = 0;
	
			echo "<h3 style='border-bottom:3px solid black;'>" . SIMILE_EXISTING_ZONES . "</h3>";
		
			while($zone = array_shift($zones)){
						
				?><p style="border-bottom:1px solid black;"><a onclick="javascript:simile_toggle('zone_<?PHP echo $counter; ?>');">+</a> | <?PHP echo $zone['simile_zone_start_' . $counter];  ?> - 	<?PHP echo $zone['simile_zone_stop_' . $counter];  ?> (Zone <?PHP echo $counter; ?>)</p>
				<div id="zone_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; display:none">
				<label><?PHP echo SIMILE_START; ?></label><input type="text" length="4" style="width:100%" name="simile_zone_start_<?PHP echo $counter; ?>" value="<?PHP echo $zone['simile_zone_start_' . $counter];  ?>" /><br />
				<label><?PHP echo SIMILE_STOP; ?></label><input type="text" length="4" style="width:100%" name="simile_zone_stop_<?PHP echo $counter; ?>" value="<?PHP echo $zone['simile_zone_stop_' . $counter];  ?>" /><br />
				<label><?PHP echo SIMILE_WIDTH; ?></label><input type="text" length="4" style="width:100%" name="simile_zone_width_<?PHP echo $counter; ?>" value="<?PHP echo $zone['simile_zone_width_' . $counter];  ?>" /><br />
				<label><?PHP echo SIMILE_UNIT_TIME; ?></label>
				<select name="simile_zone_unit_<?PHP echo $counter; ?>">
					<option value="0" <?PHP if($zone['simile_zone_unit_' . $counter]==0){ echo " selected "; } ?> ><?PHP echo SIMILE_HOUR; ?></option>
					<option value="1" <?PHP if($zone['simile_zone_unit_' . $counter]==1){ echo " selected "; } ?> ><?PHP echo SIMILE_DAY; ?></option>
					<option value="2" <?PHP if($zone['simile_zone_unit_' . $counter]==2){ echo " selected "; } ?> ><?PHP echo SIMILE_MONTH; ?></option>
					<option value="3" <?PHP if($zone['simile_zone_unit_' . $counter]==3){ echo " selected "; } ?> ><?PHP echo SIMILE_YEAR; ?></option>
					<option value="4" <?PHP if($zone['simile_zone_unit_' . $counter]==4){ echo " selected "; } ?> ><?PHP echo SIMILE_DECADE; ?></option>
					<option value="5" <?PHP if($zone['simile_zone_unit_' . $counter]==5){ echo " selected "; } ?> ><?PHP echo SIMILE_CENTURY; ?></option>
				</select><br />
				<label><?PHP echo SIMILE_WIDTH; ?></label>
				<input type="text" length="10" name="simile_zone_interval_pixels_<?PHP echo $counter; ?>" value="<?PHP echo $zone['simile_zone_interval_pixels_' . $counter];  ?>" /><br /><br />
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
				
				$counter++;

			}
			
		}
		
	}
	
	?>
	<div style="border-top:3px solid black;">
	<h4><?PHP echo SIMILE_NEW_ZONE; ?></h4>
	<p><?PHP echo SIMILE_DATE_FORMAT; ?></p>
	<p><?PHP echo SIMILE_DATE_FORMAT_2; ?></p>
	<p><?PHP echo SIMILE_DATE_FORMAT_3; ?></p>
	<label><?PHP echo SIMILE_START; ?></label><input type="text" style="width:100%" length="4" name="simile_zone_start_<?PHP echo $counter; ?>" /><br />
	<label><?PHP echo SIMILE_STOP; ?></label><input type="text" style="width:100%" length="4" name="simile_zone_stop_<?PHP echo $counter; ?>" /><br />	
	<label><?PHP echo SIMILE_WIDTH; ?></label><input type="text" length="4" name="simile_zone_width_<?PHP echo $counter; ?>" /><?PHP echo SIMILE_WIDTH_EXPLAIN; ?><br />
	<label><?PHP echo SIMILE_UNIT; ?></label>
	<select name="simile_zone_unit_<?PHP echo $counter; ?>">
		<option value="0"><?PHP echo SIMILE_HOUR; ?></option>
		<option value="1"><?PHP echo SIMILE_DAY; ?></option>
		<option value="2"><?PHP echo SIMILE_MONTH; ?></option>
		<option value="3"><?PHP echo SIMILE_YEAR; ?></option>
		<option value="4"><?PHP echo SIMILE_DECADE; ?></option>
		<option value="5"><?PHP echo SIMILE_CENTURY; ?></option>
	</select><?PHP echo SIMILE_UNIT_EXPLAIN; ?><br />
	<label><?PHP echo SIMILE_UNIT_SIZE; ?></label>
	<input type="text" length="10" name="simile_zone_interval_pixels_<?PHP echo $counter; ?>" />
	<p><? echo SIMILE_ZONE_UNIT_EXPLAIN; ?></p>
	</div>
	</div>
	<?PHP
	
	echo "<div style='margin:10 0; padding:10; background:#eee'>";
	
	$counter = 0;
	
	if($preview!=""){
	
		if(isset($data['zone_labels'])){
		
			echo "<h2>" . SIMILE_ZONE_LABELS . "</h2>";
			echo "<p>" . SIMILE_ZONE_LABEL_INSTRUCTION . "</p>";
	
			$zone_labels = $data['zone_labels'];
				
			while($zone_label = array_shift($zone_labels)){
				
				?><p style="border-bottom:1px solid black;"><a onclick="javascript:simile_toggle('zone_label_<?PHP echo $counter; ?>');">+</a> | <?PHP echo $zone_label['simile_zone_label_startlabel_' . $counter];  ?> - 	<?PHP echo $zone_label['simile_zone_label_endlabel_' . $counter];  ?> (Zone <?PHP echo $counter; ?>)</p>
				<div id="zone_label_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; display:none">
				  <label><?PHP echo SIMILE_ZONE_START_DATE; ?></label><input type="text" style="width:100%" length="20" name="simile_zone_label_startdate_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_startdate_' . $counter]; ?>" /><br />
				  <label><?PHP echo SIMILE_ZONE_END_DATE; ?></label><input type="text" style="width:100%" length="20" name="simile_zone_label_enddate_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_enddate_' . $counter];  ?>" /><br />
				  <label><?PHP echo SIMILE_ZONE_START_LABEL; ?></label><input type="text" style="width:100%" length="20" name="simile_zone_label_startlabel_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_startlabel_' . $counter]; ?>" /><br />
				  <label><?PHP echo SIMILE_ZONE_END_LABEL; ?></label><input type="text" style="width:100%" length="20" name="simile_zone_label_endlabel_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_endlabel_' . $counter]; ?>" /><br />
				  <label><?PHP echo SIMILE_ZONE_LABEL_CHOICE; ?></label>
				  <select style="height:auto" name="simile_event_label_zones_<?PHP echo $counter; ?>[]">
				  <?PHP
				  
					$zones = $data['zones'];
				  
					for($x=0;$x<count($zones);$x++){
			
						?><option value="<?PHP echo $x; ?>" <?PHP 
						
							if(in_array($x, $zone_label['simile_event_label_zones_' . $counter])){
							
								echo " selected ";
							
							}
						
						?>>Zone <?PHP echo $x; ?></option><?PHP
					
					}
				  
				  ?>			  
				  </select><br />
				  <label><? echo SIMILE_COLOUR; ?></label><input type="text" length="6" name="simile_zone_label_colour_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_colour_' . $counter]; ?>" /><br />
				  <label><? echo SIMILE_OPACITY; ?></label><input type="text" length="3" name="simile_zone_label_opacity_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_opacity_' . $counter]; ?>" /><br />		
				  <label><? echo SIMILE_REMOVE; ?></label> <input type="checkbox" length="10" name="simile_zone_label_delete_<?PHP echo $counter; ?>" />			  		
				</div>
				<?PHP
				
				$counter++;

			}

		}

	}
	
	?><h4><?PHP echo SIMILE_ZONE_NEW_LABEL; ?></h4>
		<p><?PHP echo SIMILE_ZONE_FORMAT; ?></p>	
		<label><?PHP echo SIMILE_ZONE_START_DATE; ?></label><input type="text" style="width:100%" length="20" name="simile_zone_label_startdate_<?PHP echo $counter; ?>" /><br />
		<label><?PHP echo SIMILE_ZONE_END_DATE; ?></label><input type="text" style="width:100%" length="20" name="simile_zone_label_enddate_<?PHP echo $counter; ?>" /><br />
		<label><?PHP echo SIMILE_ZONE_START_LABEL; ?></label><input type="text" style="width:100%" length="20" name="simile_zone_label_startlabel_<?PHP echo $counter; ?>" /><br />
		<label><?PHP echo SIMILE_ZONE_END_LABEL; ?></label><input type="text" style="width:100%" length="20" name="simile_zone_label_endlabel_<?PHP echo $counter; ?>" /><br />
		<label><?PHP echo SIMILE_ZONE_APPEAR; ?></label>
		<select style="height:auto" name="simile_event_label_zones_<?PHP echo $counter; ?>[]">
		<?PHP
			  
			$zones = $data['zones'];
			  
			for($x=0;$x<count($zones);$x++){
		
				?><option value="<?PHP echo $x; ?>">Zone <?PHP echo $x; ?></option><?PHP
				
			}
			  
		?>			  
		</select><br />
		<label><? echo SIMILE_COLOUR; ?></label><input type="text" length="6" name="simile_zone_label_colour_<?PHP echo $counter; ?>" /><? echo SIMILE_HEXA; ?><a href="<? echo SIMILE_HEXA_LINK; ?>"><? echo SIMILE_HEXA_EXAMPLES; ?></a> <br />
		<label><? echo SIMILE_OPACITY; ?></label><input type="text" length="3" name="simile_zone_label_opacity_<?PHP echo $counter; ?>" /> <? echo SIMILE_OPACITY_EXPLAINED; ?>
		</div>
	<?PHP
	
	echo "<div style='margin:10 0; padding:10; background:#eee'>";
	echo "<h2>" . SIMILE_TIMELINE_EVENTS . "</h2>";
	echo "<p>" . SIMILE_EXISTING_EVENTS . "</p>";
	
	$counter = 0;
	
	if($preview!=""){
	
		if(isset($data['events'])){
					
			$events = $data['events'];	
			
			while($event = array_shift($events)){
						
				?><p style="border-bottom:1px solid black;"><a onclick="javascript:simile_toggle('event_<?PHP echo $counter; ?>');">+</a> | <?PHP echo $event['simile_event_title_' . $counter];  ?> (Event <?PHP echo $counter; ?>)</p>
				<div id="event_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; background:#eaeaea; display:none">
				<label><? echo SIMILE_EVENT_TITLE; ?></label><input type="text" size=100 length=100 style="width:100%" name="simile_event_title_<?PHP echo $counter; ?>" value="<?PHP echo stripslashes($event['simile_event_title_' . $counter]); ?>" /><br />
				<label><? echo SIMILE_EVENT_DESCRIPTION; ?></label><textarea style="width:100%; height:50px" name="simile_event_description_<?PHP echo $counter; ?>"><?PHP echo stripslashes($event['simile_event_description_' . $counter]); ?></textarea><br />
				<label><? echo SIMILE_EVENT_LINK; ?></label><input style="width:100%" type="text" length="100" name="simile_event_link_<?PHP echo $counter; ?>" value="<?PHP echo  $event['simile_event_link_' . $counter]; ?>" /><br />
				<label><? echo SIMILE_EVENT_IMAGE; ?></label><input style="width:100%" type="text" length="100" name="simile_event_image_<?PHP echo $counter; ?>" value="<?PHP echo  $event['simile_event_image_' . $counter]; ?>" /><br />
				<label><? echo SIMILE_EVENT_START; ?></label><input type="text" length="20" name="simile_event_start_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_start_' . $counter]; ?>" />	
				<label><? echo SIMILE_EVENT_LATEST_START; ?></label><input type="text" length="20" name="simile_event_lateststart" value="<?PHP echo $event['simile_event_lateststart_' . $counter]; ?>" /><br />
				<label><? echo SIMILE_EVENT_EARLIEST_END; ?></label><input type="text" length="20" name="simile_event_earliestend_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_earliestend_' . $counter]; ?>" /> 
				<label><? echo SIMILE_EVENT_END; ?></label><input type="text" length="20" name="simile_event_end_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_end_' . $counter]; ?>" /><br />
				<label><? echo SIMILE_EVENT_DURATION_EVENT; ?></label></label><input type="checkbox" name="simile_event_durationevent_<?PHP echo $counter; ?>" <?PHP if($event['simile_event_durationevent_' . $counter]=="on"){ echo " checked "; } ?> /><br />
				<label><? echo SIMILE_COLOUR; ?></label><input type="text" length="6" name="simile_event_color_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_color_' . $counter]; ?>" /><br />
				<label><? echo SIMILE_TEXT_COLOUR; ?></label><input type="text" length="6" name="simile_event_textcolor_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_textcolor_' . $counter]; ?>" /><br />
				<label><? echo SIMILE_OPACITY; ?></label><input type="text" length="3" name="simile_event_opacity_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_opacity_' . $counter]; ?>" /><br />
				<label><? echo SIMILE_ZONE_APPEAR_EVENTS; ?></label>
				<select style="height:auto" multiple="multiple" name="simile_event_zones_<?PHP echo $counter; ?>[]">
				  <?PHP
					
					$zones = $data['zones'];
				  
					for($x=0;$x<count($zones);$x++){
			
						?><option value="<?PHP echo $x; ?>" <?PHP 
						
							if(is_array($event['simile_event_zones_' . $counter])){
						
								if(in_array($x, $event['simile_event_zones_' . $counter])){
							
									echo " selected ";
							
								}
								
							}
						
						?><?PHP echo SIMILE_ZONE_ZONE; ?><?PHP echo $x; ?></option><?PHP
					
					}
				  
				  ?>			  
				  </select><br />
				  <label><?PHP echo SIMILE_REMOVE; ?></label> <input type="checkbox" name="simile_event_delete_<?PHP echo $counter; ?>" />
				  </div>		
				<?PHP
				
				$counter++;

			}
	
		}
	
	}
				
	?>
	<label><? echo SIMILE_EVENT_TITLE; ?></label><input type="text" length="100" style="width:100%" name="simile_event_title_<?PHP echo $counter; ?>" /><br />
	<label><? echo SIMILE_EVENT_DESCRIPTION; ?></label><textarea style="width:100%; height:50px" name="simile_event_description_<?PHP echo $counter; ?>"></textarea><br />
	<label><? echo SIMILE_EVENT_LINK; ?></label><input style="width:100%" type="text" length="100" name="simile_event_link_<?PHP echo $counter; ?>" /><br />
	<label><? echo SIMILE_EVENT_IMAGE; ?></label><input style="width:100%" type="text" length="100" name="simile_event_image_<?PHP echo $counter; ?>" value="" /><br />
	<label><? echo SIMILE_EVENT_START; ?></label><input type="text" length="20" style="width:100%" name="simile_event_start_<?PHP echo $counter; ?>" /><br/>
	<label><? echo SIMILE_EVENT_LATEST_START; ?></label><input type="text" style="width:100%" length="20" name="simile_event_lateststart" /><br />
	<label><? echo SIMILE_EVENT_EARLIEST_END; ?></label><input type="text" style="width:100%" length="20" name="simile_event_earliestend_<?PHP echo $counter; ?>" /><br />
	<label><? echo SIMILE_EVENT_END; ?></label><input type="text" length="20" style="width:100%" name="simile_event_end" /><br />
	<label><? echo SIMILE_EVENT_DURATION_EVENT; ?></label> <input type="checkbox" name="simile_event_durationevent_<?PHP echo $counter; ?>" /><br />
	<label><? echo SIMILE_COLOUR; ?></label><input type="text" length="6" name="simile_event_color_<?PHP echo $counter; ?>" /><br />
	<label><? echo SIMILE_TEXT_COLOUR; ?></label><input type="text" length="6" name="simile_event_textcolor_<?PHP echo $counter; ?>" /><br />
	<label><? echo SIMILE_OPACITY; ?></label><input type="text" length="3" name="simile_event_opacity_<?PHP echo $counter; ?>" />		
	</div>
	<input type="submit" value="<? echo SIMILE_PREVIEW; ?>" />
	</form>
	</div>

	<?PHP

	}
	
?>
