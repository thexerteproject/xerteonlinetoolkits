/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tr' ]: { dictionary, getPluralForm } } = {"tr":{"dictionary":{"media widget":"medya aracı","Media URL":"Medya URL'si","Paste the media URL in the input.":"Medya URL'siini metin kutusuna yapıştırınız.","Tip: Paste the URL into the content to embed faster.":"İpucu: İçeriği daha hızlı yerleştirmek için URL'yi yapıştırın.","The URL must not be empty.":"URL boş olamaz.","This media URL is not supported.":"Desteklenmeyen Medya URL'si.","Insert media":"Medya Ekle","Media":"Medya","Media toolbar":"Medya araç çubuğu","Open media in new tab":"Medyayı yeni sekmede aç","Media embed":"Medya yerleştirme"},getPluralForm(n){return (n > 1);}}};
e[ 'tr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tr' ].dictionary = Object.assign( e[ 'tr' ].dictionary, dictionary );
e[ 'tr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
