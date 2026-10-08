/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bg' ]: { dictionary, getPluralForm } } = {"bg":{"dictionary":{"Saving changes":"Запазване на промените"},getPluralForm(n){return (n != 1);}}};
e[ 'bg' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bg' ].dictionary = Object.assign( e[ 'bg' ].dictionary, dictionary );
e[ 'bg' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
