/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'be' ]: { dictionary, getPluralForm } } = {"be":{"dictionary":{"Unlink":"Выдаліць спасылку","Link":"Спасылка","Link URL":"Спасылка URL","Link URL must not be empty.":"URL-адрас спасылкі не павінен быць пустым.","Link image":"Спасылка на відарыс","Edit link":"Рэдагаваць спасылку","Open link in new tab":"Адкрыць спасылку ў новай укладцы","Open in a new tab":"Адкрыць ў новай укладцы","Downloadable":"Даступны для спампоўкі","Create link":"Стварыць спасылку","Move out of a link":"Выйсці з спасылкі","Link properties":"","Displayed text":"","No links available":""},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'be' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'be' ].dictionary = Object.assign( e[ 'be' ].dictionary, dictionary );
e[ 'be' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
