/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"Heading":"Pengepala","Choose heading":"Pilih pengepala","Heading 1":"Pengepala 1","Heading 2":"Pengepala 2","Heading 3":"Pengepala 3","Heading 4":"Pengepala 4","Heading 5":"Pengepala 5","Heading 6":"Pengepala 6","Type your title":"Taip tajuk anda","Type or paste your content here.":"Taip atau tampal kandungan anda disini."},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
