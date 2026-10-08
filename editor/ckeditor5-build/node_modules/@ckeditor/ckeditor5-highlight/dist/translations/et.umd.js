/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'et' ]: { dictionary, getPluralForm } } = {"et":{"dictionary":{"Yellow marker":"Kollane marker","Green marker":"Roheline marker","Pink marker":"Roosa marker","Blue marker":"Sinine marker","Red pen":"Punane pliiats","Green pen":"Roheline pliiats","Remove highlight":"Eemalda esiletõstmine","Highlight":"Tõsta esile","Text highlight toolbar":"Teksti markeerimise tööriistariba"},getPluralForm(n){return (n != 1);}}};
e[ 'et' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'et' ].dictionary = Object.assign( e[ 'et' ].dictionary, dictionary );
e[ 'et' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
