/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'es' ]: { dictionary, getPluralForm } } = {"es":{"dictionary":{"Enable editing":"Habilitar edición","Previous editable region":"Anterior zona editable","Next editable region":"Siguiente zona editable","Navigate editable regions":"Navegar por las zonas editables","Disable inline editing":"Deshabilitar la edición en línea","Enable inline editing":"Habilitar la edición en línea","Disable block editing":"Deshabilitar la edición de bloques","Enable block editing":"Habilitar la edición de bloques","Disable editing":"Deshabilitar la edición"},getPluralForm(n){return (n != 1);}}};
e[ 'es' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'es' ].dictionary = Object.assign( e[ 'es' ].dictionary, dictionary );
e[ 'es' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
