/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de' ]: { dictionary, getPluralForm } } = {"de":{"dictionary":{"Open file manager":"Dateimanager öffnen","Cannot determine a category for the uploaded file.":"Die Kategorie für die hochgeladene Datei konnte nicht bestimmt werden.","Cannot access default workspace.":"Zugriff auf Standardarbeitsbereich nicht möglich.","You have no image editing permissions.":"Sie haben keine Berechtigung zum Bearbeiten von Bildern.","Edit image":"Bild bearbeiten","Processing the edited image.":"Das bearbeitete Bild wird verarbeitet.","Server failed to process the image.":"Der Server konnte das Bild nicht verarbeiten.","Failed to determine category of edited image.":"Es konnte für das bearbeitete Bild keine Kategorie ermittelt werden."},getPluralForm(n){return (n != 1);}}};
e[ 'de' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de' ].dictionary = Object.assign( e[ 'de' ].dictionary, dictionary );
e[ 'de' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
