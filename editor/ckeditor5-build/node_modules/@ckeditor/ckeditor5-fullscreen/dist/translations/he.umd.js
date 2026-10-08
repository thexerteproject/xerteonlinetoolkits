/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'he' ]: { dictionary, getPluralForm } } = {"he":{"dictionary":{"Enter fullscreen mode":"היכנס למצב מסך מלא","Leave fullscreen mode":"צא ממצב מסך מלא","Fullscreen mode":"מצב מסך מלא","Toggle fullscreen mode":"החלף מצב מסך מלא","Document outline":"מפת מסמך","Connected users":"משתמשים מחוברים","Show left sidebar":"הצג סרגל צד שמאלי","Hide left sidebar":"הסתר סרגל צד שמאלי","Toggle sidebar":"פתיחת/סגירת סרגל הצד"},getPluralForm(n){return (n != 1);}}};
e[ 'he' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'he' ].dictionary = Object.assign( e[ 'he' ].dictionary, dictionary );
e[ 'he' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
