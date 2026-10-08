/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Heading":"Κεφαλίδα","Choose heading":"Επιλέξτε κεφαλίδα","Heading 1":"Κεφαλίδα 1","Heading 2":"Κεφαλίδα 2","Heading 3":"Κεφαλίδα 3","Heading 4":"Κεφαλίδα 4","Heading 5":"Κεφαλίδα 5","Heading 6":"Κεφαλίδα 6","Type your title":"Γράψτε τον τίτλο σας εδώ","Type or paste your content here.":"Γράψτε ή επικολλήστε τα περιεχόμενά σας εδώ."},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
