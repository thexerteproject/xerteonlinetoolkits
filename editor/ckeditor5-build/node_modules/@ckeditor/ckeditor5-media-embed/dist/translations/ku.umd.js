/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ku' ]: { dictionary, getPluralForm } } = {"ku":{"dictionary":{"media widget":"ویدجێتتی مێدیا","Media URL":"بەستەری مێدیا","Paste the media URL in the input.":"بەستەری مێدیاکە لە خانەکە بلکێنە.","Tip: Paste the URL into the content to embed faster.":"Tip: Paste the URL into the content to embed faster.","The URL must not be empty.":"پێویستە بەستەر بەتاڵ نەبێت.","This media URL is not supported.":"ئەم بەستەری مێدیایە پاڵپشتی ناکرێت.","Insert media":"مێدیا دابنێ","Media":"","Media toolbar":"تووڵامرازی مێدیا","Open media in new tab":"","Media embed":""},getPluralForm(n){return (n != 1);}}};
e[ 'ku' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ku' ].dictionary = Object.assign( e[ 'ku' ].dictionary, dictionary );
e[ 'ku' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
