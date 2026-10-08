/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en-au' ]: { dictionary, getPluralForm } } = {"en-au":{"dictionary":{"Yellow marker":"Yellow marker","Green marker":"Green marker","Pink marker":"Pink marker","Blue marker":"Blue marker","Red pen":"Red pen","Green pen":"Green pen","Remove highlight":"Remove highlight","Highlight":"Highlight","Text highlight toolbar":"Text highlight toolbar"},getPluralForm(n){return (n != 1);}}};
e[ 'en-au' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en-au' ].dictionary = Object.assign( e[ 'en-au' ].dictionary, dictionary );
e[ 'en-au' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
