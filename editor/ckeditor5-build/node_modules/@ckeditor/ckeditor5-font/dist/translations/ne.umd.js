/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ne' ]: { dictionary, getPluralForm } } = {"ne":{"dictionary":{"Font Size":"फन्ट आकार","Tiny":"सानो","Small":"सानो","Big":"ठूलो","Huge":"विशाल","Font Family":"फन्ट परिवार","Default":"पूर्वनिर्धारित","Font Color":"फन्ट रंग","Font Background Color":"पृष्ठभूमिको फन्ट रंग","Document colors":"कागजात रंग"},getPluralForm(n){return (n != 1);}}};
e[ 'ne' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ne' ].dictionary = Object.assign( e[ 'ne' ].dictionary, dictionary );
e[ 'ne' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
