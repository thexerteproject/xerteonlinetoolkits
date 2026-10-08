/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sv' ]: { dictionary, getPluralForm } } = {"sv":{"dictionary":{"Open file manager":"Öppna filhanterare","Cannot determine a category for the uploaded file.":"Kan inte avgöra kategorin på den uppladdade filen.","Cannot access default workspace.":"Kan inte komma åt standardarbetsytan.","You have no image editing permissions.":"Du saknar behörighet att redigera bilder.","Edit image":"Redigera bild","Processing the edited image.":"Bearbetar den redigerade bilden.","Server failed to process the image.":"Servern kunde inte bearbeta bilden.","Failed to determine category of edited image.":"Kunde inte fastställa den redigerade bildens kategori."},getPluralForm(n){return (n != 1);}}};
e[ 'sv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sv' ].dictionary = Object.assign( e[ 'sv' ].dictionary, dictionary );
e[ 'sv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
