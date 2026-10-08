/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lv' ]: { dictionary, getPluralForm } } = {"lv":{"dictionary":{"media widget":"medija sīkrīks","Media URL":"Medija URL","Paste the media URL in the input.":"Ielīmējiet medija URL teksta laukā.","Tip: Paste the URL into the content to embed faster.":"Padoms: Ielīmējiet adresi saturā, lai iegultu","The URL must not be empty.":"URL ir jābūt ievadītam.","This media URL is not supported.":"Šis medija URL netiek atbalstīts.","Insert media":"Ievietot mediju","Media":"Ievietot, izmantojot plašsaziņas līdzekļus","Media toolbar":"Mediju rīkjosla","Open media in new tab":"Atvērt mediju jaunā cilnē","Media embed":"Multivides saites"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2);}}};
e[ 'lv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lv' ].dictionary = Object.assign( e[ 'lv' ].dictionary, dictionary );
e[ 'lv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
