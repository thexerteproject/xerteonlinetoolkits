/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'et' ]: { dictionary, getPluralForm } } = {"et":{"dictionary":{"Bold":"Rasvane","Italic":"Kaldkiri","Underline":"Allajoonitud","Code":"Kood","Strikethrough":"Läbijoonitud","Subscript":"Alaindeks","Superscript":"Ülaindeks","Italic text":"Kaldkirjas tekst","Move out of an inline code style":"Välju reasisese koodi stiilist","Bold text":"Paks tekst","Underline text":"Allakriipsutatud tekst","Strikethrough text":"Läbikriipsutatud tekst"},getPluralForm(n){return (n != 1);}}};
e[ 'et' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'et' ].dictionary = Object.assign( e[ 'et' ].dictionary, dictionary );
e[ 'et' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
