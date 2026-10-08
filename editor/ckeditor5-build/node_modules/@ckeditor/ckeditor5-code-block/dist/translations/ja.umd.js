/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ja' ]: { dictionary, getPluralForm } } = {"ja":{"dictionary":{"Insert code block":"コードブロックの挿入","Plain text":"プレインテキスト","Leaving %0 code snippet":"%0のコードスニペットを残す","Entering %0 code snippet":"%0のコードスニペットを入力","Entering code snippet":"コードスニペットを入力","Leaving code snippet":"コードスニペットを残す","Code block":"コードブロック"},getPluralForm(n){return 0;}}};
e[ 'ja' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ja' ].dictionary = Object.assign( e[ 'ja' ].dictionary, dictionary );
e[ 'ja' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
