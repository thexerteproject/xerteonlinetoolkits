/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh' ]: { dictionary, getPluralForm } } = {"zh":{"dictionary":{"Heading":"標題","Choose heading":"選取標題","Heading 1":"標題 1","Heading 2":"標題 2","Heading 3":"標題 3","Heading 4":"標題 4","Heading 5":"標題 5","Heading 6":"標題 6","Type your title":"輸入你的標題","Type or paste your content here.":"在此輸入或貼上你的內容。"},getPluralForm(n){return 0;}}};
e[ 'zh' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh' ].dictionary = Object.assign( e[ 'zh' ].dictionary, dictionary );
e[ 'zh' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
