/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tk' ]: { dictionary, getPluralForm } } = {"tk":{"dictionary":{"Open file manager":"","Cannot determine a category for the uploaded file.":"","Cannot access default workspace.":"","You have no image editing permissions.":"","Edit image":"","Processing the edited image.":"","Server failed to process the image.":"","Failed to determine category of edited image.":""},getPluralForm(n){return (n != 1);}}};
e[ 'tk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tk' ].dictionary = Object.assign( e[ 'tk' ].dictionary, dictionary );
e[ 'tk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
