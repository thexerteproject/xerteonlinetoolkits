/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'th' ]: { dictionary, getPluralForm } } = {"th":{"dictionary":{"Insert image or file":"แทรกรูปภาพหรือไฟล์","Could not obtain resized image URL.":"ไม่สามารถรับ URL ของภาพที่ปรับขนาด","Selecting resized image failed":"การเลือกภาพที่ปรับขนาดล้มเหลว","Could not insert image at the current position.":"ไม่สามารถแทรกภาพที่ตำแหน่งปัจจุบัน","Inserting image failed":"การแทรกภาพล้มเหลว"},getPluralForm(n){return 0;}}};
e[ 'th' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'th' ].dictionary = Object.assign( e[ 'th' ].dictionary, dictionary );
e[ 'th' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
