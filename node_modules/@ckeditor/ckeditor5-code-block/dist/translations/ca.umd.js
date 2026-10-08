/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ca' ]: { dictionary, getPluralForm } } = {"ca":{"dictionary":{"Insert code block":"Introduir un bloc de codi","Plain text":"Text simple","Leaving %0 code snippet":"Sortint de %0 fragments de codi","Entering %0 code snippet":"S'està introduint %0 fragments de codi","Entering code snippet":"Introduint un fragment de codi","Leaving code snippet":"Sortint del fragment de codi","Code block":"Bloc de codis"},getPluralForm(n){return (n != 1);}}};
e[ 'ca' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ca' ].dictionary = Object.assign( e[ 'ca' ].dictionary, dictionary );
e[ 'ca' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
