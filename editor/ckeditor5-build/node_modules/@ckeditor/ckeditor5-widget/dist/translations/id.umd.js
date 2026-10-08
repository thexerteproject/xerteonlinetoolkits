/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'id' ]: { dictionary, getPluralForm } } = {"id":{"dictionary":{"Widget toolbar":"Alat widget","Insert paragraph before block":"Tambahkan paragraf sebelum blok","Insert paragraph after block":"Tambahkan paragraf setelah blok","Press Enter to type after or press Shift + Enter to type before the widget":"Tekan Enter untuk mengetik setelah atau tekan Shift + Enter untuk mengetik sebelum widget","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Penekanan tombol yang bisa dilakukan saat widget dipilih (contoh: gambar, tabel, dll.)","Insert a new paragraph directly after a widget":"Sisipkan paragraf baru secara langsung setelah widget","Insert a new paragraph directly before a widget":"Sisipkan paragraf baru secara langsung sebelum widget","Move the caret to allow typing directly before a widget":"Pindahkan tanda sisipan untuk memungkinkan mengetik langsung setelah widget","Move the caret to allow typing directly after a widget":"Pindahkan tanda sisipan untuk memungkinkan mengetik langsung setelah widget","Move focus from an editable area back to the parent widget":"Pindahkan fokus dari area yang dapat diedit kembali ke widget induk"},getPluralForm(n){return 0;}}};
e[ 'id' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'id' ].dictionary = Object.assign( e[ 'id' ].dictionary, dictionary );
e[ 'id' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
