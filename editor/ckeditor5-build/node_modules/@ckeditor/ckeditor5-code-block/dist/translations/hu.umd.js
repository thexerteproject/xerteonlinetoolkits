/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hu' ]: { dictionary, getPluralForm } } = {"hu":{"dictionary":{"Insert code block":"Kód blokk beszúrása","Plain text":"Egyszerű szöveg","Leaving %0 code snippet":"%0 kódrészlet elhagyása","Entering %0 code snippet":"%0 kódrészlet bevitele","Entering code snippet":"Kódrészlet bevitele","Leaving code snippet":"Kódrészlet elhagyása","Code block":"Kódblokk"},getPluralForm(n){return (n != 1);}}};
e[ 'hu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hu' ].dictionary = Object.assign( e[ 'hu' ].dictionary, dictionary );
e[ 'hu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
