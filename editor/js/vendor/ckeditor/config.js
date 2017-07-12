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
        //{ name: 'forms' },
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'links' },
        { name: 'styles' },
        { name: 'colors' },
        { name: 'tools' },
        { name: 'insert' },
        { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
        { name: 'others' }
    ];


    config.extraPlugins = 'dialog,widget,extmathjax,image3,codemirror,oembed,xotlink,xotmarkword,fontawesome,uploadimage';
    // The default plugins included in the basic setup define some buttons that
    // we don't want too have in a basic editor. We remove them here.
    //config.removeButtons = 'Cut,Copy,Paste,Undo,Redo,Anchor,Underline,Strike,Subscript,Superscript';
    config.removeButtons = 'Cut,Copy,Paste,Save,NewPage,Preview,Print,PageBreak,CreateDiv,Anchor';
    
    config.format_tags = 'p;h3;h4;h5;h6;pre;address;div';

    // Let's have it basic on dialogs as well.
    config.removeDialogTabs = 'link:advanced';
    config.toolbarCanCollapse = true;
    config.allowedContent = true;
    config.extraAllowedContent = 'p(*)[*]{*};div(*)[*]{*};li(*)[*]{*};ul(*)[*]{*}';
    //config.contentsCss = ['editor/js/vendor/ckeditor/contents.css',
    //    'modules/xerte/parent_templates/Nottingham/common_html5/css/smoothness/jquery-ui-1.8.18.custom.css',
    //    'modules/xerte/parent_templates/Nottingham/common_html5/css/themeStyles.css',
    //    'modules/xerte/parent_templates/Nottingham/common_html5/css/mainStyles.css',
    //    'modules/xerte/parent_templates/Nottingham/common_html5/font-awesome/css/font-awesome.min.css',
    //    'modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css'

    config.uploadUrl = '',

    config.contentsCss = ['modules/xerte/parent_templates/Nottingham/common_html5/css/smoothness/jquery-ui-1.8.18.custom.css',
        'modules/xerte/parent_templates/Nottingham/common_html5/css/themeStyles.css',
        'modules/xerte/parent_templates/Nottingham/common_html5/css/mainStyles.css',
        'modules/xerte/parent_templates/Nottingham/common_html5/font-awesome/css/font-awesome.min.css',
        'modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css'
    ];
};
CKEDITOR.dtd.$removeEmpty.i = 0;
CKEDITOR.dtd.$removeEmpty.span = 0;
