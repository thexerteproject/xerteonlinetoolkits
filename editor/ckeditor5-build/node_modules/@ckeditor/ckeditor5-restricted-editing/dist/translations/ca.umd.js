/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ca' ]: { dictionary, getPluralForm } } = {"ca":{"dictionary":{"Enable editing":"Activar l'edició","Previous editable region":"Part editable anterior","Next editable region":"Següent part editable","Navigate editable regions":"Navegar per parts editables","Disable inline editing":"Desactivar l'edició en línia","Enable inline editing":"Activar l'edició en línia","Disable block editing":"Desactivar l'edició per blocs","Enable block editing":"Activar l'edició per blocs","Disable editing":"Desactivar l'edició"},getPluralForm(n){return (n != 1);}}};
e[ 'ca' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ca' ].dictionary = Object.assign( e[ 'ca' ].dictionary, dictionary );
e[ 'ca' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
