/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'gl' ]: { dictionary, getPluralForm } } = {"gl":{"dictionary":{"Open file manager":"Abrir o xestor de ficheiros","Cannot determine a category for the uploaded file.":"Non é posíbel determinar unha categoría para o ficheiro enviado.","Cannot access default workspace.":"Non é posíbel acceder ao espazo de traballo predeterminado.","You have no image editing permissions.":"Vde. non ten permisos de edición de imaxes.","Edit image":"Editar imaxe","Processing the edited image.":"Procesando a imaxe editada.","Server failed to process the image.":"Produciuse un fallo no servidor ao procesar a imaxe.","Failed to determine category of edited image.":"Produciuse un fallo ao determinar a categoría da imaxe editada."},getPluralForm(n){return (n != 1);}}};
e[ 'gl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'gl' ].dictionary = Object.assign( e[ 'gl' ].dictionary, dictionary );
e[ 'gl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
