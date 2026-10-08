/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Emoji":"ইমোজি","Show all emoji...":"সমস্ত ইমোজি দেখান...","Find an emoji (min. 2 characters)":"একটি ইমোজির সন্ধান করুন (কমপক্ষে 2 টি ক্যারেক্টার)","No emojis were found matching \"%0\".":"\"%0\" এর সাথে মেলে এমন কোনো ইমোজি পাওয়া যায়নি।","Keep on typing to see the emoji.":"ইমোজিটি দেখতে টাইপ করতে থাকুন।","The query must contain at least two characters.":"কোয়েরিটিতে কমপক্ষে দুটি ক্যারেক্টার থাকতে হবে।","Smileys & Expressions":"স্মাইলি ও অভিব্যক্তি","Gestures & People":"অঙ্গভঙ্গি ও মানুষ","Animals & Nature":"প্রাণী ও প্রকৃতি","Food & Drinks":"খাদ্য ও পানীয়","Travel & Places":"ভ্রমণ ও স্থান","Activities":"কার্যক্রম","Objects":"বস্তু","Symbols":"প্রতীক","Flags":"পতাকা","Select skin tone":"স্কিন টোন নির্বাচন করুন","Default skin tone":"ডিফল্ট স্কিন টোন","Light skin tone":"হালকা স্কিন টোন","Medium Light skin tone":"মাঝারি হালকা স্কিন টোন","Medium skin tone":"মাঝারি স্কিন টোন","Medium Dark skin tone":"মাঝারি গাঢ় স্কিন টোন","Dark skin tone":"গাঢ় স্কিন টোন","Emoji picker":"ইমোজি পিকার"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
