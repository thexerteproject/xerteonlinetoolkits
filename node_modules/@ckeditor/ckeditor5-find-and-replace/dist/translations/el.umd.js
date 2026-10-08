/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Find and replace":"Εύρεση και αντικατάσταση","Find in text…":"Εύρεση στο κείμενο...","Find":"Εύρεση","Previous result":"Προηγούμενο αποτέλεσμα","Next result":"Επόμενο αποτέλεσμα","Replace":"Αντικατάσταση","Replace all":"Αντικατάσταση όλων","Match case":"Ταίριασμα πεζών-ΚΕΦΑΛΑΙΩΝ","Whole words only":"Μόνο ολόκληρες λέξεις","Replace with…":"Αντικατάσταση με...","Text to find must not be empty.":"Το κείμενο προς εύρεση δεν πρέπει να είναι άδειο.","Tip: Find some text first in order to replace it.":"Επισήμανση: Βρείτε κάποιο κείμενο αρχικά ώστε να το αντικαταστήσετε.","Advanced options":"Προηγμένες επιλογές","Find in the document":"Εύρεση στο έγγραφο"},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
