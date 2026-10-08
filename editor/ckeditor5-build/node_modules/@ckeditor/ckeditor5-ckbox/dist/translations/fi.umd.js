/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fi' ]: { dictionary, getPluralForm } } = {"fi":{"dictionary":{"Open file manager":"Avaa tiedostonhallinnointityökalu","Cannot determine a category for the uploaded file.":"Emme voi määrittää ladatun tiedoston kategoriaa.","Cannot access default workspace.":"Oletustyötilan käyttöoikeudet puuttuvat.","You have no image editing permissions.":"Sinulla ei ole vaadittavaa käyttöoikeutta kuvan muokkaamiseen.","Edit image":"Muokkaa kuvaa","Processing the edited image.":"Käsitellään muokattua kuvaa.","Server failed to process the image.":"Palvelin ei kyennyt käsittelemään kuvaa.","Failed to determine category of edited image.":"Muokatun kuvan katergorian määrittäminen epäonnistui."},getPluralForm(n){return (n != 1);}}};
e[ 'fi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fi' ].dictionary = Object.assign( e[ 'fi' ].dictionary, dictionary );
e[ 'fi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
