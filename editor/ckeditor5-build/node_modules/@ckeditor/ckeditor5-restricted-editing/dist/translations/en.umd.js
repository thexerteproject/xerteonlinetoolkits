/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en' ]: { dictionary, getPluralForm } } = {"en":{"dictionary":{"Enable editing":"Enable editing","Previous editable region":"Previous editable region","Next editable region":"Next editable region","Navigate editable regions":"Navigate editable regions","Disable inline editing":"Disable inline editing","Enable inline editing":"Enable inline editing","Disable block editing":"Disable block editing","Enable block editing":"Enable block editing","Disable editing":"Disable editing"},getPluralForm(n){return (n != 1);}}};
e[ 'en' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en' ].dictionary = Object.assign( e[ 'en' ].dictionary, dictionary );
e[ 'en' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
