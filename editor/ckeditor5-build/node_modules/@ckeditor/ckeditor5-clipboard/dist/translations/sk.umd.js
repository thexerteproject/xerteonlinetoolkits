/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sk' ]: { dictionary, getPluralForm } } = {"sk":{"dictionary":{"Copy selected content":"Skopírovať vybraný obsah","Paste content":"Prilepiť obsah","Paste content as plain text":"Prilepiť obsah iba ako text"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'sk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sk' ].dictionary = Object.assign( e[ 'sk' ].dictionary, dictionary );
e[ 'sk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
