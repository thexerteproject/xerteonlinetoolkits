/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sq' ]: { dictionary, getPluralForm } } = {"sq":{"dictionary":{"Heading":"Nëntitulli","Choose heading":"Përzgjidh nëntitullin","Heading 1":"Nëntitulli 1","Heading 2":"Nëntitulli 2","Heading 3":"Nëntitulli 3","Heading 4":"Titulli 4","Heading 5":"Titulli 5","Heading 6":"Titulli 6","Type your title":"Shkruani titullin tuaj","Type or paste your content here.":"Shkruaj ose kopjo përmbajtjen këtu."},getPluralForm(n){return (n != 1);}}};
e[ 'sq' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sq' ].dictionary = Object.assign( e[ 'sq' ].dictionary, dictionary );
e[ 'sq' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
