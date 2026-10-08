/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tk' ]: { dictionary, getPluralForm } } = {"tk":{"dictionary":{"Unlink":"Baglanyşygy aýyr","Link":"Baglanyşyk","Link URL":"URL baglanyşygy","Link URL must not be empty.":"","Link image":"Surat baglanyşygy","Edit link":"Baglanyşygy üýtget","Open link in new tab":"Täze goýmada baglanyşyk açyň","Open in a new tab":"Täze goýmada açyň","Downloadable":"Göçürip alyp bolýar","Create link":"","Move out of a link":"","Link properties":"","Displayed text":"","No links available":""},getPluralForm(n){return (n != 1);}}};
e[ 'tk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tk' ].dictionary = Object.assign( e[ 'tk' ].dictionary, dictionary );
e[ 'tk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
