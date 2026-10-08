/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lv' ]: { dictionary, getPluralForm } } = {"lv":{"dictionary":{"Yellow marker":"Dzeltens marķieris","Green marker":"Zaļš marķieris","Pink marker":"Rozā marķieris","Blue marker":"Zils marķieris","Red pen":"Sarkana pildspalva","Green pen":"Zaļa pildspalva","Remove highlight":"Noņemt izcēlumu","Highlight":"Izcelt","Text highlight toolbar":"Teksta izcēluma rīkjosla"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2);}}};
e[ 'lv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lv' ].dictionary = Object.assign( e[ 'lv' ].dictionary, dictionary );
e[ 'lv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
