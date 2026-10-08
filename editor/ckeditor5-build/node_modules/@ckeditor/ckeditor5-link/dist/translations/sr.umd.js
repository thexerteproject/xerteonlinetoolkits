/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sr' ]: { dictionary, getPluralForm } } = {"sr":{"dictionary":{"Unlink":"Отклони линк","Link":"Линк","Link URL":"УРЛ линк","Link URL must not be empty.":"URL linka ne sme biti prazan.","Link image":"Линк слике","Edit link":"Исправи линк","Open link in new tab":"Отвори линк у новом прозору","Open in a new tab":"Отвори у новој картици","Downloadable":"Могуће преузимање","Create link":"Napravi vezu","Move out of a link":"Idi sa veze","Link properties":"Svojstva veze","Displayed text":"Prikazani tekst","No links available":"Nema dostupnih veza"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'sr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sr' ].dictionary = Object.assign( e[ 'sr' ].dictionary, dictionary );
e[ 'sr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
