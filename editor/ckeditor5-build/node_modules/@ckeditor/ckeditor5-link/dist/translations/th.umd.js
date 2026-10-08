/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'th' ]: { dictionary, getPluralForm } } = {"th":{"dictionary":{"Unlink":"ยกเลิกการลิงก์","Link":"ลิงก์","Link URL":"ลิงก์ URL","Link URL must not be empty.":"URL ของลิงก์ต้องไม่เว้นว่าง","Link image":"ลิงก์ภาพ","Edit link":"แก้ไขลิงก์","Open link in new tab":"เปิดลิงก์ในแท็บใหม่","Open in a new tab":"เปิดในแท็บใหม่","Downloadable":"ที่สามารถดาวน์โหลดได้","Create link":"สร้างลิงก์","Move out of a link":"ย้ายออกจากลิงก์","Link properties":"คุณสมบัติลิงก์","Displayed text":"ข้อความที่แสดง","No links available":"ไม่มีลิงก์พร้อมใช้งาน"},getPluralForm(n){return 0;}}};
e[ 'th' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'th' ].dictionary = Object.assign( e[ 'th' ].dictionary, dictionary );
e[ 'th' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
