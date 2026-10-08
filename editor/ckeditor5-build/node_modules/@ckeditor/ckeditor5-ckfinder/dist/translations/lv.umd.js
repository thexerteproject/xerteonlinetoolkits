/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lv' ]: { dictionary, getPluralForm } } = {"lv":{"dictionary":{"Insert image or file":"Ievietot attēlu vai failu","Could not obtain resized image URL.":"Nevarēja iegūt mērogotā attēla adresi.","Selecting resized image failed":"Nevarēja izvēlēties mērogoto attēlu.","Could not insert image at the current position.":"Pašreizējā pozīcijā attēlu nevarēja ievietot.","Inserting image failed":"Nevarēja ievietot attēlu"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2);}}};
e[ 'lv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lv' ].dictionary = Object.assign( e[ 'lv' ].dictionary, dictionary );
e[ 'lv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
