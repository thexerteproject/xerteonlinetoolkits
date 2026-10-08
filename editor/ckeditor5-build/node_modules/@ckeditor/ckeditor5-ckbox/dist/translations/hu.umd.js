/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hu' ]: { dictionary, getPluralForm } } = {"hu":{"dictionary":{"Open file manager":"Fájlkezelő megnyitása","Cannot determine a category for the uploaded file.":"Nem sikerült meghatározni a feltöltött fájl kategóriáját.","Cannot access default workspace.":"Nem lehetséges hozzáférni az alapértelmezett munkaterülethez.","You have no image editing permissions.":"Nincs képszerkesztési engedélyed.","Edit image":"Kép szerkesztése","Processing the edited image.":"A szerkesztett kép feldolgozása.","Server failed to process the image.":"A szerver nem tudta feldolgozni a képet.","Failed to determine category of edited image.":"Nem sikerült meghatározni a szerkesztett kép kategóriáját."},getPluralForm(n){return (n != 1);}}};
e[ 'hu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hu' ].dictionary = Object.assign( e[ 'hu' ].dictionary, dictionary );
e[ 'hu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
