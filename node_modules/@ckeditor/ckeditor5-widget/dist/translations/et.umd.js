/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'et' ]: { dictionary, getPluralForm } } = {"et":{"dictionary":{"Widget toolbar":"Vidinate tööriistariba","Insert paragraph before block":"Sisesta lõik enne plokki","Insert paragraph after block":"Sisesta lõik pärast plokki","Press Enter to type after or press Shift + Enter to type before the widget":"Vajutage Enter, et tippida pärast, või Shift + Enter, et tippida enne vidinat","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Klahvikombinatsioonid, mida kasutada vidina (nt pildi, tabeli jne) valimisel","Insert a new paragraph directly after a widget":"Sisesta uus lõik kohe pärast vidinat","Insert a new paragraph directly before a widget":"Sisesta uus lõik kohe enne vidinat","Move the caret to allow typing directly before a widget":"Kohe enne vidinat kirjutamiseks liiguta katusesümbolit","Move the caret to allow typing directly after a widget":"Kohe pärast vidinat kirjutamiseks liiguta katusemärki","Move focus from an editable area back to the parent widget":"Liiguta fookus redigeeritavalt alalt tagasi põhividinale"},getPluralForm(n){return (n != 1);}}};
e[ 'et' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'et' ].dictionary = Object.assign( e[ 'et' ].dictionary, dictionary );
e[ 'et' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
