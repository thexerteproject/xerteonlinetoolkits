/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en' ]: { dictionary, getPluralForm } } = {"en":{"dictionary":{"Open file manager":"Open file manager","Cannot determine a category for the uploaded file.":"Cannot determine a category for the uploaded file.","Cannot access default workspace.":"Cannot access default workspace.","You have no image editing permissions.":"You have no image editing permissions.","Edit image":"Edit image","Processing the edited image.":"Processing the edited image.","Server failed to process the image.":"Server failed to process the image.","Failed to determine category of edited image.":"Failed to determine category of edited image."},getPluralForm(n){return (n != 1);}}};
e[ 'en' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en' ].dictionary = Object.assign( e[ 'en' ].dictionary, dictionary );
e[ 'en' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
