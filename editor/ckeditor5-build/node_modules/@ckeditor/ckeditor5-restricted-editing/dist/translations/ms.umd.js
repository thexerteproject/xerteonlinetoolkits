/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"Enable editing":"Benarkan suntingan","Previous editable region":"Bahagian yang boleh disunting sebelumnya","Next editable region":"Bahagian yang boleh disunting seterusnya","Navigate editable regions":"Kawal bahagian yang boleh disunting seterusnya","Disable inline editing":"Nyahaktifkan penyuntingan sebaris","Enable inline editing":"Aktifkan penyuntingan sebaris","Disable block editing":"Nyahaktifkan penyuntingan blok","Enable block editing":"Aktifkan penyuntingan blok","Disable editing":"Matikan suntingan"},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
