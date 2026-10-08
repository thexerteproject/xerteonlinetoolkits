/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh-cn' ]: { dictionary, getPluralForm } } = {"zh-cn":{"dictionary":{"Heading":"标题","Choose heading":"标题类型","Heading 1":"标题 1","Heading 2":"标题 2","Heading 3":"标题 3","Heading 4":"标题 4","Heading 5":"标题 5","Heading 6":"标题 6","Type your title":"输入标题","Type or paste your content here.":"在这里输入或粘贴内容"},getPluralForm(n){return 0;}}};
e[ 'zh-cn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh-cn' ].dictionary = Object.assign( e[ 'zh-cn' ].dictionary, dictionary );
e[ 'zh-cn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
