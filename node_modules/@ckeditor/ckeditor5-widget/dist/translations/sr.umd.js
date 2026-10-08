/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sr' ]: { dictionary, getPluralForm } } = {"sr":{"dictionary":{"Widget toolbar":"Widget traka sa alatkama","Insert paragraph before block":"Umetnite odlomak pre bloka","Insert paragraph after block":"Umetnite odlomak posle bloka","Press Enter to type after or press Shift + Enter to type before the widget":"Притисните Ентер да куцате после или притисните Схифт + Ентер да куцате пре виџета","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Tasteri koji se mogu koristiti kada je vidžet izabran (na primer: slika, tabela, itd.)","Insert a new paragraph directly after a widget":"Umetni novi pasus direktno posle vidžeta","Insert a new paragraph directly before a widget":"Umetni novi pasus direktno pre vidžeta","Move the caret to allow typing directly before a widget":"Pomeri kursor kako bi se omogućilo kucanje direktno pre vidžeta","Move the caret to allow typing directly after a widget":"Pomeri kursor kako bi se omogućilo kucanje direktno posle vidžeta","Move focus from an editable area back to the parent widget":"Vratite fokus sa oblasti koja se može uređivati na matični vidžet"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'sr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sr' ].dictionary = Object.assign( e[ 'sr' ].dictionary, dictionary );
e[ 'sr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
