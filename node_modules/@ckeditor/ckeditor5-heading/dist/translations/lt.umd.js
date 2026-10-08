/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lt' ]: { dictionary, getPluralForm } } = {"lt":{"dictionary":{"Heading":"Antraštė","Choose heading":"Pasirinkite antraštę","Heading 1":"Antraštė 1","Heading 2":"Antraštė 2","Heading 3":"Antraštė 3","Heading 4":"Antraštė 4","Heading 5":"Antraštė 5","Heading 6":"Antraštė 6","Type your title":"Įveskite savo pavadinimą","Type or paste your content here.":"Rašykite ar įkopijuokite turinį čia."},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'lt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lt' ].dictionary = Object.assign( e[ 'lt' ].dictionary, dictionary );
e[ 'lt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
