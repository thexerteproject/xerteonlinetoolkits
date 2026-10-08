/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'gl' ]: { dictionary, getPluralForm } } = {"gl":{"dictionary":{"Unlink":"Desligar","Link":"Ligar","Link URL":"URL de ligazón","Link URL must not be empty.":"O URL da ligazón non debe estar baleiro.","Link image":"Ligazón da imaxe","Edit link":"Editar a ligazón","Open link in new tab":"Abrir a ligazón nunha nova lapela","Open in a new tab":"Abrir nunha nova lapela","Downloadable":"Descargábel","Create link":"Crear ligazón","Move out of a link":"Saír dunha ligazón","Link properties":"","Displayed text":"","No links available":""},getPluralForm(n){return (n != 1);}}};
e[ 'gl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'gl' ].dictionary = Object.assign( e[ 'gl' ].dictionary, dictionary );
e[ 'gl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
