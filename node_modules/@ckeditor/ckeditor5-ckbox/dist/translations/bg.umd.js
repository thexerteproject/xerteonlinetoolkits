/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bg' ]: { dictionary, getPluralForm } } = {"bg":{"dictionary":{"Open file manager":"Отвори управление на файлове","Cannot determine a category for the uploaded file.":"Не може да бъде определена категория за качения файл.","Cannot access default workspace.":"Нямате достъп до работното пространство по подразбиране.","You have no image editing permissions.":"Нямате разрешения за редактиране на изображения.","Edit image":"Редактиране на изображението","Processing the edited image.":"Обработка на редактираното изображение.","Server failed to process the image.":"Сървърът не успя да обработи изображението.","Failed to determine category of edited image.":"Неуспешно определяне на категорията на редактираното изображение."},getPluralForm(n){return (n != 1);}}};
e[ 'bg' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bg' ].dictionary = Object.assign( e[ 'bg' ].dictionary, dictionary );
e[ 'bg' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
