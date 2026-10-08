/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'km' ]: { dictionary, getPluralForm } } = {"km":{"dictionary":{"Enter fullscreen mode":"","Leave fullscreen mode":"","Fullscreen mode":"","Toggle fullscreen mode":"","Document outline":"","Connected users":"","Show left sidebar":"","Hide left sidebar":"","Toggle sidebar":""},getPluralForm(n){return 0;}}};
e[ 'km' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'km' ].dictionary = Object.assign( e[ 'km' ].dictionary, dictionary );
e[ 'km' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
