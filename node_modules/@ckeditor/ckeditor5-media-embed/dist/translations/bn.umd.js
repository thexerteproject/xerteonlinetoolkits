/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"media widget":"মিডিয়া উইজেট","Media URL":"মিডিয়া URL","Paste the media URL in the input.":"ইনপুটে মিডিয়া URL পেস্ট করুন।","Tip: Paste the URL into the content to embed faster.":"টিপ: দ্রুত এম্বেড করতে কন্টেন্টে URL পেস্ট করুন।","The URL must not be empty.":"URLটি খালি হওয়া উচিত নয়৷","This media URL is not supported.":"এই মিডিয়া URL সমর্থিত নয়।","Insert media":"মিডিয়া ঢোকান","Media":"মিডিয়া","Media toolbar":"মিডিয়া টুলবার","Open media in new tab":"নতুন ট্যাবে মিডিয়া খুলুন","Media embed":"মিডিয়া এম্বেড"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
