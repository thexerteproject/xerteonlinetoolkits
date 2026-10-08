/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'vi' ]: { dictionary, getPluralForm } } = {"vi":{"dictionary":{"Widget toolbar":"Thanh công cụ tiện ích","Insert paragraph before block":"Chèn đoạn trước khối","Insert paragraph after block":"Chèn đoạn sau khối","Press Enter to type after or press Shift + Enter to type before the widget":"Nhấn Enter để nhập vào sau hoặc nhấn Shift + Enter để nhập vào trước tiện ích","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Tổ hợp phím mà bạn có thể dùng khi một tiện ích được chọn (ví dụ: hình ảnh, bảng, v.v.)","Insert a new paragraph directly after a widget":"Chèn đoạn văn mới ngay sau tiện ích","Insert a new paragraph directly before a widget":"Chèn đoạn văn mới ngay trước tiện ích","Move the caret to allow typing directly before a widget":"Di chuyển dấu sót để cho phép nhập ngay trước một tiện ích","Move the caret to allow typing directly after a widget":"Di chuyển dấu sót để cho phép nhập ngay sau một tiện ích","Move focus from an editable area back to the parent widget":"Di chuyển tiêu điểm từ vùng có thể chỉnh sửa trở lại tiện ích gốc"},getPluralForm(n){return 0;}}};
e[ 'vi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'vi' ].dictionary = Object.assign( e[ 'vi' ].dictionary, dictionary );
e[ 'vi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
