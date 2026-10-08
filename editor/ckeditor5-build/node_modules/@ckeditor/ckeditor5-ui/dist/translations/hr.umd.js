/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hr' ]: { dictionary, getPluralForm } } = {"hr":{"dictionary":{"Rich Text Editor":"Rich Text Editor","Edit block":"Uredi blok","Click to edit block":"","Drag to move":"","Next":"Sljedeći","Previous":"Prethodni","Editor toolbar":"Traka uređivača","Dropdown toolbar":"Traka padajućeg izbornika","Dropdown menu":"","Black":"Crna","Dim grey":"Tamnosiva","Grey":"Siva","Light grey":"Svijetlosiva","White":"Bijela","Red":"Crvena","Orange":"Narančasta","Yellow":"Žuta","Light green":"Svijetlozelena","Green":"Zelena","Aquamarine":"Akvamarin","Turquoise":"Tirkizna","Light blue":"Svijetloplava","Blue":"Plava","Purple":"Ljubičasta","Editor block content toolbar":"Alatna traka sadržaja uređivača blokova","Editor contextual toolbar":"Kontekstualna alatna traka uređivača","HEX":"","No results found":"","No searchable items":"","Editor dialog":"","Close":"","Help Contents. To close this dialog press ESC.":"","Below, you can find a list of keyboard shortcuts that can be used in the editor.":"","(may require <kbd>Fn</kbd>)":"","Accessibility":"","Accessibility help":"","Press %0 for help.":"","Move focus in and out of an active dialog window":"","MENU_BAR_MENU_FILE":"","MENU_BAR_MENU_EDIT":"Promijeni","MENU_BAR_MENU_VIEW":"","MENU_BAR_MENU_INSERT":"Ubaci","MENU_BAR_MENU_FORMAT":"","MENU_BAR_MENU_TOOLS":"","MENU_BAR_MENU_HELP":"","MENU_BAR_MENU_TEXT":"Tekst","MENU_BAR_MENU_FONT":"","Editor menu bar":"","Please enter a valid color (e.g. \"ff0000\").":""},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'hr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hr' ].dictionary = Object.assign( e[ 'hr' ].dictionary, dictionary );
e[ 'hr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
