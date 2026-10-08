/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Bookmark":"বুকমার্ক","Edit bookmark":"বুকমার্ক এডিট করুন","Remove bookmark":"বুকমার্ক অপসারণ করুন","Bookmark name":"বুকমার্কের নাম","Enter the bookmark name without spaces.":"স্পেস ছাড়া বুকমার্কের নাম লিখুন।","Bookmark must not be empty.":"বুকমার্ক খালি রাখা যাবে না।","Bookmark name cannot contain space characters.":"বুকমার্কের নামে স্পেস ক্যারেক্টার রাখা যাবে না।","Bookmark name already exists.":"বুকমার্কের নাম আগে থেকেই বিদ্যমান।","bookmark widget":"বুকমার্ক উইজেট","Bookmark toolbar":"বুকমার্ক টুলবার","Bookmarks":"বুকমার্কস","No bookmarks available.":"কোনো বুকমার্কস উপলব্ধ নেই।","Scroll to bookmark":"বুকমার্কে স্ক্রল করুন"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
