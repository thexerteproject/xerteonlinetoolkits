/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"Insert image or file":"Masukkan imej atau fail","Could not obtain resized image URL.":"Gagal mendapatkan URL imej yang disaizkan semula.","Selecting resized image failed":"Gagal memilih imej yang disaizkan semula.","Could not insert image at the current position.":"Gagal memasukkan imej pada posisi kini.","Inserting image failed":"Gagal memasukkan imej"},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
