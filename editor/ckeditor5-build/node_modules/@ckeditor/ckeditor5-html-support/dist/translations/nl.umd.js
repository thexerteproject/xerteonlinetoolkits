/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'nl' ]: { dictionary, getPluralForm } } = {"nl":{"dictionary":{"HTML object":"HTML object"},getPluralForm(n){return (n != 1);}}};
e[ 'nl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'nl' ].dictionary = Object.assign( e[ 'nl' ].dictionary, dictionary );
e[ 'nl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
