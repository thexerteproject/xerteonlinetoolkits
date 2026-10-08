/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Insert code block":"কোড ব্লক ঢোকান","Plain text":"প্লেইন টেক্সট","Leaving %0 code snippet":"%0 কোড স্নিপেট ছেড়ে যাচ্ছে","Entering %0 code snippet":"%0 কোড স্নিপেট প্রবেশ করা হচ্ছে","Entering code snippet":"কোড স্নিপেট প্রবেশ করা হচ্ছে","Leaving code snippet":"কোড স্নিপেট ছেড়ে যাচ্ছে","Code block":"কোড ব্লক"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
