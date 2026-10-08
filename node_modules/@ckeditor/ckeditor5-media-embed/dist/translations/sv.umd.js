/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sv' ]: { dictionary, getPluralForm } } = {"sv":{"dictionary":{"media widget":"mediewidget","Media URL":"Medie-URL","Paste the media URL in the input.":"Klistra in medie-URL:en i indata.","Tip: Paste the URL into the content to embed faster.":"Tips: Klistra in URL:en i innehållet för snabbare inbäddning.","The URL must not be empty.":"URL:en får inte vara tom.","This media URL is not supported.":"Medie-URL:en stöds inte.","Insert media":"Lägg in media","Media":"Media","Media toolbar":"Medieverktygsfält","Open media in new tab":"Öppna media i ny flik","Media embed":"Medieinbäddning"},getPluralForm(n){return (n != 1);}}};
e[ 'sv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sv' ].dictionary = Object.assign( e[ 'sv' ].dictionary, dictionary );
e[ 'sv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
