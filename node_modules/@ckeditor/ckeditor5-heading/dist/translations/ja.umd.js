/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ja' ]: { dictionary, getPluralForm } } = {"ja":{"dictionary":{"Heading":"見出し","Choose heading":"見出しを選択","Heading 1":"見出し1","Heading 2":"見出し2","Heading 3":"見出し3 ","Heading 4":"見出し4","Heading 5":"見出し5","Heading 6":"見出し6","Type your title":"タイトルを入力","Type or paste your content here.":"コンテンツをここに入力または貼り付けしてください。"},getPluralForm(n){return 0;}}};
e[ 'ja' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ja' ].dictionary = Object.assign( e[ 'ja' ].dictionary, dictionary );
e[ 'ja' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
