/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ja' ]: { dictionary, getPluralForm } } = {"ja":{"dictionary":{"Find and replace":"検索して置換","Find in text…":"テキスト内を検索...","Find":"見つける","Previous result":"前の結果","Next result":"次の結果","Replace":"置換","Replace all":"全てを置換","Match case":"マッチケース","Whole words only":"単語全体のみ","Replace with…":"こちらと置換...","Text to find must not be empty.":"検索対象テキスト欄は空白にできません。","Tip: Find some text first in order to replace it.":"ヒント：置換するには、対象テキストを先に検索してください。","Advanced options":"高度なオプション","Find in the document":"ドキュメント内を探す"},getPluralForm(n){return 0;}}};
e[ 'ja' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ja' ].dictionary = Object.assign( e[ 'ja' ].dictionary, dictionary );
e[ 'ja' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
