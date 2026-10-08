/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tk' ]: { dictionary, getPluralForm } } = {"tk":{"dictionary":{"media widget":"media widjeti","Media URL":"Media URL","Paste the media URL in the input.":"Media URL-ni girişde goýuň.","Tip: Paste the URL into the content to embed faster.":"Maslahat: Has çalt ýerleşdirmek üçin URL-i mazmuna goýuň.","The URL must not be empty.":"URL boş bolmaly däldir.","This media URL is not supported.":"Bu media URL goldanok.","Insert media":"Mediýa goýuň","Media":"","Media toolbar":"Mediýa gurallar paneli","Open media in new tab":"","Media embed":""},getPluralForm(n){return (n != 1);}}};
e[ 'tk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tk' ].dictionary = Object.assign( e[ 'tk' ].dictionary, dictionary );
e[ 'tk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
