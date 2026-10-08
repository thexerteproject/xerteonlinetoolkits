/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Insert HTML":"HTML ঢোকান","HTML snippet":"HTML স্নিপেট","Paste raw HTML here...":"এখানে সারি HTML পেস্ট করুন...","Edit source":"উৎস এডিট করুন","Save changes":"পরিবর্তনগুলো সংরক্ষন","No preview available":"কোনো প্রিভিউ উপলব্ধ নেই","Empty snippet content":"খালি স্নিপেট বিষয়বস্তু"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
