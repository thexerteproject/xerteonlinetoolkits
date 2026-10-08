/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hr' ]: { dictionary, getPluralForm } } = {"hr":{"dictionary":{"Insert image or file":"Umetni sliku ili datoteku","Could not obtain resized image URL.":"Nije moguće dohvatiti URL slike s promijenjenom veličinom","Selecting resized image failed":"Odabir slike s promijenjenom veličinom nije uspjelo","Could not insert image at the current position.":"Nije moguće umetnuti sliku na trenutnu poziciju","Inserting image failed":"Umetanje slike nije uspjelo"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'hr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hr' ].dictionary = Object.assign( e[ 'hr' ].dictionary, dictionary );
e[ 'hr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
