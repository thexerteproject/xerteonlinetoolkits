/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'eo' ]: { dictionary, getPluralForm } } = {"eo":{"dictionary":{"Remove Format":""},getPluralForm(n){return (n != 1);}}};
e[ 'eo' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'eo' ].dictionary = Object.assign( e[ 'eo' ].dictionary, dictionary );
e[ 'eo' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
