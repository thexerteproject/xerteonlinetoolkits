/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ro' ]: { dictionary, getPluralForm } } = {"ro":{"dictionary":{"Bold":"Îngroșat","Italic":"Cursiv","Underline":"Subliniat","Code":"Cod","Strikethrough":"Tăiere text cu o linie","Subscript":"Indice","Superscript":"Exponent","Italic text":"Text cursiv","Move out of an inline code style":"Ieșirea dintr-un stil de cod inline","Bold text":"Text bold","Underline text":"Text subliniat","Strikethrough text":"Text barat"},getPluralForm(n){return (n == 1 ? 0 : (n == 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2);}}};
e[ 'ro' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ro' ].dictionary = Object.assign( e[ 'ro' ].dictionary, dictionary );
e[ 'ro' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
