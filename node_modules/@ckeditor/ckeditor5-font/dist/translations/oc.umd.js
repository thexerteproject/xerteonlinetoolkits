/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'oc' ]: { dictionary, getPluralForm } } = {"oc":{"dictionary":{"Font Size":"","Tiny":"","Small":"","Big":"","Huge":"","Font Family":"","Default":"","Font Color":"","Font Background Color":"","Document colors":""},getPluralForm(n){return (n > 1);}}};
e[ 'oc' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'oc' ].dictionary = Object.assign( e[ 'oc' ].dictionary, dictionary );
e[ 'oc' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
