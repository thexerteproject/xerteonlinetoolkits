/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'nb' ]: { dictionary, getPluralForm } } = {"nb":{"dictionary":{"Yellow marker":"Gul uthevingsfarge","Green marker":"Grønn uthevingsfarge","Pink marker":"Rosa uthevingsfarge","Blue marker":"Blå uthevingsfarge","Red pen":"Rød penn","Green pen":"Grønn penn","Remove highlight":"Fjern uthevingsfarge","Highlight":"Utheving","Text highlight toolbar":""},getPluralForm(n){return (n != 1);}}};
e[ 'nb' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'nb' ].dictionary = Object.assign( e[ 'nb' ].dictionary, dictionary );
e[ 'nb' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
