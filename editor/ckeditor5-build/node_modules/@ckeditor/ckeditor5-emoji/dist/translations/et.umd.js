/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'et' ]: { dictionary, getPluralForm } } = {"et":{"dictionary":{"Emoji":"Emoji","Show all emoji...":"Kuva kõik emojid ..","Find an emoji (min. 2 characters)":"Otsi emojit (vajalikud vähemalt 2 tärki)","No emojis were found matching \"%0\".":"Ei leitud ühtki emojid, mis vastaks sõnale \"%0\".","Keep on typing to see the emoji.":"Emoji nägemiseks jätkake tippimist.","The query must contain at least two characters.":"Päring peab sisaldama vähemalt kahte tärki.","Smileys & Expressions":"Naerunäod ja ilmed","Gestures & People":"Žestid ja inimesed","Animals & Nature":"Loomad ja loodus","Food & Drinks":"Toit ja jook","Travel & Places":"Reisimine ja paigad","Activities":"Tegevused","Objects":"Esemed","Symbols":"Sümbolid","Flags":"Lipud","Select skin tone":"Vali nahatoon","Default skin tone":"Vaikimisi nahatoon","Light skin tone":"Hele nahatoon","Medium Light skin tone":"Keskmiselt hele nahatoon","Medium skin tone":"Keskmine nahatoon","Medium Dark skin tone":"Keskmiselt tume nahatoon","Dark skin tone":"Tume nahatoon","Emoji picker":"Emotikoni valija"},getPluralForm(n){return (n != 1);}}};
e[ 'et' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'et' ].dictionary = Object.assign( e[ 'et' ].dictionary, dictionary );
e[ 'et' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
