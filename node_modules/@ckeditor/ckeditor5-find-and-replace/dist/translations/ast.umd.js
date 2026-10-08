/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ast' ]: { dictionary, getPluralForm } } = {"ast":{"dictionary":{"Find and replace":"","Find in text…":"","Find":"","Previous result":"","Next result":"","Replace":"","Replace all":"","Match case":"","Whole words only":"","Replace with…":"","Text to find must not be empty.":"","Tip: Find some text first in order to replace it.":"","Advanced options":"","Find in the document":""},getPluralForm(n){return (n != 1);}}};
e[ 'ast' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ast' ].dictionary = Object.assign( e[ 'ast' ].dictionary, dictionary );
e[ 'ast' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
