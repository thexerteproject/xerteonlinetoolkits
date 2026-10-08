/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tr' ]: { dictionary, getPluralForm } } = {"tr":{"dictionary":{"Enter fullscreen mode":"Tam ekran moduna gir","Leave fullscreen mode":"Tam ekran modundan çık","Fullscreen mode":"Tam ekran modu","Toggle fullscreen mode":"Tam ekran modunu aç/kapat","Document outline":"Belge ana hatları","Connected users":"Bağlı kullanıcılar","Show left sidebar":"Sol kenar çubuğunu göster","Hide left sidebar":"Sol kenar çubuğunu gizle","Toggle sidebar":"Kenar çubuğunu aç/kapat"},getPluralForm(n){return (n > 1);}}};
e[ 'tr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tr' ].dictionary = Object.assign( e[ 'tr' ].dictionary, dictionary );
e[ 'tr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
