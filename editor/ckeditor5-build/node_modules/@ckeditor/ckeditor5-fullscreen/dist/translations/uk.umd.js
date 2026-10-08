/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'uk' ]: { dictionary, getPluralForm } } = {"uk":{"dictionary":{"Enter fullscreen mode":"Задіяти повноекранний режим","Leave fullscreen mode":"Вийти з повноекранного режиму","Fullscreen mode":"Повноекранний режим","Toggle fullscreen mode":"Увімкнути повноекранний режим","Document outline":"Структура документа","Connected users":"Підключені користувачі","Show left sidebar":"Показати ліву бічну панель","Hide left sidebar":"Сховати ліву бічну панель","Toggle sidebar":"Показати/сховати бічну панель"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'uk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'uk' ].dictionary = Object.assign( e[ 'uk' ].dictionary, dictionary );
e[ 'uk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
