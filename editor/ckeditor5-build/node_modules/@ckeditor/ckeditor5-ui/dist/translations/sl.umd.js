/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sl' ]: { dictionary, getPluralForm } } = {"sl":{"dictionary":{"Rich Text Editor":"","Edit block":"","Click to edit block":"","Drag to move":"","Next":"","Previous":"","Editor toolbar":"","Dropdown toolbar":"","Dropdown menu":"","Black":"Črna","Dim grey":"Temno siva","Grey":"Siva","Light grey":"Svetlo siva","White":"Bela","Red":"Rdeča","Orange":"Oranžna","Yellow":"Rumena","Light green":"Svetlo zelena","Green":"Zelena","Aquamarine":"Akvamarin","Turquoise":"Turkizna","Light blue":"Svetlo modra","Blue":"Modra","Purple":"Vijolična","Editor block content toolbar":"","Editor contextual toolbar":"","HEX":"","No results found":"","No searchable items":"","Editor dialog":"","Close":"","Help Contents. To close this dialog press ESC.":"","Below, you can find a list of keyboard shortcuts that can be used in the editor.":"","(may require <kbd>Fn</kbd>)":"","Accessibility":"","Accessibility help":"","Press %0 for help.":"","Move focus in and out of an active dialog window":"","MENU_BAR_MENU_FILE":"","MENU_BAR_MENU_EDIT":"","MENU_BAR_MENU_VIEW":"","MENU_BAR_MENU_INSERT":"","MENU_BAR_MENU_FORMAT":"","MENU_BAR_MENU_TOOLS":"","MENU_BAR_MENU_HELP":"","MENU_BAR_MENU_TEXT":"","MENU_BAR_MENU_FONT":"","Editor menu bar":"","Please enter a valid color (e.g. \"ff0000\").":""},getPluralForm(n){return (n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0);}}};
e[ 'sl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sl' ].dictionary = Object.assign( e[ 'sl' ].dictionary, dictionary );
e[ 'sl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
