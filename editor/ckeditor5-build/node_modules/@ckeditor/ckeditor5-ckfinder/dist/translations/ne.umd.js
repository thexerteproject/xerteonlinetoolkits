/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ne' ]: { dictionary, getPluralForm } } = {"ne":{"dictionary":{"Insert image or file":"तस्बिर वा फाइल सम्मिलित गर्न","Could not obtain resized image URL.":"पुनःआकार गरिएको तस्बिरको यूआरएल प्राप्त गर्न सकिएन।","Selecting resized image failed":"पुनःआकार गरिएको तस्बिर चयन गर्न असफल भयो।","Could not insert image at the current position.":"हालैको स्थितिमा तस्बिर सम्मिलित गर्न सकिएन।","Inserting image failed":"तस्बिर सम्मिलित गर्न असफल भयो।"},getPluralForm(n){return (n != 1);}}};
e[ 'ne' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ne' ].dictionary = Object.assign( e[ 'ne' ].dictionary, dictionary );
e[ 'ne' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
