/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'da' ]: { dictionary, getPluralForm } } = {"da":{"dictionary":{"Bookmark":"Bogmærke","Edit bookmark":"Rediger bogmærke","Remove bookmark":"Fjern bogmærke","Bookmark name":"Bogmærkenavn","Enter the bookmark name without spaces.":"Indtast bogmærkenavnet uden mellemrum.","Bookmark must not be empty.":"Bogmærke må ikke være tomt.","Bookmark name cannot contain space characters.":"Bogmærkenavnet må ikke indholde mellemrum.","Bookmark name already exists.":"Bogmærkenavnet findes allerede.","bookmark widget":"bogmærke-widget","Bookmark toolbar":"Bogmærkelinje","Bookmarks":"Bogmærker","No bookmarks available.":"Ingen bogmærker tilgængelige.","Scroll to bookmark":"Rul til bogmærke"},getPluralForm(n){return (n != 1);}}};
e[ 'da' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'da' ].dictionary = Object.assign( e[ 'da' ].dictionary, dictionary );
e[ 'da' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
