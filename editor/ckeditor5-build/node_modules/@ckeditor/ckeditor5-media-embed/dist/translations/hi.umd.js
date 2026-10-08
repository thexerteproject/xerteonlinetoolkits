/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hi' ]: { dictionary, getPluralForm } } = {"hi":{"dictionary":{"media widget":"media widget","Media URL":"Media URL","Paste the media URL in the input.":"Paste the media URL in the input.","Tip: Paste the URL into the content to embed faster.":"Tip: Paste the URL into the content to embed faster.","The URL must not be empty.":"The URL must not be empty.","This media URL is not supported.":"This media URL is not supported.","Insert media":"Insert media","Media":"मीडिया","Media toolbar":"Media toolbar","Open media in new tab":"नए टैब में मीडिया खोलें","Media embed":"मीडिया एंबेड"},getPluralForm(n){return (n != 1);}}};
e[ 'hi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hi' ].dictionary = Object.assign( e[ 'hi' ].dictionary, dictionary );
e[ 'hi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
