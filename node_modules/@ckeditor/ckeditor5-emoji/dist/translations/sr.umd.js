/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sr' ]: { dictionary, getPluralForm } } = {"sr":{"dictionary":{"Emoji":"Emotikon","Show all emoji...":"Prikaži sve emotikone","Find an emoji (min. 2 characters)":"Pronađi emotikon (min. 2 znaka)","No emojis were found matching \"%0\".":"Nije pronađen nijedan emotikon koji odgovara „%0“.","Keep on typing to see the emoji.":"Nastavite da kucate da biste videli emotikone.","The query must contain at least two characters.":"Upit mora da sadrži najmanje dva znaka","Smileys & Expressions":"Smajliji i izrazi","Gestures & People":"Gestovi i ljudi","Animals & Nature":"Životinje i priroda","Food & Drinks":"Hrana i piće","Travel & Places":"Putovanje i mesta","Activities":"Aktivnosti","Objects":"Predmeti","Symbols":"Simboli","Flags":"Zastave","Select skin tone":"Izaberite ton kože","Default skin tone":"Podrazumevani ton kože","Light skin tone":"Svetli ton kože","Medium Light skin tone":"Srednje svetli ton kože","Medium skin tone":"Srednji ton kože","Medium Dark skin tone":"Srednje tamni ton kože","Dark skin tone":"Tamni ton kože","Emoji picker":"Birač emodžija"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'sr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sr' ].dictionary = Object.assign( e[ 'sr' ].dictionary, dictionary );
e[ 'sr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
