/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sk' ]: { dictionary, getPluralForm } } = {"sk":{"dictionary":{"Unlink":"Zrušiť odkaz","Link":"Odkaz","Link URL":"URL adresa","Link URL must not be empty.":"Adresa odkazu URL nesmie byť prázdna.","Link image":"Adresa obrázku","Edit link":"Upraviť odkaz","Open link in new tab":"Otvoriť odkaz v novom okne","Open in a new tab":"Otvoriť v novej záložke","Downloadable":"Na stiahnutie","Create link":"Vytvoriť odkaz","Move out of a link":"Presunúť sa mimo odkazu","Link properties":"Vlastnosti odkazu","Displayed text":"Zobrazený text","No links available":"Nie sú dostupné žiadne odkazy"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'sk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sk' ].dictionary = Object.assign( e[ 'sk' ].dictionary, dictionary );
e[ 'sk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
