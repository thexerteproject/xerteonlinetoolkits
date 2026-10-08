/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'gu' ]: { dictionary, getPluralForm } } = {"gu":{"dictionary":{"Font Size":"","Tiny":"","Small":"","Big":"","Huge":"","Font Family":"","Default":"","Font Color":"","Font Background Color":"","Document colors":""},getPluralForm(n){return (n != 1);}}};
e[ 'gu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'gu' ].dictionary = Object.assign( e[ 'gu' ].dictionary, dictionary );
e[ 'gu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
