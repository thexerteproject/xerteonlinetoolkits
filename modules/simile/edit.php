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
    require_once("website_code/php/url_library.php");
    require_once("modules/simile/module_functions.php");		

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
	
	$data = unserialize(file_get_contents($preview));
  
    if(!file_exists($preview) && file_exists($data)){
        copy($data, $preview);
        chmod($preview, 0777);
    }

    /**
     * set up the onunload function used in version control
     */

	simile_header();

	?>
    <body>
	<div class="simile_main">
		<form method="POST" action="<?PHP echo url_return("preview",$row_edit['template_id']); ?>">
		<input type="hidden" name="save_path" value="<?PHP echo $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name']; ?>" />
		<?PHP
		
		if($preview==""){
		
			echo "<p>" . SIMILE_EXPLAIN_CREATE . "</p>";
		
		}else{
		
			if(count($data['zones'])==0){
			
				echo "<p>Now add a zone to your timeline - a zone is a horizontal strip on your timeline to represent a set of events. You can have multiple zones</p>";
			
			}else if(count($data['events'])==0){

				echo "<p>Now add a zone to your timeline - a zone is a horizontal strip on your timeline to represent a set of events. You can have multiple zones</p>";

			}
		
		}
		
		echo "<p><strong>" . SIMILE_REQUIRED . "</strong></p>";
		
		echo "<div class='simile_section'>";
		echo "<h1 class='toggle' onclick='javascript:simile_toggle(this,\"simile_start_stop_holder\");'>-</h1><h2>" . SIMILE_START_STOP . "</h2>";
		echo "<div id='simile_start_stop_holder' class='display'>";
		
		simile_start_stop($data, $preview);

		echo "</div>";
		
		echo "<div class='simile_section'>";	
		echo "<h1 class='toggle' onclick='javascript:simile_toggle(this,\"simile_description_holder\");'>-</h1><h2>Timeline Description</h2>";
		
		echo "<div id='simile_description_holder' class='display'>";
		
		simile_description($data, $preview);
		
		echo "</div>";
		
		if($preview!=""){
		
			echo "<div class='simile_section'>";
			echo "<h1 class='toggle' onclick='javascript:simile_toggle(this,\"simile_zone_holder\");'>+</h1><h2>" . SIMILE_ZONE . "</h2>";
			echo "<div id='simile_zone_holder' class='hidden'>";
			echo "<p>" . SIMILE_ZONE_EXPLAIN . "</p>";
			
			$zones = $data['zones'];
					
			$counter = 0;
			
			if(count($zones)!=0){
			
				echo "<h3 style='border-bottom:3px solid black;'>" . SIMILE_EXISTING_ZONES . "</h3>";
					
				while($zone = array_shift($zones)){
							
					simile_zone($zone, $counter, $data);
							
					$counter++;

				}
				
			}
					
			?><div>		
				<h4><?PHP echo SIMILE_NEW_ZONE; ?></h4>
				<?PHP
					
					simile_zone($zone, $counter, $data);
				
				?>
			</div>	
		</div>
		</div>
			<?PHP
		
			$counter = 0;

			echo "<div class='simile_section'>";
			echo "<h1 class='toggle' onclick='javascript:simile_toggle(this,\"simile_zone_label_holder\");'>+</h1><h2>" . SIMILE_ZONE_LABELS . "</h2>";
			echo "<div id='simile_zone_label_holder' class='hidden'>";
			echo "<p>" . SIMILE_ZONE_LABEL_INSTRUCTION . "</p>";

			if($preview!=""){
			
				if(count($data['zone_labels'])!=0){
				
					$zone_labels = $data['zone_labels'];
					
					while($zone_label = array_shift($zone_labels)){
						
						simile_zone_label($counter, $zone_label, $data);
						
						$counter++;

					}

				}

			}	

			if(count($data['zones'])!=0){
			
				$zone_labels = $data['zone_labels'];
			
				simile_zone_label($counter, $zone_labels, $data);
			
			}
			
			echo "</div></div>";

			if(count($data['zones'])!=0){
			
				echo "<div class='simile_section'>";
				echo "<h1 class='toggle' onclick='javascript:simile_toggle(this,\"simile_events_holder\");'>+</h1><h2>" . SIMILE_TIMELINE_EVENTS . "</h2>";
				echo "<div id='simile_events_holder' class='hidden'>";
							
				$counter = 0;
			
				if($preview!=""){
			
					if(isset($data['events'])){
								
						$events = $data['events'];

						echo "<p>" . SIMILE_EXISTING_EVENTS . "</p>";
						
						while($event = array_shift($events)){
									
							simile_event($counter, $event, $data);
							
							$counter++;

						}
				
					}
				
				}
				
				echo "<p>" . SIMILE_NEW_EVENTS . "</p>";
				
				simile_event($counter, $event, $data);
				
				echo "</div></div>";
				
			}
		
		}
		
		simile_buttons($preview);
		
		echo "</div>";
		
	?></div>
	</form>
</div>
</body>
</html>
<?

}
