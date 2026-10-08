/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Heading":"শিরোনাম","Choose heading":"শিরোনাম নির্বাচন করুন","Heading 1":"শিরোনাম 1","Heading 2":"শিরোনাম 2","Heading 3":"শিরোনাম 3","Heading 4":"শিরোনাম 4","Heading 5":"শিরোনাম 5","Heading 6":"শিরোনাম 6","Type your title":"আপনার শিরোনাম টাইপ করুন","Type or paste your content here.":"আপনার বিষয়বস্তু এখানে টাইপ অথবা পেস্ট করুন।"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
