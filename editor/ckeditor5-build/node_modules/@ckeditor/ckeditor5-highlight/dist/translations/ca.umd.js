/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ca' ]: { dictionary, getPluralForm } } = {"ca":{"dictionary":{"Yellow marker":"Marcador groc","Green marker":"Marcador verd","Pink marker":"Marcador rosa","Blue marker":"Marcador blau","Red pen":"Marcador vermell","Green pen":"Bolígraf verd","Remove highlight":"Esborrar destacat","Highlight":"Destacat","Text highlight toolbar":"Barra d'eines de ressaltat de text"},getPluralForm(n){return (n != 1);}}};
e[ 'ca' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ca' ].dictionary = Object.assign( e[ 'ca' ].dictionary, dictionary );
e[ 'ca' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
