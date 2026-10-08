/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'he' ]: { dictionary, getPluralForm } } = {"he":{"dictionary":{"Emoji":"אמוג'י","Show all emoji...":"הצג את כל סמלי האמוג'י...","Find an emoji (min. 2 characters)":"חפש אמוג'י (מינימום 2 תווים)","No emojis were found matching \"%0\".":"לא נמצאו סמלי אמוג'י התואמים ל-\"%0\".","Keep on typing to see the emoji.":"המשיכו להקליד כדי לראות את האמוג'י.","The query must contain at least two characters.":"השאילתה חייבת להכיל לפחות שני תווים.","Smileys & Expressions":"סמיילים והבעות","Gestures & People":"מחוות ואנשים","Animals & Nature":"בעלי חיים וטבע","Food & Drinks":"מזון ומשקאות","Travel & Places":"נסיעות ומקומות","Activities":"פעילויות","Objects":"חפצים","Symbols":"סמלים","Flags":"דגלים","Select skin tone":"בחר גוון עור","Default skin tone":"גוון עור ברירת מחדל","Light skin tone":"גוון עור בהיר","Medium Light skin tone":"גוון עור בהיר בינוני","Medium skin tone":"גוון עור בינוני","Medium Dark skin tone":"גוון עור כהה בינוני","Dark skin tone":"גוון עור כהה","Emoji picker":"בורר אימוג'י"},getPluralForm(n){return (n != 1);}}};
e[ 'he' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'he' ].dictionary = Object.assign( e[ 'he' ].dictionary, dictionary );
e[ 'he' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
