/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hu' ]: { dictionary, getPluralForm } } = {"hu":{"dictionary":{"media widget":"Média widget","Media URL":"Média URL","Paste the media URL in the input.":"Illessze be a média URL-jét.","Tip: Paste the URL into the content to embed faster.":"Tipp: Illessze be a média URL-jét a tartalomba.","The URL must not be empty.":"Az URL nem lehet üres.","This media URL is not supported.":"Ez a média URL típus nem támogatott.","Insert media":"Média beszúrása","Media":"Média","Media toolbar":"Média eszköztár","Open media in new tab":"Nyissa meg a médiát új lapon","Media embed":"Média beágyazása"},getPluralForm(n){return (n != 1);}}};
e[ 'hu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hu' ].dictionary = Object.assign( e[ 'hu' ].dictionary, dictionary );
e[ 'hu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
