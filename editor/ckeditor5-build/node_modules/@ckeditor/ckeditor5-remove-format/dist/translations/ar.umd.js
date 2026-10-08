/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ar' ]: { dictionary, getPluralForm } } = {"ar":{"dictionary":{"Remove Format":"إزالة التنسيق"},getPluralForm(n){return (n == 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5);}}};
e[ 'ar' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ar' ].dictionary = Object.assign( e[ 'ar' ].dictionary, dictionary );
e[ 'ar' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
