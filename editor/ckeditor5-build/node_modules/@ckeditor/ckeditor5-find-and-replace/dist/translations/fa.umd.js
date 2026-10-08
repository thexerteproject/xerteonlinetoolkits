/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fa' ]: { dictionary, getPluralForm } } = {"fa":{"dictionary":{"Find and replace":"جست و جو و جایگزینی","Find in text…":"جست و جو در متن...","Find":"جست و جو","Previous result":"نتیجه قبلی","Next result":"نتیجه بعدی","Replace":"جایگزینی","Replace all":"جایگزینی همه","Match case":"","Whole words only":"","Replace with…":"جایگزینی با...","Text to find must not be empty.":"واژه جست و جو شده نباید خالی باشد.","Tip: Find some text first in order to replace it.":"نکته: برای جایگزینی نخست واژه را پیدا کنید.","Advanced options":"","Find in the document":""},getPluralForm(n){return 0;}}};
e[ 'fa' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fa' ].dictionary = Object.assign( e[ 'fa' ].dictionary, dictionary );
e[ 'fa' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
