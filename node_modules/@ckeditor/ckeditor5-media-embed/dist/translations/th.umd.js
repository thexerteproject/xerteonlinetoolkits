/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'th' ]: { dictionary, getPluralForm } } = {"th":{"dictionary":{"media widget":"วิดเจ็ตสื่อ","Media URL":"URL สื่อ","Paste the media URL in the input.":"วาง URL สื่อในอินพุต","Tip: Paste the URL into the content to embed faster.":"เคล็ดลับ: การวาง URL ลงในเนื้อหาจะช่วยให้ฝังได้เร็วขึ้น","The URL must not be empty.":"URL ต้องไม่ว่างเปล่า","This media URL is not supported.":"ไม่รองรับ URL ของสื่อนี้","Insert media":"แทรกสื่อ","Media":"สื่อ","Media toolbar":"แถบเครื่องมือสื่อ","Open media in new tab":"เปิดสื่อในแท็บใหม่","Media embed":"สื่อที่ฝัง"},getPluralForm(n){return 0;}}};
e[ 'th' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'th' ].dictionary = Object.assign( e[ 'th' ].dictionary, dictionary );
e[ 'th' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
