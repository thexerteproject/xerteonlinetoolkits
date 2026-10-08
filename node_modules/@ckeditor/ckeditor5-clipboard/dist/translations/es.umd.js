/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'es' ]: { dictionary, getPluralForm } } = {"es":{"dictionary":{"Copy selected content":"Copia el contenido seleccionado","Paste content":"Pega el contenido","Paste content as plain text":"Pega el contenido como texto sin formato"},getPluralForm(n){return (n != 1);}}};
e[ 'es' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'es' ].dictionary = Object.assign( e[ 'es' ].dictionary, dictionary );
e[ 'es' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
