/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ko' ]: { dictionary, getPluralForm } } = {"ko":{"dictionary":{"Open file manager":"파일 관리자 열기","Cannot determine a category for the uploaded file.":"업로드된 파일의 카테고리를 확인할 수 없습니다.","Cannot access default workspace.":"기본 작업 공간에 액세스할 수 없습니다.","You have no image editing permissions.":"이미지를 편집할 수 있는 권한이 없습니다.","Edit image":"이미지 편집","Processing the edited image.":"편집한 이미지를 처리 중입니다.","Server failed to process the image.":"서버가 이미지를 처리하지 못했습니다.","Failed to determine category of edited image.":"편집한 이미지의 카테고리를 결정하지 못했습니다."},getPluralForm(n){return 0;}}};
e[ 'ko' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ko' ].dictionary = Object.assign( e[ 'ko' ].dictionary, dictionary );
e[ 'ko' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
