/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh-cn' ]: { dictionary, getPluralForm } } = {"zh-cn":{"dictionary":{"Find and replace":"查找和替换","Find in text…":"查找的文本","Find":"查找","Previous result":"上一个匹配项","Next result":"下一个匹配项","Replace":"替换","Replace all":"全部替换","Match case":"区分大小写","Whole words only":"单词","Replace with…":"替换的文本","Text to find must not be empty.":"查找的文本不可为空","Tip: Find some text first in order to replace it.":"提示：先查找文本再替换","Advanced options":"高级选项","Find in the document":"在文档中查找"},getPluralForm(n){return 0;}}};
e[ 'zh-cn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh-cn' ].dictionary = Object.assign( e[ 'zh-cn' ].dictionary, dictionary );
e[ 'zh-cn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
