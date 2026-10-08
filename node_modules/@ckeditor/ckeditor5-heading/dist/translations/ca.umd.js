/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ca' ]: { dictionary, getPluralForm } } = {"ca":{"dictionary":{"Heading":"Encapçalament","Choose heading":"Trieu l'encapçalament","Heading 1":"Encapçalament 1","Heading 2":"Encapçalament 2","Heading 3":"Encapçalament 3","Heading 4":"Encapçalament 4","Heading 5":"Encapçalament 5","Heading 6":"Encapçalament 6","Type your title":"Escriviu el títol","Type or paste your content here.":"Escriviu o enganxeu el contingut aquí."},getPluralForm(n){return (n != 1);}}};
e[ 'ca' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ca' ].dictionary = Object.assign( e[ 'ca' ].dictionary, dictionary );
e[ 'ca' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
