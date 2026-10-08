/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Enter fullscreen mode":"Εισαγωγή σε λειτουργία πλήρους οθόνης","Leave fullscreen mode":"Αποχώρηση από τη λειτουργία πλήρους οθόνης","Fullscreen mode":"Λειτουργία πλήρους οθόνης","Toggle fullscreen mode":"Εναλλαγή λειτουργίας πλήρους οθόνης","Document outline":"Περιεχόμενο εγγράφου","Connected users":"Συνδεδεμένοι χρήστες","Show left sidebar":"Εμφάνιση αριστερής πλαϊνής γραμμής","Hide left sidebar":"Απόκρυψη αριστερής πλαϊνής γραμμής","Toggle sidebar":"Εναλλαγή πλαϊνής γραμμής"},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
