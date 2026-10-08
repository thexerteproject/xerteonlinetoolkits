/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ko' ]: { dictionary, getPluralForm } } = {"ko":{"dictionary":{"media widget":"미디어 위젯","Media URL":"미디어 URL","Paste the media URL in the input.":"미디어 URL을 입력해주세요.","Tip: Paste the URL into the content to embed faster.":"팁: URL을 붙여넣으면 더 빨리 삽입할 수 있습니다.","The URL must not be empty.":"URL이 비어있을 수 없습니다.","This media URL is not supported.":"이 미디어 URL은 지원되지 않습니다.","Insert media":"미디어 삽입","Media":"미디어","Media toolbar":"미디어 툴바","Open media in new tab":"새 탭에서 미디어 열기","Media embed":"미디어 삽입"},getPluralForm(n){return 0;}}};
e[ 'ko' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ko' ].dictionary = Object.assign( e[ 'ko' ].dictionary, dictionary );
e[ 'ko' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
