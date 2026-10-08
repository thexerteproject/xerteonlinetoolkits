/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fa' ]: { dictionary, getPluralForm } } = {"fa":{"dictionary":{"Insert image or file":"وارد کردن تصویر یا فایل","Could not obtain resized image URL.":"نمیتوان آدرس اینترنتی تصویر تغییر اندازه یافته را بدست آورد","Selecting resized image failed":"انتخاب تصویر تغییر اندازه یافته انجام نشد","Could not insert image at the current position.":"نمیتوان تصویر را در موقعیت فعلی وارد کرد","Inserting image failed":"وارد کردن تصویر انجام نشد"},getPluralForm(n){return 0;}}};
e[ 'fa' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fa' ].dictionary = Object.assign( e[ 'fa' ].dictionary, dictionary );
e[ 'fa' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
