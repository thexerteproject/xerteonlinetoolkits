/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ne' ]: { dictionary, getPluralForm } } = {"ne":{"dictionary":{"Yellow marker":"पहेंलो मार्कर","Green marker":"हरियो मार्कर","Pink marker":"गुलाबी मार्कर","Blue marker":"नीलो मार्कर","Red pen":"रातो कलम","Green pen":"हरियो कलम","Remove highlight":"हाइलाइट हटाउनुहोस्","Highlight":"हाइलाइट","Text highlight toolbar":""},getPluralForm(n){return (n != 1);}}};
e[ 'ne' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ne' ].dictionary = Object.assign( e[ 'ne' ].dictionary, dictionary );
e[ 'ne' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
