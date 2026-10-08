/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'et' ]: { dictionary, getPluralForm } } = {"et":{"dictionary":{"Open file manager":"Ava failihaldur","Cannot determine a category for the uploaded file.":"Ei suuda üles laaditud faili kategooriat tuvastada.","Cannot access default workspace.":"Puudub juurdepääs vaiketööruumile.","You have no image editing permissions.":"Puudub pildi muutmise luba","Edit image":"Redigeeri pilti","Processing the edited image.":"Redigeeritud pildi töötlemine.","Server failed to process the image.":"Serveril ei õnnestunud pilti töödelda.","Failed to determine category of edited image.":"Redigeeritud pildi kategooria määramine nurjus."},getPluralForm(n){return (n != 1);}}};
e[ 'et' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'et' ].dictionary = Object.assign( e[ 'et' ].dictionary, dictionary );
e[ 'et' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
