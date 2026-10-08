/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bg' ]: { dictionary, getPluralForm } } = {"bg":{"dictionary":{"media widget":"Медиен компонент","Media URL":"Медиен уеб адрес","Paste the media URL in the input.":"Постави медииния уеб адрес във входа.","Tip: Paste the URL into the content to embed faster.":"Полезен съвет: Постави уеб адреса в съдържанието, за да вградите по-бързо.","The URL must not be empty.":"Уеб адресът не трябва да бъде празен.","This media URL is not supported.":"Този медиен уеб адрес не се поддържа.","Insert media":"Вмъкни медия","Media":"Медия","Media toolbar":"Лента със задачи за медия","Open media in new tab":"Отворете мултимедията в нов раздел","Media embed":"Вмъкване на мултимедия"},getPluralForm(n){return (n != 1);}}};
e[ 'bg' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bg' ].dictionary = Object.assign( e[ 'bg' ].dictionary, dictionary );
e[ 'bg' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
