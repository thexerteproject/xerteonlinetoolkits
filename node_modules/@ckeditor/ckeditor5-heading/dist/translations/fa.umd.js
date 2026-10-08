/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fa' ]: { dictionary, getPluralForm } } = {"fa":{"dictionary":{"Heading":"عنوان","Choose heading":"انتخاب عنوان","Heading 1":"عنوان 1","Heading 2":"عنوان 2","Heading 3":"عنوان 3","Heading 4":"عنوان 4","Heading 5":"عنوان 5","Heading 6":"عنوان 6","Type your title":"عنوان خود را تایپ کنید","Type or paste your content here.":"محتوای خود را در اینجا تایپ یا پیست کنید."},getPluralForm(n){return 0;}}};
e[ 'fa' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fa' ].dictionary = Object.assign( e[ 'fa' ].dictionary, dictionary );
e[ 'fa' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
