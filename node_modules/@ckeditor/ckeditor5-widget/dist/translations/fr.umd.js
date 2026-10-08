/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fr' ]: { dictionary, getPluralForm } } = {"fr":{"dictionary":{"Widget toolbar":"Barre d'outils du widget","Insert paragraph before block":"Insérer du texte avant ce bloc","Insert paragraph after block":"Insérer du texte après ce bloc","Press Enter to type after or press Shift + Enter to type before the widget":"Appuyez sur la touche Entrée pour taper après ou sur Maj + Entrée pour taper avant le widget.","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Frappes de touches pouvant être utilisées lorsqu'un widget est sélectionné (par exemple : image, tableau, etc.)","Insert a new paragraph directly after a widget":"Insérer un nouveau paragraphe directement après un widget","Insert a new paragraph directly before a widget":"Insérer un nouveau paragraphe directement avant un widget","Move the caret to allow typing directly before a widget":"Déplacez le curseur pour permettre la saisie directement avant un widget","Move the caret to allow typing directly after a widget":"Déplacez le curseur pour permettre de taper directement après un widget","Move focus from an editable area back to the parent widget":"Déplacer le focus d'une zone modifiable vers le widget parent"},getPluralForm(n){return (n <= -2 || n >= 2);}}};
e[ 'fr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fr' ].dictionary = Object.assign( e[ 'fr' ].dictionary, dictionary );
e[ 'fr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
