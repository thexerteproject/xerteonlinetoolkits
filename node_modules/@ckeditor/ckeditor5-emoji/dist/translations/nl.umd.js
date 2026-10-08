/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'nl' ]: { dictionary, getPluralForm } } = {"nl":{"dictionary":{"Emoji":"Emoji","Show all emoji...":"Toon alle emoji...","Find an emoji (min. 2 characters)":"Vind een emoji (min. 2 tekens)","No emojis were found matching \"%0\".":"Er zijn geen emoji gevonden overeenkomend met \"%0\".","Keep on typing to see the emoji.":"Blijf typen om de emoji te zien.","The query must contain at least two characters.":"De zoekopdracht moet ten minste 2 tekens bevatten.","Smileys & Expressions":"Smileys & gezichtsuitdrukkingen","Gestures & People":"Gebaren & mensen","Animals & Nature":"Dieren & natuur","Food & Drinks":"Eten & drinken","Travel & Places":"Reizen & plaatsen","Activities":"Activiteiten","Objects":"Objecten","Symbols":"Symbolen","Flags":"Vlaggen","Select skin tone":"Selecteer huidskleur","Default skin tone":"Standaard huidskleur","Light skin tone":"Lichte huidskleur","Medium Light skin tone":"Redelijk lichte huidskleur","Medium skin tone":"Gemiddeld getinte huidskleur","Medium Dark skin tone":"Redelijk donkere huidskleur","Dark skin tone":"Donkere huidskleur","Emoji picker":"Emoji-kiezer"},getPluralForm(n){return (n != 1);}}};
e[ 'nl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'nl' ].dictionary = Object.assign( e[ 'nl' ].dictionary, dictionary );
e[ 'nl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
