/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'it' ]: { dictionary, getPluralForm } } = {"it":{"dictionary":{"Bookmark":"Segnalibro","Edit bookmark":"Modifica segnalibro","Remove bookmark":"Rimuovi segnalibro","Bookmark name":"Aggiungi ai preferiti il nome","Enter the bookmark name without spaces.":"Inserisci il nome del segnalibro senza spazi.","Bookmark must not be empty.":"Il segnalibro non deve essere vuoto.","Bookmark name cannot contain space characters.":"Il nome del segnalibro non può contenere spazi.","Bookmark name already exists.":"Il nome del segnalibro esiste già.","bookmark widget":"widget segnalibro","Bookmark toolbar":"Barra degli strumenti dei segnalibri","Bookmarks":"Segnalibri","No bookmarks available.":"Nessun segnalibro disponibile.","Scroll to bookmark":"Scorri fino al segnalibro"},getPluralForm(n){return (n != 1);}}};
e[ 'it' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'it' ].dictionary = Object.assign( e[ 'it' ].dictionary, dictionary );
e[ 'it' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
