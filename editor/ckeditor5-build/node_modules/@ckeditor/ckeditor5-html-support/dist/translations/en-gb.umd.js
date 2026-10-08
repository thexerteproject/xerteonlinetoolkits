/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en-gb' ]: { dictionary, getPluralForm } } = {"en-gb":{"dictionary":{"HTML object":""},getPluralForm(n){return (n != 1);}}};
e[ 'en-gb' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en-gb' ].dictionary = Object.assign( e[ 'en-gb' ].dictionary, dictionary );
e[ 'en-gb' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
