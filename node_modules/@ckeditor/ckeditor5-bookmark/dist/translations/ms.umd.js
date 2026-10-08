/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"Bookmark":"Penanda halaman","Edit bookmark":"Sunting penanda halaman","Remove bookmark":"Alih keluar penanda halaman","Bookmark name":"Nama penanda halaman","Enter the bookmark name without spaces.":"Masukkan nama penanda halaman tanpa ruang.","Bookmark must not be empty.":"Penanda halaman tidak boleh kosong.","Bookmark name cannot contain space characters.":"Nama penanda halaman tidak boleh mengandungi aksara ruang.","Bookmark name already exists.":"Nama penanda halaman sudah wujud.","bookmark widget":"widget penanda halaman","Bookmark toolbar":"Bar alat penanda halaman","Bookmarks":"Penanda halaman","No bookmarks available.":"Tiada penanda halaman tersedia.","Scroll to bookmark":"Tatal ke penanda halaman"},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
