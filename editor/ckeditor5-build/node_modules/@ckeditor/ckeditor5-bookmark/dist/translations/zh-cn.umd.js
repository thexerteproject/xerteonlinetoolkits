/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh-cn' ]: { dictionary, getPluralForm } } = {"zh-cn":{"dictionary":{"Bookmark":"书签","Edit bookmark":"编辑书签","Remove bookmark":"删除书签","Bookmark name":"书签名称","Enter the bookmark name without spaces.":"输入书签名称，不带空格。","Bookmark must not be empty.":"书签不能为空。","Bookmark name cannot contain space characters.":"书签名称不能包含空格。","Bookmark name already exists.":"书签名称已存在。","bookmark widget":"书签小组件","Bookmark toolbar":"书签工具栏","Bookmarks":"书签","No bookmarks available.":"无可用书签。","Scroll to bookmark":"滚动到书签"},getPluralForm(n){return 0;}}};
e[ 'zh-cn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh-cn' ].dictionary = Object.assign( e[ 'zh-cn' ].dictionary, dictionary );
e[ 'zh-cn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
