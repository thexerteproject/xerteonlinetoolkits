/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'si' ]: { dictionary, getPluralForm } } = {"si":{"dictionary":{"Insert image or file":"","Could not obtain resized image URL.":"","Selecting resized image failed":"","Could not insert image at the current position.":"","Inserting image failed":""},getPluralForm(n){return (n != 1);}}};
e[ 'si' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'si' ].dictionary = Object.assign( e[ 'si' ].dictionary, dictionary );
e[ 'si' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
