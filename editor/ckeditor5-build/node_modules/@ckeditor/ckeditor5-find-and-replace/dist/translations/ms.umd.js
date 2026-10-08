/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"Find and replace":"Cari dan ganti","Find in text…":"Cari dalam teks...","Find":"Cari","Previous result":"Keputusan sebelumnya","Next result":"Keputusan seterusnya","Replace":"Ganti","Replace all":"Ganti semua","Match case":"Sesuaikan kes","Whole words only":"Perkataan penuh sahaja","Replace with…":"Gantikan dengan...","Text to find must not be empty.":"Teks yang hendak dicari tidak boleh ditinggalkan kosong.","Tip: Find some text first in order to replace it.":"Petua: Cari teks terlebih dahulu untuk menggantikannya.","Advanced options":"Pilihan lanjutan","Find in the document":"Cari dalam dokumen"},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
