/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'he' ]: { dictionary, getPluralForm } } = {"he":{"dictionary":{"Align left":"יישור לשמאל","Align right":"יישור לימין","Align center":"יישור באמצע","Justify":"מרכוז גבולות","Text alignment":"יישור טקסט","Text alignment toolbar":"סרגל כלים יישור טקסט"},getPluralForm(n){return (n != 1);}}};
e[ 'he' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'he' ].dictionary = Object.assign( e[ 'he' ].dictionary, dictionary );
e[ 'he' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
