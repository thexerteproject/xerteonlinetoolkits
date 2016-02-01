/**
 * Created by tom on 22-11-2014.
 */


'use strict';


CKEDITOR.plugins.add('xotmarkword', {
    //lang: 'en,en-gb,nl,', // %REMOVE_LINE_CORE%
    requires: 'menu,contextmenu',
    //icons: 'extmathjax',
    //hidpi: true,

    init: function (editor) {
        editor.addCommand( 'xotMarkWord', {
            exec: function( editor ) {
                var selection = editor.getSelection().getNative(),
					mainDelimiter = $("#opt_mainDelimiter").length != 0 ? $("#opt_mainDelimiter").find(".wizardvalue input")[0].value : "|";
                editor.insertText(mainDelimiter + selection + mainDelimiter);
                //alert("Word Marked");
            }
        });
        if ( editor.contextMenu ) {
            editor.addMenuGroup( 'xotGroup' );
            editor.addMenuItem( 'xotMarkItem', {
                label: 'Mark Word',
                //icon: this.path + 'icons/extmathjax.png',
                command: 'xotMarkWord',
                group: 'xotGroup'
            });
        }
        editor.contextMenu.addListener( function( element ) {
            var selection = editor.getSelection();
            //alert( selection.getType() );
            if (selection.getSelectedText() != "")
                return { xotMarkItem: CKEDITOR.TRISTATE_OFF };
            });
    }
});




