/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ku' ]: { dictionary, getPluralForm } } = {"ku":{"dictionary":{"Align left":"بەهێڵکردنی چەپ","Align right":"بەهێڵکردنی ڕاست","Align center":"بەهێڵکردنی ناورەڕاست","Justify":"هاوستوونی","Text alignment":"ڕیززکردنی تێکست","Text alignment toolbar":"تووڵامرازی ڕیززکردنی تێکست"},getPluralForm(n){return (n != 1);}}};
e[ 'ku' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ku' ].dictionary = Object.assign( e[ 'ku' ].dictionary, dictionary );
e[ 'ku' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
