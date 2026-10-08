/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hi' ]: { dictionary, getPluralForm } } = {"hi":{"dictionary":{"Font Size":"Font Size","Tiny":"Tiny","Small":"Small","Big":"Big","Huge":"Huge","Font Family":"Font Family","Default":"Default","Font Color":"Font Color","Font Background Color":"Font Background Color","Document colors":"Document colors"},getPluralForm(n){return (n != 1);}}};
e[ 'hi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hi' ].dictionary = Object.assign( e[ 'hi' ].dictionary, dictionary );
e[ 'hi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
