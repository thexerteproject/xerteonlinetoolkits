/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ko' ]: { dictionary, getPluralForm } } = {"ko":{"dictionary":{"Find and replace":"찾기 및 바꾸기","Find in text…":"텍스트에서 찾기...","Find":"찾기","Previous result":"이전 결과","Next result":"다음 결과","Replace":"바꾸기","Replace all":"모두 바꾸기","Match case":"대/소문자 구분","Whole words only":"전체 단어만","Replace with…":"바꿀 내용...","Text to find must not be empty.":"찾을 텍스트를 입력해야 합니다.","Tip: Find some text first in order to replace it.":"팁: 바꾸려는 텍스트를 먼저 찾으세요.","Advanced options":"고급 옵션","Find in the document":"문서에서 찾기"},getPluralForm(n){return 0;}}};
e[ 'ko' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ko' ].dictionary = Object.assign( e[ 'ko' ].dictionary, dictionary );
e[ 'ko' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
