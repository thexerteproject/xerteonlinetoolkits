/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Insert a soft break (a <code>&lt;br&gt;</code> element)":"একটি সফট ব্রেক প্রবেশ করুন (একটি <code>&lt;br&gt;</code> উপাদান)","Insert a hard break (a new paragraph)":"একটি হার্ড ব্রেক প্রবেশ করুন (একটি নতুন প্যারাগ্রাফ)"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
