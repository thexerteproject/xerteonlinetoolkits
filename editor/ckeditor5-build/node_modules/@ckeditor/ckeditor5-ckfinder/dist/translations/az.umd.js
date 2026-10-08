/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'az' ]: { dictionary, getPluralForm } } = {"az":{"dictionary":{"Insert image or file":"Şəkil və ya fayl əlavə ed","Could not obtain resized image URL.":"Ölçüsü dəyişmiş təsvirin URL-ni əldə etmək mümkün olmadı","Selecting resized image failed":"Ölçüsü dəyişmiş təsvirin seçilməsi uğursuz oldu","Could not insert image at the current position.":"Şəkili əlavə etmək mümkün deyil","Inserting image failed":"Şəkili əlavə edilmədi"},getPluralForm(n){return (n != 1);}}};
e[ 'az' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'az' ].dictionary = Object.assign( e[ 'az' ].dictionary, dictionary );
e[ 'az' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
