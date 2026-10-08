/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh' ]: { dictionary, getPluralForm } } = {"zh":{"dictionary":{"Unlink":"移除連結","Link":"連結","Link URL":"連結˙ URL","Link URL must not be empty.":"連結 URL 不得為空白。","Link image":"圖片連結","Edit link":"編輯連結","Open link in new tab":"在新視窗開啟連結","Open in a new tab":"在新視窗開啟","Downloadable":"可下載","Create link":"建立連結","Move out of a link":"移出連結","Link properties":"連結屬性","Displayed text":"顯示的文字","No links available":"無可用連結"},getPluralForm(n){return 0;}}};
e[ 'zh' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh' ].dictionary = Object.assign( e[ 'zh' ].dictionary, dictionary );
e[ 'zh' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
