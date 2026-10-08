/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bg' ]: { dictionary, getPluralForm } } = {"bg":{"dictionary":{"Insert code block":"Въведи кодов блок","Plain text":"Обикновен текст","Leaving %0 code snippet":"Оставяне %0 отрязък от код","Entering %0 code snippet":"Въвеждане %0 отрязък от код","Entering code snippet":"Въвеждане на отрязък от код","Leaving code snippet":"Оставяне на отрязък от код","Code block":"Кодов блок"},getPluralForm(n){return (n != 1);}}};
e[ 'bg' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bg' ].dictionary = Object.assign( e[ 'bg' ].dictionary, dictionary );
e[ 'bg' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
