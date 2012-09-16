<?PHP    

/**
* 
* preview page, allows the site to make a preview page for a xerte module
*
* @author Patrick Lockley
* @version 1.0
* @params array row_play - The array from the last mysql query
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/


/**
* 
* Function show_preview_code
* This function creates folders needed when creating a template
* @param array $row - an array from a mysql query for the template
* @param array $row_username - an array from a mysql query for the username
* @version 1.0
* @author Patrick Lockley
*/

function show_preview_code($row, $row_username){

	global $xerte_toolkits_site;
	
	require_once(dirname(__FILE__) . '/module_functions.php');

	/*
	* Format the XML strings to provide data to the engine
	*/

	if(!file_exists($xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/preview.inc")){

	}


	if(isset($_POST)){
	
		?>
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title><?PHP echo SIMILE_EDIT_TITLE; ?></title>
		<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
		<script src="http://static.simile.mit.edu/timeline/api-2.3.0/timeline-api.js?bundle=true" type="text/javascript"></script>
    </head>

    <body>
		<p><a href="edit.php?template_id=<?PHP echo $row['template_id']; ?>">Return to editor</a></p>
		<?PHP
	
		$data = array();
		
		$data['simile_description'] = strip_tags($_POST['simile_description'],"<p><a><img>");
		$data['simile_start'] = htmlentities(strip_tags($_POST['simile_start']));
		$data['simile_stop'] = htmlentities(strip_tags($_POST['simile_stop']));
		
		$counter = 0;
		
		$save_counter = 0;
		
		$data['zones'] = array();
		
		while(isset($_POST['simile_zone_width_' . $counter])){
		
			$zone = array();
			
			if($_POST['simile_zone_delete_' . $counter]!="on"){
			
				$zone['simile_zone_start_' . $save_counter] = $_POST['simile_zone_start_' . $counter];
				$zone['simile_zone_stop_' . $save_counter] = $_POST['simile_zone_stop_' . $counter];
				$zone['simile_zone_width_' . $save_counter] = $_POST['simile_zone_width_' . $counter];
				$zone['simile_zone_interval_pixels_' . $save_counter] = $_POST['simile_zone_interval_pixels_' . $counter];
				$zone['simile_zone_unit_' . $save_counter] = $_POST['simile_zone_unit_' . $counter];
				$zone['simile_zone_sync_' . $save_counter] = $_POST['simile_zones_sync_' . $counter];
									
				if($_POST['simile_zone_width_' . $counter]!=""){
					
					$zone = array_filter($zone);		
							
					array_push($data['zones'], $zone);
					$save_counter++;
				
				}
			
			}
			
			$counter++;
		
		}
						
		$data['zone_labels'] = array();
		
		$counter = 0;
		$save_counter = 0;
		
		while(isset($_POST['simile_zone_label_startdate_' . $counter])){
		
			$zone_label = array();
			
			if(!isset($_POST['simile_zone_label_delete_' . $counter])){
									
				$zone_label['simile_zone_label_startdate_' . $save_counter] = $_POST['simile_zone_label_startdate_' . $counter];
				$zone_label['simile_zone_label_enddate_' . $save_counter] = $_POST['simile_zone_label_enddate_' . $counter];
				$zone_label['simile_zone_label_startlabel_' . $save_counter] = $_POST['simile_zone_label_startlabel_' . $counter];
				$zone_label['simile_zone_label_endlabel_' . $save_counter] = $_POST['simile_zone_label_endlabel_' . $counter];
				$zone_label['simile_zone_label_colour_' . $save_counter] = $_POST['simile_zone_label_colour_' . $counter];
				$zone_label['simile_zone_label_opacity_' . $save_counter] = $_POST['simile_zone_label_opacity_' . $counter];
				$zone_label['simile_event_label_zones_' . $save_counter] = $_POST['simile_event_label_zones_' . $counter];
			
				if($_POST['simile_zone_label_startdate_' . $counter]!=""){
				
					$zone_label = array_filter($zone_label);	
			
					array_push($data['zone_labels'], $zone_label);
					$save_counter++;
				
				}
						
			}
									
			$counter++;
		
		}
		
		$data['events'] = array();
				
		$counter = 0;
		
		$save_counter = 0;
		
		while(isset($_POST['simile_event_title_' . $counter])){
		
			$event = array();
			
			if($_POST['simile_event_delete_' . $counter]!="on"){
			
				$event['simile_event_title_' . $save_counter] = stripslashes($_POST['simile_event_title_' . $counter]);
				$event['simile_event_description_' . $save_counter] = $_POST['simile_event_description_' . $counter];
				$event['simile_event_link_' . $save_counter] = $_POST['simile_event_link_' . $counter];
				$event['simile_event_image_' . $save_counter] = $_POST['simile_event_image_' . $counter];
				$event['simile_event_start_' . $save_counter] = $_POST['simile_event_start_' . $counter];
				$event['simile_event_lateststart_' . $save_counter] = $_POST['simile_event_lateststart_' . $counter];
				$event['simile_event_earliestend_' . $save_counter] = $_POST['simile_event_earliestend_' . $counter];
				$event['simile_event_end_' . $save_counter] = $_POST['simile_event_end_' . $counter];
				$event['simile_event_durationevent_' . $save_counter] = $_POST['simile_event_durationevent_' . $counter];
				$event['simile_event_color_' . $save_counter] = $_POST['simile_event_color_' . $counter];
				$event['simile_event_textcolor_' . $save_counter] = $_POST['simile_event_textcolor_' . $counter];
				$event['simile_event_opacity_' . $save_counter] = $_POST['simile_event_opacity_' . $counter];
				$event['simile_event_zones_' . $save_counter] = $_POST['simile_event_zones_' . $counter];
								
				if($_POST['simile_event_title_' . $counter]!=""){
						
					$event = array_filter($event);	
				
					array_push($data['events'], $event);
					$save_counter++;
					
				}
			
			}
			
			$counter++;
		
		}
					
		if(isset($_POST)){
			
			file_put_contents($_POST['save_path'] . "/preview.inc", serialize($data));
		
			display_timeline($data);
	
		}	
	
	}
	
}
	
	
?>