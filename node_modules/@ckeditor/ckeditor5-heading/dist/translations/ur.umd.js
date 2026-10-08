/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ur' ]: { dictionary, getPluralForm } } = {"ur":{"dictionary":{"Heading":"سرخی","Choose heading":"سرخی منتخب کریں","Heading 1":"سرخی 1","Heading 2":"سرخی 2","Heading 3":"سرخی 3","Heading 4":"سرخی 4","Heading 5":"سرخی 5","Heading 6":"سرخی 6","Type your title":"عنوان ٹایپ کریں","Type or paste your content here.":"اپنا مواد یہاں ٹایپ یا چسپاں کریں."},getPluralForm(n){return (n != 1);}}};
e[ 'ur' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ur' ].dictionary = Object.assign( e[ 'ur' ].dictionary, dictionary );
e[ 'ur' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
