/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'az' ]: { dictionary, getPluralForm } } = {"az":{"dictionary":{"Yellow marker":"Sarı marker","Green marker":"Yaşıl marker","Pink marker":"Çəhrayı marker","Blue marker":"Mavi marker","Red pen":"Qırmızı qələm","Green pen":"Yaşıl qələm","Remove highlight":"Vurgulanı sil","Highlight":"Vurğulamaq","Text highlight toolbar":"Vurğulamaq paneli"},getPluralForm(n){return (n != 1);}}};
e[ 'az' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'az' ].dictionary = Object.assign( e[ 'az' ].dictionary, dictionary );
e[ 'az' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
