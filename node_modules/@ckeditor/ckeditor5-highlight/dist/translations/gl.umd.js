/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'gl' ]: { dictionary, getPluralForm } } = {"gl":{"dictionary":{"Yellow marker":"Marcador marelo","Green marker":"Marcador verde","Pink marker":"Marcador rosa","Blue marker":"Marcador azul","Red pen":"Pluma vermella","Green pen":"Pluma verde","Remove highlight":"Retirar o resaltado","Highlight":"Resaltado","Text highlight toolbar":"Barra de ferramentas para resaltar texto"},getPluralForm(n){return (n != 1);}}};
e[ 'gl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'gl' ].dictionary = Object.assign( e[ 'gl' ].dictionary, dictionary );
e[ 'gl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
