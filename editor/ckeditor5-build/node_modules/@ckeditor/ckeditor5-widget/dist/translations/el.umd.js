/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Widget toolbar":"Γραμμή εργαλείων γραφικού στοιχείου","Insert paragraph before block":"Εισαγωγή παραγράφου πριν το τμήμα","Insert paragraph after block":"Εισαγωγή παραγράφου μετά το τμήμα","Press Enter to type after or press Shift + Enter to type before the widget":"Πατήστε Enter για να πληκτρολογήσετε μετά ή πατήστε Shift + Enter για να πληκτρολογήσετε πριν από το γραφικό στοιχείο","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Πλήκτρα που μπορείτε να χρησιμοποιήσετε όταν επιλέγετε ένα widget (για παράδειγμα: εικόνα, πίνακα κ.λπ.)","Insert a new paragraph directly after a widget":"Εισαγωγή νέας παραγράφου απευθείας μετά από ένα widget","Insert a new paragraph directly before a widget":"Εισαγωγή νέας παραγράφου απευθείας πριν από ένα widget","Move the caret to allow typing directly before a widget":"Μετακινήστε τον δρομέα caret για να είναι δυνατή η πληκτρολόγηση απευθείας πριν από ένα widget","Move the caret to allow typing directly after a widget":"Μετακινήστε τον δρομέα caret για να είναι δυνατή η πληκτρολόγηση απευθείας μετά από ένα widget","Move focus from an editable area back to the parent widget":"Μετακίνηση της εστίασης από μια επεξεργάσιμη περιοχή πίσω στο αρχικό widget"},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
