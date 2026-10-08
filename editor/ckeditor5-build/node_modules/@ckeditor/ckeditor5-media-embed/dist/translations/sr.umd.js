/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sr' ]: { dictionary, getPluralForm } } = {"sr":{"dictionary":{"media widget":"Медиа wидгет","Media URL":"Mедиа УРЛ","Paste the media URL in the input.":"Налепи медијски УРЛ у поље за унос","Tip: Paste the URL into the content to embed faster.":"Савет: Залепите УРЛ у садржај да би сте га брже уградили.","The URL must not be empty.":"УРЛ не сме бити празан.","This media URL is not supported.":"Овај медиа УРЛ тип није подржан.","Insert media":"Додај медиа","Media":"Medijski sadržaj","Media toolbar":"Медији трака са алаткама","Open media in new tab":"Отворите медије у новој картици","Media embed":"Ugradi medij"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'sr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sr' ].dictionary = Object.assign( e[ 'sr' ].dictionary, dictionary );
e[ 'sr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
