/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'es' ]: { dictionary, getPluralForm } } = {"es":{"dictionary":{"Widget toolbar":"Barra de herramientas del widget","Insert paragraph before block":"Insertar párrafo antes del bloque","Insert paragraph after block":"Insertar párrafo después del bloque","Press Enter to type after or press Shift + Enter to type before the widget":"Pulse Intro para escribir después o pulse Mayús + Intro para escribir antes del «widget».","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Teclas que se pueden utilizar cuando se selecciona un módulo interactivo (por ejemplo: imagen, tabla, etc.)","Insert a new paragraph directly after a widget":"Inserta un nuevo párrafo directamente después de un módulo interactivo","Insert a new paragraph directly before a widget":"Inserta un nuevo párrafo directamente antes de un módulo interactivo","Move the caret to allow typing directly before a widget":"Mueve el cursor para permitir escribir directamente antes de un módulo interactivo","Move the caret to allow typing directly after a widget":"Mueve el cursor para permitir escribir directamente después de un módulo interactivo","Move focus from an editable area back to the parent widget":"Cambiar el foco de un área editable al widget principal"},getPluralForm(n){return (n != 1);}}};
e[ 'es' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'es' ].dictionary = Object.assign( e[ 'es' ].dictionary, dictionary );
e[ 'es' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
