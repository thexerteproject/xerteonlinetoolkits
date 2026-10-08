/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lt' ]: { dictionary, getPluralForm } } = {"lt":{"dictionary":{"Bold":"Paryškintas","Italic":"Kursyvas","Underline":"Pabrauktas","Code":"Kodas","Strikethrough":"Perbrauktas","Subscript":"Žemiau","Superscript":"Aukščiau","Italic text":"Rašyti tekstą kursyvu","Move out of an inline code style":"Perėjimas iš įterptojo kodo stiliaus","Bold text":"Pajuodinti tekstą","Underline text":"Pabraukti tekstą","Strikethrough text":"Perbraukti tekstą"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'lt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lt' ].dictionary = Object.assign( e[ 'lt' ].dictionary, dictionary );
e[ 'lt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
