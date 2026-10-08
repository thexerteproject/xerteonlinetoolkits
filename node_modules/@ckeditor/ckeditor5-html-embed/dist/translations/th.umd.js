/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'th' ]: { dictionary, getPluralForm } } = {"th":{"dictionary":{"Insert HTML":"แทรก HTML","HTML snippet":"ส่วนย่อยของ HTML","Paste raw HTML here...":"วาง HTML ดิบที่นี่...","Edit source":"แก้ไขซอร์ส","Save changes":"บันทึกการเปลี่ยนแปลง","No preview available":"ไม่มีภาพตัวอย่างให้ใช้งาน","Empty snippet content":"เนื้อหาส่วนย่อยว่างเปล่า"},getPluralForm(n){return 0;}}};
e[ 'th' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'th' ].dictionary = Object.assign( e[ 'th' ].dictionary, dictionary );
e[ 'th' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
