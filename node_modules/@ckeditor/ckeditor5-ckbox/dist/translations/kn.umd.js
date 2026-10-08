/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'kn' ]: { dictionary, getPluralForm } } = {"kn":{"dictionary":{"Open file manager":"","Cannot determine a category for the uploaded file.":"","Cannot access default workspace.":"","You have no image editing permissions.":"","Edit image":"","Processing the edited image.":"","Server failed to process the image.":"","Failed to determine category of edited image.":""},getPluralForm(n){return (n != 1);}}};
e[ 'kn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'kn' ].dictionary = Object.assign( e[ 'kn' ].dictionary, dictionary );
e[ 'kn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
