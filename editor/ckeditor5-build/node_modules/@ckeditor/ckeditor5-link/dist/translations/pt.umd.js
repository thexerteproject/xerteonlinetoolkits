/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt' ]: { dictionary, getPluralForm } } = {"pt":{"dictionary":{"Unlink":"Desligar","Link":"Hiperligação","Link URL":"URL da ligação","Link URL must not be empty.":"O URL da ligação não pode estar em branco.","Link image":"Imagem da hiperligação","Edit link":"Editar hiperligação","Open link in new tab":"Abrir hiperligação num novo separador","Open in a new tab":"Abrir num novo separador","Downloadable":"Descarregável","Create link":"Criar ligação","Move out of a link":"Sair de uma ligação","Link properties":"Propriedades de ligação","Displayed text":"Texto exibido","No links available":"Sem ligações disponíveis"},getPluralForm(n){return (n != 1);}}};
e[ 'pt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt' ].dictionary = Object.assign( e[ 'pt' ].dictionary, dictionary );
e[ 'pt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
