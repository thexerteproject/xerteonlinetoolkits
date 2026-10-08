/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lt' ]: { dictionary, getPluralForm } } = {"lt":{"dictionary":{"Widget toolbar":"Valdiklių įrankių juosta","Insert paragraph before block":"Įkelti pastraipą prieš bloką","Insert paragraph after block":"Įkelti pastraipą po bloko","Press Enter to type after or press Shift + Enter to type before the widget":"Paspauskite Enter, jei norite rašyti po valdiklio, arba paspauskite Shift + Enter, jei norite rašyti prieš valdiklį.","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Klavišų paspaudimai, kuriuos galima naudoti pasirinkus valdiklį (pavyzdžiui, vaizdą, lentelę ir t. t.)","Insert a new paragraph directly after a widget":"Įterpti naują pastraipą iškart po valdiklio","Insert a new paragraph directly before a widget":"Įterpti naują pastraipą iškart prieš valdiklį","Move the caret to allow typing directly before a widget":"Perkelkite žymeklį, kad būtų galima rašyti iškart prieš valdiklį","Move the caret to allow typing directly after a widget":"Perkelkite žymeklį, kad būtų galima rašyti iškart po valdiklio","Move focus from an editable area back to the parent widget":"Perkelti fokusą iš redaguojamos srities atgal į pagrindinį valdiklį"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'lt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lt' ].dictionary = Object.assign( e[ 'lt' ].dictionary, dictionary );
e[ 'lt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
