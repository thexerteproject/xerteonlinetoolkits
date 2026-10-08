/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt' ]: { dictionary, getPluralForm } } = {"pt":{"dictionary":{"Bookmark":"Marcador","Edit bookmark":"Editar marcador","Remove bookmark":"Remover marcador","Bookmark name":"Nome do marcador","Enter the bookmark name without spaces.":"Introduza o nome do marcador sem espaços.","Bookmark must not be empty.":"O marcador não deve estar vazio.","Bookmark name cannot contain space characters.":"O nome do marcador não pode conter caracteres de espaço.","Bookmark name already exists.":"O nome do marcador já existe.","bookmark widget":"widget de marcador","Bookmark toolbar":"Barra de marcadores","Bookmarks":"Marcadores","No bookmarks available.":"Sem marcadores disponíveis.","Scroll to bookmark":"Ir para o marcador"},getPluralForm(n){return (n != 1);}}};
e[ 'pt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt' ].dictionary = Object.assign( e[ 'pt' ].dictionary, dictionary );
e[ 'pt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
