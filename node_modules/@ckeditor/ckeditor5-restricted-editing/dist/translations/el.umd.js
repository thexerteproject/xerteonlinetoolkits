/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Enable editing":"Ενεργοποίηση επεξεργασίας","Previous editable region":"Προηγούμενη επεξεργάσιμη περιοχή","Next editable region":"Επόμενη επεξεργάσιμη περιοχή","Navigate editable regions":"Πλοήγηση στις επεξεργάσιμες περιοχές","Disable inline editing":"Απενεργοποίηση ενσωματωμένης επεξεργασίας","Enable inline editing":"Ενεργοποίηση ενσωματωμένης επεξεργασίας","Disable block editing":"Απενεργοποίηση επεξεργασίας μπλοκ","Enable block editing":"Ενεργοποίηση επεξεργασίας μπλοκ","Disable editing":"Απενεργοποίηση επεξεργασίας"},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
