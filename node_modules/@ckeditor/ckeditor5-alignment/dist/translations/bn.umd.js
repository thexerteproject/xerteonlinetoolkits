/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Align left":"বামে সারিবদ্ধ করুন","Align right":"ডানদিকে সারিবদ্ধ করুন","Align center":"কেন্দ্র সারিবদ্ধ করুন","Justify":"জাস্টিফাই","Text alignment":"টেক্সট সারিবদ্ধকরণ","Text alignment toolbar":"টেক্সট শ্রেণীবিন্যাস টুলবার"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
