/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tr' ]: { dictionary, getPluralForm } } = {"tr":{"dictionary":{"Open file manager":"Dosya yöneticisini aç","Cannot determine a category for the uploaded file.":"Yüklenen dosya için bir kategori belirlenemiyor.","Cannot access default workspace.":"Varsayılan çalışma alanına erişilemiyor.","You have no image editing permissions.":"Görüntü düzenleme izniniz yok.","Edit image":"Görüntüyü düzenle","Processing the edited image.":"Düzenlenen görüntü işleniyor.","Server failed to process the image.":"Sunucu görüntüyü işlemede başarısız oldu.","Failed to determine category of edited image.":"Düzenlenen görselin kategorisinin belirlenmesi başarısız oldu."},getPluralForm(n){return (n > 1);}}};
e[ 'tr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tr' ].dictionary = Object.assign( e[ 'tr' ].dictionary, dictionary );
e[ 'tr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
