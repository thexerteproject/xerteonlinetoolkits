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
	
	$data = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/data.inc";
 
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

    <div style="margin:0 auto; width:800px">
        <div class="edit_topbar" style="width:800px">
            <img src="website_code/images/edit_xerteLogo.jpg" style="margin-left:10px; float:left" />
            <img src="website_code/images/edit_UofNLogo.jpg" style="margin-right:10px; float:right" />
        </div>
    </div>
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
	
	echo "<p>Enter the description for your timeline here. You can use &lt;p&gt;, &lt;img&gt; and &lt;a&gt; HTML tags.</p>";
	echo "</div>";
	
	echo "<div style='margin:10 0; padding:10; background:#eee'>";
	echo "<h2>Timeline start and end years</h2>";
	
	if($preview!=""){
	
		?><label>Start</label><input type="text" length="4" name="simile_start" value="<?PHP echo $data['simile_start'];  ?>" /><br />
		<label>Stop</label><input type="text" length="4" name="simile_stop" value="<?PHP echo $data['simile_stop'];  ?>" /><br />
		<?PHP
			
	}else{
	
		?><label>Start</label><input type="text" length="4" name="simile_start" /><br />
		<label>Stop</label><input type="text" length="4" name="simile_stop" /><br /><?PHP
		
	}

	echo "<p>In these fields enter the years you want your timeline to start and stop.</p>";
	echo "</div>";
	
	echo "<div style='margin:10 0; padding:10; background:#eee'>";
	echo "<h2>Timeline zones</h2>";
	echo "<p>A zone is a band on the time zone reflecting a grouping of events</p>";
	
	if($preview!=""){
	
		if(isset($data['zones'])){
	
			$zones = $data['zones'];
			
			$counter = 0;
	
			echo "<h3 style='border-bottom:3px solid black;'>Existing zones</h3>";
		
			while($zone = array_shift($zones)){
						
				?><p style="border-bottom:1px solid black;"><a onclick="javascript:simile_toggle('zone_<?PHP echo $counter; ?>');">+</a> | <?PHP echo $zone['simile_zone_start_' . $counter];  ?> - 	<?PHP echo $zone['simile_zone_stop_' . $counter];  ?> (Zone <?PHP echo $counter; ?>)</p>
				<div id="zone_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; display:none">
				<label>Start</label><input type="text" length="4" style="width:100%" name="simile_zone_start_<?PHP echo $counter; ?>" value="<?PHP echo $zone['simile_zone_start_' . $counter];  ?>" /><br />
				<label>Stop</label><input type="text" length="4" style="width:100%" name="simile_zone_stop_<?PHP echo $counter; ?>" value="<?PHP echo $zone['simile_zone_stop_' . $counter];  ?>" /><br />
				<label>Width</label><input type="text" length="4" style="width:100%" name="simile_zone_width_<?PHP echo $counter; ?>" value="<?PHP echo $zone['simile_zone_width_' . $counter];  ?>" /><br />
				<label>Unit of Time</label>
				<select name="simile_zone_unit_<?PHP echo $counter; ?>">
					<option value="0" <?PHP if($zone['simile_zone_unit_' . $counter]==0){ echo " selected "; } ?> >Hour</option>
					<option value="1" <?PHP if($zone['simile_zone_unit_' . $counter]==1){ echo " selected "; } ?> >Day</option>
					<option value="2" <?PHP if($zone['simile_zone_unit_' . $counter]==2){ echo " selected "; } ?> >Month</option>
					<option value="3" <?PHP if($zone['simile_zone_unit_' . $counter]==3){ echo " selected "; } ?> >Year</option>
					<option value="4" <?PHP if($zone['simile_zone_unit_' . $counter]==4){ echo " selected "; } ?> >Decade</option>
					<option value="5" <?PHP if($zone['simile_zone_unit_' . $counter]==5){ echo " selected "; } ?> >Century</option>
				</select><br />
				<label>Size of each unit</label>
				<input type="text" length="10" name="simile_zone_interval_pixels_<?PHP echo $counter; ?>" value="<?PHP echo $zone['simile_zone_interval_pixels_' . $counter];  ?>" /><br /><br />
				<?PHP 
				
					if(count($data['zones'])>1){
					
				?>
				<label>Which Time Zones should this zone sync with? (Make sure each zone is only linked to once.) </label>
				<select style="height:auto" name="simile_zones_sync_<?PHP echo $counter; ?>"><option value="-1">Select a zone to sync</option>
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
				<label>Remove</label> <input type="checkbox" length="10" name="simile_zone_delete_<?PHP echo $counter; ?>" />
				</div>
				<?PHP	
				
				$counter++;

			}
			
		}
		
	}
	
	?>
	<div style="border-top:3px solid black;">
	<h4>Add a new zone</h4>
	<p>Format the dates like this - so 1159 AM (GMT) on June 1st 2012 is <b>2012-06-01T11:59:00+0000</b></p>
	<p>So 2012 is the year, 06 is the month and 01 is the day - this is the minimum you must enter for each date.</p>
	<p>11:59:00 is the time (minutes are supported, and +0000 means GMT. </p>
	<label>Start</label><input type="text" style="width:100%" length="4" name="simile_zone_start_<?PHP echo $counter; ?>" /><br />
	<label>Stop</label><input type="text" style="width:100%" length="4" name="simile_zone_stop_<?PHP echo $counter; ?>" /><br />	
	<label>Width</label><input type="text" length="4" name="simile_zone_width_<?PHP echo $counter; ?>" /> By default use '100%' but again, you might wish to experiment with this.<br />
	<label>Unit of Time</label>
	<select name="simile_zone_unit_<?PHP echo $counter; ?>">
		<option value="0">Hour</option>
		<option value="1">Day</option>
		<option value="2">Month</option>
		<option value="3">Year</option>
		<option value="4">Decade</option>
		<option value="5">Century</option>
	</select>This is the unit shown on the timeline for this zone. Hours will show hours, days with show days, and so on.<br />
	<label>Size of each unit</label>
	<input type="text" length="10" name="simile_zone_interval_pixels_<?PHP echo $counter; ?>" />
	<p>You must add a size for the zone to be added. Experiment with this size if you want different time zones to use different scales.</p>
	</div>
	</div>
	<?PHP
	
	echo "<div style='margin:10 0; padding:10; background:#eee'>";
	
	$counter = 0;
	
	if($preview!=""){
	
		if(isset($data['zone_labels'])){
		
			echo "<h2>Timeline zone labels</h2>";
			echo "<pAdd a text label for a zone</p>";
	
			$zone_labels = $data['zone_labels'];
				
			while($zone_label = array_shift($zone_labels)){
				
				?><p style="border-bottom:1px solid black;"><a onclick="javascript:simile_toggle('zone_label_<?PHP echo $counter; ?>');">+</a> | <?PHP echo $zone_label['simile_zone_label_startlabel_' . $counter];  ?> - 	<?PHP echo $zone_label['simile_zone_label_endlabel_' . $counter];  ?> (Zone <?PHP echo $counter; ?>)</p>
				<div id="zone_label_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; display:none">
				  <label>Start Date</label><input type="text" style="width:100%" length="20" name="simile_zone_label_startdate_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_startdate_' . $counter]; ?>" /><br />
				  <label>End Date</label><input type="text" style="width:100%" length="20" name="simile_zone_label_enddate_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_enddate_' . $counter];  ?>" /><br />
				  <label>Start Label</label><input type="text" style="width:100%" length="20" name="simile_zone_label_startlabel_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_startlabel_' . $counter]; ?>" /><br />
				  <label>End Label</label><input type="text" style="width:100%" length="20" name="simile_zone_label_endlabel_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_endlabel_' . $counter]; ?>" /><br />
				  <label>A label for which zone</label>
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
				  <label>Colour</label><input type="text" length="6" name="simile_zone_label_colour_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_colour_' . $counter]; ?>" /><br />
				  <label>Opacity</label><input type="text" length="3" name="simile_zone_label_opacity_<?PHP echo $counter; ?>" value="<?PHP echo $zone_label['simile_zone_label_opacity_' . $counter]; ?>" /><br />		
				  <label>Remove</label> <input type="checkbox" length="10" name="simile_zone_label_delete_<?PHP echo $counter; ?>" />			  		
				</div>
				<?PHP
				
				$counter++;

			}

		}

	}
	
	?><h4>Add new event label</h4>
		<p>Start date and end dates should use the same format as specified above.</p>	
		<label>Start Date</label><input type="text" style="width:100%" length="20" name="simile_zone_label_startdate_<?PHP echo $counter; ?>" /><br />
		<label>End Date</label><input type="text" style="width:100%" length="20" name="simile_zone_label_enddate_<?PHP echo $counter; ?>" /><br />
		<label>Start Label</label><input type="text" style="width:100%" length="20" name="simile_zone_label_startlabel_<?PHP echo $counter; ?>" /><br />
		<label>End Label</label><input type="text" style="width:100%" length="20" name="simile_zone_label_endlabel_<?PHP echo $counter; ?>" /><br />
		<label>Which Time Zone should this event appear in?</label>
		<select style="height:auto" name="simile_event_label_zones_<?PHP echo $counter; ?>[]">
		<?PHP
			  
			$zones = $data['zones'];
			  
			for($x=0;$x<count($zones);$x++){
		
				?><option value="<?PHP echo $x; ?>">Zone <?PHP echo $x; ?></option><?PHP
				
			}
			  
		?>			  
		</select><br />
		<label>Colour</label><input type="text" length="6" name="simile_zone_label_colour_<?PHP echo $counter; ?>" /> The hexadecimal colour code. You can see <a href="http://en.wikipedia.org/wiki/Web_colors">some example colours if you would like help</a> <br />
		<label>Opacity</label><input type="text" length="3" name="simile_zone_label_opacity_<?PHP echo $counter; ?>" /> Expressed as a percentage of 100 (no percent symbol needed).
		</div>
	<?PHP
	
	echo "<div style='margin:10 0; padding:10; background:#eee'>";
	echo "<h2>Timeline events</h2>";
	echo "<p>A zone is a band on the time zone reflecting a grouping of events</p>";
	
	$counter = 0;
	
	if($preview!=""){
	
		if(isset($data['events'])){
					
			$events = $data['events'];	
			
			while($event = array_shift($events)){
						
				?><p style="border-bottom:1px solid black;"><a onclick="javascript:simile_toggle('event_<?PHP echo $counter; ?>');">+</a> | <?PHP echo $event['simile_event_title_' . $counter];  ?> (Event <?PHP echo $counter; ?>)</p>
				<div id="event_<?PHP echo $counter; ?>" style="margin:20px; padding:20px; background:#eaeaea; display:none">
				<label>Title</label><input type="text" size=100 length=100 style="width:100%" name="simile_event_title_<?PHP echo $counter; ?>" value="<?PHP echo stripslashes($event['simile_event_title_' . $counter]); ?>" /><br />
				<label>Description</label><textarea style="width:100%; height:50px" name="simile_event_description_<?PHP echo $counter; ?>"><?PHP echo stripslashes($event['simile_event_description_' . $counter]); ?></textarea><br />
				<label>Link</label><input style="width:100%" type="text" length="100" name="simile_event_link_<?PHP echo $counter; ?>" value="<?PHP echo  $event['simile_event_link_' . $counter]; ?>" /><br />
				<label>Image</label><input style="width:100%" type="text" length="100" name="simile_event_image_<?PHP echo $counter; ?>" value="<?PHP echo  $event['simile_event_image_' . $counter]; ?>" /><br />
				<label>start</label><input type="text" length="20" name="simile_event_start_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_start_' . $counter]; ?>" />	
				<label>latest start</label><input type="text" length="20" name="simile_event_lateststart" value="<?PHP echo $event['simile_event_lateststart_' . $counter]; ?>" /><br />
				<label>earliest end</label><input type="text" length="20" name="simile_event_earliestend_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_earliestend_' . $counter]; ?>" /> 
				<label>end</label><input type="text" length="20" name="simile_event_end_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_end_' . $counter]; ?>" /><br />
				<label>Duration Event</label><input type="checkbox" name="simile_event_durationevent_<?PHP echo $counter; ?>" <?PHP if($event['simile_event_durationevent_' . $counter]=="on"){ echo " checked "; } ?> /><br />
				<label>Colour</label><input type="text" length="6" name="simile_event_color_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_color_' . $counter]; ?>" /><br />
				<label>Text Colour</label><input type="text" length="6" name="simile_event_textcolor_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_textcolor_' . $counter]; ?>" /><br />
				<label>Opacity</label><input type="text" length="3" name="simile_event_opacity_<?PHP echo $counter; ?>" value="<?PHP echo $event['simile_event_opacity_' . $counter]; ?>" /><br />
				<label>Which Time Zones should this event appear in?</label>
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
						
						?>>Zone <?PHP echo $x; ?></option><?PHP
					
					}
				  
				  ?>			  
				  </select><br />
				  <label>Remove</label> <input type="checkbox" name="simile_event_delete_<?PHP echo $counter; ?>" />
				  </div>		
				<?PHP
				
				$counter++;

			}
	
		}
	
	}
				
	?>
	<label>Title (This is the text that will appear omn the timeline)</label><input type="text" length="100" style="width:100%" name="simile_event_title_<?PHP echo $counter; ?>" /><br />
	<label>Description (This is text which appears in the bubble when the timeline is clicked on)</label><textarea style="width:100%; height:50px" name="simile_event_description_<?PHP echo $counter; ?>"></textarea><br />
	<label>Link (Web address to make available in the bubble)</label><input style="width:100%" type="text" length="100" name="simile_event_link_<?PHP echo $counter; ?>" /><br />
	<label>Image (Web address of picture used in the bubble)</label><input style="width:100%" type="text" length="100" name="simile_event_image_<?PHP echo $counter; ?>" value="" /><br />
	<label>Start (date of event, or date when event starts - please see date format mentioned above)</label><input type="text" length="20" style="width:100%" name="simile_event_start_<?PHP echo $counter; ?>" /><br/>
	<label>Latest start</label><input type="text" style="width:100%" length="20" name="simile_event_lateststart" /><br />
	<label>Earliest end</label><input type="text" style="width:100%" length="20" name="simile_event_earliestend_<?PHP echo $counter; ?>" /><br />
	<label>End</label><input type="text" length="20" style="width:100%" name="simile_event_end" /><br />
	<label>Duration Event (if you want the event to be a line between two dates - start and end - check this box ). </label> <input type="checkbox" name="simile_event_durationevent_<?PHP echo $counter; ?>" /><br />
	<label>Colour</label><input type="text" length="6" name="simile_event_color_<?PHP echo $counter; ?>" /><br />
	<label>Text Colour</label><input type="text" length="6" name="simile_event_textcolor_<?PHP echo $counter; ?>" /><br />
	<label>Opacity</label><input type="text" length="3" name="simile_event_opacity_<?PHP echo $counter; ?>" />		
	</div>
	<input type="submit" value="Preview" />
	</form>
	</div>

	<?PHP

	}
	
?>
