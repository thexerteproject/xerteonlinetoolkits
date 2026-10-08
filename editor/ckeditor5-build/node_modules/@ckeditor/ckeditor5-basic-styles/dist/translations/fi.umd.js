/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fi' ]: { dictionary, getPluralForm } } = {"fi":{"dictionary":{"Bold":"Lihavointi","Italic":"Kursivointi","Underline":"Alleviivaus","Code":"Koodi","Strikethrough":"Yliviivaus","Subscript":"Alaindeksi","Superscript":"Yläindeksi","Italic text":"Kursivoitu teksti","Move out of an inline code style":"Siirry pois rivinsisäisestä koodista","Bold text":"Lihavoitu teksti","Underline text":"Alleviivattu teksti","Strikethrough text":"Yliviivattu teksti"},getPluralForm(n){return (n != 1);}}};
e[ 'fi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fi' ].dictionary = Object.assign( e[ 'fi' ].dictionary, dictionary );
e[ 'fi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
