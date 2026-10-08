/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt' ]: { dictionary, getPluralForm } } = {"pt":{"dictionary":{"Enter fullscreen mode":"Entrar em modo de ecrã inteiro","Leave fullscreen mode":"Sair de modo de ecrã inteiro","Fullscreen mode":"Modo de ecrã inteiro","Toggle fullscreen mode":"Alternar modo de ecrã inteiro","Document outline":"Esboço do documento","Connected users":"Utilizadores ligados","Show left sidebar":"Exibir a barra lateral esquerda","Hide left sidebar":"Ocultar a barra lateral esquerda","Toggle sidebar":"Exibir/Ocultar a barra lateral"},getPluralForm(n){return (n != 1);}}};
e[ 'pt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt' ].dictionary = Object.assign( e[ 'pt' ].dictionary, dictionary );
e[ 'pt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
