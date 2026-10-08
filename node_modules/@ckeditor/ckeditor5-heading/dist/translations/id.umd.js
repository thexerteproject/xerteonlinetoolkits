/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'id' ]: { dictionary, getPluralForm } } = {"id":{"dictionary":{"Heading":"Tajuk","Choose heading":"Pilih tajuk","Heading 1":"Tajuk 1","Heading 2":"Tajuk 2","Heading 3":"Tajuk 3","Heading 4":"Tajuk 4","Heading 5":"Tajuk 5","Heading 6":"Tajuk 6","Type your title":"Ketik judul Anda","Type or paste your content here.":"Ketik atau tempel konten Anda di sini."},getPluralForm(n){return 0;}}};
e[ 'id' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'id' ].dictionary = Object.assign( e[ 'id' ].dictionary, dictionary );
e[ 'id' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
