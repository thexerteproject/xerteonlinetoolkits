/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pl' ]: { dictionary, getPluralForm } } = {"pl":{"dictionary":{"Enable editing":"Odblokuj edycję","Previous editable region":"Poprzednie pole do edycji","Next editable region":"Następne pole do edycji","Navigate editable regions":"Przejdź między polami do edycji","Disable inline editing":"Zablokuj edycję w tekście","Enable inline editing":"Odblokuj edycję w tekście","Disable block editing":"Zablokuj edycję bloku","Enable block editing":"Odblokuj edycję bloku","Disable editing":"Zablokuj edycję"},getPluralForm(n){return (n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'pl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pl' ].dictionary = Object.assign( e[ 'pl' ].dictionary, dictionary );
e[ 'pl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
