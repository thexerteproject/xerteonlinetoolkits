/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hu' ]: { dictionary, getPluralForm } } = {"hu":{"dictionary":{"Insert HTML":"HTML beillesztése","HTML snippet":"HTML kódrészlet","Paste raw HTML here...":"Másolja ide a HTML forrás szövegét...","Edit source":"Forrás szerkesztése","Save changes":"Módosítások mentése","No preview available":"Nincs elérhető előnézet","Empty snippet content":"Üres kódrészleti tartalom"},getPluralForm(n){return (n != 1);}}};
e[ 'hu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hu' ].dictionary = Object.assign( e[ 'hu' ].dictionary, dictionary );
e[ 'hu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
