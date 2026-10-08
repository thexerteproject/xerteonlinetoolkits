/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hu' ]: { dictionary, getPluralForm } } = {"hu":{"dictionary":{"Bold":"Félkövér","Italic":"Dőlt","Underline":"Aláhúzott","Code":"Forráskód","Strikethrough":"Áthúzott","Subscript":"Alsó index","Superscript":"Felső index","Italic text":"Dőlt szöveg","Move out of an inline code style":"Kilépés egy soron belüli kódstílusból","Bold text":"Félkövér szöveg","Underline text":"Aláhúzott szöveg","Strikethrough text":"Áthúzott szöveg"},getPluralForm(n){return (n != 1);}}};
e[ 'hu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hu' ].dictionary = Object.assign( e[ 'hu' ].dictionary, dictionary );
e[ 'hu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
