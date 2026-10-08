/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'he' ]: { dictionary, getPluralForm } } = {"he":{"dictionary":{"Yellow marker":"סימון צהוב","Green marker":"סימון ירוק","Pink marker":"סימון וורוד","Blue marker":"סימון כחול","Red pen":"עט אדום","Green pen":"עט ירוק","Remove highlight":"הסר הדגשה","Highlight":"הדגשה","Text highlight toolbar":"סרגל הדגשת טקסט"},getPluralForm(n){return (n != 1);}}};
e[ 'he' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'he' ].dictionary = Object.assign( e[ 'he' ].dictionary, dictionary );
e[ 'he' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
