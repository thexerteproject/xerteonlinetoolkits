/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'no' ]: { dictionary, getPluralForm } } = {"no":{"dictionary":{"Open file manager":"Åpne filutforsker","Cannot determine a category for the uploaded file.":"Kunne ikke avgjøre kategori for den opplastede filen.","Cannot access default workspace.":"Får ikke tilgang til standard arbeidsflate.","You have no image editing permissions.":"Du har ingen bilderedigeringstillatelser.","Edit image":"Redigere bilde","Processing the edited image.":"Behandler det redigerte bildet.","Server failed to process the image.":"Serveren klarte ikke å behandle bildet.","Failed to determine category of edited image.":"Kunne ikke bestemme kategori for det redigerte bildet."},getPluralForm(n){return (n != 1);}}};
e[ 'no' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'no' ].dictionary = Object.assign( e[ 'no' ].dictionary, dictionary );
e[ 'no' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
