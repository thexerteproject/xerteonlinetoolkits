<?php if( !isset($xot_setup) ) { die( 'Access denied.'); } ?>
    <h2>Software Installed</h2>

    <p>Xerte Online Toolkits appears to be installed.</p>
    <p>To go to your installation visit: <a href="<?php echo $xot_setup->xot_url; ?>" title="<?php echo $xot_setup->xot_url; ?>"><?php echo $xot_setup->xot_url; ?></a>.</p>

    <h3>To reinstall:</h3>

    <ul>
        <li>Delete 'database.php' from <code><?php echo $xot_setup->root_path; ?></code></li>
    </ul>