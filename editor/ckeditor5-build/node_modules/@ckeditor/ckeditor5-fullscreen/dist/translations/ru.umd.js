/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ru' ]: { dictionary, getPluralForm } } = {"ru":{"dictionary":{"Enter fullscreen mode":"Войти в полноэкранный режим","Leave fullscreen mode":"Выйти из полноэкранного режима","Fullscreen mode":"Полноэкранный режим","Toggle fullscreen mode":"Переключить полноэкранный режим","Document outline":"Состав документа","Connected users":"Подключенные пользователи","Show left sidebar":"Показать левую боковую панель","Hide left sidebar":"Скрыть левую боковую панель","Toggle sidebar":"Переключить боковую панель"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'ru' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ru' ].dictionary = Object.assign( e[ 'ru' ].dictionary, dictionary );
e[ 'ru' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
