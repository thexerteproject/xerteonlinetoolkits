/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh' ]: { dictionary, getPluralForm } } = {"zh":{"dictionary":{"Widget toolbar":"小工具","Insert paragraph before block":"在這個區塊前面插入一個段落","Insert paragraph after block":"在這個區塊後面插入一個段落","Press Enter to type after or press Shift + Enter to type before the widget":"按下 Enter 在小工具後輸入，或按下 Shift + Enter 在小工具前輸入","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"小工具選取時可使用的按鍵（例如：圖片、表格等）","Insert a new paragraph directly after a widget":"在小工具後直接插入新段落","Insert a new paragraph directly before a widget":"在小工具前直接插入新段落","Move the caret to allow typing directly before a widget":"移動插入符號，以便在小工具前直接輸入","Move the caret to allow typing directly after a widget":"移動插入符號，以便在小工具後直接輸入","Move focus from an editable area back to the parent widget":"將焦點從可編輯區域移回上層小工具"},getPluralForm(n){return 0;}}};
e[ 'zh' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh' ].dictionary = Object.assign( e[ 'zh' ].dictionary, dictionary );
e[ 'zh' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
