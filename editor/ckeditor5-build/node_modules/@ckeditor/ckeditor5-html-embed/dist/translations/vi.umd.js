/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'vi' ]: { dictionary, getPluralForm } } = {"vi":{"dictionary":{"Insert HTML":"Chèn HTML","HTML snippet":"Mẫu HTML","Paste raw HTML here...":"Dán mã HTML nguyên bản tại đây...","Edit source":"Sửa nguồn","Save changes":"Lưu thay đổi","No preview available":"Không có sẵn bản xem trước","Empty snippet content":"Nội dung đoạn mã trống"},getPluralForm(n){return 0;}}};
e[ 'vi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'vi' ].dictionary = Object.assign( e[ 'vi' ].dictionary, dictionary );
e[ 'vi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
