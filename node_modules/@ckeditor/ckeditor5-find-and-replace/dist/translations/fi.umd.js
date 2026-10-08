/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fi' ]: { dictionary, getPluralForm } } = {"fi":{"dictionary":{"Find and replace":"Etsi ja korvaa","Find in text…":"Etsi tekstissä…","Find":"Etsi","Previous result":"Edellinen tulos","Next result":"Seuraava tulos","Replace":"Korvaa","Replace all":"Korvaa kaikki","Match case":"Hae tapaukselle vastapari","Whole words only":"Vain kokonaisia sanoja","Replace with…":"Korvaa tällä…","Text to find must not be empty.":"Haettava teksti ei saa olla tyhjä.","Tip: Find some text first in order to replace it.":"Vinkki: hae ensin teksti korvataksesi sen.","Advanced options":"Lisäasetukset","Find in the document":"Paikanna asiakirjassa"},getPluralForm(n){return (n != 1);}}};
e[ 'fi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fi' ].dictionary = Object.assign( e[ 'fi' ].dictionary, dictionary );
e[ 'fi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
