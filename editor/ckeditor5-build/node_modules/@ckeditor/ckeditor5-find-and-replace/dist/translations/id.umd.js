/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'id' ]: { dictionary, getPluralForm } } = {"id":{"dictionary":{"Find and replace":"Cari dan ubah","Find in text…":"Cari di dalam teks...","Find":"Cari","Previous result":"Hasil sebelumnya","Next result":"Hasil berikutnya","Replace":"Ubah","Replace all":"Ubah semua","Match case":"Sesuaikan huruf","Whole words only":"Kata utuh saja","Replace with…":"Ubah dengan...","Text to find must not be empty.":"Teks yang dicari tidak boleh kosong.","Tip: Find some text first in order to replace it.":"Tip: Cari suatu teks terlebih dahulu untuk menggantinya.","Advanced options":"Opsi lanjutan","Find in the document":"Temukan di dokumen"},getPluralForm(n){return 0;}}};
e[ 'id' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'id' ].dictionary = Object.assign( e[ 'id' ].dictionary, dictionary );
e[ 'id' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
