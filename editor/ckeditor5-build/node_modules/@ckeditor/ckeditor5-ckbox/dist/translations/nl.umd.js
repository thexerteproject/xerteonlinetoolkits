/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'nl' ]: { dictionary, getPluralForm } } = {"nl":{"dictionary":{"Open file manager":"Open bestandsmanager","Cannot determine a category for the uploaded file.":"Kan geen categorie bepalen voor het geüploade bestand.","Cannot access default workspace.":"Geen toegang mogelijk tot standaard werkplek.","You have no image editing permissions.":"U heeft geen toestemming om afbeeldingen te bewerken.","Edit image":"Afbeelding bewerken","Processing the edited image.":"De bewerkte afbeelding verwerken.","Server failed to process the image.":"De server heeft de afbeelding niet verwerkt.","Failed to determine category of edited image.":"Het is niet gelukt om de categorie van de bewerkte afbeelding te bepalen."},getPluralForm(n){return (n != 1);}}};
e[ 'nl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'nl' ].dictionary = Object.assign( e[ 'nl' ].dictionary, dictionary );
e[ 'nl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
