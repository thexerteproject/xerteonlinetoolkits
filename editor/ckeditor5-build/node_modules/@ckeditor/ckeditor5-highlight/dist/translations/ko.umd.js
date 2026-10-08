/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ko' ]: { dictionary, getPluralForm } } = {"ko":{"dictionary":{"Yellow marker":"노란색 마커","Green marker":"초록색 마커","Pink marker":"분홍색 마커","Blue marker":"파란색 마커","Red pen":"빨간색 펜","Green pen":"초록색 펜","Remove highlight":"강조 제거","Highlight":"강조","Text highlight toolbar":"글자 강조 툴바"},getPluralForm(n){return 0;}}};
e[ 'ko' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ko' ].dictionary = Object.assign( e[ 'ko' ].dictionary, dictionary );
e[ 'ko' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
