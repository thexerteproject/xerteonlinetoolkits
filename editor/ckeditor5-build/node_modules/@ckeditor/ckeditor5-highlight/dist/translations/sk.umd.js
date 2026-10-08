/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sk' ]: { dictionary, getPluralForm } } = {"sk":{"dictionary":{"Yellow marker":"Žltý zvýrazňovač","Green marker":"Zelený zvýrazňovač","Pink marker":"Ružový zvýrazňovač","Blue marker":"Modrý zvýrazňovač","Red pen":"Červené pero","Green pen":"Zelené pero","Remove highlight":"Odstrániť zvýraznenie","Highlight":"Zvýraznenie","Text highlight toolbar":"Panel nástrojov zvýraznenia textu"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'sk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sk' ].dictionary = Object.assign( e[ 'sk' ].dictionary, dictionary );
e[ 'sk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
