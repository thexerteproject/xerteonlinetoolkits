/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en-gb' ]: { dictionary, getPluralForm } } = {"en-gb":{"dictionary":{"media widget":"Media widget","Media URL":"Media URL","Paste the media URL in the input.":"Paste the media URL in the input.","Tip: Paste the URL into the content to embed faster.":"Tip: Paste the URL into the content to embed faster.","The URL must not be empty.":"The URL must not be empty.","This media URL is not supported.":"This media URL is not supported.","Insert media":"Insert media","Media":"","Media toolbar":"","Open media in new tab":"","Media embed":"Media embed"},getPluralForm(n){return (n != 1);}}};
e[ 'en-gb' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en-gb' ].dictionary = Object.assign( e[ 'en-gb' ].dictionary, dictionary );
e[ 'en-gb' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
