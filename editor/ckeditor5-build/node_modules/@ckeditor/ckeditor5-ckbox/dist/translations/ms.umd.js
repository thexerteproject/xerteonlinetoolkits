/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"Open file manager":"Buka pengurus fail","Cannot determine a category for the uploaded file.":"Gagal menentukan kategori bagi fail yang dimuat naik.","Cannot access default workspace.":"Tidak dapat mengakses ruang kerja lalai.","You have no image editing permissions.":"Anda tiada kebenaran untuk mengedit imej.","Edit image":"Sunting imej","Processing the edited image.":"Memproses imej yang telah disunting.","Server failed to process the image.":"Pelayan gagal memproses imej.","Failed to determine category of edited image.":"Gagal menentukan kategori imej yang disunting."},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
