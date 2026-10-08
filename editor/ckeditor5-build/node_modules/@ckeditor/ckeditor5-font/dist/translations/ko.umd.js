/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ko' ]: { dictionary, getPluralForm } } = {"ko":{"dictionary":{"Font Size":"글자 크기","Tiny":"매우 작은","Small":"작은","Big":"큰","Huge":"매우 큰","Font Family":"글꼴 집합","Default":"기본","Font Color":"글자 색깔","Font Background Color":"글자 배경 색깔","Document colors":"문서 색깔들"},getPluralForm(n){return 0;}}};
e[ 'ko' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ko' ].dictionary = Object.assign( e[ 'ko' ].dictionary, dictionary );
e[ 'ko' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
