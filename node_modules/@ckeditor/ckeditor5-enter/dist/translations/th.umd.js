/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'th' ]: { dictionary, getPluralForm } } = {"th":{"dictionary":{"Insert a soft break (a <code>&lt;br&gt;</code> element)":"แทรกการขึ้นบรรทัดใหม่แบบ Soft Break  (<code>&lt;br&gt;</code> element)","Insert a hard break (a new paragraph)":"แทรกการขึ้นบรรทัดใหม่แบบ Hard Break (ย่อหน้าใหม่)"},getPluralForm(n){return 0;}}};
e[ 'th' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'th' ].dictionary = Object.assign( e[ 'th' ].dictionary, dictionary );
e[ 'th' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
