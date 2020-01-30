/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
    // Define changes to default configuration here.
    // For the complete reference:
    // http://docs.ckeditor.com/#!/api/CKEDITOR.config

    // The toolbar groups arrangement, optimized for a single toolbar row.
    config.toolbarGroups = [
        { name: 'document',	   groups: [ 'mode' ] },
        { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
        { name: 'editing',     groups: [ 'spellchecker' ] },
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'links' },
        { name: 'styles' },
        { name: 'colors' },
        { name: 'tools' },
        { name: 'insert' },
        { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
        { name: 'others' }
    ];

    config.extraPlugins = 'dialog,widget,extmathjax,image3,codemirror,oembed,xotlink,xotmarkword,fontawesome,uploadimage,html5audio,rubytext,wrapstyle,link,emoji';
    // The default plugins included in the basic setup define some buttons that
    // we don't want too have in a basic editor. We remove them here.
    config.removeButtons = 'Cut,Copy,Paste,Save,NewPage,Preview,Print,PageBreak,CreateDiv,Anchor,Smiley';
    
    config.format_tags = 'p;h3;h4;h5;h6;pre;address;div';

    // Let's have it basic on dialogs as well.
    config.removeDialogTabs = 'link:advanced';
    config.toolbarCanCollapse = true;
    config.allowedContent = true;
    config.extraAllowedContent = 'p(*)[*]{*};div(*)[*]{*};li(*)[*]{*};ul(*)[*]{*}';

    config.uploadUrl = '',

    config.contentsCss = ['modules/xerte/parent_templates/Nottingham/common_html5/css/smoothness/jquery-ui-1.8.18.custom.css',
        'modules/xerte/parent_templates/Nottingham/common_html5/css/themeStyles.css',
        'modules/xerte/parent_templates/Nottingham/common_html5/css/editorStyles.css',
        'modules/xerte/parent_templates/Nottingham/common_html5/css/mainStyles.css',
        'modules/xerte/parent_templates/Nottingham/common_html5/font-awesome/css/font-awesome.min.css',
        'modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css',
		'modules/xerte/parent_templates/Nottingham/common_html5/css/fonts.css'
    ];
	
	// custom fonts can be added here that have been included in fonts.css:
	//config.font_names = 'fontnametodisplay/yourfontname;' + config.font_names;

    if (typeof lo_data['treeroot']["attributes"]["theme"] != 'undefined' && lo_data['treeroot']["attributes"]["theme"] != 'default')
    {
        var themecss;
        var xerteeditorcss = "editor/js/vendor/ckeditor/xerteeditor.css";

        if (templateframework == 'xerte') {
            themecss = 'themes/' + lo_data['treeroot']["attributes"]["targetFolder"] + '/' + lo_data['treeroot']["attributes"]["theme"] + '/' + lo_data['treeroot']["attributes"]["theme"] + '.css';
        }
        else
        {
            themecss = 'themes/' + templateframework + '/' + lo_data['treeroot']["attributes"]["theme"] + '/' + lo_data['treeroot']["attributes"]["theme"] + '.css';
        }
        config.contentsCss.push(themecss);
        config.contentsCss.push(xerteeditorcss);

    }
};
CKEDITOR.dtd.$removeEmpty.i = 0;
CKEDITOR.dtd.$removeEmpty.span = 0;
