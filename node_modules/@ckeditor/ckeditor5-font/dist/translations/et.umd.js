/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'et' ]: { dictionary, getPluralForm } } = {"et":{"dictionary":{"Font Size":"Teksti suurus","Tiny":"Imepisike","Small":"Väike","Big":"Suur","Huge":"Ülisuur","Font Family":"Kirjastiil","Default":"Vaikimisi","Font Color":"Fondi värvus","Font Background Color":"Kirja tausta värvus","Document colors":"Dokumendi värvid"},getPluralForm(n){return (n != 1);}}};
e[ 'et' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'et' ].dictionary = Object.assign( e[ 'et' ].dictionary, dictionary );
e[ 'et' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
