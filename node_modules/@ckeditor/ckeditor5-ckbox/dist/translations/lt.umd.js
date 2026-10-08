/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lt' ]: { dictionary, getPluralForm } } = {"lt":{"dictionary":{"Open file manager":"Atidaryti failų tvarkyklę","Cannot determine a category for the uploaded file.":"Negalima apibrėžti įkelto failo kategorijos.","Cannot access default workspace.":"Negalima pasiekti numatytosios darbo erdvės.","You have no image editing permissions.":"Jūs neturite leidimo nuotraukoms redaguoti.","Edit image":"Redaguoti paveikslėlį","Processing the edited image.":"Redaguojamo paveikslėlio apdorojimas.","Server failed to process the image.":"Serveriui nepavyko apdoroti paveikslėlio.","Failed to determine category of edited image.":"Nepavyko nustatyti redaguojamo paveikslėlio kategorijos."},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'lt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lt' ].dictionary = Object.assign( e[ 'lt' ].dictionary, dictionary );
e[ 'lt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
