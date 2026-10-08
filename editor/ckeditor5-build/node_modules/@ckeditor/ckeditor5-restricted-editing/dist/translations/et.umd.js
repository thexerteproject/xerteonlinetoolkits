/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'et' ]: { dictionary, getPluralForm } } = {"et":{"dictionary":{"Enable editing":"Luba muutmine","Previous editable region":"Eelmine muudetav piirkond","Next editable region":"Järgmine muudetav piirkond","Navigate editable regions":"Muudetavate piirkondade vahel liikumine","Disable inline editing":"Keela teksti muutmine","Enable inline editing":"Luba valitud teksti muutmine","Disable block editing":"Keela ploki muutmine","Enable block editing":"Luba valitud ploki muutmine","Disable editing":"Keela muutmine"},getPluralForm(n){return (n != 1);}}};
e[ 'et' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'et' ].dictionary = Object.assign( e[ 'et' ].dictionary, dictionary );
e[ 'et' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
