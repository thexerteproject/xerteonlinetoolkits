/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en' ]: { dictionary, getPluralForm } } = {"en":{"dictionary":{"Insert HTML":"Insert HTML","HTML snippet":"HTML snippet","Paste raw HTML here...":"Paste raw HTML here...","Edit source":"Edit source","Save changes":"Save changes","No preview available":"No preview available","Empty snippet content":"Empty snippet content"},getPluralForm(n){return (n != 1);}}};
e[ 'en' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en' ].dictionary = Object.assign( e[ 'en' ].dictionary, dictionary );
e[ 'en' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
