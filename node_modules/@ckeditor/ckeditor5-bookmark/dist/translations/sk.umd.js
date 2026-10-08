/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sk' ]: { dictionary, getPluralForm } } = {"sk":{"dictionary":{"Bookmark":"Záložka","Edit bookmark":"Upraviť záložku","Remove bookmark":"Odstrániť záložku","Bookmark name":"Názov záložky","Enter the bookmark name without spaces.":"Zadajte názov záložky bez medzier.","Bookmark must not be empty.":"Záložka nesmie byť prázdna.","Bookmark name cannot contain space characters.":"Názov záložky nemôže obsahovať medzery.","Bookmark name already exists.":"Názov záložky už existuje.","bookmark widget":"widget pre záložky","Bookmark toolbar":"Panel s nástrojmi záložky","Bookmarks":"Záložky","No bookmarks available.":"Nie sú k dispozícii žiadne záložky.","Scroll to bookmark":"Prejdite na záložku"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'sk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sk' ].dictionary = Object.assign( e[ 'sk' ].dictionary, dictionary );
e[ 'sk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
