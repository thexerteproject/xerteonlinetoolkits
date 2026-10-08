/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'he' ]: { dictionary, getPluralForm } } = {"he":{"dictionary":{"Bookmark":"סימניה","Edit bookmark":"ערכו סימניה","Remove bookmark":"הסירו סימניה","Bookmark name":"שם הסימניה","Enter the bookmark name without spaces.":"הקלידו את שם הסימניה ללא רווחים.","Bookmark must not be empty.":"לא ניתן שהסימניה תהיה ריקה","Bookmark name cannot contain space characters.":"שם הסימניה לא יכול להכיל רווחים","Bookmark name already exists.":"שם הסימניה כבר קיים","bookmark widget":"יישומון הסימניה","Bookmark toolbar":"סרגל כלים לסימניות","Bookmarks":"סימניות","No bookmarks available.":"אין סימניות זמינות.","Scroll to bookmark":"גלול לסימניה"},getPluralForm(n){return (n != 1);}}};
e[ 'he' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'he' ].dictionary = Object.assign( e[ 'he' ].dictionary, dictionary );
e[ 'he' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
