/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de-ch' ]: { dictionary, getPluralForm } } = {"de-ch":{"dictionary":{"media widget":"Medien-Widget","Media URL":"Medien-URL","Paste the media URL in the input.":"Medien-URL in das Eingabefeld einfügen.","Tip: Paste the URL into the content to embed faster.":"Tipp: Zum schnelleren Einbetten können Sie die Medien-URL in den Inhalt einfügen.","The URL must not be empty.":"Die URL darf nicht leer sein.","This media URL is not supported.":"Diese Medien-URL wird nicht unterstützt.","Insert media":"Medium einfügen","Media":"","Media toolbar":"Medien Werkzeugleiste","Open media in new tab":"","Media embed":""},getPluralForm(n){return (n != 1);}}};
e[ 'de-ch' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de-ch' ].dictionary = Object.assign( e[ 'de-ch' ].dictionary, dictionary );
e[ 'de-ch' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
