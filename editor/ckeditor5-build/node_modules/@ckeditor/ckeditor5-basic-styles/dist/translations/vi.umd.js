/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'vi' ]: { dictionary, getPluralForm } } = {"vi":{"dictionary":{"Bold":"Đậm","Italic":"Nghiêng","Underline":"Gạch dưới","Code":"Code","Strikethrough":"Gạch ngang","Subscript":"Chữ nhỏ dưới","Superscript":"Chữ nhỏ trên","Italic text":"In nghiêng chữ","Move out of an inline code style":"Thoát khỏi kiểu mã nội dòng","Bold text":"In đậm chữ","Underline text":"Gạch chân chữ","Strikethrough text":"Gạch ngang chữ"},getPluralForm(n){return 0;}}};
e[ 'vi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'vi' ].dictionary = Object.assign( e[ 'vi' ].dictionary, dictionary );
e[ 'vi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
