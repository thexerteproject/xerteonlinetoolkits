/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hi' ]: { dictionary, getPluralForm } } = {"hi":{"dictionary":{"Insert code block":"Insert code block","Plain text":"Plain text","Leaving %0 code snippet":"%0 कोड स्निपेट से बहार निकला जा रहा है","Entering %0 code snippet":"%0 कोड स्निपेट में प्रवेश किया जा रहा है","Entering code snippet":"कोड स्निपेट में प्रवेश किया जा रहा है","Leaving code snippet":"कोड स्निपेट में प्रवेश किया जा रहा है","Code block":"कोड ब्लॉक"},getPluralForm(n){return (n != 1);}}};
e[ 'hi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hi' ].dictionary = Object.assign( e[ 'hi' ].dictionary, dictionary );
e[ 'hi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
