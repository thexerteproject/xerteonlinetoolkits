/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en-au' ]: { dictionary, getPluralForm } } = {"en-au":{"dictionary":{"Unlink":"Unlink","Link":"Link","Link URL":"Link URL","Link URL must not be empty.":"","Link image":"Link image","Edit link":"Edit link","Open link in new tab":"Open link in new tab","Open in a new tab":"Open in a new tab","Downloadable":"Downloadable","Create link":"","Move out of a link":"","Link properties":"Link properties","Displayed text":"Displayed text","No links available":"No links available"},getPluralForm(n){return (n != 1);}}};
e[ 'en-au' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en-au' ].dictionary = Object.assign( e[ 'en-au' ].dictionary, dictionary );
e[ 'en-au' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
