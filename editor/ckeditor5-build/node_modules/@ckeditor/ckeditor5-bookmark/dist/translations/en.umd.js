/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en' ]: { dictionary, getPluralForm } } = {"en":{"dictionary":{"Bookmark":"Bookmark","Edit bookmark":"Edit bookmark","Remove bookmark":"Remove bookmark","Bookmark name":"Bookmark name","Enter the bookmark name without spaces.":"Enter the bookmark name without spaces.","Bookmark must not be empty.":"Bookmark must not be empty.","Bookmark name cannot contain space characters.":"Bookmark name cannot contain space characters.","Bookmark name already exists.":"Bookmark name already exists.","bookmark widget":"bookmark widget","Bookmark toolbar":"Bookmark toolbar","Bookmarks":"Bookmarks","No bookmarks available.":"No bookmarks available.","Scroll to bookmark":"Scroll to bookmark"},getPluralForm(n){return (n != 1);}}};
e[ 'en' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en' ].dictionary = Object.assign( e[ 'en' ].dictionary, dictionary );
e[ 'en' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
