/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt-br' ]: { dictionary, getPluralForm } } = {"pt-br":{"dictionary":{"Enter fullscreen mode":"Entrar no modo tela cheia","Leave fullscreen mode":"Sair do modo tela cheia","Fullscreen mode":"Modo tela cheia","Toggle fullscreen mode":"Alternar modo tela cheia","Document outline":"Contorno do documento","Connected users":"Usuários conectados","Show left sidebar":"Mostrar barra lateral esquerda","Hide left sidebar":"Ocultar barra lateral esquerda","Toggle sidebar":"Alternar barra lateral"},getPluralForm(n){return (n != 1);}}};
e[ 'pt-br' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt-br' ].dictionary = Object.assign( e[ 'pt-br' ].dictionary, dictionary );
e[ 'pt-br' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
