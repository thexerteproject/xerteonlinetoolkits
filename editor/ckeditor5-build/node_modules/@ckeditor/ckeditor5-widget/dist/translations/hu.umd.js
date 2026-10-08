/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hu' ]: { dictionary, getPluralForm } } = {"hu":{"dictionary":{"Widget toolbar":"Widget eszköztár","Insert paragraph before block":"Bekezdés beszúrása elé","Insert paragraph after block":"Bekezdés beszúrása utána","Press Enter to type after or press Shift + Enter to type before the widget":"Az Enter billentyű megnyomásával a widget után, a Shift + Enter kombinációval pedig a widget előtt írhatja be a szöveget","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Billentyűleütések, amelyek egy widget kiválasztásakor (például: kép, táblázat, stb.) használhatók","Insert a new paragraph directly after a widget":"Egy új bekezdés beszúrása közvetlenül a widget mögé","Insert a new paragraph directly before a widget":"Egy új bekezdés beszúrása közvetlenül a widget elé","Move the caret to allow typing directly before a widget":"Mozgasd a kurzort, hogy hogy közvetlenül a widget elé tudj gépelni","Move the caret to allow typing directly after a widget":"Mozgasd a kurzort, hogy közvetlenül a widget után tudj gépelni","Move focus from an editable area back to the parent widget":"Helyezze vissza a fókuszt egy szerkeszthető területről a szülő widgetre."},getPluralForm(n){return (n != 1);}}};
e[ 'hu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hu' ].dictionary = Object.assign( e[ 'hu' ].dictionary, dictionary );
e[ 'hu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
