/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sv' ]: { dictionary, getPluralForm } } = {"sv":{"dictionary":{"Enable editing":"Aktivera redigering","Previous editable region":"Föregående redigerbara område","Next editable region":"Nästa redigerbara område","Navigate editable regions":"Navigera redigerbara områden","Disable inline editing":"Inaktivera direktredigering","Enable inline editing":"Aktivera direktredigering","Disable block editing":"Inaktivera blockredigering","Enable block editing":"Aktivera blockredigering","Disable editing":"Stäng av redigering"},getPluralForm(n){return (n != 1);}}};
e[ 'sv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sv' ].dictionary = Object.assign( e[ 'sv' ].dictionary, dictionary );
e[ 'sv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
