/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'he' ]: { dictionary, getPluralForm } } = {"he":{"dictionary":{"Insert code block":"הוספת קטע קוד","Plain text":"טקסט פשוט","Leaving %0 code snippet":"יוצא מקטע קוד %0","Entering %0 code snippet":"נכנס לקטע קוד %0","Entering code snippet":"נכנס לקטע קוד","Leaving code snippet":"יוצא מקטע קוד","Code block":"בלוק קוד"},getPluralForm(n){return (n != 1);}}};
e[ 'he' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'he' ].dictionary = Object.assign( e[ 'he' ].dictionary, dictionary );
e[ 'he' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
