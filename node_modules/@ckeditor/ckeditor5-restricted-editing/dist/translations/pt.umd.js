/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt' ]: { dictionary, getPluralForm } } = {"pt":{"dictionary":{"Enable editing":"Ativar edição","Previous editable region":"Região editável anterior","Next editable region":"Região editável seguinte","Navigate editable regions":"Navegar regiões editáveis","Disable inline editing":"Desativar a edição em linha","Enable inline editing":"Ativar a edição em linha","Disable block editing":"Desativar a edição do bloco","Enable block editing":"Ativar a edição do bloco","Disable editing":"Desativar a edição"},getPluralForm(n){return (n != 1);}}};
e[ 'pt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt' ].dictionary = Object.assign( e[ 'pt' ].dictionary, dictionary );
e[ 'pt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
