/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sq' ]: { dictionary, getPluralForm } } = {"sq":{"dictionary":{"Enable editing":"Munëso redaktimin","Previous editable region":"Rajoni paraprak i redaktueshëm","Next editable region":"Rajoni i redaktueshëm i radhës","Navigate editable regions":"Navigo rajonet e redaktueshme","Disable inline editing":"","Enable inline editing":"","Disable block editing":"","Enable block editing":"","Disable editing":""},getPluralForm(n){return (n != 1);}}};
e[ 'sq' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sq' ].dictionary = Object.assign( e[ 'sq' ].dictionary, dictionary );
e[ 'sq' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
