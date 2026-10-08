/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Unlink":"লিঙ্কমুক্ত করুন","Link":"লিঙ্ক","Link URL":"লিঙ্ক URL","Link URL must not be empty.":"লিঙ্ক URL খালি রাখা যাবে না।","Link image":"লিঙ্ক চিত্র","Edit link":"\t\nলিঙ্ক  এডিট করুন","Open link in new tab":"লিঙ্কটি নতুন ট্যাবে খুলুন","Open in a new tab":"একটি নতুন ট্যাবে খুলুন","Downloadable":"ডাউনলোডযোগ্য","Create link":"লিঙ্ক তৈরি করুন","Move out of a link":"কোনো লিঙ্কের বাইরে সরান","Link properties":"লিঙ্কের বৈশিষ্ট্যসমূহ","Displayed text":"প্রদর্শিত টেক্সট","No links available":"কোনো লিঙ্ক উপলব্ধ নেই"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
