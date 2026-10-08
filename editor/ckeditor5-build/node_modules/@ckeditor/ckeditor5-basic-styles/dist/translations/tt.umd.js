/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tt' ]: { dictionary, getPluralForm } } = {"tt":{"dictionary":{"Bold":"Калын","Italic":"Курсив","Underline":"Ассызыклау","Code":"Код","Strikethrough":"Сызылган","Subscript":"","Superscript":"","Italic text":"Курсив текст","Move out of an inline code style":"","Bold text":"Калын текст","Underline text":"Ассызыклы текст","Strikethrough text":"Сызылган текст"},getPluralForm(n){return 0;}}};
e[ 'tt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tt' ].dictionary = Object.assign( e[ 'tt' ].dictionary, dictionary );
e[ 'tt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
