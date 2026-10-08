/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bn' ]: { dictionary, getPluralForm } } = {"bn":{"dictionary":{"Font Size":"অক্ষরের আকার","Tiny":"ক্ষুদ্র","Small":"ছোট","Big":"বড়","Huge":"অনেক বড়","Font Family":"ফন্ট পরিবার","Default":"ডিফল্ট","Font Color":"ফন্টের রং","Font Background Color":"ফন্ট ব্যাকগ্রাউন্ডের রং","Document colors":"নথির রং"},getPluralForm(n){return (n != 1);}}};
e[ 'bn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bn' ].dictionary = Object.assign( e[ 'bn' ].dictionary, dictionary );
e[ 'bn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
