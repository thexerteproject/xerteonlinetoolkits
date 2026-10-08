/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh-cn' ]: { dictionary, getPluralForm } } = {"zh-cn":{"dictionary":{"Bold":"加粗","Italic":"倾斜","Underline":"下划线","Code":"代码","Strikethrough":"删除线","Subscript":"下标","Superscript":"上标","Italic text":"斜体文本","Move out of an inline code style":"摆脱内联代码风格","Bold text":"加粗字体","Underline text":"给文本添加下划线","Strikethrough text":"给文本添加删除线"},getPluralForm(n){return 0;}}};
e[ 'zh-cn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh-cn' ].dictionary = Object.assign( e[ 'zh-cn' ].dictionary, dictionary );
e[ 'zh-cn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
