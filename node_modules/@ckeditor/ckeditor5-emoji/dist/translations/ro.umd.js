/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ro' ]: { dictionary, getPluralForm } } = {"ro":{"dictionary":{"Emoji":"Emoji","Show all emoji...":"Arată toate emoji...","Find an emoji (min. 2 characters)":"Găsește un emoji (min. 2 caractere)","No emojis were found matching \"%0\".":"Nu s-a găsit niciun emoji pentru \"%0\".","Keep on typing to see the emoji.":"Mai încearcă să vezi emoji.","The query must contain at least two characters.":"Interogarea trebuie să conțină cel puțin două caractere.","Smileys & Expressions":"Smiley și expresii","Gestures & People":"Gesturi și oameni","Animals & Nature":"Animale și natură","Food & Drinks":"Mâncare și băuturi","Travel & Places":"Călătorii și locuri","Activities":"Activități","Objects":"Obiecte","Symbols":"Sim","Flags":"Steaguri","Select skin tone":"Selectează tonul pielii","Default skin tone":"Ton de piele implicit","Light skin tone":"Ton de piele deschis","Medium Light skin tone":"Ton de piele mediu-deschis","Medium skin tone":"Ton de piele mediu","Medium Dark skin tone":"Ton de piele mediu-închis","Dark skin tone":"Ton de piele închis","Emoji picker":"Selector emoji"},getPluralForm(n){return (n == 1 ? 0 : (n == 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2);}}};
e[ 'ro' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ro' ].dictionary = Object.assign( e[ 'ro' ].dictionary, dictionary );
e[ 'ro' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
