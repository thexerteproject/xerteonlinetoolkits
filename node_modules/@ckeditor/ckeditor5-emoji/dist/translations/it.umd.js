/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'it' ]: { dictionary, getPluralForm } } = {"it":{"dictionary":{"Emoji":"Emoji","Show all emoji...":"Mostra tutti gli emoji...","Find an emoji (min. 2 characters)":"Trova un emoji (min. 2 caratteri)","No emojis were found matching \"%0\".":"Non sono state trovati emoji corrispondenti a \"%0\".","Keep on typing to see the emoji.":"Continua a digitare per vedere l'emoji.","The query must contain at least two characters.":"La ricerca deve contenere almeno due caratteri.","Smileys & Expressions":"Faccine ed espressioni","Gestures & People":"Gesti e persone","Animals & Nature":"Animali e natura","Food & Drinks":"Cibo e bevande","Travel & Places":"Viaggi e luoghi","Activities":"Attività","Objects":"Oggetti","Symbols":"Simboli","Flags":"Bandiere","Select skin tone":"Seleziona la tonalità della pelle","Default skin tone":"Tonalità di pelle predefinita","Light skin tone":"Tonalità di pelle chiara","Medium Light skin tone":"Tonalità di pelle medio-chiara","Medium skin tone":"Tonalità di pelle media","Medium Dark skin tone":"Tonalità di pelle medio-scura","Dark skin tone":"Tonalità di pelle scura","Emoji picker":"Selettore di emoji"},getPluralForm(n){return (n != 1);}}};
e[ 'it' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'it' ].dictionary = Object.assign( e[ 'it' ].dictionary, dictionary );
e[ 'it' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
