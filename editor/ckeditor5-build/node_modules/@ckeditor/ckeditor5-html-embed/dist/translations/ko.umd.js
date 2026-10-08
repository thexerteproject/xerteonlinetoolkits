/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ko' ]: { dictionary, getPluralForm } } = {"ko":{"dictionary":{"Insert HTML":"HTML 삽입","HTML snippet":"HTML 코드 조각","Paste raw HTML here...":"원시 HTML을 여기에 붙여넣으세요...","Edit source":"소스 편집","Save changes":"변경사항 저장","No preview available":"미리보기를 이용할 수 없습니다","Empty snippet content":"빈 코드 조각 내용"},getPluralForm(n){return 0;}}};
e[ 'ko' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ko' ].dictionary = Object.assign( e[ 'ko' ].dictionary, dictionary );
e[ 'ko' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
