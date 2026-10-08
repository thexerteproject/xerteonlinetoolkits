/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sl' ]: { dictionary, getPluralForm } } = {"sl":{"dictionary":{"Open file manager":"","Cannot determine a category for the uploaded file.":"","Cannot access default workspace.":"","You have no image editing permissions.":"","Edit image":"","Processing the edited image.":"","Server failed to process the image.":"","Failed to determine category of edited image.":""},getPluralForm(n){return (n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0);}}};
e[ 'sl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sl' ].dictionary = Object.assign( e[ 'sl' ].dictionary, dictionary );
e[ 'sl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
