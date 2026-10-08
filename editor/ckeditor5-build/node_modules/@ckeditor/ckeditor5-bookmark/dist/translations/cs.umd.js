/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'cs' ]: { dictionary, getPluralForm } } = {"cs":{"dictionary":{"Bookmark":"Záložka","Edit bookmark":"Upravit záložku","Remove bookmark":"Odstranit záložku","Bookmark name":"Název záložky","Enter the bookmark name without spaces.":"Zadejte název záložky bez mezer.","Bookmark must not be empty.":"Záložka nesmí být prázdná","Bookmark name cannot contain space characters.":"Název záložky nemůže obsahovat znaky mezery.","Bookmark name already exists.":"Záložka s tímto názvem už existuje.","bookmark widget":"widget záložky","Bookmark toolbar":"Panel nástrojů záložek","Bookmarks":"Záložky","No bookmarks available.":"Žádné záložky nejsou k dispozici","Scroll to bookmark":"Přejít na záložku"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'cs' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'cs' ].dictionary = Object.assign( e[ 'cs' ].dictionary, dictionary );
e[ 'cs' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
