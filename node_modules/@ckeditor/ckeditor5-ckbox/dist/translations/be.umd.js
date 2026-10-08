/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'be' ]: { dictionary, getPluralForm } } = {"be":{"dictionary":{"Open file manager":"Адкрыць менеджэр файлаў","Cannot determine a category for the uploaded file.":"Немагчыма вызначыць катэгорыю для запампаванага файла.","Cannot access default workspace.":"Немагчыма атрымаць доступ да прадвызначанай працоўнай прасторы.","You have no image editing permissions.":"У вас няма дозволу на рэдагаванне відарыса.","Edit image":"Рэдагаваць відарыс","Processing the edited image.":"Апрацоўка адрэдагаванага відарыса.","Server failed to process the image.":"Сервер не здольны апрацаваць відарыс.","Failed to determine category of edited image.":"Не здольны вызначыць катэгорыю адрэдагаванага відарыса."},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'be' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'be' ].dictionary = Object.assign( e[ 'be' ].dictionary, dictionary );
e[ 'be' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
