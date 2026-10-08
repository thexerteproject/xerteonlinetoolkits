/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ku' ]: { dictionary, getPluralForm } } = {"ku":{"dictionary":{"Insert image or file":"وێنە یان پەڕگە دابنێ","Could not obtain resized image URL.":"نەتوانرا بەستەری وێنەی قەبارە گۆڕاو بەدەست بێت.","Selecting resized image failed":"دیاریکردنی وێنەی قەبارە گۆڕاو سەرکەوتوو نەبوو","Could not insert image at the current position.":"نەتوانرا وێنە دابنرێت لەم شوێنە.","Inserting image failed":"دانانی وێنە سەرکەوتوو نەبوو"},getPluralForm(n){return (n != 1);}}};
e[ 'ku' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ku' ].dictionary = Object.assign( e[ 'ku' ].dictionary, dictionary );
e[ 'ku' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
