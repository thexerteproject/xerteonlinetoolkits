/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tk' ]: { dictionary, getPluralForm } } = {"tk":{"dictionary":{"Insert image or file":"Surat ýa-da faýl goýuň","Could not obtain resized image URL.":"Ölçegi üýtgedilen surat URL-ni alyp bolmady.","Selecting resized image failed":"Ölçegi üýtgedilen suraty saýlap bolmady","Could not insert image at the current position.":"Häzirki pozisiýa şekil goýup bolmady.","Inserting image failed":"Surat goýup bolmady"},getPluralForm(n){return (n != 1);}}};
e[ 'tk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tk' ].dictionary = Object.assign( e[ 'tk' ].dictionary, dictionary );
e[ 'tk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
