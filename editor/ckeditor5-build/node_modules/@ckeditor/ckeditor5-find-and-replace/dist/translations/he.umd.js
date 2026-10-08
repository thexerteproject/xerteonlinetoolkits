/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'he' ]: { dictionary, getPluralForm } } = {"he":{"dictionary":{"Find and replace":"חיפוש והחלפה","Find in text…":"חיפוש בטקסט","Find":"חיפוש","Previous result":"התוצאה הקודמת","Next result":"התוצאה הבאה","Replace":"החלף","Replace all":"החלף הכל","Match case":"התאם רישיות","Whole words only":"מילים שלמות בלבד","Replace with…":"החלף ב…","Text to find must not be empty.":"הטקסט לחיפוש לא יכול להיות ריק.","Tip: Find some text first in order to replace it.":"טיפ: מצאו תחילה טקסט כדי להחליף אותו.","Advanced options":"אפשרויות מתקדמות","Find in the document":"חיפוש במסמך"},getPluralForm(n){return (n != 1);}}};
e[ 'he' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'he' ].dictionary = Object.assign( e[ 'he' ].dictionary, dictionary );
e[ 'he' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
