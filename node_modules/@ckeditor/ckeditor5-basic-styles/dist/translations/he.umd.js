/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'he' ]: { dictionary, getPluralForm } } = {"he":{"dictionary":{"Bold":"מודגש","Italic":"נטוי","Underline":"קו תחתון","Code":"קוד","Strikethrough":"קו חוצה","Subscript":"כתב תחתי","Superscript":"כתב עילי","Italic text":"טקסט נטוי","Move out of an inline code style":"יציאה מסגנון קוד מוטבע","Bold text":"טקסט מודגש","Underline text":"הוספת קו תחתון לטקסט","Strikethrough text":"הוספת קו חוצה לטקסט"},getPluralForm(n){return (n != 1);}}};
e[ 'he' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'he' ].dictionary = Object.assign( e[ 'he' ].dictionary, dictionary );
e[ 'he' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
