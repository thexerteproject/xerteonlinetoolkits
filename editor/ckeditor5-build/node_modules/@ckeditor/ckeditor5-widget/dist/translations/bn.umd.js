/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Widget toolbar":"উইজেট টুলবার","Insert paragraph before block":"ব্লক করার আগে অনুচ্ছেদ ঢোকান","Insert paragraph after block":"ব্লকের পর অনুচ্ছেদ ঢোকান","Press Enter to type after or press Shift + Enter to type before the widget":"পরে টাইপ করতে এন্টার চাপুন বা উইজেটের আগে টাইপ করতে Shift + এন্টার চাপুন","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"কোনো উইজেট সিলেক্ট থাকা অবস্থায় যে কীস্ট্রোকগুলি ব্যবহার করা যেতে পারে (উদাহরণ: ছবি, টেবিল, ইত্যাদি)","Insert a new paragraph directly after a widget":"কোনো উইজেটের পরে সরাসরি একটি নতুন প্যারাগ্রাফ প্রবেশ করুন","Insert a new paragraph directly before a widget":"কোনো উইজেটের আগে সরাসরি একটি নতুন প্যারাগ্রাফ প্রবেশ করুন","Move the caret to allow typing directly before a widget":"কোনো উইজেটের আগে সরাসরি টাইপ করতে দিতে ক্যারেটটি সরান","Move the caret to allow typing directly after a widget":"কোনো উইজেটের পরে সরাসরি টাইপ করতে দিতে ক্যারেটটি সরান","Move focus from an editable area back to the parent widget":"এডিটযোগ্য এরিয়া থেকে প্যারেন্ট উইজেটে ফোকাসে সরিয়ে নিন"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
