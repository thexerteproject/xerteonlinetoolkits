/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ar' ]: { dictionary, getPluralForm } } = {"ar":{"dictionary":{"Enable editing":"تمكين التحرير","Previous editable region":"منطقة التحرير السابقة","Next editable region":"منطقة التحرير التالية","Navigate editable regions":"التنقل في مناطق التحرير","Disable inline editing":"تعطيل التحرير المضمن","Enable inline editing":"تفعيل التحرير المضمن","Disable block editing":"تعطيل تحرير الكتل","Enable block editing":"تفعيل تحرير الكتل","Disable editing":"تعطيل التحرير"},getPluralForm(n){return (n == 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5);}}};
e[ 'ar' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ar' ].dictionary = Object.assign( e[ 'ar' ].dictionary, dictionary );
e[ 'ar' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
