/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'no' ]: { dictionary, getPluralForm } } = {"no":{"dictionary":{"Insert code block":"Sett inn kodeblokk","Plain text":"Ren tekst","Leaving %0 code snippet":"Forlater %0 kodesnutt","Entering %0 code snippet":"Skriver inn %0 kodesnutt","Entering code snippet":"Skriver inn kodesnutt","Leaving code snippet":"Forlater kodesnutt","Code block":"Kodeblokk"},getPluralForm(n){return (n != 1);}}};
e[ 'no' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'no' ].dictionary = Object.assign( e[ 'no' ].dictionary, dictionary );
e[ 'no' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
