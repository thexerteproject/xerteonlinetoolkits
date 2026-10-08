/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Insert HTML":"Εισαγωγή HTML","HTML snippet":"Απόσπασμα HTML","Paste raw HTML here...":"Επικολλήστε κώδικα HTML εδώ...","Edit source":"Επεξεργασία κώδικα","Save changes":"Αποθήκευση αλλαγών","No preview available":"Η προεπισκόπηση δεν είναι διαθέσιμη","Empty snippet content":"Άδειο περιεχόμενο αποσπάσματος"},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
