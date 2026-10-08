/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh' ]: { dictionary, getPluralForm } } = {"zh":{"dictionary":{"Enter fullscreen mode":"進入全螢幕模式","Leave fullscreen mode":"退出全螢幕模式","Fullscreen mode":"全螢幕模式","Toggle fullscreen mode":"切換全螢幕模式","Document outline":"文件大綱","Connected users":"已連線使用者","Show left sidebar":"顯示左側邊欄","Hide left sidebar":"隱藏左側邊欄","Toggle sidebar":"切換側邊欄"},getPluralForm(n){return 0;}}};
e[ 'zh' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh' ].dictionary = Object.assign( e[ 'zh' ].dictionary, dictionary );
e[ 'zh' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
