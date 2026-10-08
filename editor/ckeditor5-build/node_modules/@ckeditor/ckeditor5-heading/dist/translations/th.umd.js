/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'th' ]: { dictionary, getPluralForm } } = {"th":{"dictionary":{"Heading":"หัวข้อ","Choose heading":"เลือกขนาดหัวข้อ","Heading 1":"หัวข้อขนาด 1","Heading 2":"หัวข้อ 2","Heading 3":"หัวข้อ 3","Heading 4":"หัวข้อ 4","Heading 5":"หัวข้อ 5","Heading 6":"หัวข้อ 6","Type your title":"พิมพ์ชื่อเรื่องของคุณ","Type or paste your content here.":"พิมพ์หรือวางเนื้อหาของคุณที่นี่"},getPluralForm(n){return 0;}}};
e[ 'th' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'th' ].dictionary = Object.assign( e[ 'th' ].dictionary, dictionary );
e[ 'th' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
