/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh-cn' ]: { dictionary, getPluralForm } } = {"zh-cn":{"dictionary":{"Emoji":"表情符号","Show all emoji...":"显示所有表情符号...","Find an emoji (min. 2 characters)":"查找表情符号（最少 2 个字符）","No emojis were found matching \"%0\".":"未找到与“%0”匹配的表情符号。","Keep on typing to see the emoji.":"继续键入以查看表情符号。","The query must contain at least two characters.":"查询必须至少包含两个字符。","Smileys & Expressions":"笑脸符与表情","Gestures & People":"手势与人物","Animals & Nature":"动物与自然","Food & Drinks":"食物与饮料","Travel & Places":"旅行与地点","Activities":"活动","Objects":"物品","Symbols":"符号","Flags":"旗帜","Select skin tone":"选择肤色","Default skin tone":"默认肤色","Light skin tone":"浅肤色","Medium Light skin tone":"中等偏浅肤色","Medium skin tone":"中等肤色","Medium Dark skin tone":"中等偏深肤色","Dark skin tone":"深肤色","Emoji picker":"表情符号选择器"},getPluralForm(n){return 0;}}};
e[ 'zh-cn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh-cn' ].dictionary = Object.assign( e[ 'zh-cn' ].dictionary, dictionary );
e[ 'zh-cn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
