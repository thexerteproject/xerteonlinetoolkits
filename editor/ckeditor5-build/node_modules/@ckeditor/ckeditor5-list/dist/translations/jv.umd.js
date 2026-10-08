/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'jv' ]: { dictionary, getPluralForm } } = {"jv":{"dictionary":{"Numbered List":"","Bulleted List":"","To-do List":"","Bulleted list styles toolbar":"","Numbered list styles toolbar":"","Toggle the disc list style":"","Toggle the circle list style":"","Toggle the square list style":"","Toggle the decimal list style":"","Toggle the decimal with leading zero list style":"","Toggle the lower–roman list style":"","Toggle the upper–roman list style":"","Toggle the lower–latin list style":"","Toggle the upper–latin list style":"","Disc":"Kaset","Circle":"Bunder","Square":"Kotak","Decimal":"","Decimal with leading zero":"","Lower–roman":"","Upper-roman":"","Lower-latin":"","Upper-latin":"","List properties":"","Start at":"Wiwit saking","Invalid start index value.":"","Start index must be greater than 0.":"","Reversed order":"Dipunwangsul","Keystrokes that can be used in a list":"","Increase list item indent":"","Decrease list item indent":"","Entering a to-do list":"","Leaving a to-do list":"","Toggle the arabic-indic list style":"","Arabic-indic":""},getPluralForm(n){return (n !== 0);}}};
e[ 'jv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'jv' ].dictionary = Object.assign( e[ 'jv' ].dictionary, dictionary );
e[ 'jv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
