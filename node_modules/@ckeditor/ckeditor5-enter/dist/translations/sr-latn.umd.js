/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sr-latn' ]: { dictionary, getPluralForm } } = {"sr-latn":{"dictionary":{"Insert a soft break (a <code>&lt;br&gt;</code> element)":"Umetnite meku pauzu (element &lt;br&gt;)","Insert a hard break (a new paragraph)":"Ubacite čvrstu pauzu (novi pasus)  "},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'sr-latn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sr-latn' ].dictionary = Object.assign( e[ 'sr-latn' ].dictionary, dictionary );
e[ 'sr-latn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
