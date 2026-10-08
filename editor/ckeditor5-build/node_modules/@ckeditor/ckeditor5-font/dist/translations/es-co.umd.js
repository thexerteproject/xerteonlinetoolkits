/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'es-co' ]: { dictionary, getPluralForm } } = {"es-co":{"dictionary":{"Font Size":"Tamaño de fuente","Tiny":"Diminuta","Small":"Pequeña","Big":"Grande","Huge":"Enorme","Font Family":"Familia de fuente","Default":"Por defecto","Font Color":"Color de fuente","Font Background Color":"Color de fondo de fuente","Document colors":"Colores del documento"},getPluralForm(n){return (n != 1);}}};
e[ 'es-co' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'es-co' ].dictionary = Object.assign( e[ 'es-co' ].dictionary, dictionary );
e[ 'es-co' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
