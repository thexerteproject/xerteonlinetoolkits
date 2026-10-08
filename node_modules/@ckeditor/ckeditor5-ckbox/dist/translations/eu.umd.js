/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'eu' ]: { dictionary, getPluralForm } } = {"eu":{"dictionary":{"Open file manager":"","Cannot determine a category for the uploaded file.":"","Cannot access default workspace.":"","You have no image editing permissions.":"","Edit image":"","Processing the edited image.":"","Server failed to process the image.":"","Failed to determine category of edited image.":""},getPluralForm(n){return (n != 1);}}};
e[ 'eu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'eu' ].dictionary = Object.assign( e[ 'eu' ].dictionary, dictionary );
e[ 'eu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
