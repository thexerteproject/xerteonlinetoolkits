/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'cs' ]: { dictionary, getPluralForm } } = {"cs":{"dictionary":{"media widget":"ovládací prvek médií","Media URL":"URL adresa","Paste the media URL in the input.":"Vložte URL média do vstupního pole.","Tip: Paste the URL into the content to embed faster.":"Rada: Vložte URL přímo do editoru pro rychlejší vnoření.","The URL must not be empty.":"URL adresa musí být vyplněna.","This media URL is not supported.":"Tato adresa bohužel není podporována.","Insert media":"Vložit média","Media":"Média","Media toolbar":"Panel nástrojů médií","Open media in new tab":"Otevřete média na nové kartě","Media embed":"Vložení médií"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'cs' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'cs' ].dictionary = Object.assign( e[ 'cs' ].dictionary, dictionary );
e[ 'cs' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
