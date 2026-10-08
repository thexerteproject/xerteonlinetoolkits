/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en-au' ]: { dictionary, getPluralForm } } = {"en-au":{"dictionary":{"Bookmark":"Bookmark","Edit bookmark":"Edit bookmark","Remove bookmark":"Remove bookmark","Bookmark name":"Bookmark name","Enter the bookmark name without spaces.":"Enter the bookmark name without spaces.","Bookmark must not be empty.":"Bookmark must not be empty.","Bookmark name cannot contain space characters.":"Bookmark name cannot contain space characters.","Bookmark name already exists.":"Bookmark name already exists.","bookmark widget":"bookmark widget","Bookmark toolbar":"Bookmark toolbar","Bookmarks":"Bookmarks","No bookmarks available.":"No bookmarks available.","Scroll to bookmark":"Scroll to bookmark"},getPluralForm(n){return (n != 1);}}};
e[ 'en-au' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en-au' ].dictionary = Object.assign( e[ 'en-au' ].dictionary, dictionary );
e[ 'en-au' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
