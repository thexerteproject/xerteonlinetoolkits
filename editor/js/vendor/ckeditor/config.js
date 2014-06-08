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
        { name: 'styles' },
        { name: 'links' },
        { name: 'colors' },
        { name: 'tools' },
        { name: 'insert' },
        { name: 'paragraph',   groups: [ 'list', 'indent', /* 'blocks', */ 'align', 'bidi' ] },
        { name: 'others' }
    ];

    config.extraPlugins = 'dialog,widget,extmathjax,image2,codemirror,oembed';
    // The default plugins included in the basic setup define some buttons that
    // we don't want too have in a basic editor. We remove them here.
    //config.removeButtons = 'Cut,Copy,Paste,Undo,Redo,Anchor,Underline,Strike,Subscript,Superscript';
    config.removeButtons = 'Cut,Copy,Paste,Save,NewPage,Preview,Print,Anchor';

    // Let's have it basic on dialogs as well.
    config.removeDialogTabs = 'link:advanced';
    config.toolbarCanCollapse = true;
};
