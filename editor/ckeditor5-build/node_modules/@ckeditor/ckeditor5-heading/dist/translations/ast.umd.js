/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ast' ]: { dictionary, getPluralForm } } = {"ast":{"dictionary":{"Heading":"","Choose heading":"","Heading 1":"","Heading 2":"","Heading 3":"","Heading 4":"","Heading 5":"","Heading 6":"","Type your title":"","Type or paste your content here.":""},getPluralForm(n){return (n != 1);}}};
e[ 'ast' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ast' ].dictionary = Object.assign( e[ 'ast' ].dictionary, dictionary );
e[ 'ast' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
