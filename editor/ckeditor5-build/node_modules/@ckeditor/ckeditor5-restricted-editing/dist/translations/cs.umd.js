/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'cs' ]: { dictionary, getPluralForm } } = {"cs":{"dictionary":{"Enable editing":"Povolit úpravy","Previous editable region":"Předchozí upravitelná oblast","Next editable region":"Následující upravitelná oblast","Navigate editable regions":"Procházet upravitelnými oblastmi","Disable inline editing":"Zakázat úpravy v textu","Enable inline editing":"Povolit inline úpravy","Disable block editing":"Zakázat blokové úpravy","Enable block editing":"Povolit blokové úpravy","Disable editing":"Zakázat úpravy"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'cs' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'cs' ].dictionary = Object.assign( e[ 'cs' ].dictionary, dictionary );
e[ 'cs' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
