/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'si' ]: { dictionary, getPluralForm } } = {"si":{"dictionary":{"Insert HTML":"","HTML snippet":"","Paste raw HTML here...":"","Edit source":"","Save changes":"","No preview available":"","Empty snippet content":""},getPluralForm(n){return (n != 1);}}};
e[ 'si' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'si' ].dictionary = Object.assign( e[ 'si' ].dictionary, dictionary );
e[ 'si' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
