/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pl' ]: { dictionary, getPluralForm } } = {"pl":{"dictionary":{"Open file manager":"Otwórz menedżer plików","Cannot determine a category for the uploaded file.":"Nie można ustalić kategorii przesłanego pliku.","Cannot access default workspace.":"Nie można uzyskać dostępu do domyślnego obszaru roboczego.","You have no image editing permissions.":"Nie masz uprawnień do edytowania obrazów.","Edit image":"Edytuj obraz","Processing the edited image.":"Trwa przetwarzanie edytowanego obrazu.","Server failed to process the image.":"Serwer nie mógł przetworzyć obrazu.","Failed to determine category of edited image.":"Nie udało się określić kategorii edytowanego obrazu."},getPluralForm(n){return (n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'pl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pl' ].dictionary = Object.assign( e[ 'pl' ].dictionary, dictionary );
e[ 'pl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
