/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ur' ]: { dictionary, getPluralForm } } = {"ur":{"dictionary":{"Align left":"بائیں سیدھ","Align right":"دائیں سیدھ","Align center":"درمیانی سیدھ","Justify":"برابر سیدھ","Text alignment":"متن کی سیدھ","Text alignment toolbar":"خانہ آلات برائے سیدھ"},getPluralForm(n){return (n != 1);}}};
e[ 'ur' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ur' ].dictionary = Object.assign( e[ 'ur' ].dictionary, dictionary );
e[ 'ur' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
