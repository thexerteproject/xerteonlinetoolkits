/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tt' ]: { dictionary, getPluralForm } } = {"tt":{"dictionary":{"Enable editing":"","Previous editable region":"","Next editable region":"","Navigate editable regions":"","Disable inline editing":"","Enable inline editing":"","Disable block editing":"","Enable block editing":"","Disable editing":""},getPluralForm(n){return 0;}}};
e[ 'tt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tt' ].dictionary = Object.assign( e[ 'tt' ].dictionary, dictionary );
e[ 'tt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
