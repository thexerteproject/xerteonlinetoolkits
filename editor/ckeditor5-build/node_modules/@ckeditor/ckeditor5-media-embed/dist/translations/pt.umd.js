/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt' ]: { dictionary, getPluralForm } } = {"pt":{"dictionary":{"media widget":"Miniaplicação de media","Media URL":"URL de media","Paste the media URL in the input.":"Cole o URL de média no input.","Tip: Paste the URL into the content to embed faster.":"Dica: Cole o URL no conteúdo para incorporar mais rapidamente.","The URL must not be empty.":"O URL não pode ficar vazio.","This media URL is not supported.":"Este URL de media não é suportado.","Insert media":"Inserir media","Media":"Multimédia","Media toolbar":"Barra de ferramentas de media","Open media in new tab":"Abrir ficheiro multimédia em novo separador","Media embed":"Incorporar média"},getPluralForm(n){return (n != 1);}}};
e[ 'pt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt' ].dictionary = Object.assign( e[ 'pt' ].dictionary, dictionary );
e[ 'pt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
