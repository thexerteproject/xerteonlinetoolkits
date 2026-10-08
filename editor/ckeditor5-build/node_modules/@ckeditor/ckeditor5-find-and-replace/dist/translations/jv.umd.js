/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'jv' ]: { dictionary, getPluralForm } } = {"jv":{"dictionary":{"Find and replace":"Pados lan gantos","Find in text…":"Pados ing seratan","Find":"Pados","Previous result":"Kasil saderengipun","Next result":"Kasil salajengipun","Replace":"Gantos","Replace all":"Gantos sedaya","Match case":"Samikaken aksara","Whole words only":"Sedayaning ukanten","Replace with…":"Gantos kaliyan...","Text to find must not be empty.":"Seratan ingkang dipunpadosi mboten angsal kosong.","Tip: Find some text first in order to replace it.":"","Advanced options":"","Find in the document":""},getPluralForm(n){return (n !== 0);}}};
e[ 'jv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'jv' ].dictionary = Object.assign( e[ 'jv' ].dictionary, dictionary );
e[ 'jv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
