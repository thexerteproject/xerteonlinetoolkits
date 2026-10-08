/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"media widget":"widget media","Media URL":"URL Media","Paste the media URL in the input.":"Tampal URL media dalam input.","Tip: Paste the URL into the content to embed faster.":"Petua: Tampal URL kedalam kandungan untuk   membenam dengan lebih pantas.","The URL must not be empty.":"URL tidak boleh ditinggalkan kosong.","This media URL is not supported.":"URL media ini tidak disokong.","Insert media":"Masukkan media","Media":"Media","Media toolbar":"Bar alat capaian media","Open media in new tab":"Buka media dalam tab baru","Media embed":"Benam media"},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
