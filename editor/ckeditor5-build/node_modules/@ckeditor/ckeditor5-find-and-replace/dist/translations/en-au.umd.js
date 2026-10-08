/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en-au' ]: { dictionary, getPluralForm } } = {"en-au":{"dictionary":{"Find and replace":"Find and replace","Find in text…":"Find in text…","Find":"Find","Previous result":"Previous result","Next result":"Next result","Replace":"Replace","Replace all":"Replace all","Match case":"Match case","Whole words only":"Whole words only","Replace with…":"Replace with…","Text to find must not be empty.":"Text to find must not be empty.","Tip: Find some text first in order to replace it.":"Tip: Find some text first in order to replace it.","Advanced options":"","Find in the document":""},getPluralForm(n){return (n != 1);}}};
e[ 'en-au' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en-au' ].dictionary = Object.assign( e[ 'en-au' ].dictionary, dictionary );
e[ 'en-au' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
