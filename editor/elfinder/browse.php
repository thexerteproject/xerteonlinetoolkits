<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Created by Tom Reijnders
 */

$mode = 'standalone';
if (isset($_REQUEST['mode']) && $_REQUEST['mode']=='cke') {
    $mode = 'cke';
    $funcNum = $_REQUEST['CKEditorFuncNum'];
}

$lang = "en";
if (isset($_REQUEST['lang']))
{
    $lang = $_REQUEST['lang'];
}

if (isset($_REQUEST['langCode']))
{
    $lang = $_REQUEST['langCode'];
}


?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>XOT Media Browser</title>

		<!-- jQuery and jQuery UI (REQUIRED) -->
		<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/themes/smoothness/jquery-ui.css">
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js"></script>

		<!-- elFinder CSS (REQUIRED) -->
		<link rel="stylesheet" type="text/css" href="css/elfinder.min.css">
		<link rel="stylesheet" type="text/css" href="css/theme.css">

		<!-- elFinder JS (REQUIRED) -->
		<script src="js/elfinder.min.js"></script>

		<!-- elFinder translation (OPTIONAL) -->
        <?php
        if (file_exists('js/i18n/elfinder.' . $lang . '.js'))
        {
            echo "<script src=\"js/i18n/elfinder." . $lang . ".js\"></script>";
        }
        ?>

		<!-- elFinder initialization (REQUIRED) -->
		<script type="text/javascript" charset="utf-8">


        // Documentation for client options:
        // https://github.com/Studio-42/elFinder/wiki/Client-configuration-options
        $(document).ready(function() {
            <?php
            if ($mode == 'cke')
            {
                echo "var funcNum = $funcNum;";
            }
            ?>

            $('#elfinder').elfinder({
                url : 'php/connector.php?uploadDir=<?php echo $_REQUEST['uploadDir'];?>&uploadURL=<?php echo $_REQUEST['uploadURL'];?>',       // connector URL (REQUIRED)
                lang: '<?php echo $lang;?>',     // language (OPTIONAL)
                uiOptions : {
                    // toolbar configuration
                    toolbar : [
                        // ['back', 'forward'],
                        ['reload'],
                        // ['home', 'up'],
                        ['home'],
                        //['mkdir', 'mkfile', 'upload'],
                        ['upload'],
                        //['open', 'download', 'getfile'],
                        ['download', 'getfile'],
                        ['info'],
                        ['quicklook'],
                        ['copy', 'cut', 'paste'],
                        ['rm'],
                        ['duplicate', 'rename', 'edit', 'resize'],
                        //['extract', 'archive'],
                        ['search'],
                        ['view'],
                        ['help']
                    ],

                    // directories tree options
                    tree : {
                        // expand current root on init
                        openRootOnLoad : true,
                        // auto load current dir parents
                        syncTree : true
                    },

                    // navbar options
                    navbar : {
                        minWidth : 150,
                        maxWidth : 500
                    },

                    // current working directory options
                    cwd : {
                        // display parent directory in listing as ".."
                        oldSchool : false
                    }
                },
                contextmenu : {
                    // navbarfolder menu
                    navbar : ['open', '|', 'copy', 'cut', 'paste', 'duplicate', '|', 'rm', '|', 'info'],

                    // current directory menu
                    //cwd    : ['reload', 'back', '|', 'upload', 'mkdir', 'mkfile', 'paste', '|', 'info'],
                    cwd    : ['reload', '|', 'upload', 'paste', '|', 'info'],

                    // current directory file menu
                    //files  : [
                    //    'getfile', '|','open', 'quicklook', '|', 'download', '|', 'copy', 'cut', 'paste', 'duplicate', '|',
                    //    'rm', '|', 'edit', 'rename', 'resize', '|', 'archive', 'extract', '|', 'info'
                    //]
                    files  : [
                        'getfile', '|','quicklook', '|', 'download', '|', 'copy', 'cut', 'paste', 'duplicate', '|',
                        'rm', '|', 'edit', 'rename', 'resize', '|', 'info'
                    ]
                },
                resizable: false,
                height: $(window).height() - 20,
                handlers : {
                    dblclick : function(event, elfinderInstance) {
                        event.preventDefault();
                        elfinderInstance.exec('getfile')
                            .done(function() { elfinderInstance.exec('select'); })
                            .fail(function() { elfinderInstance.exec('open'); });
                    }
                },
                <?php
                if ($mode=='cke')
                {
                ?>
                    getFileCallback : function(file) {
                        window.opener.CKEDITOR.tools.callFunction(funcNum, file.url);
                        window.close();
                    }
                <?php
                }
                else{
                ?>

                    getFileCallback: function (file) {
                        window.opener.elFinder.callBack(file);
                        window.close();
                    }
                <?php
                }
                if (isset($_REQUEST['type']))
                {
                    switch($_REQUEST['type'])
                    {
                        case 'image':
                            ?>
                                ,onlyMimes: ["image"] // display all images
                            <?php
                            break;
                        case 'flash':
                            ?>
                                ,onlyMimes: ["application/x-shockwave-flash"]  // Flash
                            <?php
                            break;

                        default:
                            break;
                    }
                }
                ?>


            });

            $(window).resize(function(){
                var h = ($(window).height() -20);
                if($('#elfinder').height() != h){
                    $('#elfinder').height(h).resize();
                }
            });
        });


		</script>
	</head>
	<body>

		<!-- Element where elFinder will be created (REQUIRED) -->
		<div id="elfinder"></div>

	</body>
</html>
