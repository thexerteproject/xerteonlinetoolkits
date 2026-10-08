/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'jv' ]: { dictionary, getPluralForm } } = {"jv":{"dictionary":{"media widget":"","Media URL":"","Paste the media URL in the input.":"","Tip: Paste the URL into the content to embed faster.":"","The URL must not be empty.":"","This media URL is not supported.":"","Insert media":"","Media":"","Media toolbar":"","Open media in new tab":"","Media embed":""},getPluralForm(n){return (n !== 0);}}};
e[ 'jv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'jv' ].dictionary = Object.assign( e[ 'jv' ].dictionary, dictionary );
e[ 'jv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
