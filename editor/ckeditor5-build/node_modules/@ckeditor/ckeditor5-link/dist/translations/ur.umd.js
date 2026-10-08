/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ur' ]: { dictionary, getPluralForm } } = {"ur":{"dictionary":{"Unlink":"ربط حذف کریں","Link":"ربط","Link URL":"ربط کا یو آر ایل","Link URL must not be empty.":"","Link image":"","Edit link":"ربط کی تدوین","Open link in new tab":"نئے ٹیب میں کھولیں","Open in a new tab":"نئی ٹیب کھولیں","Downloadable":"ڈاؤنلوڈ ہو سکتا ہے","Create link":"","Move out of a link":"","Link properties":"","Displayed text":"","No links available":""},getPluralForm(n){return (n != 1);}}};
e[ 'ur' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ur' ].dictionary = Object.assign( e[ 'ur' ].dictionary, dictionary );
e[ 'ur' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
