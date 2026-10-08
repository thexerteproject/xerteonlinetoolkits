/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'km' ]: { dictionary, getPluralForm } } = {"km":{"dictionary":{"Heading":"ក្បាលអត្ថបទ","Choose heading":"ជ្រើសរើស​ក្បាលអត្ថបទ","Heading 1":"ក្បាលអត្ថបទ 1","Heading 2":"ក្បាលអត្ថបទ 2","Heading 3":"ក្បាលអត្ថបទ 3","Heading 4":"","Heading 5":"","Heading 6":"","Type your title":"","Type or paste your content here.":""},getPluralForm(n){return 0;}}};
e[ 'km' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'km' ].dictionary = Object.assign( e[ 'km' ].dictionary, dictionary );
e[ 'km' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
