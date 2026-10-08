/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lv' ]: { dictionary, getPluralForm } } = {"lv":{"dictionary":{"Emoji":"Emocijzīme","Show all emoji...":"Rādīt visas emocijzīmes...","Find an emoji (min. 2 characters)":"Atrast emocijzīmi (vismaz 2 rakstu zīmes)","No emojis were found matching \"%0\".":"Netika atrasta neviena emocijzīme, kas atbilstu \"%0\".","Keep on typing to see the emoji.":"Turpini rakstīt, lai ieraudzītu emocijzīmi.","The query must contain at least two characters.":"Pieprasījumā ir jābūt vismaz 2 rakstu zīmēm.","Smileys & Expressions":"Smaidiņi & Emocijas","Gestures & People":"Žesti & Cilvēki","Animals & Nature":"Dzīvnieki & Daba","Food & Drinks":"Ēdieni & Dzērieni","Travel & Places":"Ceļojumi & Vietas","Activities":"Darbības","Objects":"Objekti","Symbols":"Simboli","Flags":"Karogi","Select skin tone":"Izvēlies ietvara toni","Default skin tone":"Noklusējuma ietvara tonis","Light skin tone":"Gaišs ietvara tonis","Medium Light skin tone":"Vidēji Gaišs ietvara tonis","Medium skin tone":"Vidējs ietvara tonis","Medium Dark skin tone":"Vidēji Tumšs ietvara tonis","Dark skin tone":"Tumšs ietvara tonis","Emoji picker":"Emocijzīmju atlasītājs"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2);}}};
e[ 'lv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lv' ].dictionary = Object.assign( e[ 'lv' ].dictionary, dictionary );
e[ 'lv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
