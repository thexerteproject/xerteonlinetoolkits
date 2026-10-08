/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'es' ]: { dictionary, getPluralForm } } = {"es":{"dictionary":{"Heading":"Encabezado","Choose heading":"Elegir Encabezado","Heading 1":"Encabezado 1","Heading 2":"Encabezado 2","Heading 3":"Encabezado 3","Heading 4":"Encabezado 4","Heading 5":"Encabezado 5","Heading 6":"Encabezado 6","Type your title":"Introduce tu título","Type or paste your content here.":"Introduce o pega tu contenido aquí"},getPluralForm(n){return (n != 1);}}};
e[ 'es' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'es' ].dictionary = Object.assign( e[ 'es' ].dictionary, dictionary );
e[ 'es' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
