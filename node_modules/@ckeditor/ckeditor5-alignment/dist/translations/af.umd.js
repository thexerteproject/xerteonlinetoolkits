/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'af' ]: { dictionary, getPluralForm } } = {"af":{"dictionary":{"Align left":"Belyn links","Align right":"Belyn regs","Align center":"Belyn in die middel","Justify":"Belyn beide kante","Text alignment":"Teksbelyning","Text alignment toolbar":"Teksbelyning nutsbank"},getPluralForm(n){return (n != 1);}}};
e[ 'af' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'af' ].dictionary = Object.assign( e[ 'af' ].dictionary, dictionary );
e[ 'af' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
