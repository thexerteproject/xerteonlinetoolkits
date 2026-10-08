/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ku' ]: { dictionary, getPluralForm } } = {"ku":{"dictionary":{"Enable editing":"بەکارخستنی چاکسازی","Previous editable region":"ناوچەی چاکسازی پێشوو","Next editable region":"ناوچەی چاکسازی داهاتوو","Navigate editable regions":"چوون بۆ ناوچەی چاکسازی","Disable inline editing":"","Enable inline editing":"","Disable block editing":"","Enable block editing":"","Disable editing":""},getPluralForm(n){return (n != 1);}}};
e[ 'ku' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ku' ].dictionary = Object.assign( e[ 'ku' ].dictionary, dictionary );
e[ 'ku' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
