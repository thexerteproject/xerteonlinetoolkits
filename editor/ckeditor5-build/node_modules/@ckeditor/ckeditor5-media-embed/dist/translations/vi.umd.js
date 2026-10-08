/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'vi' ]: { dictionary, getPluralForm } } = {"vi":{"dictionary":{"media widget":"tiện ích đa phương tiện","Media URL":"Đường dẫn đa phương tiện","Paste the media URL in the input.":"Dán đường dẫn đa phương tiện vào trường","Tip: Paste the URL into the content to embed faster.":"Mẹo: Dán đường dẫn vào nội dung để nhúng ngay","The URL must not be empty.":"Đường dẫn không được để trống","This media URL is not supported.":"Đường dẫn đa phương tiện không hỗ trợ","Insert media":"Chèn đa phương tiện","Media":"Phương tiện","Media toolbar":"Thanh công cụ đa phương tiện","Open media in new tab":"Mở nội dung nghe nhìn trong tab mới","Media embed":"Nhúng tệp đa phương tiện"},getPluralForm(n){return 0;}}};
e[ 'vi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'vi' ].dictionary = Object.assign( e[ 'vi' ].dictionary, dictionary );
e[ 'vi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
