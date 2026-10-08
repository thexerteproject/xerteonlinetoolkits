/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hi' ]: { dictionary, getPluralForm } } = {"hi":{"dictionary":{"Open file manager":"फाइल मैनेजर खोलें","Cannot determine a category for the uploaded file.":"अपलोड की गई फ़ाइल के लिए एक केटेगरी डिटर्माइन नहीं कर पा रहें.","Cannot access default workspace.":"डिफ़ॉल्ट वर्कस्पेस को ऐक्सेस नहीं किया जा सकता.","You have no image editing permissions.":"आपके पास तस्वीर को एडिट करने की अनुमति नहीं है.","Edit image":"इमेज एडिट करें","Processing the edited image.":"एडिट किए गए इमेज को प्रोसेस किया जा रहा है","Server failed to process the image.":"सर्वर इमेज प्रोसेस करने में विफल रहा.","Failed to determine category of edited image.":"एडिट किए गए इमेज की श्रेणी निर्धारित करने में विफल."},getPluralForm(n){return (n != 1);}}};
e[ 'hi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hi' ].dictionary = Object.assign( e[ 'hi' ].dictionary, dictionary );
e[ 'hi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
