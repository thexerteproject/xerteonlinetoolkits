/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ko' ]: { dictionary, getPluralForm } } = {"ko":{"dictionary":{"Numbered List":"번호 목록","Bulleted List":"불릿 목록","To-do List":"확인 목록","Bulleted list styles toolbar":"글머리 기호 목록 스타일 도구 모음","Numbered list styles toolbar":"번호 목록 스타일 도구 모음","Toggle the disc list style":"흰 원형 목록 스타일 전환","Toggle the circle list style":"검은 원형 목록 스타일 전환","Toggle the square list style":"검은 사각형 목록 스타일 전환","Toggle the decimal list style":"십진수 목록 스타일 전환","Toggle the decimal with leading zero list style":"앞에 0이 붙는 십진수 목록 스타일 전환","Toggle the lower–roman list style":"소문자 로마자 목록 스타일 전환","Toggle the upper–roman list style":"대문자 로마자 목록 스타일 전환","Toggle the lower–latin list style":"소문자 알파벳 목록 스타일 전환","Toggle the upper–latin list style":"대문자 알파벳 목록 스타일 전환","Disc":"검은 원형","Circle":"흰 원형","Square":"검은 사각형","Decimal":"십진수","Decimal with leading zero":"앞에 0이 붙는 십진수","Lower–roman":"소문자 로마자","Upper-roman":"대문자 로마자","Lower-latin":"소문자 알파벳","Upper-latin":"대문자 알파벳","List properties":"목록 속성","Start at":"시작 번호","Invalid start index value.":"잘못된 시작 인덱스 값입니다.","Start index must be greater than 0.":"시작 번호는 0보다 커야 합니다.","Reversed order":"역순","Keystrokes that can be used in a list":"목록에서 사용할 수 있는 키 입력","Increase list item indent":"목록 항목 들여쓰기 늘리기","Decrease list item indent":"목록 항목 들여쓰기 줄이기","Entering a to-do list":"할 일 목록 입력하는 중","Leaving a to-do list":"할 일 목록 남기는 중","Toggle the arabic-indic list style":"아랍-인도식 목록 스타일 켜기/끄기","Arabic-indic":"아랍-인도식"},getPluralForm(n){return 0;}}};
e[ 'ko' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ko' ].dictionary = Object.assign( e[ 'ko' ].dictionary, dictionary );
e[ 'ko' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
