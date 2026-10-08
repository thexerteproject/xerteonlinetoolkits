/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'it' ]: { dictionary, getPluralForm } } = {"it":{"dictionary":{"media widget":"widget media","Media URL":"URL media","Paste the media URL in the input.":"Incolla l'URL del file multimediale nell'input.","Tip: Paste the URL into the content to embed faster.":"Consiglio: incolla l'URL nel contenuto per un'incorporazione più veloce.","The URL must not be empty.":"L'URL non può essere vuoto.","This media URL is not supported.":"Questo URL di file multimediali non è supportato.","Insert media":"Inserisci media","Media":"Media","Media toolbar":"Barra degli strumenti degli elementi multimediali","Open media in new tab":"Apri media in nuova scheda","Media embed":"Incorporamento multimediale"},getPluralForm(n){return (n != 1);}}};
e[ 'it' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'it' ].dictionary = Object.assign( e[ 'it' ].dictionary, dictionary );
e[ 'it' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
