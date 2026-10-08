/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh' ]: { dictionary, getPluralForm } } = {"zh":{"dictionary":{"Bold":"粗體","Italic":"斜體","Underline":"底線","Code":"代碼","Strikethrough":"刪除線","Subscript":"下標","Superscript":"上標","Italic text":"斜體文字","Move out of an inline code style":"移出行內程式碼樣式","Bold text":"粗體文字","Underline text":"底線文字","Strikethrough text":"刪除線文字"},getPluralForm(n){return 0;}}};
e[ 'zh' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh' ].dictionary = Object.assign( e[ 'zh' ].dictionary, dictionary );
e[ 'zh' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
