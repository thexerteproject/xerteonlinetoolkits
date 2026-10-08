/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pl' ]: { dictionary, getPluralForm } } = {"pl":{"dictionary":{"Widget toolbar":"Pasek widgetów","Insert paragraph before block":"Wstaw akapit przed blokiem","Insert paragraph after block":"Wstaw akapit po bloku","Press Enter to type after or press Shift + Enter to type before the widget":"Naciśnij Enter, aby pisać po widżecie, lub Shift + Enter, aby pisać przed widżetem","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Klawisze, których można używać po wybraniu widżetu (na przykład: obraz, tabela itd.)","Insert a new paragraph directly after a widget":"Wstawia nowy akapit bezpośrednio po widżecie","Insert a new paragraph directly before a widget":"Wstawia nowy akapit bezpośrednio przed widżetem","Move the caret to allow typing directly before a widget":"Przenosi kursor, aby umożliwić pisanie bezpośrednio przed widżetem","Move the caret to allow typing directly after a widget":"Przenosi kursor, aby umożliwić pisanie bezpośrednio za widżetem","Move focus from an editable area back to the parent widget":"Przenieś skupienie z edytowalnego obszaru z powrotem do widżetu nadrzędnego"},getPluralForm(n){return (n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'pl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pl' ].dictionary = Object.assign( e[ 'pl' ].dictionary, dictionary );
e[ 'pl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
