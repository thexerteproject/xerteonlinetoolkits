/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'th' ]: { dictionary, getPluralForm } } = {"th":{"dictionary":{"Find and replace":"ค้นหาและแทนที่","Find in text…":"ค้นหาในข้อความ...","Find":"ค้นหา","Previous result":"ผลลัพธ์ก่อนหน้านี้","Next result":"ผลลัพธ์ถัดไป","Replace":"แทนที่","Replace all":"แทนที่ทั้งหมด","Match case":"ตัวใหญ่-เล็ก ตรงกัน","Whole words only":"ตรงกันทุกตัวอักษร","Replace with…":"แทนที่ด้วย...","Text to find must not be empty.":"ข้อความที่จะค้นหาต้องไม่ว่างเปล่า","Tip: Find some text first in order to replace it.":"เคล็ดลับ: ค้นหาข้อความบางอย่างก่อนจึงจะแทนที่ได้","Advanced options":"ตัวเลือกขั้นสูง","Find in the document":"ค้นหาในเอกสาร"},getPluralForm(n){return 0;}}};
e[ 'th' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'th' ].dictionary = Object.assign( e[ 'th' ].dictionary, dictionary );
e[ 'th' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
