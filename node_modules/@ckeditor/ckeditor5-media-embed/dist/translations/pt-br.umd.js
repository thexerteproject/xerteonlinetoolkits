/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt-br' ]: { dictionary, getPluralForm } } = {"pt-br":{"dictionary":{"media widget":"Ferramenta de mídia","Media URL":"URL da mídia","Paste the media URL in the input.":"Cole o endereço da mídia no campo.","Tip: Paste the URL into the content to embed faster.":"Cole o endereço dentro do conteúdo para embutir mais rapidamente.","The URL must not be empty.":"A URL não pode ficar em branco.","This media URL is not supported.":"Esta URL de mídia não é suportada.","Insert media":"Inserir mídia","Media":"Mídia","Media toolbar":"Ferramentas de Mídia","Open media in new tab":"Abrir mídia em nova aba","Media embed":"Incorporar elemento de mídia"},getPluralForm(n){return (n != 1);}}};
e[ 'pt-br' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt-br' ].dictionary = Object.assign( e[ 'pt-br' ].dictionary, dictionary );
e[ 'pt-br' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
