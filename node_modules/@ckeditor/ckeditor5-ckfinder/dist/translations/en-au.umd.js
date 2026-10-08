/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en-au' ]: { dictionary, getPluralForm } } = {"en-au":{"dictionary":{"Insert image or file":"Insert image or file","Could not obtain resized image URL.":"Could not obtain resized image URL.","Selecting resized image failed":"Selecting resized image failed","Could not insert image at the current position.":"Could not insert image at the current position.","Inserting image failed":"Inserting image failed"},getPluralForm(n){return (n != 1);}}};
e[ 'en-au' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en-au' ].dictionary = Object.assign( e[ 'en-au' ].dictionary, dictionary );
e[ 'en-au' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
