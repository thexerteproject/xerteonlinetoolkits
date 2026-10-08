/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Yellow marker":"Επισημαντής κίτρινου","Green marker":"Επισημαντής πράσινου","Pink marker":"Επισημαντής ροζ","Blue marker":"Επισημαντής μπλε","Red pen":"Πένα κόκκινου","Green pen":"Πένα πράσινου","Remove highlight":"Απομάκρυνση επισήμανσης","Highlight":"Επισήμανση","Text highlight toolbar":"Γραμμή εργαλείων επισήμανσης κειμένου"},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
