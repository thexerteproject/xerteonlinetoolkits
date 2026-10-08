/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ug' ]: { dictionary, getPluralForm } } = {"ug":{"dictionary":{"Heading":"ماۋزۇ","Choose heading":"ماۋزۇ تاللاش","Heading 1":"ماۋزۇ 1","Heading 2":"ماۋزۇ 2","Heading 3":"ماۋزۇ 3","Heading 4":"ماۋزۇ 4","Heading 5":"ماۋزۇ 5","Heading 6":"ماۋزۇ 6","Type your title":"ماۋزۇ كىرگۈزۈلىدۇ","Type or paste your content here.":"مەزمۇن بۇ جايغا كىرگۈزۈلىدۇ ياكى چاپلىنىدۇ."},getPluralForm(n){return 0;}}};
e[ 'ug' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ug' ].dictionary = Object.assign( e[ 'ug' ].dictionary, dictionary );
e[ 'ug' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
