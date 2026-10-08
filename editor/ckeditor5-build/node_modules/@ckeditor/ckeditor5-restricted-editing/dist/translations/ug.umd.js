/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ug' ]: { dictionary, getPluralForm } } = {"ug":{"dictionary":{"Enable editing":"","Previous editable region":"","Next editable region":"","Navigate editable regions":"","Disable inline editing":"","Enable inline editing":"","Disable block editing":"","Enable block editing":"","Disable editing":""},getPluralForm(n){return 0;}}};
e[ 'ug' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ug' ].dictionary = Object.assign( e[ 'ug' ].dictionary, dictionary );
e[ 'ug' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
