/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fa' ]: { dictionary, getPluralForm } } = {"fa":{"dictionary":{"Font Size":"اندازه فونت","Tiny":"بسیار کوچک","Small":"کوچک","Big":"بزرگ","Huge":"بسیار بزرگ","Font Family":"خانواده فونت","Default":"پیش فرض","Font Color":"رنگ فونت","Font Background Color":"رنگ پس زمینه فونت","Document colors":"رنگ اسناد"},getPluralForm(n){return 0;}}};
e[ 'fa' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fa' ].dictionary = Object.assign( e[ 'fa' ].dictionary, dictionary );
e[ 'fa' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
