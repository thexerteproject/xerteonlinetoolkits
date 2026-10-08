/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh-cn' ]: { dictionary, getPluralForm } } = {"zh-cn":{"dictionary":{"Enter fullscreen mode":"进入全屏模式","Leave fullscreen mode":"退出全屏模式","Fullscreen mode":"全屏模式","Toggle fullscreen mode":"切换全屏模式","Document outline":"文档大纲","Connected users":"已连接用户","Show left sidebar":"显示左侧边栏","Hide left sidebar":"隐藏左侧边栏","Toggle sidebar":"切换侧边栏"},getPluralForm(n){return 0;}}};
e[ 'zh-cn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh-cn' ].dictionary = Object.assign( e[ 'zh-cn' ].dictionary, dictionary );
e[ 'zh-cn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
