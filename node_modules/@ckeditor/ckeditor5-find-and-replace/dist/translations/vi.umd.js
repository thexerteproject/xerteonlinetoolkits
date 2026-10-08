/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'vi' ]: { dictionary, getPluralForm } } = {"vi":{"dictionary":{"Find and replace":"Tìm và thay thế","Find in text…":"Tìm trong văn bản...","Find":"Tìm","Previous result":"Kết quả trước","Next result":"Kết quả tiếp theo","Replace":"Thay thế","Replace all":"Thay thế tất cả","Match case":"Khớp chữ hoa/chữ thường","Whole words only":"Chỉ toàn bộ từ","Replace with…":"Thay thế bằng...","Text to find must not be empty.":"Không được để trống trường văn bản cần tìm.","Tip: Find some text first in order to replace it.":"Mẹo: Tìm một đoạn văn bản trước để thay thế.","Advanced options":"Tùy chọn nâng cao","Find in the document":"Tìm trong tài liệu"},getPluralForm(n){return 0;}}};
e[ 'vi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'vi' ].dictionary = Object.assign( e[ 'vi' ].dictionary, dictionary );
e[ 'vi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
