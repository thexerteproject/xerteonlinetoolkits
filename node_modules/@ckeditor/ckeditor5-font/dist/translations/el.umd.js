/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Font Size":"Μέγεθος γραμματοσειράς","Tiny":"Μικροσκοπικό","Small":"Μικρό","Big":"Μεγάλο","Huge":"Τεράστιο","Font Family":"Οικογένεια γραμματοσειρών","Default":"Προεπιλογή","Font Color":"Χρώμα γραμματοσειράς","Font Background Color":"Χρώμα υποβάθρου γραμματοσειράς","Document colors":"Χρώματα εγγράφου"},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
