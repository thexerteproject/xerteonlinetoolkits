/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'kn' ]: { dictionary, getPluralForm } } = {"kn":{"dictionary":{"Align left":"","Align right":"","Align center":"","Justify":"","Text alignment":"","Text alignment toolbar":""},getPluralForm(n){return (n != 1);}}};
e[ 'kn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'kn' ].dictionary = Object.assign( e[ 'kn' ].dictionary, dictionary );
e[ 'kn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
