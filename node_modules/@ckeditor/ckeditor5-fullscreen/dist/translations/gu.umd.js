/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'gu' ]: { dictionary, getPluralForm } } = {"gu":{"dictionary":{"Enter fullscreen mode":"","Leave fullscreen mode":"","Fullscreen mode":"","Toggle fullscreen mode":"","Document outline":"","Connected users":"","Show left sidebar":"","Hide left sidebar":"","Toggle sidebar":""},getPluralForm(n){return (n != 1);}}};
e[ 'gu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'gu' ].dictionary = Object.assign( e[ 'gu' ].dictionary, dictionary );
e[ 'gu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
