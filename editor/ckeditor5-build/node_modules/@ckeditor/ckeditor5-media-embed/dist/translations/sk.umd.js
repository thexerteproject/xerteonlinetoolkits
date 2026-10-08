/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sk' ]: { dictionary, getPluralForm } } = {"sk":{"dictionary":{"media widget":"Nástroj pre médiá","Media URL":"URL média","Paste the media URL in the input.":"Vložte URL média.","Tip: Paste the URL into the content to embed faster.":"Tip: URL adresu média vložte do obsahu.","The URL must not be empty.":"Musíte zadať URL.","This media URL is not supported.":"URL média nie je podporovaná.","Insert media":"Vložiť média","Media":"Médiá","Media toolbar":"Nástroje pre médiá","Open media in new tab":"Otvoriť médiá na novej karte","Media embed":"Vloženie médií"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'sk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sk' ].dictionary = Object.assign( e[ 'sk' ].dictionary, dictionary );
e[ 'sk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
