/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"Enter fullscreen mode":"Masukkan mod skrin penuh","Leave fullscreen mode":"Tinggalkan mod skrin penuh","Fullscreen mode":"Mod skrin penuh","Toggle fullscreen mode":"Togol mod skrin penuh","Document outline":"Garis luar dokumen","Connected users":"Pengguna dihubungkan","Show left sidebar":"Tunjukkan bar sisi kiri","Hide left sidebar":"Sembunyikan bar sisi kiri","Toggle sidebar":"Togol bar sisi"},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
