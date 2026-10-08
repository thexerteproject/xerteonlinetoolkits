/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"Insert code block":"Masukkan blok kod","Plain text":"Teks kosong","Leaving %0 code snippet":"Meninggalkan %0 coretan kod","Entering %0 code snippet":"Memasukkan %0 coretan kod","Entering code snippet":"Memasukkan coretan kod","Leaving code snippet":"Meninggalkan coretan kod","Code block":"Sekatan kod"},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
