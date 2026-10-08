/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fr' ]: { dictionary, getPluralForm } } = {"fr":{"dictionary":{"Yellow marker":"Marqueur jaune","Green marker":"Marqueur vert","Pink marker":"Marqueur rose","Blue marker":"Marqueur bleu","Red pen":"Crayon rouge","Green pen":"Crayon vert","Remove highlight":"Enlever le surlignage","Highlight":"Surlignage","Text highlight toolbar":"Barre d'outils du surlignage"},getPluralForm(n){return (n <= -2 || n >= 2);}}};
e[ 'fr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fr' ].dictionary = Object.assign( e[ 'fr' ].dictionary, dictionary );
e[ 'fr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
