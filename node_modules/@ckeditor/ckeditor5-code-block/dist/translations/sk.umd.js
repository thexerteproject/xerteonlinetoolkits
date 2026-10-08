/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sk' ]: { dictionary, getPluralForm } } = {"sk":{"dictionary":{"Insert code block":"Vložte blok kódu","Plain text":"Čistý text","Leaving %0 code snippet":"Opúšťanie %0 útržku kódu","Entering %0 code snippet":"Zadávanie %0 útržku kódu","Entering code snippet":"Zadávanie útržku kódu","Leaving code snippet":"Opúšťanie útržku kódu","Code block":"Blok kódu"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'sk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sk' ].dictionary = Object.assign( e[ 'sk' ].dictionary, dictionary );
e[ 'sk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
