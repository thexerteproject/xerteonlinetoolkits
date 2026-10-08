/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sv' ]: { dictionary, getPluralForm } } = {"sv":{"dictionary":{"Find and replace":"Hitta och ersätt","Find in text…":"Hitta i text ...","Find":"Hitta","Previous result":"Föregående träff","Next result":"Nästa träff","Replace":"Ersätt","Replace all":"Ersätt alla","Match case":"Matcha versaler","Whole words only":"Enbart hela ord","Replace with…":"Ersätt med ...","Text to find must not be empty.":"Text att hitta får inte vara tom.","Tip: Find some text first in order to replace it.":"Tips: Hitta någon text först för att ersätta den.","Advanced options":"Avancerade alternativ","Find in the document":"Hitta i dokumentet"},getPluralForm(n){return (n != 1);}}};
e[ 'sv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sv' ].dictionary = Object.assign( e[ 'sv' ].dictionary, dictionary );
e[ 'sv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
