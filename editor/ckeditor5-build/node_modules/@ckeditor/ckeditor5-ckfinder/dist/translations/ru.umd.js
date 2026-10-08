/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ru' ]: { dictionary, getPluralForm } } = {"ru":{"dictionary":{"Insert image or file":"Вставьте изображение или файл","Could not obtain resized image URL.":"Не удалось получить URL с измененным размером изображения.","Selecting resized image failed":"Выбор изображения с измененным размером не удался","Could not insert image at the current position.":"Нельзя вставить изображение на текущую позицию.","Inserting image failed":"Вставка изображения не удалась"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'ru' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ru' ].dictionary = Object.assign( e[ 'ru' ].dictionary, dictionary );
e[ 'ru' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
