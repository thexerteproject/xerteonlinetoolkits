/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de-ch' ]: { dictionary, getPluralForm } } = {"de-ch":{"dictionary":{"Yellow marker":"Gelber Marker","Green marker":"Grüner Marker","Pink marker":"Pinker Marker","Blue marker":"Blauer Marker","Red pen":"Rote Schriftfarbe","Green pen":"Grüne Schriftfarbe","Remove highlight":"Texthervorhebung entfernen","Highlight":"Texthervorhebung","Text highlight toolbar":"Texthervorhebung Werkzeugleiste"},getPluralForm(n){return (n != 1);}}};
e[ 'de-ch' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de-ch' ].dictionary = Object.assign( e[ 'de-ch' ].dictionary, dictionary );
e[ 'de-ch' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
