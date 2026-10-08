/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'et' ]: { dictionary, getPluralForm } } = {"et":{"dictionary":{"Insert code block":"Sisesta koodiplokk","Plain text":"Lihtsalt tekst","Leaving %0 code snippet":"%0 koodilõigu sulgemine","Entering %0 code snippet":"%0 koodilõigu avamine","Entering code snippet":"Koodilõigu avamine","Leaving code snippet":"Koodilõigust väljumine","Code block":"Koodiplokk"},getPluralForm(n){return (n != 1);}}};
e[ 'et' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'et' ].dictionary = Object.assign( e[ 'et' ].dictionary, dictionary );
e[ 'et' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
