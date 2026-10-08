/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en-au' ]: { dictionary, getPluralForm } } = {"en-au":{"dictionary":{"Emoji":"Emoji","Show all emoji...":"Show all emoji...","Find an emoji (min. 2 characters)":"Find an emoji (min. 2 characters)","No emojis were found matching \"%0\".":"No emojis were found matching \"%0\".","Keep on typing to see the emoji.":"Keep on typing to see the emoji.","The query must contain at least two characters.":"The query must contain at least two characters.","Smileys & Expressions":"Smileys & Expressions","Gestures & People":"Gestures & People","Animals & Nature":"Animals & Nature","Food & Drinks":"Food & Drinks","Travel & Places":"Travel & Places","Activities":"Activities","Objects":"Objects","Symbols":"Symbols","Flags":"Flags","Select skin tone":"Select skin tone","Default skin tone":"Default skin tone","Light skin tone":"Light skin tone","Medium Light skin tone":"Medium Light skin tone","Medium skin tone":"Medium skin tone","Medium Dark skin tone":"Medium Dark skin tone","Dark skin tone":"Dark skin tone","Emoji picker":"Emoji picker"},getPluralForm(n){return (n != 1);}}};
e[ 'en-au' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en-au' ].dictionary = Object.assign( e[ 'en-au' ].dictionary, dictionary );
e[ 'en-au' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
