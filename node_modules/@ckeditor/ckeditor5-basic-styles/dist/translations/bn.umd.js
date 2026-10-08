/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Bold":"বোল্ড","Italic":"ইটালিক","Underline":"আন্ডারলাইন","Code":"কোড","Strikethrough":"স্ট্রাইকথ্রু","Subscript":"সাবস্ক্রিপ্ট","Superscript":"সুপারস্ক্রিপ্ট","Italic text":"ইটালিক টেক্সট","Move out of an inline code style":"ইনলাইন কোড স্টাইল থেকে সরে আসুন","Bold text":"বোল্ড টেক্সট","Underline text":"আন্ডারলাইন টেক্সট","Strikethrough text":"স্ট্রাইকথ্রু টেক্সট"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
