/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'az' ]: { dictionary, getPluralForm } } = {"az":{"dictionary":{"Insert a soft break (a <code>&lt;br&gt;</code> element)":"","Insert a hard break (a new paragraph)":""},getPluralForm(n){return (n != 1);}}};
e[ 'az' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'az' ].dictionary = Object.assign( e[ 'az' ].dictionary, dictionary );
e[ 'az' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
