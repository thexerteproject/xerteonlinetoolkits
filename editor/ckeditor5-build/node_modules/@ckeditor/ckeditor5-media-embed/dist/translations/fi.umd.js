/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fi' ]: { dictionary, getPluralForm } } = {"fi":{"dictionary":{"media widget":"mediawidget","Media URL":"Media-URL","Paste the media URL in the input.":"Liitä media-URL syötteeseen.","Tip: Paste the URL into the content to embed faster.":"Vinkki: liitä URL sisältöön upottaaksesi sen nopeammin.","The URL must not be empty.":"URL-osoite ei voi olla tyhjä.","This media URL is not supported.":"Tätä media-URLia ei tueta.","Insert media":"Liitä media","Media":"Media","Media toolbar":"Median työkalupalkki","Open media in new tab":"Avaa media uudessa välilehdessä","Media embed":"Median upotus"},getPluralForm(n){return (n != 1);}}};
e[ 'fi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fi' ].dictionary = Object.assign( e[ 'fi' ].dictionary, dictionary );
e[ 'fi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
