/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'gl' ]: { dictionary, getPluralForm } } = {"gl":{"dictionary":{"Find and replace":"Buscar e substituír","Find in text…":"Buscar no texto…","Find":"Buscar","Previous result":"Resultado anterior","Next result":"Seguinte resultado","Replace":"Substituír","Replace all":"Substituír todo","Match case":"Coincidencia de maiúsculas","Whole words only":"Só palabras enteiras","Replace with…":"Substituír por…","Text to find must not be empty.":"O texto a buscar non debe estar baleiro.","Tip: Find some text first in order to replace it.":"Consello: primeiro busca algo de texto para substituílo.","Advanced options":"Opcións avanzadas","Find in the document":"Atopar no documento"},getPluralForm(n){return (n != 1);}}};
e[ 'gl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'gl' ].dictionary = Object.assign( e[ 'gl' ].dictionary, dictionary );
e[ 'gl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
