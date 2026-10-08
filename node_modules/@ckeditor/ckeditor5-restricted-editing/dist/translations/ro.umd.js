/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ro' ]: { dictionary, getPluralForm } } = {"ro":{"dictionary":{"Enable editing":"Activează editarea","Previous editable region":"Regiunea editabilă precedentă","Next editable region":"Regiunea editabilă următoare","Navigate editable regions":"Navighează la regiunile editabile","Disable inline editing":"Dezactivați editarea inline (în interiorul textului)","Enable inline editing":"Activați editarea inline (în interiorul textului)","Disable block editing":"Dezactivați editarea blocurilor","Enable block editing":"Activați editarea blocurilor","Disable editing":"Dezactivați editarea"},getPluralForm(n){return (n == 1 ? 0 : (n == 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2);}}};
e[ 'ro' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ro' ].dictionary = Object.assign( e[ 'ro' ].dictionary, dictionary );
e[ 'ro' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
