/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hy' ]: { dictionary, getPluralForm } } = {"hy":{"dictionary":{"Bookmark":"","Edit bookmark":"","Remove bookmark":"","Bookmark name":"","Enter the bookmark name without spaces.":"","Bookmark must not be empty.":"","Bookmark name cannot contain space characters.":"","Bookmark name already exists.":"","bookmark widget":"","Bookmark toolbar":"","Bookmarks":"","No bookmarks available.":"","Scroll to bookmark":""},getPluralForm(n){return (n != 1);}}};
e[ 'hy' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hy' ].dictionary = Object.assign( e[ 'hy' ].dictionary, dictionary );
e[ 'hy' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
