/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Bold":"Έντονα","Italic":"Πλάγια","Underline":"Υπογράμμιση","Code":"Κώδικας","Strikethrough":"Διακριτή διαγραφή","Subscript":"Δείκτης","Superscript":"Εκθέτης","Italic text":"Πλάγιο κείμενο","Move out of an inline code style":"Μετακίνηση από ένα στυλ ενσωματωμένου κώδικα","Bold text":"Έντονο κείμενο","Underline text":"Υπογράμμιση κειμένου","Strikethrough text":"Διακριτική διαγραφή κειμένου"},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
