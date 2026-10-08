/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sk' ]: { dictionary, getPluralForm } } = {"sk":{"dictionary":{"Emoji":"Emotikon","Show all emoji...":"Zobraziť všetky emotikony...","Find an emoji (min. 2 characters)":"Nájsť emotikon (min. 2 znaky)","No emojis were found matching \"%0\".":"Nenašli sa žiadne emotikony zodpovedajúce výrazu „%0“.","Keep on typing to see the emoji.":"Pokračujte v písaní, aby ste videli emotikony.","The query must contain at least two characters.":"Dotaz musí obsahovať aspoň dva znaky.","Smileys & Expressions":"Smajlíky a výrazy","Gestures & People":"Gestá a ľudia","Animals & Nature":"Zvieratá a príroda","Food & Drinks":"Jedlá a nápoje","Travel & Places":"Cestovanie a miesta","Activities":"Aktivity","Objects":"Objekty","Symbols":"Symboly","Flags":"Zástavy","Select skin tone":"Vyberte tón pleti","Default skin tone":"Predvolený tón pleti","Light skin tone":"Svetlý tón pleti","Medium Light skin tone":"Stredne svetlý tón pleti","Medium skin tone":"Stredný tón pleti","Medium Dark skin tone":"Stredne tmavý tón pleti","Dark skin tone":"Tmavý tón pleti","Emoji picker":"Výber emodži"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'sk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sk' ].dictionary = Object.assign( e[ 'sk' ].dictionary, dictionary );
e[ 'sk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
