/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
export default {"sr-latn":{"dictionary":{"Font Size":"Veličina fonta","Tiny":"Sitno","Small":"Malo","Big":"Veliko","Huge":"Ogromno","Font Family":"Font","Default":"Оsnovni","Font Color":"Boja slova","Font Background Color":"Boja pozadine slova","Document colors":"Boje dokumenta"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}}