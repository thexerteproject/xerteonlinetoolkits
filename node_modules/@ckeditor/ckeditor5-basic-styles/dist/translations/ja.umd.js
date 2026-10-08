/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ja' ]: { dictionary, getPluralForm } } = {"ja":{"dictionary":{"Bold":"ボールド","Italic":"イタリック","Underline":"アンダーライン","Code":"コード","Strikethrough":"取り消し線","Subscript":"下付き文字","Superscript":"上付き文字","Italic text":"斜体","Move out of an inline code style":"インラインコードスタイルを終了する","Bold text":"太字","Underline text":"下線","Strikethrough text":"取り消し線"},getPluralForm(n){return 0;}}};
e[ 'ja' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ja' ].dictionary = Object.assign( e[ 'ja' ].dictionary, dictionary );
e[ 'ja' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
