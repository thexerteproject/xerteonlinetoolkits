/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'id' ]: { dictionary, getPluralForm } } = {"id":{"dictionary":{"Enter fullscreen mode":"Masuk ke mode layar penuh","Leave fullscreen mode":"Keluar dari mode layar penuh","Fullscreen mode":"Mode layar penuh","Toggle fullscreen mode":"Alihkan mode layar penuh","Document outline":"Garis besar dokumen","Connected users":"Pengguna yang terhubung","Show left sidebar":"Tampilkan panel kiri","Hide left sidebar":"Sembunyikan panel kiri","Toggle sidebar":"Alihkan panel samping"},getPluralForm(n){return 0;}}};
e[ 'id' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'id' ].dictionary = Object.assign( e[ 'id' ].dictionary, dictionary );
e[ 'id' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
