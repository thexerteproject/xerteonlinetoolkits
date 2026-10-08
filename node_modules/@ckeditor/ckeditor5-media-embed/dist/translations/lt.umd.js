/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lt' ]: { dictionary, getPluralForm } } = {"lt":{"dictionary":{"media widget":"media valdiklis","Media URL":"Media URL","Paste the media URL in the input.":"Įklijuokite media URL adresą į įvedimo lauką.","Tip: Paste the URL into the content to embed faster.":"Patarimas: norėdami greičiau įterpti media tiesiog įklijuokite URL į turinį.","The URL must not be empty.":"URL negali būti tuščias.","This media URL is not supported.":"Šis media URL yra nepalaikomas.","Insert media":"Įterpkite media","Media":"Medija","Media toolbar":"Medijų įrankių juosta","Open media in new tab":"Atidaryti mediją naujame skirtuke","Media embed":"Medijos įterpimas"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'lt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lt' ].dictionary = Object.assign( e[ 'lt' ].dictionary, dictionary );
e[ 'lt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
