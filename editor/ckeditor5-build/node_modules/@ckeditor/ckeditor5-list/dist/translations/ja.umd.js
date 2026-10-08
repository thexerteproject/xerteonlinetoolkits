/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ja' ]: { dictionary, getPluralForm } } = {"ja":{"dictionary":{"Numbered List":"番号付きリスト","Bulleted List":"箇条書きリスト","To-do List":"やることリスト","Bulleted list styles toolbar":"箇条書きリストスタイルのツールバー","Numbered list styles toolbar":"番号付きリストスタイルのツールバー","Toggle the disc list style":"黒い丸リストスタイルを切り替える","Toggle the circle list style":"白い丸リストスタイルを切り替える","Toggle the square list style":"黒い四角リストスタイルを切り替える","Toggle the decimal list style":"10進数リストスタイルを切り替える","Toggle the decimal with leading zero list style":"10進数の数値の前に0がつくリストスタイルを切り替える","Toggle the lower–roman list style":"小文字ローマ数字リストスタイルを切り替える","Toggle the upper–roman list style":"大文字ローマ数字リストスタイルを切り替える","Toggle the lower–latin list style":"小文字アルファベットリストスタイルを切り替える","Toggle the upper–latin list style":"大文字アルファベットリストスタイルを切り替える","Disc":"黒い丸","Circle":"白い丸","Square":"黒い四角","Decimal":"10進数の数値","Decimal with leading zero":"10進数の数値の前に0がつく","Lower–roman":"小文字ローマ数字","Upper-roman":"大文字ローマ数字","Lower-latin":"小文字アルファベット","Upper-latin":"大文字アルファベット","List properties":"リストのプロパティ","Start at":"開始数字","Invalid start index value.":"無効な開始インデックス値です。","Start index must be greater than 0.":"開始インデックスは0より大きくなければいけません。","Reversed order":"逆順","Keystrokes that can be used in a list":"リスト内で使用できるキーストローク","Increase list item indent":"リスト項目のインデントを増やす","Decrease list item indent":"リスト項目のインデントを減らす","Entering a to-do list":"To-Doリストを入力","Leaving a to-do list":"To-Doリストを残す","Toggle the arabic-indic list style":"インド数字のリストに切り替え","Arabic-indic":"インド数字"},getPluralForm(n){return 0;}}};
e[ 'ja' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ja' ].dictionary = Object.assign( e[ 'ja' ].dictionary, dictionary );
e[ 'ja' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
