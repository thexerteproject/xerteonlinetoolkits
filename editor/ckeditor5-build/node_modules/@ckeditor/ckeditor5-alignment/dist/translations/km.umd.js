/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'km' ]: { dictionary, getPluralForm } } = {"km":{"dictionary":{"Align left":"តម្រឹម​ឆ្វេង","Align right":"តម្រឹម​ស្ដាំ","Align center":"តម្រឹម​កណ្ដាល","Justify":"តម្រឹម​សងខាង","Text alignment":"ការ​តម្រឹម​អក្សរ","Text alignment toolbar":"របារ​ឧបករណ៍​តម្រឹម​អក្សរ"},getPluralForm(n){return 0;}}};
e[ 'km' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'km' ].dictionary = Object.assign( e[ 'km' ].dictionary, dictionary );
e[ 'km' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
