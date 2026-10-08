/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ku' ]: { dictionary, getPluralForm } } = {"ku":{"dictionary":{"Font Size":"قەبارەی فۆنت","Tiny":"گچکە","Small":"بچوک","Big":"گەورە","Huge":"زۆر گەورە","Font Family":"فۆنتی خێزانی","Default":"بنچینە","Font Color":"ڕەنگی فۆنت","Font Background Color":"ڕەنگی پاشبنەمای فۆنت","Document colors":"ڕەنگەکانی دۆکومێنت"},getPluralForm(n){return (n != 1);}}};
e[ 'ku' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ku' ].dictionary = Object.assign( e[ 'ku' ].dictionary, dictionary );
e[ 'ku' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
