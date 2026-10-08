/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sv' ]: { dictionary, getPluralForm } } = {"sv":{"dictionary":{"Insert code block":"Infoga kodblock","Plain text":"Vanlig text","Leaving %0 code snippet":"Lämnar %0-kodsnutt","Entering %0 code snippet":"Anger %0-kodsnutt","Entering code snippet":"Anger kodsnutt","Leaving code snippet":"Lämnar kodsnutt","Code block":"Kodblock"},getPluralForm(n){return (n != 1);}}};
e[ 'sv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sv' ].dictionary = Object.assign( e[ 'sv' ].dictionary, dictionary );
e[ 'sv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
