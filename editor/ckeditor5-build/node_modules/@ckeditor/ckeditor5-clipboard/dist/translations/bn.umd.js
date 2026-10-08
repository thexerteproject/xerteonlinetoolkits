/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Copy selected content":"সিলেক্ট করা কন্টেন্ট কপি করুন","Paste content":"কন্টেন্ট পেস্ট করুন","Paste content as plain text":"প্লেইন টেক্সট হিসেবে কন্টেন্ট পেস্ট করুন"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
