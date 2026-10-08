/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hy' ]: { dictionary, getPluralForm } } = {"hy":{"dictionary":{"Emoji":"","Show all emoji...":"","Find an emoji (min. 2 characters)":"","No emojis were found matching \"%0\".":"","Keep on typing to see the emoji.":"","The query must contain at least two characters.":"","Smileys & Expressions":"","Gestures & People":"","Animals & Nature":"","Food & Drinks":"","Travel & Places":"","Activities":"","Objects":"","Symbols":"","Flags":"","Select skin tone":"","Default skin tone":"","Light skin tone":"","Medium Light skin tone":"","Medium skin tone":"","Medium Dark skin tone":"","Dark skin tone":"","Emoji picker":""},getPluralForm(n){return (n != 1);}}};
e[ 'hy' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hy' ].dictionary = Object.assign( e[ 'hy' ].dictionary, dictionary );
e[ 'hy' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
