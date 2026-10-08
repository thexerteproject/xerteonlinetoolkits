/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ja' ]: { dictionary, getPluralForm } } = {"ja":{"dictionary":{"Enable editing":"編集を有効にする","Previous editable region":"前の編集可能な領域","Next editable region":"次に編集可能な領域","Navigate editable regions":"編集可能な領域をナビゲート","Disable inline editing":"インライン編集を無効にする","Enable inline editing":"インライン編集を有効にする","Disable block editing":"ブロック編集を無効にする","Enable block editing":"ブロック編集を有効にする","Disable editing":"編集を無効にする"},getPluralForm(n){return 0;}}};
e[ 'ja' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ja' ].dictionary = Object.assign( e[ 'ja' ].dictionary, dictionary );
e[ 'ja' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
