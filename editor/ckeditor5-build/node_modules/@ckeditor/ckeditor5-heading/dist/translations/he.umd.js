/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'he' ]: { dictionary, getPluralForm } } = {"he":{"dictionary":{"Heading":"כותרת","Choose heading":"בחר סוג כותרת","Heading 1":"כותרת 1","Heading 2":"כותרת 2","Heading 3":"כותרת 3","Heading 4":"כותרת 4","Heading 5":"כותרת 5","Heading 6":"כותרת 6","Type your title":"הזן כותרת","Type or paste your content here.":"הזן או הדבק את התוכן כאן"},getPluralForm(n){return (n != 1);}}};
e[ 'he' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'he' ].dictionary = Object.assign( e[ 'he' ].dictionary, dictionary );
e[ 'he' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
