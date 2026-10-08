/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de' ]: { dictionary, getPluralForm } } = {"de":{"dictionary":{"Bookmark":"Lesezeichen","Edit bookmark":"Lesezeichen bearbeiten","Remove bookmark":"Lesezeichen entfernen","Bookmark name":"Name des Lesezeichens","Enter the bookmark name without spaces.":"Geben Sie den Namen des Lesezeichens ohne Leerzeichen ein.","Bookmark must not be empty.":"Das Lesezeichen darf nicht leer sein.","Bookmark name cannot contain space characters.":"Der Name des Lesezeichens darf keine Leerzeichen enthalten.","Bookmark name already exists.":"Der Lesezeichenname existiert bereits.","bookmark widget":"Lesezeichen-Widget","Bookmark toolbar":"Lesezeichen-Werkzeugleiste","Bookmarks":"Lesezeichen","No bookmarks available.":"Keine Lesezeichen verfügbar.","Scroll to bookmark":"Zu Lesezeichen scrollen"},getPluralForm(n){return (n != 1);}}};
e[ 'de' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de' ].dictionary = Object.assign( e[ 'de' ].dictionary, dictionary );
e[ 'de' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
