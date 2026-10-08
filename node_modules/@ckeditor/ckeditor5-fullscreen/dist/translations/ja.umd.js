/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ja' ]: { dictionary, getPluralForm } } = {"ja":{"dictionary":{"Enter fullscreen mode":"全画面モードに入る","Leave fullscreen mode":"全画面モードを終了","Fullscreen mode":"全画面モード","Toggle fullscreen mode":"全画面モードの切り替え","Document outline":"ドキュメントの概要","Connected users":"接続ユーザー","Show left sidebar":"左サイドバーを表示する","Hide left sidebar":"左サイドバーを隠す","Toggle sidebar":"サイドバーを切り替える"},getPluralForm(n){return 0;}}};
e[ 'ja' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ja' ].dictionary = Object.assign( e[ 'ja' ].dictionary, dictionary );
e[ 'ja' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
