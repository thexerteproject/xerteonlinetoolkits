/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh-cn' ]: { dictionary, getPluralForm } } = {"zh-cn":{"dictionary":{"Numbered List":"项目编号列表","Bulleted List":"项目符号列表","To-do List":"待办列表","Bulleted list styles toolbar":"项目符号列表样式工具条","Numbered list styles toolbar":"项目编号列表样式工具条","Toggle the disc list style":"切换实心原点列表样式","Toggle the circle list style":"切换空心原点列表样式","Toggle the square list style":"切换实心方块列表样式","Toggle the decimal list style":"切换阿拉伯数字列表样式","Toggle the decimal with leading zero list style":"切换前导零阿拉伯数字列表样式","Toggle the lower–roman list style":"切换小写罗马数字列表样式","Toggle the upper–roman list style":"切换大写罗马数字列表样式","Toggle the lower–latin list style":"切换小写拉丁字母列表样式","Toggle the upper–latin list style":"切换大写拉丁字母列表样式","Disc":"实心圆点","Circle":"空心圆点","Square":"实心方块","Decimal":"阿拉伯数字","Decimal with leading zero":"前导零阿拉伯数字","Lower–roman":"小写罗马数字","Upper-roman":"大写罗马数字","Lower-latin":"小写拉丁字母","Upper-latin":"大写拉丁字母","List properties":"列表属性","Start at":"起始编号","Invalid start index value.":"无效的起始索引值。","Start index must be greater than 0.":"起始编号必须大于0。","Reversed order":"顺序反转","Keystrokes that can be used in a list":"可在列表中使用的按键","Increase list item indent":"增加列表项的缩进","Decrease list item indent":"减少列表项的缩进","Entering a to-do list":"正在输入待办事项清单","Leaving a to-do list":"正在退出待办事项清单","Toggle the arabic-indic list style":"切换阿拉伯-印度数字列表样式","Arabic-indic":"阿拉伯-印度数字"},getPluralForm(n){return 0;}}};
e[ 'zh-cn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh-cn' ].dictionary = Object.assign( e[ 'zh-cn' ].dictionary, dictionary );
e[ 'zh-cn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
