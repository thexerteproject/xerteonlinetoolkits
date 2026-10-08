/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ar' ]: { dictionary, getPluralForm } } = {"ar":{"dictionary":{"Find and replace":"البحث والاستبدال","Find in text…":"البحث في النص...","Find":"البحث","Previous result":"النتيجة السابقة","Next result":"النتيجة التالية","Replace":"استبدال","Replace all":"استبدال الكل","Match case":"مطابقة حالة الأحرف","Whole words only":"الكلمات بأكملها فقط","Replace with…":"استبدال بـ...","Text to find must not be empty.":"لا يمكن لبيان النص المطلوب البحث عنه أن يكون فارغاً.","Tip: Find some text first in order to replace it.":"نصيحة: في البداية، ابحث عن جزء من النص؛ لتتمكن من استبداله. ","Advanced options":"الخيارات المتقدمة","Find in the document":"ابحثْ في الوثيقة"},getPluralForm(n){return (n == 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5);}}};
e[ 'ar' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ar' ].dictionary = Object.assign( e[ 'ar' ].dictionary, dictionary );
e[ 'ar' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
