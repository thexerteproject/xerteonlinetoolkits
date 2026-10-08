/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sq' ]: { dictionary, getPluralForm } } = {"sq":{"dictionary":{"Font Size":"Madhësia tekstit","Tiny":"I vocërr","Small":"I vogël","Big":"I madh","Huge":"I stërmadh","Font Family":"Familja e fontit","Default":"Parazgjedhur","Font Color":"Ngjyra e tekstit","Font Background Color":"Ngjyra e tekstit të prapavijës","Document colors":"Ngjyra e dokumentit"},getPluralForm(n){return (n != 1);}}};
e[ 'sq' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sq' ].dictionary = Object.assign( e[ 'sq' ].dictionary, dictionary );
e[ 'sq' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
