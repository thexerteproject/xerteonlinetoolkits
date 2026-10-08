/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ko' ]: { dictionary, getPluralForm } } = {"ko":{"dictionary":{"Enter fullscreen mode":"전체 화면으로 보기","Leave fullscreen mode":"전체 화면 나가기","Fullscreen mode":"전체 화면 모드","Toggle fullscreen mode":"전체 화면 모드 전환","Document outline":"문서 외곽선","Connected users":"참여 사용자","Show left sidebar":"왼쪽 사이드바 표시","Hide left sidebar":"왼쪽 사이드바 숨기기","Toggle sidebar":"사이드바 전환"},getPluralForm(n){return 0;}}};
e[ 'ko' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ko' ].dictionary = Object.assign( e[ 'ko' ].dictionary, dictionary );
e[ 'ko' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
