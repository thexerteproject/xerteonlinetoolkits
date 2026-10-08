/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Insert code block":"Εισαγωγή τμήματος κώδικα","Plain text":"Απλό κέιμενο","Leaving %0 code snippet":"Αποχώρηση από %0 απόσπασμα κώδικα","Entering %0 code snippet":"Εισαγωγή %0 αποσπάσματος κώδικα","Entering code snippet":"Εισαγωγή αποσπάσματος κώδικα","Leaving code snippet":"Αποχώρηση από απόσπασμα κώδικα","Code block":"Μπλοκ κώδικα"},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
