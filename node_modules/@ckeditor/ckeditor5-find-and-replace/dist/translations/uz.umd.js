/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'uz' ]: { dictionary, getPluralForm } } = {"uz":{"dictionary":{"Find and replace":"","Find in text…":"","Find":"","Previous result":"","Next result":"","Replace":"","Replace all":"","Match case":"","Whole words only":"","Replace with…":"","Text to find must not be empty.":"","Tip: Find some text first in order to replace it.":"","Advanced options":"","Find in the document":""},getPluralForm(n){return (n > 1);}}};
e[ 'uz' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'uz' ].dictionary = Object.assign( e[ 'uz' ].dictionary, dictionary );
e[ 'uz' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
