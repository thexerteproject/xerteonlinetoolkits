/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'no' ]: { dictionary, getPluralForm } } = {"no":{"dictionary":{"Font Size":"Skriftstørrelse","Tiny":"Veldig liten","Small":"Liten","Big":"Stor","Huge":"Veldig stor","Font Family":"Skrifttypefamilie","Default":"Standard","Font Color":"Skriftfarge","Font Background Color":"Uthevingsfarge for tekst","Document colors":"Dokumentfarger"},getPluralForm(n){return (n != 1);}}};
e[ 'no' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'no' ].dictionary = Object.assign( e[ 'no' ].dictionary, dictionary );
e[ 'no' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
