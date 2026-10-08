/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'th' ]: { dictionary, getPluralForm } } = {"th":{"dictionary":{"Yellow marker":"มาร์กเกอร์สีเหลือง","Green marker":"มาร์กเกอร์สีเขียว","Pink marker":"มาร์กเกอร์สีชมพู","Blue marker":"มาร์กเกอร์สีน้ำเงิน","Red pen":"ปากกาสีแดง","Green pen":"ปากกาสีเขียว","Remove highlight":"ลบไฮไลต์ออก","Highlight":"ไฮไลต์","Text highlight toolbar":"แถบเครื่องมือไฮไลต์ข้อความ"},getPluralForm(n){return 0;}}};
e[ 'th' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'th' ].dictionary = Object.assign( e[ 'th' ].dictionary, dictionary );
e[ 'th' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
