/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'az' ]: { dictionary, getPluralForm } } = {"az":{"dictionary":{"Font Size":"Şrift ölçüsü","Tiny":"Miniatür","Small":"Kiçik","Big":"Böyük","Huge":"Nəhəng","Font Family":"Şrift ailəsi","Default":"Default","Font Color":"Şrift Rəngi","Font Background Color":"Şrift Fonunun Rəngi","Document colors":"Rənglər"},getPluralForm(n){return (n != 1);}}};
e[ 'az' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'az' ].dictionary = Object.assign( e[ 'az' ].dictionary, dictionary );
e[ 'az' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
