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

function dont_show_template(){


    _load_language_file("/modules/xerte/module_functions.inc");

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

					if(is_array($data['events'][$x]['simile_event_zones_' . $x])){						
																	
						if(in_array($y, $data['events'][$x]['simile_event_zones_' . $x])){
			
						?>
					
						{
						 'start': '<?PHP echo $data['events'][$x]['simile_event_start_' . $x]; ?>',
						 'end': '<?PHP echo $data['events'][$x]['simile_event_end_' . $x]; ?>',
						 'durationEvent' : <?PHP if($data['events'][$x]['simile_event_durationevent_' . $x]=="on"){ echo "1"; }else{ echo "0"; } ?>,
						 'title': "<?PHP echo str_replace("\\","",$data['events'][$x]['simile_event_title_' . $x]); ?>",
						 'description': "<?PHP echo str_replace("\\","",(trim($data['events'][$x]['simile_event_description_' . $x]))); ?>",
						 'image': '<?PHP echo $data['events'][$x]['simile_event_image_' . $x]; ?>',
						 'link': '<?PHP echo $data['events'][$x]['simile_event_link_' . $x]; ?>'
						}
						
						<?PHP
						
							if($x!=(count($data['events'])-1)){
					
								echo ",";
					
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
				var d<?PHP echo $y; ?> = Timeline.DateTime.parseGregorianDateTime('<?PHP echo $data['zones'][$y]['simile_zone_start_' . $y]; ?>');	
			
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
									startDate:  "<?PHP echo $data['zone_labels'][$x]['simile_zone_label_startdate_' . $x]; ?>",
									endDate:    "<?PHP echo $data['zone_labels'][$x]['simile_zone_label_enddate_' . $x]; ?>",
									startLabel: "<?PHP echo $data['zone_labels'][$x]['simile_zone_label_startlabel_' . $x]; ?>",
									endLabel:   "<?PHP echo $data['zone_labels'][$x]['simile_zone_label_endlabel_' . $x]; ?>",
									color:      "<?PHP echo $data['zone_labels'][$x]['simile_zone_label_colour_' . $x]; ?>",
									opacity:    <?PHP echo $data['zone_labels'][$x]['simile_zone_label_opacity_' . $x]; ?>,
									theme:      theme1
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
			
			
				if($data['zones'][$y]['simile_zone_sync_' . $y]!="-1"&&$data['zones'][$y]['simile_zone_sync_' . $y]!=""){
				
			?>
			
				bandInfos[<?PHP echo $y; ?>].syncWith = <?PHP echo $data['zones'][$y]['simile_zone_sync_' . $y] ?>;
			
			<?PHP
			
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

?>
