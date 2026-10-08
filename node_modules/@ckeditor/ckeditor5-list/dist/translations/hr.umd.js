/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hr' ]: { dictionary, getPluralForm } } = {"hr":{"dictionary":{"Numbered List":"Brojčana lista","Bulleted List":"Obična lista","To-do List":"Lista zadataka","Bulleted list styles toolbar":"Alatna traka za stilove obične liste","Numbered list styles toolbar":"Alatna traka za stilove brojčane liste","Toggle the disc list style":"Primjeni disk stil","Toggle the circle list style":"Primjeni krug stil","Toggle the square list style":"Primjeni kvadrat stil","Toggle the decimal list style":"Primjeni decimalni stil","Toggle the decimal with leading zero list style":"Primjeni decimalni stil s vodećom nulom","Toggle the lower–roman list style":"Primjeni rimske brojeve mala slova stil","Toggle the upper–roman list style":"Primjeni rimske brojeve velika slova stil","Toggle the lower–latin list style":"Primjeni mala slova stil","Toggle the upper–latin list style":"Primjeni velika slova stil","Disc":"Disk","Circle":"Krug","Square":"Kvadrat","Decimal":"Decimalni","Decimal with leading zero":"Decimalni s vodećom nulom","Lower–roman":"Mali rimski brojevi","Upper-roman":"Veliki rimski brojevi","Lower-latin":"Mala slova","Upper-latin":"Velika slova","List properties":"Svojstva liste","Start at":"Počni sa","Invalid start index value.":"","Start index must be greater than 0.":"Početni indeks mora biti veći od 0.","Reversed order":"Obrnuti redoslijed","Keystrokes that can be used in a list":"","Increase list item indent":"","Decrease list item indent":"","Entering a to-do list":"","Leaving a to-do list":"","Toggle the arabic-indic list style":"","Arabic-indic":""},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'hr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hr' ].dictionary = Object.assign( e[ 'hr' ].dictionary, dictionary );
e[ 'hr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
