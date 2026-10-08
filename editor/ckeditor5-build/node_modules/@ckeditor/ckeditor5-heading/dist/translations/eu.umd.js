/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'eu' ]: { dictionary, getPluralForm } } = {"eu":{"dictionary":{"Heading":"Izenburua","Choose heading":"Aukeratu izenburua","Heading 1":"Izenburua 1","Heading 2":"Izenburua 2","Heading 3":"Izenburua 3","Heading 4":"","Heading 5":"","Heading 6":"","Type your title":"","Type or paste your content here.":""},getPluralForm(n){return (n != 1);}}};
e[ 'eu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'eu' ].dictionary = Object.assign( e[ 'eu' ].dictionary, dictionary );
e[ 'eu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
