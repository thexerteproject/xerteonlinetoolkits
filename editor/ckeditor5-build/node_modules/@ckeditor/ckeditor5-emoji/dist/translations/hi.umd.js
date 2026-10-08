/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hi' ]: { dictionary, getPluralForm } } = {"hi":{"dictionary":{"Emoji":"इमोजी","Show all emoji...":"सभी इमोजी दिखाएँ...","Find an emoji (min. 2 characters)":"एक इमोजी ढूंढें (कम से कम 2 अक्षर)","No emojis were found matching \"%0\".":"\"%0\" से मेल खाता कोई इमोजी नहीं मिला.","Keep on typing to see the emoji.":"इमोजी देखने के लिए टाइप करते रहें.","The query must contain at least two characters.":"क्वेरी में कम से कम दो अक्षर होने चाहिए.","Smileys & Expressions":"स्माइलीज़ और एक्सप्रेशंस","Gestures & People":"इशारे और लोग","Animals & Nature":"पशु और प्रकृति","Food & Drinks":"फ़ूड और ड्रिंक्स","Travel & Places":"ट्रैवल और स्थान","Activities":"गतिविधियाँ","Objects":"वस्तुओं","Symbols":"सिंबल","Flags":"झंडे","Select skin tone":"स्किन टोन चुनें","Default skin tone":"डिफ़ॉल्ट स्किन टोन","Light skin tone":"हल्की स्किन टोन","Medium Light skin tone":"मध्यम हल्की स्किन टोन","Medium skin tone":"मध्यम स्किन टोन","Medium Dark skin tone":"मध्यम गहरे स्किन टोन","Dark skin tone":"गहरे रंग का स्किन टोन","Emoji picker":"इमोजी पिकर"},getPluralForm(n){return (n != 1);}}};
e[ 'hi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hi' ].dictionary = Object.assign( e[ 'hi' ].dictionary, dictionary );
e[ 'hi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
