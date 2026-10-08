/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lv' ]: { dictionary, getPluralForm } } = {"lv":{"dictionary":{"Heading":"Virsraksts","Choose heading":"Izvēlēties virsrakstu","Heading 1":"Virsraksts 1","Heading 2":"Virsraksts 2","Heading 3":"Virsraksts 3","Heading 4":"Virsraksts 4","Heading 5":"Virsraksts 5","Heading 6":"Virsraksts 6","Type your title":"Ievadiet virsrakstu","Type or paste your content here.":"Rakstiet vai ielīmējiet saturu šeit."},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2);}}};
e[ 'lv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lv' ].dictionary = Object.assign( e[ 'lv' ].dictionary, dictionary );
e[ 'lv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
