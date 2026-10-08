/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bg' ]: { dictionary, getPluralForm } } = {"bg":{"dictionary":{"Yellow marker":"Жълт маркер","Green marker":"Зелен маркер","Pink marker":"Розов маркер","Blue marker":"Син маркер","Red pen":"Червена химикалка","Green pen":"Зелена химикалка","Remove highlight":"Премахни подчертаване","Highlight":"Подчертай","Text highlight toolbar":"Лента за подчертаване на текст"},getPluralForm(n){return (n != 1);}}};
e[ 'bg' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bg' ].dictionary = Object.assign( e[ 'bg' ].dictionary, dictionary );
e[ 'bg' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
