/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de' ]: { dictionary, getPluralForm } } = {"de":{"dictionary":{"Emoji":"Emojis","Show all emoji...":"Alle Emojis anzeigen ...","Find an emoji (min. 2 characters)":"Emoji finden (min. 2 Zeichen)","No emojis were found matching \"%0\".":"Es wurden keine Emojis gefunden, die zu „%0“ passen.","Keep on typing to see the emoji.":"Weiteren Text eingeben, damit Emojis angezeigt werden.","The query must contain at least two characters.":"Die Anfrage muss aus mindestens zwei Zeichen bestehen.","Smileys & Expressions":"Smileys und Emotionen","Gestures & People":"Gesten und Personen","Animals & Nature":"Tiere und Natur","Food & Drinks":"Speisen und Getränke","Travel & Places":"Reisen und Orte","Activities":"Aktivitäten","Objects":"Objekte","Symbols":"Symbole","Flags":"Flaggen","Select skin tone":"Hautfarbe wählen","Default skin tone":"Standardhautfarbe","Light skin tone":"Helle Hautfarbe","Medium Light skin tone":"Mittelhelle Hautfarbe","Medium skin tone":"Mittlere Hautfarbe","Medium Dark skin tone":"Mitteldunkle Hautfarbe","Dark skin tone":"Dunkle Hautfarbe","Emoji picker":"Emoji-Auswahl"},getPluralForm(n){return (n != 1);}}};
e[ 'de' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de' ].dictionary = Object.assign( e[ 'de' ].dictionary, dictionary );
e[ 'de' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
