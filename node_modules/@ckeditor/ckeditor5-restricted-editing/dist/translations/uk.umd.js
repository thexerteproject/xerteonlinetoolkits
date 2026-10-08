/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'uk' ]: { dictionary, getPluralForm } } = {"uk":{"dictionary":{"Enable editing":"Увімкнути редагування","Previous editable region":"Попередня область редагування","Next editable region":"Наступна область редагування","Navigate editable regions":"Навігація по областях редагування","Disable inline editing":"Вимкнути редагування рядків","Enable inline editing":"Увімкнути редагування рядків","Disable block editing":"Вимкнути редагування блоків","Enable block editing":"Увімкнути редагування блоків","Disable editing":"Вимкнути редагування"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'uk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'uk' ].dictionary = Object.assign( e[ 'uk' ].dictionary, dictionary );
e[ 'uk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
