/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt-br' ]: { dictionary, getPluralForm } } = {"pt-br":{"dictionary":{"Enable editing":"Ativar edição","Previous editable region":"Região editável anterior","Next editable region":"Próxima região editável","Navigate editable regions":"Navegar entre regiões editáveis","Disable inline editing":"Desativar edição em linha","Enable inline editing":"Ativar edição em linha","Disable block editing":"Desativar edição em bloco","Enable block editing":"Ativar edição em bloco","Disable editing":"Desativar edição"},getPluralForm(n){return (n != 1);}}};
e[ 'pt-br' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt-br' ].dictionary = Object.assign( e[ 'pt-br' ].dictionary, dictionary );
e[ 'pt-br' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
