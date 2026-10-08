/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'vi' ]: { dictionary, getPluralForm } } = {"vi":{"dictionary":{"Yellow marker":"Bút vàng","Green marker":"Bút xanh lá","Pink marker":"Bút hồng","Blue marker":"Bút xanh dương","Red pen":"Mực đỏ","Green pen":"Mực xanh","Remove highlight":"Xóa làm nổi","Highlight":"Làm nổi","Text highlight toolbar":"Thanh công cụ làm nổi chữ"},getPluralForm(n){return 0;}}};
e[ 'vi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'vi' ].dictionary = Object.assign( e[ 'vi' ].dictionary, dictionary );
e[ 'vi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
