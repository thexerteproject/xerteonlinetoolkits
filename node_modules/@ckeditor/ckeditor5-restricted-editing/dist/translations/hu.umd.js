/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hu' ]: { dictionary, getPluralForm } } = {"hu":{"dictionary":{"Enable editing":"Szerkesztés engedélyezése","Previous editable region":"Előző szerkeszthető terület","Next editable region":"Következő szerkeszthető terület","Navigate editable regions":"Szerkeszthető területek navigálása","Disable inline editing":"Közvetlen szerkesztés letiltása","Enable inline editing":"Közvetlen szerkesztés engedélyezése","Disable block editing":"Blokk szerkesztésének letiltása","Enable block editing":"Blokk szerkesztésének engedélyezése","Disable editing":"Szerkesztés letiltása"},getPluralForm(n){return (n != 1);}}};
e[ 'hu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hu' ].dictionary = Object.assign( e[ 'hu' ].dictionary, dictionary );
e[ 'hu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
