/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"media widget":"Γραφικό στοιχείου πολυμέσου","Media URL":"Διεύθυνση πολυμέσου","Paste the media URL in the input.":"Επικολλήστε τη διεύθυνση του πολυμέσου στο πλαίσιο.","Tip: Paste the URL into the content to embed faster.":"Επισήμανση: Επικολλήστε τη διεύθυνση στο περιεχόμενο για γρηγορότερη ενσωμάτωση.","The URL must not be empty.":"Η διεύθυνση δεν πρέπει να είναι άδεια.","This media URL is not supported.":"Αυτή η διεύθυνση πολυμέσου δεν υποστηρίζεται.","Insert media":"Εισαγωγή πολυμέσου","Media":"Πολυμέσα","Media toolbar":"Γραμμή εργαλείων πολυμέσων","Open media in new tab":"Άνοιγμα πολυμέσων σε νέα καρτέλα","Media embed":"Ενσωμάτωση πολυμέσων"},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
