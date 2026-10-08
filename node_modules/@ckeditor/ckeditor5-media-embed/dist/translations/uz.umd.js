/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'uz' ]: { dictionary, getPluralForm } } = {"uz":{"dictionary":{"media widget":"media vidjeti","Media URL":"Media URL manzili","Paste the media URL in the input.":"Media URL manzilini kiritish maydoniga joylashtiring.","Tip: Paste the URL into the content to embed faster.":"Maslahat: Tez kiritish uchun URL manzilini kontentga joylashtiring.","The URL must not be empty.":"URL bo'sh bo'lmasligi kerak.","This media URL is not supported.":"Ushbu media URL manzili qo‘llab-quvvatlanmaydi.","Insert media":"Mediani joylashtiring","Media":"","Media toolbar":"Media asboblar paneli","Open media in new tab":"","Media embed":""},getPluralForm(n){return (n > 1);}}};
e[ 'uz' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'uz' ].dictionary = Object.assign( e[ 'uz' ].dictionary, dictionary );
e[ 'uz' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
