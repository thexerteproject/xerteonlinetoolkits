/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ne' ]: { dictionary, getPluralForm } } = {"ne":{"dictionary":{"Align left":"बायाँ पङ्क्तिबद्ध गर्नुहोस्","Align right":"दायाँ पङ्क्तिबद्ध गर्नुहोस्","Align center":"केन्द्र पङ्क्तिबद्ध गर्नुहोस्","Justify":"जस्टिफाइ गर्नुहोस्","Text alignment":"पाठ संरेखण","Text alignment toolbar":""},getPluralForm(n){return (n != 1);}}};
e[ 'ne' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ne' ].dictionary = Object.assign( e[ 'ne' ].dictionary, dictionary );
e[ 'ne' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
