<?PHP /**
	 * 
	 * Function url return
	 * This function is used to format strings depending on whether a HTACCESS File is being used
	 * @author Patrick Lockley
	 * @version 1.0
	 * @params number $string - the action we need the new url for play, edit, preview etc
 	 * @params number $template_number - the template number we are providing the link for.
 	 * @return string - the URL
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */

	function url_return($string,$template_number){

		global $xerte_toolkits_site;

		switch($string){

			case "play":	if($xerte_toolkits_site->apache=="true"){

						return $string . "_" . $template_number;

					}else{

						return "play.php?template_id=" . $template_number;

					}
					break;

			case "preview":if($xerte_toolkits_site->apache=="true"){

						return $string . "_" . $template_number;

					}else{

						return "preview.php?template_id=" . $template_number;

					}
					break;

			case "edit":	if($xerte_toolkits_site->apache=="true"){

						return $string . "_" . $template_number;

					}else{

						return "edit.php?template_id=" . $template_number;

					}
					break;

			case "properties":	if($xerte_toolkits_site->apache=="true"){

							return $string . "_" . $template_number;

						}else{

							return "properties.php?template_id=" . $template_number;

						}
						break;

			case "folderproperties":	if($xerte_toolkits_site->apache=="true"){

								return $string . "_" . $template_number;

							}else{

								return "edit.php?template_id=" . $template_number;

							}
							break;

			case "export":	if($xerte_toolkits_site->apache=="true"){

							return $string . "_" . $template_number;

						}else{

							return $xerte_toolkits_site->php_library_path . "scorm/export.php?scorm=false&template_id=" . $template_number;

						}
						break;

			case "scorm":	if($xerte_toolkits_site->apache=="true"){

						return $string . "_" . $template_number;

					}else{

						return $xerte_toolkits_site->php_library_path . "scorm/export.php?scorm=true&template_id=" . $template_number;

					}
					break;

			case "drawing":	if($xerte_toolkits_site->apache=="true"){

							return $string . "_" . $template_number;

						}else{

							return "drawing.php?template_id=" . $template_number;

						}
						break;

			case "peerreview":	if($xerte_toolkits_site->apache=="true"){

						return $string . "_" . $template_number;

					}else{

						return "peer.php?template_id=" . $template_number;

					}
					break;

			case "xml":	if($xerte_toolkits_site->apache=="true"){

						return $string . "_" . $template_number;

					}else{

						return "data.php?template_id=" . $template_number;

					}
					break;

			case "RSS":	if($xerte_toolkits_site->apache=="true"){

						return "RSS/";

					}else{

						return "rss.php";

					}
					break;

			case "RSS_user":	

						if($xerte_toolkits_site->apache=="true"){

							return "RSS/" . $template_number . "/";

						}else{

							return "rss.php?username=" . $template_number;


						}
						break;

			case "RSS_user_folder":	if($xerte_toolkits_site->apache=="true"){

								return "RSS/" . $template_id . "/";

							}else{

								return "rss.php?username=" . $template_number;

							}

			case "RSS_export":		if($xerte_toolkits_site->apache=="true"){

								return "export/";

							}else{

								return "export.php";

							}
							break;

			case "RSS_syndicate":	if($xerte_toolkits_site->apache=="true"){

								return "syndication/";

							}else{

								return "syndicate.php";

							}
							break;

			default : break;


		}	

	}

?>