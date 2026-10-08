/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ti' ]: { dictionary, getPluralForm } } = {"ti":{"dictionary":{"Bold":"ቦልድ","Italic":"ኢታሊክ","Underline":"ኣስምር","Code":"ኮድ","Strikethrough":"ሰርዝ","Subscript":"ሳብስክሪፕት","Superscript":"ሱፐርስክሪፕት","Italic text":"ኢታሊክ ጽሑፍ","Move out of an inline code style":"","Bold text":"ጽሑፍ ኣጉልህ","Underline text":"ጽሑፍ ኣስምር","Strikethrough text":"ጽሑፍ ሰርዝ"},getPluralForm(n){return (n > 1);}}};
e[ 'ti' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ti' ].dictionary = Object.assign( e[ 'ti' ].dictionary, dictionary );
e[ 'ti' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
