/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'it' ]: { dictionary, getPluralForm } } = {"it":{"dictionary":{"Unlink":"Elimina collegamento","Link":"Collegamento","Link URL":"URL del collegamento","Link URL must not be empty.":"L'URL del link non può essere lasciato in bianco.","Link image":"Collega immagine","Edit link":"Modifica collegamento","Open link in new tab":"Apri collegamento in nuova scheda","Open in a new tab":"Apri in una nuova scheda","Downloadable":"Scaricabile","Create link":"Crea un link","Move out of a link":"Esce da un link","Link properties":"Proprietà del link","Displayed text":"Testo visualizzato","No links available":"Nessun link disponibile"},getPluralForm(n){return (n != 1);}}};
e[ 'it' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'it' ].dictionary = Object.assign( e[ 'it' ].dictionary, dictionary );
e[ 'it' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
