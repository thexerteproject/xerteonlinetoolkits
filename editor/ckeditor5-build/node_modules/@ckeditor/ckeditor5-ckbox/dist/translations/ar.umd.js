/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ar' ]: { dictionary, getPluralForm } } = {"ar":{"dictionary":{"Open file manager":"فتح مدير الملفات","Cannot determine a category for the uploaded file.":"تعذر تحديد فئة الملف الذي تم رفعه","Cannot access default workspace.":"لا يمكن الوصول إلى مساحة العمل الافتراضية.","You have no image editing permissions.":"ليس لديك أذونات تحرير الصور.","Edit image":"تحرير الصورة","Processing the edited image.":"معالجة الصورة المعدلة.","Server failed to process the image.":"فشل الخادم في معالجة الصورة.","Failed to determine category of edited image.":"فشلت عملية تحديد فئة الصورة التي تم تحريرها."},getPluralForm(n){return (n == 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5);}}};
e[ 'ar' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ar' ].dictionary = Object.assign( e[ 'ar' ].dictionary, dictionary );
e[ 'ar' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
