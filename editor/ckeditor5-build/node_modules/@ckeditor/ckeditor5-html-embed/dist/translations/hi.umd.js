/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hi' ]: { dictionary, getPluralForm } } = {"hi":{"dictionary":{"Insert HTML":"एचटीएमएल इन्सर्ट करें","HTML snippet":"एचटीएमएल स्निपेट","Paste raw HTML here...":"रॉ एचटीएमएल यहां पेस्ट करें...","Edit source":"सोर्स एडिट करें","Save changes":"चेंजेज़ को सेव करें","No preview available":"कोई प्रीव्यू उपलब्ध नहीं","Empty snippet content":"खाली स्निपेट कंटेंट"},getPluralForm(n){return (n != 1);}}};
e[ 'hi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hi' ].dictionary = Object.assign( e[ 'hi' ].dictionary, dictionary );
e[ 'hi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
