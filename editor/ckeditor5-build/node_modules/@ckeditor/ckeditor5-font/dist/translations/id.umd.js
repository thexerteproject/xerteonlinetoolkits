/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'id' ]: { dictionary, getPluralForm } } = {"id":{"dictionary":{"Font Size":"Ukuran Huruf","Tiny":"Sangat Kecil","Small":"Kecil","Big":"Besar","Huge":"Sangat Besar","Font Family":"Jenis Huruf","Default":"Bawaan","Font Color":"Warna Huruf","Font Background Color":"Warna Latar Huruf","Document colors":"Warna dokumen"},getPluralForm(n){return 0;}}};
e[ 'id' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'id' ].dictionary = Object.assign( e[ 'id' ].dictionary, dictionary );
e[ 'id' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
