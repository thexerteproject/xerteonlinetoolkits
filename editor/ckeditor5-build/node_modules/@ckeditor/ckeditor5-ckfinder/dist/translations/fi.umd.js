/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fi' ]: { dictionary, getPluralForm } } = {"fi":{"dictionary":{"Insert image or file":"Lisää kuva tai tiedosto","Could not obtain resized image URL.":"Muokatun kuvan URL-osoitteen hakeminen epäonnistui.","Selecting resized image failed":"Muokatun kuvan valinta epäonnistui","Could not insert image at the current position.":"Kuvan lisäys nykyiseen sijaintiin epäonnistui","Inserting image failed":"Kuvan lisäys epäonnistui"},getPluralForm(n){return (n != 1);}}};
e[ 'fi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fi' ].dictionary = Object.assign( e[ 'fi' ].dictionary, dictionary );
e[ 'fi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
