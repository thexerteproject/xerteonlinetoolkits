/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hi' ]: { dictionary, getPluralForm } } = {"hi":{"dictionary":{"Insert a soft break (a <code>&lt;br&gt;</code> element)":"एक सॉफ़्ट ब्रेक इंसर्ट करें (एक <code>&lt;br&gt;</code> एलिमेंट)","Insert a hard break (a new paragraph)":"एक हार्ड ब्रेक इंसर्ट करें (एक नया पैराग्राफ़)"},getPluralForm(n){return (n != 1);}}};
e[ 'hi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hi' ].dictionary = Object.assign( e[ 'hi' ].dictionary, dictionary );
e[ 'hi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
