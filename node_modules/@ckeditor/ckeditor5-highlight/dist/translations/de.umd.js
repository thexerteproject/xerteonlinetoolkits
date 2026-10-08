/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de' ]: { dictionary, getPluralForm } } = {"de":{"dictionary":{"Yellow marker":"Gelber Marker","Green marker":"Grüner Marker","Pink marker":"Pinker Marker","Blue marker":"Blauer Marker","Red pen":"Rote Schriftfarbe","Green pen":"Grüne Schriftfarbe","Remove highlight":"Texthervorhebung entfernen","Highlight":"Texthervorhebung","Text highlight toolbar":"Text hervorheben Werkzeugleiste"},getPluralForm(n){return (n != 1);}}};
e[ 'de' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de' ].dictionary = Object.assign( e[ 'de' ].dictionary, dictionary );
e[ 'de' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
