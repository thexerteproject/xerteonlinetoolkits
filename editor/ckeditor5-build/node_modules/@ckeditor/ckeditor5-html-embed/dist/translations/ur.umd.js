/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ur' ]: { dictionary, getPluralForm } } = {"ur":{"dictionary":{"Insert HTML":"ایچ ٹی ایم ایل نصب کریں","HTML snippet":"ایچ ٹی ایم ایل تراشہ","Paste raw HTML here...":"خام ایچ ٹی ایم ایل یہاں چسپاں کریں۔۔۔","Edit source":"ماخذ کی تدوین","Save changes":"تبدیلیاں محفوظ کریں","No preview available":"نمائش دستیاب نہیں","Empty snippet content":"مندرجاتِ تراشہ خالی ہیں"},getPluralForm(n){return (n != 1);}}};
e[ 'ur' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ur' ].dictionary = Object.assign( e[ 'ur' ].dictionary, dictionary );
e[ 'ur' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
