/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lt' ]: { dictionary, getPluralForm } } = {"lt":{"dictionary":{"Emoji":"Jaustukas","Show all emoji...":"Rodyti visus jaustukus...","Find an emoji (min. 2 characters)":"Rasti jaustuką (mažiausiai 2 ženklai)","No emojis were found matching \"%0\".":"Nerastas nė vienas jaustukas, atitinkantis \"[%0]\".","Keep on typing to see the emoji.":"Kad pamatytumėte jaustuką, toliau rinkite tekstą.","The query must contain at least two characters.":"Užklausoje turi būti bent 2 simboliai.","Smileys & Expressions":"Šypsenos ir išraiškos","Gestures & People":"Ženklai ir žmonės","Animals & Nature":"Gyvūnai ir gamta","Food & Drinks":"Maistas ir gėrimai","Travel & Places":"Kelionės ir vietos","Activities":"Veiklos","Objects":"Objektai","Symbols":"Simboliai","Flags":"Vėliavėlės","Select skin tone":"Pasirinkti spalvos toną","Default skin tone":"Numatytasis spalvos tonas","Light skin tone":"Šviesus spalvos tonas","Medium Light skin tone":"Vidutiniškai šviesus spalvos tonas","Medium skin tone":"Vidutinis spalvos tonas","Medium Dark skin tone":"Vidutiniškai tamsus spalvos tonas","Dark skin tone":"Tamsus spalvos tonas","Emoji picker":"Jausmaženklių pasirinkimas"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'lt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lt' ].dictionary = Object.assign( e[ 'lt' ].dictionary, dictionary );
e[ 'lt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
