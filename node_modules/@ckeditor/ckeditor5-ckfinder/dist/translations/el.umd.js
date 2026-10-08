/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Insert image or file":"Εισαγωγή εικόνας ή αρχείου","Could not obtain resized image URL.":"Αδύνατη η λήψη URL εικόνας με αλλαγμένο μέγεθος.","Selecting resized image failed":"Η επιλογή εικόνας με αλλαγμένο μέγεθος απέτυχε","Could not insert image at the current position.":"Αδύνατη η εισαγωγή εικόνας στην τρέχουσα θέση.","Inserting image failed":"Η εισαγωγή εικόνας απέτυχε."},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
