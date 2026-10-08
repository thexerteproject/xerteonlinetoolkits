/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tr' ]: { dictionary, getPluralForm } } = {"tr":{"dictionary":{"Heading":"Başlık","Choose heading":"Başlık tipi seç","Heading 1":"1. Seviye Başlık","Heading 2":"2. Seviye Başlık","Heading 3":"3. Seviye Başlık","Heading 4":"4. Seviye Başlık","Heading 5":"5. Seviye Başlık","Heading 6":"6. Seviye Başlık","Type your title":"Başlığınızı yazınız","Type or paste your content here.":"İçeriğinizi buraya yapıştırın yada yazın."},getPluralForm(n){return (n > 1);}}};
e[ 'tr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tr' ].dictionary = Object.assign( e[ 'tr' ].dictionary, dictionary );
e[ 'tr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
