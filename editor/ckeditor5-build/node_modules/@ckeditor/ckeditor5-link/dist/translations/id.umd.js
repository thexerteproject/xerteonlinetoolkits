/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'id' ]: { dictionary, getPluralForm } } = {"id":{"dictionary":{"Unlink":"Hapus tautan","Link":"Tautan","Link URL":"URL tautan","Link URL must not be empty.":"Tautan URL tidak boleh kosong.","Link image":"Tautkan gambar","Edit link":"Sunting tautan","Open link in new tab":"Buka tautan di tab baru","Open in a new tab":"Buka di tab baru","Downloadable":"Dapat diunduh","Create link":"Buat tautan","Move out of a link":"Keluar dari tautan","Link properties":"Properti tautan","Displayed text":"Teks yang ditampilkan","No links available":"Tautan tidak tersedia"},getPluralForm(n){return 0;}}};
e[ 'id' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'id' ].dictionary = Object.assign( e[ 'id' ].dictionary, dictionary );
e[ 'id' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
