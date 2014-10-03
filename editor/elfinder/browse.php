<?php
/**
 * Created by PhpStorm.
 * User: tom
 * Date: 1-10-2014
 * Time: 10:05
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
                url : 'php/connector.php',       // connector URL (REQUIRED)
                lang: '<?php echo $lang;?>',     // language (OPTIONAL)
                uiOptions : {
                    // toolbar configuration
                    toolbar : [
                        // ['back', 'forward'],
                        ['reload'],
                        // ['home', 'up'],
                        ['home'],
                        //['mkdir', 'mkfile', 'upload'],
                        ['mkdir', 'upload'],
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
                    cwd    : ['reload', '|', 'upload', 'mkdir', 'paste', '|', 'info'],

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
