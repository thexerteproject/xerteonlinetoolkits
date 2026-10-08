/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tr' ]: { dictionary, getPluralForm } } = {"tr":{"dictionary":{"Insert code block":"Kod bloğu ekle","Plain text":"Düz metin","Leaving %0 code snippet":"%0 kod parçacığından ayrılınıyor","Entering %0 code snippet":"%0 kod parçacığına girmek","Entering code snippet":"Kod parçacığına girmek","Leaving code snippet":"Kod parçacığından ayrılma","Code block":"Kod bloku"},getPluralForm(n){return (n > 1);}}};
e[ 'tr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tr' ].dictionary = Object.assign( e[ 'tr' ].dictionary, dictionary );
e[ 'tr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
