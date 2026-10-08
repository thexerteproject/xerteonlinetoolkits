/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tr' ]: { dictionary, getPluralForm } } = {"tr":{"dictionary":{"Insert HTML":"HTML ekle","HTML snippet":"HTML snippet'i","Paste raw HTML here...":"Ham HTML'yi buraya yapıştırın...","Edit source":"Kaynağı düzenle","Save changes":"Değişiklikleri kaydet","No preview available":"Önizleme yok","Empty snippet content":"Snippet içeriği boş"},getPluralForm(n){return (n > 1);}}};
e[ 'tr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tr' ].dictionary = Object.assign( e[ 'tr' ].dictionary, dictionary );
e[ 'tr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
