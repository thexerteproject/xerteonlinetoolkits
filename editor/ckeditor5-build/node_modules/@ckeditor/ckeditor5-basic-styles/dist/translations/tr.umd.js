/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tr' ]: { dictionary, getPluralForm } } = {"tr":{"dictionary":{"Bold":"Kalın","Italic":"İtalik","Underline":"Altı Çizgili","Code":"Kod","Strikethrough":"Üstü çizili","Subscript":"Alt Simge","Superscript":"Üst Simge","Italic text":"İtalik metin","Move out of an inline code style":"Satır içi kod stilinden çık","Bold text":"Kalın yazı","Underline text":"Metnin altını çiz","Strikethrough text":"Metnin üstünü çiz"},getPluralForm(n){return (n > 1);}}};
e[ 'tr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tr' ].dictionary = Object.assign( e[ 'tr' ].dictionary, dictionary );
e[ 'tr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
