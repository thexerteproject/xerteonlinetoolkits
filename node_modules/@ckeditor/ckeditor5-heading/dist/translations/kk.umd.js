/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'kk' ]: { dictionary, getPluralForm } } = {"kk":{"dictionary":{"Heading":"","Choose heading":"","Heading 1":"","Heading 2":"","Heading 3":"","Heading 4":"","Heading 5":"","Heading 6":"","Type your title":"","Type or paste your content here.":""},getPluralForm(n){return (n != 1);}}};
e[ 'kk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'kk' ].dictionary = Object.assign( e[ 'kk' ].dictionary, dictionary );
e[ 'kk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
