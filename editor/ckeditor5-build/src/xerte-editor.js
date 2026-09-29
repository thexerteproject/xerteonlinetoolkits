/**
 * Xerte CKEditor 5 classic build (GPL-2.0+ via CKEditor packages).
 */
import 'ckeditor5/ckeditor5.css';
import './autocolumns.css';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { InlineEditor } from '@ckeditor/ckeditor5-editor-inline';
import { Emoji } from '@ckeditor/ckeditor5-emoji';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import {
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Subscript,
	Superscript,
	Code
} from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { AutoLink, Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import {
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	AutoImage
} from '@ckeditor/ckeditor5-image';
import {
	Table,
	TableToolbar,
	TableCaption,
	TableProperties,
	TableCellProperties
} from '@ckeditor/ckeditor5-table';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { TextPartLanguage } from '@ckeditor/ckeditor5-language';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { FontSize, FontFamily, FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { Fullscreen } from '@ckeditor/ckeditor5-fullscreen';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { ShowBlocks } from '@ckeditor/ckeditor5-show-blocks';
import { SpecialCharacters, SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters';
import { Style } from '@ckeditor/ckeditor5-style';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { XerteUploadAdapter } from './plugins/xerte-upload-adapter.js';
import { XerteBrowseMedia } from './plugins/xerte-browse-media.js';
import { XerteAudio } from './plugins/xerte-audio.js';
import { XerteRecorder } from './plugins/xerte-recorder.js';
import '../../js/vendor/ckeditor5/lang/en.js';
import { XerteMathJaxSnippet } from './plugins/xerte-mathjax-snippet.js';
import { XertePageLink } from './plugins/xerte-page-link.js';
import { XerteMarkWord } from './plugins/xerte-mark-word.js';
import { XerteSpecialCharacters } from './plugins/xerte-special-characters.js';
import { XerteMarkTag } from './plugins/xerte-mark-tag.js';
import { XerteContextMenu } from './plugins/xerte-context-menu.js';
import { XerteAutocolumns } from './plugins/xerte-autocolumns-dialog.js';
import { XerteFontAwesome } from './plugins/xerte-fontawesome.js';
import { XerteLineHeight } from './plugins/xerte-line-height.js';
import { XerteRubyText } from './plugins/xerte-ruby-text.js';
import { XerteMediaEmbedRoundTrip } from './plugins/xerte-media-embed-roundtrip.js';
import { XerteMediaResize } from './plugins/xerte-media-resize.js';

const toolbarItems = [
	'undo', 'redo', '|',
	'findAndReplace', '|',
	'sourceEditing', 'showBlocks', 'fullscreen', 'htmlEmbed', '|',
	'heading', 'style', '|',
	'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'lineHeight', '|',
	'textPartLanguage', '|',
	'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code', 'removeFormat', '|',
	'specialCharacters', 'emoji', 'fontAwesome', 'horizontalLine', 'xerteMathJax', 'xerteRubyText', '|',
	'link', 'xotlink', 'insertImage', 'xerteBrowseMedia', 'xerteAudio', 'xerteRecorder', 'mediaEmbed', 'insertTable', 'autocolumns', 'blockQuote', 'codeBlock', '|',
	'alignment', '|',
	'bulletedList', 'numberedList', 'outdent', 'indent', '|',
	'xotMarkWord', 'markTag'
];

const imageToolbar = [
	'imageStyle:inline',
	'imageStyle:block',
	'imageStyle:side',
	'|',
	'toggleImageCaption',
	'imageTextAlternative',
	'linkImage'
];

const tableToolbar = [
	'insertTableColumnLeft',
	'insertTableColumnRight',
	'deleteTableColumn',
	'|',
	'insertTableRowAbove',
	'insertTableRowBelow',
	'deleteTableRow',
	'|',
	'mergeTableCells',
	'tableProperties',
	'tableCellProperties',
	'|',
	'toggleTableCaption'
];

const htmlAllowAll = {
	name: /.*/,
	attributes: true,
	classes: true,
	styles: true
};

const xerteBuiltinPlugins = [
	Essentials,
	Mention,
	Emoji,
	Paragraph,
	Autoformat,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Subscript,
	Superscript,
	Code,
	RemoveFormat,
	BlockQuote,
	Heading,
	AutoLink,
	Link,
	LinkImage,
	List,
	ListProperties,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	AutoImage,
	Table,
	TableToolbar,
	TableCaption,
	TableProperties,
	TableCellProperties,
	Indent,
	IndentBlock,
	TextPartLanguage,
	Alignment,
	HorizontalLine,
	FontSize,
	FontFamily,
	FontColor,
	FontBackgroundColor,
	Fullscreen,
	PasteFromOffice,
	GeneralHtmlSupport,
	SourceEditing,
	ShowBlocks,
	SpecialCharacters,
	SpecialCharactersEssentials,
	Style,
	FindAndReplace,
	CodeBlock,
	MediaEmbed,
	XerteMediaEmbedRoundTrip,
	XerteMediaResize,
	HtmlEmbed,
	XerteUploadAdapter,
	XerteBrowseMedia,
	XerteAudio,
	XerteRecorder,
	XerteMathJaxSnippet,
	XertePageLink,
	XerteMarkWord,
	XerteSpecialCharacters,
	XerteMarkTag,
	XerteContextMenu,
	XerteAutocolumns,
	XerteFontAwesome,
	XerteLineHeight,
	XerteRubyText
];

const xerteDefaultConfig = {
	licenseKey: 'GPL',
	menuBar: {
		isVisible: true
	},
	toolbar: {
		items: toolbarItems,
		shouldNotGroupWhenFull: false
	},
	heading: {
		options: [
			{
				model: 'paragraph',
				title: 'Paragraph',
				class: 'ck-heading_paragraph'
			},
			{
				model: 'heading1',
				view: 'h2',
				title: 'Heading 1',
				class: 'ck-heading_heading1'
			},
			{
				model: 'heading2',
				view: 'h3',
				title: 'Heading 2',
				class: 'ck-heading_heading2'
			},
			{
				model: 'heading3',
				view: 'h4',
				title: 'Heading 3',
				class: 'ck-heading_heading3'
			},
			{
				model: 'heading4',
				view: 'h5',
				title: 'Heading 4',
				class: 'ck-heading_heading4'
			},
			{
				model: 'heading5',
				view: 'h6',
				title: 'Heading 5',
				class: 'ck-heading_heading5'
			},
			{
				model: 'address',
				view: 'address',
				title: 'Address',
				class: 'ck-heading_address'
			},
			{
				model: 'div',
				view: 'div',
				title: 'Normal (DIV)',
				class: 'ck-heading_div'
			}
		]
	},
	codeBlock: {
		languages: [
			{ language: 'plaintext', label: 'Plain text', class: '' },
			{ language: 'apache', label: 'Apache' },
			{ language: 'bash', label: 'Bash' },
			{ language: 'coffeescript', label: 'CoffeeScript' },
			{ language: 'cpp', label: 'C++' },
			{ language: 'cs', label: 'C#' },
			{ language: 'css', label: 'CSS' },
			{ language: 'diff', label: 'Diff' },
			{ language: 'html', label: 'HTML' },
			{ language: 'http', label: 'HTTP' },
			{ language: 'ini', label: 'INI' },
			{ language: 'java', label: 'Java' },
			{ language: 'javascript', label: 'JavaScript' },
			{ language: 'json', label: 'JSON' },
			{ language: 'makefile', label: 'Makefile' },
			{ language: 'markdown', label: 'Markdown' },
			{ language: 'nginx', label: 'Nginx' },
			{ language: 'objectivec', label: 'Objective-C' },
			{ language: 'perl', label: 'Perl' },
			{ language: 'php', label: 'PHP' },
			{ language: 'python', label: 'Python' },
			{ language: 'ruby', label: 'Ruby' },
			{ language: 'sql', label: 'SQL' },
			{ language: 'vbscript', label: 'VBScript' },
			{ language: 'xhtml', label: 'XHTML' },
			{ language: 'xml', label: 'XML' }
		]
	},
	image: {
		toolbar: imageToolbar
	},
	table: {
		contentToolbar: tableToolbar
	},
	link: {
		toolbar: [ 'linkPreview', '|', 'xerteEditPageLink', 'editLink', 'linkProperties', 'unlink' ],
		decorators: {
			openInNewTab: {
				mode: 'automatic',
				callback: url => /^(https?:|mailto:)/i.test( url ),
				attributes: {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			}
		}
	},
	language: {
		ui: 'en',
		textPartLanguage: [
			{ title: 'English', languageCode: 'en' },
			{ title: 'Dutch', languageCode: 'nl' },
			{ title: 'German', languageCode: 'de' },
			{ title: 'French', languageCode: 'fr' },
			{ title: 'Spanish', languageCode: 'es' },
			{ title: 'Arabic', languageCode: 'ar', textDirection: 'rtl' },
			{ title: 'Hebrew', languageCode: 'he', textDirection: 'rtl' }
		]
	},
	htmlSupport: {
		allow: [ htmlAllowAll ]
	},
	style: {
		definitions: [
			{
				name: 'Panel',
				element: 'p',
				classes: [ 'panel1' ]
			},
			{
				name: 'Highlight',
				element: 'span',
				classes: [ 'highlight1' ]
			},
			{
				name: 'Block quote',
				element: 'blockquote',
				classes: [ 'bq1' ]
			}
		]
	},
	mediaEmbed: {
		previewsInData: true
	},
	htmlEmbed: {
		showPreviews: true
	},
	xerteUploadUrl: '',
	xerteUploadAudioUrl: '',
	xerteBrowseMediaUrl: ''
};

export class XerteClassicEditor extends ClassicEditor {}
XerteClassicEditor.builtinPlugins = xerteBuiltinPlugins;
XerteClassicEditor.defaultConfig = xerteDefaultConfig;

export class XerteInlineEditor extends InlineEditor {}
XerteInlineEditor.builtinPlugins = xerteBuiltinPlugins.filter( plugin => plugin !== Fullscreen );
XerteInlineEditor.defaultConfig = {
	...xerteDefaultConfig,
	toolbar: {
		...xerteDefaultConfig.toolbar,
		items: toolbarItems.filter( item => item !== 'fullscreen' )
	}
};

export default {
	Classic: XerteClassicEditor,
	Inline: XerteInlineEditor
};
