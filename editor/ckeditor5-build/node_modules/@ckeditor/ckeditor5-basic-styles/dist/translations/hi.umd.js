/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hi' ]: { dictionary, getPluralForm } } = {"hi":{"dictionary":{"Bold":"Bold","Italic":"Italic","Underline":"Underline","Code":"Code","Strikethrough":"Strikethrough","Subscript":"Subscript","Superscript":"Superscript","Italic text":"इटैलिक टेक्स्ट","Move out of an inline code style":"इनलाइन कोड स्टाइल के बाहर जाएँ","Bold text":"टेक्स्ट को बोल्ड करें","Underline text":"टेक्स्ट को अंडरलाइन करें","Strikethrough text":"टेक्स्ट को स्ट्राइकथ्रू करें"},getPluralForm(n){return (n != 1);}}};
e[ 'hi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hi' ].dictionary = Object.assign( e[ 'hi' ].dictionary, dictionary );
e[ 'hi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
