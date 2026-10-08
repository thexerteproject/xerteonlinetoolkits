/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fr' ]: { dictionary, getPluralForm } } = {"fr":{"dictionary":{"Open file manager":"Ouvrir le gestionnaire de fichiers","Cannot determine a category for the uploaded file.":"Impossible de déterminer une catégorie pour le fichier téléchargé.","Cannot access default workspace.":"Impossible d'accéder à l'espace de travail par défaut.","You have no image editing permissions.":"Vous n'êtes pas autorisé à traiter des images.","Edit image":"Modifier l'image","Processing the edited image.":"Traitement de l'image modifiée.","Server failed to process the image.":"Le serveur n'a pas réussi à traiter l'image.","Failed to determine category of edited image.":"Échec de la détermination de la catégorie de l'image modifiée."},getPluralForm(n){return (n <= -2 || n >= 2);}}};
e[ 'fr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fr' ].dictionary = Object.assign( e[ 'fr' ].dictionary, dictionary );
e[ 'fr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
