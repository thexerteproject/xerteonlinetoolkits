/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sq' ]: { dictionary, getPluralForm } } = {"sq":{"dictionary":{"Insert image or file":"Shto foto ose skedar","Could not obtain resized image URL.":"Nuk mund të gjendej URL-ja e fotos së ndryshuar.","Selecting resized image failed":"Dështoi përzgjedhja e fotos së ndryshuar","Could not insert image at the current position.":"Nuk mund të vendosej fotoja në pozitën aktuale.","Inserting image failed":"Shtimi i fotos dështoi"},getPluralForm(n){return (n != 1);}}};
e[ 'sq' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sq' ].dictionary = Object.assign( e[ 'sq' ].dictionary, dictionary );
e[ 'sq' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
