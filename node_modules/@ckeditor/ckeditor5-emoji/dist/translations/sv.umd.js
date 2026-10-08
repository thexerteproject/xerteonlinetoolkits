/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sv' ]: { dictionary, getPluralForm } } = {"sv":{"dictionary":{"Emoji":"Emoji","Show all emoji...":"Visa alla emojis ...","Find an emoji (min. 2 characters)":"Hitta en emoji (minst 2 tecken)","No emojis were found matching \"%0\".":"Inga emojis motsvarande \"%0\" fanns.","Keep on typing to see the emoji.":"Fortsätt att skriva för att se emojin.","The query must contain at least two characters.":"Frågan måste innehålla minst två tecken.","Smileys & Expressions":"Smileys och uttryck","Gestures & People":"Gester och personer","Animals & Nature":"Djur och natur","Food & Drinks":"Mat och dryck","Travel & Places":"Resor och platser","Activities":"Aktiviteter","Objects":"Objekt","Symbols":"Symboler","Flags":"Flaggor","Select skin tone":"Välj hudton","Default skin tone":"Standardhudton","Light skin tone":"Ljus hudton","Medium Light skin tone":"Medelljus hudton","Medium skin tone":"Mediumhudton","Medium Dark skin tone":"Medelmörk hudton","Dark skin tone":"Mörk hudton","Emoji picker":"Emojiväljare"},getPluralForm(n){return (n != 1);}}};
e[ 'sv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sv' ].dictionary = Object.assign( e[ 'sv' ].dictionary, dictionary );
e[ 'sv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
