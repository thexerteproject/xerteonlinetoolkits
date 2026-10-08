/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'jv' ]: { dictionary, getPluralForm } } = {"jv":{"dictionary":{"Unlink":"","Link":"","Link URL":"","Link URL must not be empty.":"","Link image":"","Edit link":"","Open link in new tab":"","Open in a new tab":"","Downloadable":"","Create link":"","Move out of a link":"","Link properties":"","Displayed text":"","No links available":""},getPluralForm(n){return (n !== 0);}}};
e[ 'jv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'jv' ].dictionary = Object.assign( e[ 'jv' ].dictionary, dictionary );
e[ 'jv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
