/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt' ]: { dictionary, getPluralForm } } = {"pt":{"dictionary":{"Find and replace":"Encontrar e substituir","Find in text…":"Encontrar no texto...","Find":"Encontrar","Previous result":"Resultado anterior","Next result":"Resultado seguinte","Replace":"Substituir","Replace all":"Substituir todos","Match case":"Corresponder maiúsculas/minúsculas","Whole words only":"Apenas palavras inteiras","Replace with…":"Substituir por...","Text to find must not be empty.":"O texto a pesquisar não pode estar vazio.","Tip: Find some text first in order to replace it.":"Dica: Encontre algum texto primeiro para poder substituí-lo.","Advanced options":"Opções avançadas","Find in the document":"Localizar no documento"},getPluralForm(n){return (n != 1);}}};
e[ 'pt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt' ].dictionary = Object.assign( e[ 'pt' ].dictionary, dictionary );
e[ 'pt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
