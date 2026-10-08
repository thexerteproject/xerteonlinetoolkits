/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bs' ]: { dictionary, getPluralForm } } = {"bs":{"dictionary":{"Heading":"Naslov","Choose heading":"Odaberi naslov","Heading 1":"Naslov 1","Heading 2":"Naslov 2","Heading 3":"Naslov 3","Heading 4":"Naslov 4","Heading 5":"Naslov 5","Heading 6":"Naslov 6","Type your title":"Unesite naslov","Type or paste your content here.":"Unesite ili zalijepite vaš sadržaj ovdje"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'bs' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bs' ].dictionary = Object.assign( e[ 'bs' ].dictionary, dictionary );
e[ 'bs' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
