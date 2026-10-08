/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'vi' ]: { dictionary, getPluralForm } } = {"vi":{"dictionary":{"Copy selected content":"Sao chép nội dung đã chọn","Paste content":"Dán nội dung","Paste content as plain text":"Dán nội dung dưới dạng văn bản thuần túy"},getPluralForm(n){return 0;}}};
e[ 'vi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'vi' ].dictionary = Object.assign( e[ 'vi' ].dictionary, dictionary );
e[ 'vi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
