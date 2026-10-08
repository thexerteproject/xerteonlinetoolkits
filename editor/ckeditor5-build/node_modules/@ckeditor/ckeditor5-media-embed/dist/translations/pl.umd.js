/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pl' ]: { dictionary, getPluralForm } } = {"pl":{"dictionary":{"media widget":"widget osadzenia mediów","Media URL":"Adres URL","Paste the media URL in the input.":"Wklej adres URL mediów do pola.","Tip: Paste the URL into the content to embed faster.":"Wskazówka: Wklej URL do treści edytora, by łatwiej osadzić media.","The URL must not be empty.":"Adres URL nie może być pusty.","This media URL is not supported.":"Ten rodzaj adresu URL nie jest obsługiwany.","Insert media":"Wstaw media","Media":"Nośniki","Media toolbar":"Pasek narzędzi mediów","Open media in new tab":"Otwórz media w nowej zakładce","Media embed":"Osadzanie multimediów"},getPluralForm(n){return (n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'pl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pl' ].dictionary = Object.assign( e[ 'pl' ].dictionary, dictionary );
e[ 'pl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
