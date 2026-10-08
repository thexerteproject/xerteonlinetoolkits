/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'vi' ]: { dictionary, getPluralForm } } = {"vi":{"dictionary":{"Align left":"Canh trái","Align right":"Canh phải","Align center":"Canh giữa","Justify":"Canh đều","Text alignment":"Căn chỉnh văn bản","Text alignment toolbar":"Thanh công cụ canh chữ"},getPluralForm(n){return 0;}}};
e[ 'vi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'vi' ].dictionary = Object.assign( e[ 'vi' ].dictionary, dictionary );
e[ 'vi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
