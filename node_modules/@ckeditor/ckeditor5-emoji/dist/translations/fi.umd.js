/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fi' ]: { dictionary, getPluralForm } } = {"fi":{"dictionary":{"Emoji":"Emoji","Show all emoji...":"Näytä kaikki emojit...","Find an emoji (min. 2 characters)":"Etsi emoji (väh. 2 merkkiä)","No emojis were found matching \"%0\".":"\"%0\" -hakuehtoa vastaavia emojeja ei löytynyt.","Keep on typing to see the emoji.":"Tuo emoji näkyviin jatkamalla kirjoittamista.","The query must contain at least two characters.":"Haussa on oltava vähintään 2 merkkiä.","Smileys & Expressions":"Hymiöt & ilmeet","Gestures & People":"Eleet & ihmiset","Animals & Nature":"Eläimet & luonto","Food & Drinks":"Ruoka & juoma","Travel & Places":"Matkustus & paikat","Activities":"Aktiviteetit","Objects":"Esineet","Symbols":"Symbolit","Flags":"Liput","Select skin tone":"Valitse ihonväri","Default skin tone":"Oletusarvoinen ihonväri","Light skin tone":"Vaalea ihonväri","Medium Light skin tone":"Keskivaalea ihonväri","Medium skin tone":"Keskivälin ihonväri","Medium Dark skin tone":"Keskitumma ihonväri","Dark skin tone":"Tumma ihonväri","Emoji picker":"Emojien valitsin"},getPluralForm(n){return (n != 1);}}};
e[ 'fi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fi' ].dictionary = Object.assign( e[ 'fi' ].dictionary, dictionary );
e[ 'fi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
