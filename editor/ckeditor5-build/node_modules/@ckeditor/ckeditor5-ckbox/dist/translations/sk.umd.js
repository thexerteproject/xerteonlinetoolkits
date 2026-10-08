/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sk' ]: { dictionary, getPluralForm } } = {"sk":{"dictionary":{"Open file manager":"Otvoriť manažér súborov","Cannot determine a category for the uploaded file.":"Neznáma kategória pre nahratý súbor.","Cannot access default workspace.":"Nie je možné získať prístup k predvolenému pracovnému priestoru.","You have no image editing permissions.":"Nemáte žiadne povolenia na úpravu obrázkov.","Edit image":"Upraviť obrázok","Processing the edited image.":"Spracovanie upraveného obrázka.","Server failed to process the image.":"Serveru sa nepodarilo spracovať obrázok.","Failed to determine category of edited image.":"Nepodarilo sa určiť kategóriu upraveného obrázka."},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'sk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sk' ].dictionary = Object.assign( e[ 'sk' ].dictionary, dictionary );
e[ 'sk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
