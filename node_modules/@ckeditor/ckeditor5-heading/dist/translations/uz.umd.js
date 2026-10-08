/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'uz' ]: { dictionary, getPluralForm } } = {"uz":{"dictionary":{"Heading":"Uslub","Choose heading":"Uslubni tanlash","Heading 1":"Sarlavha 1","Heading 2":"Sarlavha 2","Heading 3":"Sarlavha 3","Heading 4":"Sarlavha 4","Heading 5":"Sarlavha 5","Heading 6":"Sarlavha 6","Type your title":"Sarlavhani kiriting","Type or paste your content here.":"Matningizni shu yerga kiriting yoki joylashtiring"},getPluralForm(n){return (n > 1);}}};
e[ 'uz' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'uz' ].dictionary = Object.assign( e[ 'uz' ].dictionary, dictionary );
e[ 'uz' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
