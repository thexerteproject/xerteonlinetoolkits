/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { CKEditorError, toMap, uid, Rect, keyCodes, Collection, logWarning, env } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { ListView, View, ListItemView, ContextualBalloon, clickOutsideHandler, ButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { TextWatcher } from '@ckeditor/ckeditor5-typing/dist/index.js';
import { debounce } from 'es-toolkit/compat';

const BRACKET_PAIRS = {
    '(': ')',
    '[': ']',
    '{': '}'
};
/**
 * The mention command.
 *
 * The command is registered by {@link module:mention/mentionediting~MentionEditing} as `'mention'`.
 *
 * To insert a mention into a range, execute the command and specify a mention object with a range to replace:
 *
 * ```ts
 * const focus = editor.model.document.selection.focus;
 *
 * // It will replace one character before the selection focus with the '#1234' text
 * // with the mention attribute filled with passed attributes.
 * editor.execute( 'mention', {
 * 	marker: '#',
 * 	mention: {
 * 		id: '#1234',
 * 		name: 'Foo',
 * 		title: 'Big Foo'
 * 	},
 * 	range: editor.model.createRange( focus.getShiftedBy( -1 ), focus )
 * } );
 *
 * // It will replace one character before the selection focus with the 'The "Big Foo"' text
 * // with the mention attribute filled with passed attributes.
 * editor.execute( 'mention', {
 * 	marker: '#',
 * 	mention: {
 * 		id: '#1234',
 * 		name: 'Foo',
 * 		title: 'Big Foo'
 * 	},
 * 	text: 'The "Big Foo"',
 * 	range: editor.model.createRange( focus.getShiftedBy( -1 ), focus )
 * } );
 *	```
 */ class MentionCommand extends Command {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        // Since this command may pass range in execution parameters, it should be checked directly in execute block.
        this._isEnabledBasedOnSelection = false;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const doc = model.document;
        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, 'mention');
    }
    /**
	 * Executes the command.
	 *
	 * @param options Options for the executed command.
	 * @param options.mention The mention object to insert. When a string is passed, it will be used to create a plain
	 * object with the name attribute that equals the passed string.
	 * @param options.marker The marker character (e.g. `'@'`).
	 * @param options.text The text of the inserted mention. Defaults to the full mention string composed from `marker` and
	 * `mention` string or `mention.id` if an object is passed.
	 * @param options.range The range to replace.
	 * Note that the replaced range might be shorter than the inserted text with the mention attribute.
	 * @fires execute
	 */ execute(options) {
        const model = this.editor.model;
        const document = model.document;
        const selection = document.selection;
        const mentionData = typeof options.mention == 'string' ? {
            id: options.mention
        } : options.mention;
        const mentionID = mentionData.id;
        const range = options.range || selection.getFirstRange();
        // Don't execute command if range is in non-editable place.
        if (!model.canEditAt(range)) {
            return;
        }
        const mentionText = options.text || mentionID;
        const mention = _addMentionAttributes({
            _text: mentionText,
            id: mentionID
        }, mentionData);
        if (!mentionID.startsWith(options.marker)) {
            /**
			 * The feed item ID must start with the marker character(s).
			 *
			 * Correct mention feed setting:
			 *
			 * ```ts
			 * mentions: [
			 * 	{
			 * 		marker: '@',
			 * 		feed: [ '@Ann', '@Barney', ... ]
			 * 	}
			 * ]
			 * ```
			 *
			 * Incorrect mention feed setting:
			 *
			 * ```ts
			 * mentions: [
			 * 	{
			 * 		marker: '@',
			 * 		feed: [ 'Ann', 'Barney', ... ]
			 * 	}
			 * ]
			 * ```
			 *
			 * See {@link module:mention/mentionconfig~MentionConfig}.
			 *
			 * @error mentioncommand-incorrect-id
			 */ throw new CKEditorError('mentioncommand-incorrect-id', this);
        }
        model.change((writer)=>{
            const currentAttributes = toMap(selection.getAttributes());
            const attributesWithMention = new Map(currentAttributes.entries());
            attributesWithMention.set('mention', mention);
            // Replace a range with the text with a mention.
            const insertionRange = model.insertContent(writer.createText(mentionText, attributesWithMention), range);
            const nodeBefore = insertionRange.start.nodeBefore;
            const nodeAfter = insertionRange.end.nodeAfter;
            const isFollowedByWhiteSpace = nodeAfter && nodeAfter.is('$text') && nodeAfter.data.startsWith(' ');
            let isInsertedInBrackets = false;
            if (nodeBefore && nodeAfter && nodeBefore.is('$text') && nodeAfter.is('$text')) {
                const precedingCharacter = nodeBefore.data.slice(-1);
                const isPrecededByOpeningBracket = precedingCharacter in BRACKET_PAIRS;
                const isFollowedByBracketClosure = isPrecededByOpeningBracket && nodeAfter.data.startsWith(BRACKET_PAIRS[precedingCharacter]);
                isInsertedInBrackets = isPrecededByOpeningBracket && isFollowedByBracketClosure;
            }
            // Don't add a white space if either of the following is true:
            // * there's already one after the mention;
            // * the mention was inserted in the empty matching brackets.
            // https://github.com/ckeditor/ckeditor5/issues/4651
            if (!isInsertedInBrackets && !isFollowedByWhiteSpace) {
                model.insertContent(writer.createText(' ', currentAttributes), range.start.getShiftedBy(mentionText.length));
            }
        });
    }
}

/**
 * The mention editing feature.
 *
 * It introduces the {@link module:mention/mentioncommand~MentionCommand command} and the `mention`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<span class="mention" data-mention="@mention">`.
 */ class MentionEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'MentionEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const model = editor.model;
        const doc = model.document;
        // Allow the mention attribute on all text nodes.
        model.schema.extend('$text', {
            allowAttributes: 'mention'
        });
        // Upcast conversion.
        editor.conversion.for('upcast').elementToAttribute({
            view: {
                name: 'span',
                attributes: 'data-mention',
                classes: 'mention'
            },
            model: {
                key: 'mention',
                value: (viewElement)=>_toMentionAttribute(viewElement)
            }
        });
        // Downcast conversion.
        editor.conversion.for('downcast').attributeToElement({
            model: 'mention',
            view: createViewMentionElement
        });
        editor.conversion.for('downcast').add(preventPartialMentionDowncast);
        doc.registerPostFixer((writer)=>removePartialMentionPostFixer(writer, doc, model.schema));
        doc.registerPostFixer((writer)=>extendAttributeOnMentionPostFixer(writer, doc));
        doc.registerPostFixer((writer)=>selectionMentionAttributePostFixer(writer, doc));
        editor.commands.add('mention', new MentionCommand(editor));
    }
}
/**
 * @internal
 */ function _addMentionAttributes(baseMentionData, data) {
    return Object.assign({
        uid: uid()
    }, baseMentionData, data || {});
}
/**
 * Creates a mention attribute value from the provided view element and optional data.
 *
 * This function is exposed as
 * {@link module:mention/mention~Mention#toMentionAttribute `editor.plugins.get( 'Mention' ).toMentionAttribute()`}.
 *
 * @internal
 */ function _toMentionAttribute(viewElementOrMention, data) {
    const dataMention = viewElementOrMention.getAttribute('data-mention');
    const textNode = viewElementOrMention.getChild(0);
    // Do not convert empty mentions.
    if (!textNode) {
        return;
    }
    const baseMentionData = {
        id: dataMention,
        _text: textNode.data
    };
    return _addMentionAttributes(baseMentionData, data);
}
/**
 * A converter that blocks partial mention from being converted.
 *
 * This converter is registered with 'highest' priority in order to consume mention attribute before it is converted by
 * any other converters. This converter only consumes partial mention - those whose `_text` attribute is not equal to text with mention
 * attribute. This may happen when copying part of mention text.
 */ function preventPartialMentionDowncast(dispatcher) {
    dispatcher.on('attribute:mention', (evt, data, conversionApi)=>{
        const mention = data.attributeNewValue;
        if (!data.item.is('$textProxy') || !mention) {
            return;
        }
        const start = data.range.start;
        const textNode = start.textNode || start.nodeAfter;
        if (textNode.data != mention._text) {
            // Consume item to prevent partial mention conversion.
            conversionApi.consumable.consume(data.item, evt.name);
        }
    }, {
        priority: 'highest'
    });
}
/**
 * Creates a mention element from the mention data.
 */ function createViewMentionElement(mention, { writer }) {
    if (!mention) {
        return;
    }
    const attributes = {
        class: 'mention',
        'data-mention': mention.id
    };
    const options = {
        id: mention.uid,
        priority: 20
    };
    return writer.createAttributeElement('span', attributes, options);
}
/**
 * Model post-fixer that disallows typing with selection when the selection is placed after the text node with the mention attribute or
 * before a text node with mention attribute.
 */ function selectionMentionAttributePostFixer(writer, doc) {
    const selection = doc.selection;
    const focus = selection.focus;
    if (selection.isCollapsed && selection.hasAttribute('mention') && shouldNotTypeWithMentionAt(focus)) {
        writer.removeSelectionAttribute('mention');
        return true;
    }
    return false;
}
/**
 * Helper function to detect if mention attribute should be removed from selection.
 * This check makes only sense if the selection has mention attribute.
 *
 * The mention attribute should be removed from a selection when selection focus is placed:
 * a) after a text node
 * b) the position is at parents start - the selection will set attributes from node after.
 */ function shouldNotTypeWithMentionAt(position) {
    const isAtStart = position.isAtStart;
    const isAfterAMention = position.nodeBefore && position.nodeBefore.is('$text');
    return isAfterAMention || isAtStart;
}
/**
 * Model post-fixer that removes the mention attribute from the modified text node.
 */ function removePartialMentionPostFixer(writer, doc, schema) {
    const changes = doc.differ.getChanges();
    let wasChanged = false;
    for (const change of changes){
        if (change.type == 'attribute') {
            continue;
        }
        // Checks the text node on the current position.
        const position = change.position;
        if (change.name == '$text') {
            const nodeAfterInsertedTextNode = position.textNode && position.textNode.nextSibling;
            // Checks the text node where the change occurred.
            wasChanged = checkAndFix(position.textNode, writer) || wasChanged;
            // Occurs on paste inside a text node with mention.
            wasChanged = checkAndFix(nodeAfterInsertedTextNode, writer) || wasChanged;
            wasChanged = checkAndFix(position.nodeBefore, writer) || wasChanged;
            wasChanged = checkAndFix(position.nodeAfter, writer) || wasChanged;
        }
        // Checks text nodes in inserted elements (might occur when splitting a paragraph or pasting content inside text with mention).
        if (change.name != '$text' && change.type == 'insert') {
            const insertedNode = position.nodeAfter;
            for (const item of writer.createRangeIn(insertedNode).getItems()){
                wasChanged = checkAndFix(item, writer) || wasChanged;
            }
        }
        // Inserted inline elements might break mention.
        if (change.type == 'insert' && schema.isInline(change.name)) {
            const nodeAfterInserted = position.nodeAfter && position.nodeAfter.nextSibling;
            wasChanged = checkAndFix(position.nodeBefore, writer) || wasChanged;
            wasChanged = checkAndFix(nodeAfterInserted, writer) || wasChanged;
        }
    }
    return wasChanged;
}
/**
 * This post-fixer will extend the attribute applied on the part of the mention so the whole text node of the mention will have
 * the added attribute.
 */ function extendAttributeOnMentionPostFixer(writer, doc) {
    const changes = doc.differ.getChanges();
    let wasChanged = false;
    for (const change of changes){
        if (change.type === 'attribute' && change.attributeKey != 'mention') {
            // Checks the node on the left side of the range...
            const nodeBefore = change.range.start.nodeBefore;
            // ... and on the right side of the range.
            const nodeAfter = change.range.end.nodeAfter;
            for (const node of [
                nodeBefore,
                nodeAfter
            ]){
                if (isBrokenMentionNode(node) && node.getAttribute(change.attributeKey) != change.attributeNewValue) {
                    writer.setAttribute(change.attributeKey, change.attributeNewValue, node);
                    wasChanged = true;
                }
            }
        }
    }
    return wasChanged;
}
/**
 * Checks if a node has a correct mention attribute if present.
 * Returns `true` if the node is text and has a mention attribute whose text does not match the expected mention text.
 */ function isBrokenMentionNode(node) {
    if (!node || !(node.is('$text') || node.is('$textProxy')) || !node.hasAttribute('mention')) {
        return false;
    }
    const text = node.data;
    const mention = node.getAttribute('mention');
    const expectedText = mention._text;
    return text != expectedText;
}
/**
 * Fixes a mention on a text node if it needs a fix.
 */ function checkAndFix(textNode, writer) {
    if (isBrokenMentionNode(textNode)) {
        writer.removeAttribute('mention', textNode);
        return true;
    }
    return false;
}

/**
 * The mention ui view.
 */ class MentionsView extends ListView {
    selected;
    position;
    /**
	 * @inheritDoc
	 */ constructor(locale){
        super(locale);
        this.extendTemplate({
            attributes: {
                class: [
                    'ck-mentions'
                ],
                tabindex: '-1'
            }
        });
    }
    /**
	 * {@link #select Selects} the first item.
	 */ selectFirst() {
        this.select(0);
    }
    /**
	 * Selects next item to the currently {@link #select selected}.
	 *
	 * If the last item is already selected, it will select the first item.
	 */ selectNext() {
        const item = this.selected;
        const index = this.items.getIndex(item);
        this.select(index + 1);
    }
    /**
	 * Selects previous item to the currently {@link #select selected}.
	 *
	 * If the first item is already selected, it will select the last item.
	 */ selectPrevious() {
        const item = this.selected;
        const index = this.items.getIndex(item);
        this.select(index - 1);
    }
    /**
	 * Marks item at a given index as selected.
	 *
	 * Handles selection cycling when passed index is out of bounds:
	 * - if the index is lower than 0, it will select the last item,
	 * - if the index is higher than the last item index, it will select the first item.
	 *
	 * @param index Index of an item to be marked as selected.
	 */ select(index) {
        let indexToGet = 0;
        if (index > 0 && index < this.items.length) {
            indexToGet = index;
        } else if (index < 0) {
            indexToGet = this.items.length - 1;
        }
        const item = this.items.get(indexToGet);
        // Return early if item is already selected.
        if (this.selected === item) {
            return;
        }
        // Remove highlight of previously selected item.
        if (this.selected) {
            this.selected.removeHighlight();
        }
        item.highlight();
        this.selected = item;
        // Scroll the mentions view to the selected element.
        if (!this._isItemVisibleInScrolledArea(item)) {
            this.element.scrollTop = item.element.offsetTop;
        }
    }
    /**
	 * Triggers the `execute` event on the {@link #select selected} item.
	 */ executeSelected() {
        this.selected.fire('execute');
    }
    /**
	 * Checks if an item is visible in the scrollable area.
	 *
	 * The item is considered visible when:
	 * - its top boundary is inside the scrollable rect
	 * - its bottom boundary is inside the scrollable rect (the whole item must be visible)
	 */ _isItemVisibleInScrolledArea(item) {
        return new Rect(this.element).contains(new Rect(item.element));
    }
}

/**
 * This class wraps DOM element as a CKEditor5 UI View.
 *
 * It allows to render any DOM element and use it in mentions list.
 */ class MentionDomWrapperView extends View {
    /**
	 * The DOM element for which wrapper was created.
	 */ domElement;
    /**
	 * Creates an instance of {@link module:mention/ui/domwrapperview~MentionDomWrapperView} class.
	 *
	 * Also see {@link #render}.
	 */ constructor(locale, domElement){
        super(locale);
        // Disable template rendering on this view.
        this.template = undefined;
        this.domElement = domElement;
        // Render dom wrapper as a button.
        this.domElement.classList.add('ck-button');
        this.set('isOn', false);
        // Handle isOn state as in buttons.
        this.on('change:isOn', (evt, name, isOn)=>{
            if (isOn) {
                this.domElement.classList.add('ck-on');
                this.domElement.classList.remove('ck-off');
            } else {
                this.domElement.classList.add('ck-off');
                this.domElement.classList.remove('ck-on');
            }
        });
        // Pass click event as execute event.
        this.listenTo(this.domElement, 'click', ()=>{
            this.fire('execute');
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        this.element = this.domElement;
    }
    /**
	 * Focuses the DOM element.
	 */ focus() {
        this.domElement.focus();
    }
}

class MentionListItemView extends ListItemView {
    item;
    marker;
    highlight() {
        const child = this.children.first;
        child.isOn = true;
    }
    removeHighlight() {
        const child = this.children.first;
        child.isOn = false;
    }
}

const VERTICAL_SPACING = 3;
// The key codes that mention UI handles when it is open (without commit keys).
const defaultHandledKeyCodes = [
    keyCodes.arrowup,
    keyCodes.arrowdown,
    keyCodes.esc
];
// Dropdown commit key codes.
const defaultCommitKeyCodes = [
    keyCodes.enter,
    keyCodes.tab
];
/**
 * The mention UI feature.
 */ class MentionUI extends Plugin {
    /**
	 * The mention view.
	 */ _mentionsView;
    /**
	 * Stores mention feeds configurations.
	 */ _mentionsConfigurations;
    /**
	 * The contextual balloon plugin instance.
	 */ _balloon;
    _items = new Collection();
    _lastRequested;
    /**
	 * Debounced feed requester. It uses `es-toolkit#debounce` method to delay function call.
	 */ _requestFeedDebounced;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'MentionUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ContextualBalloon
        ];
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._mentionsView = this._createMentionView();
        this._mentionsConfigurations = new Map();
        this._requestFeedDebounced = debounce(this._requestFeed, 100);
        editor.config.define('mention', {
            feeds: []
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const commitKeys = editor.config.get('mention.commitKeys') || defaultCommitKeyCodes;
        const handledKeyCodes = defaultHandledKeyCodes.concat(commitKeys);
        this._balloon = editor.plugins.get(ContextualBalloon);
        // Key listener that handles navigation in mention view.
        editor.editing.view.document.on('keydown', (evt, data)=>{
            if (isHandledKey(data.keyCode) && this._isUIVisible) {
                data.preventDefault();
                evt.stop(); // Required for Enter key overriding.
                if (data.keyCode == keyCodes.arrowdown) {
                    this._mentionsView.selectNext();
                }
                if (data.keyCode == keyCodes.arrowup) {
                    this._mentionsView.selectPrevious();
                }
                if (commitKeys.includes(data.keyCode)) {
                    this._mentionsView.executeSelected();
                }
                if (data.keyCode == keyCodes.esc) {
                    this._hideUIAndRemoveMarker();
                }
            }
        }, {
            priority: 'highest'
        }); // Required to override the Enter key.
        // Close the dropdown upon clicking outside of the plugin UI.
        clickOutsideHandler({
            emitter: this._mentionsView,
            activator: ()=>this._isUIVisible,
            contextElements: ()=>[
                    this._balloon.view.element
                ],
            callback: ()=>this._hideUIAndRemoveMarker()
        });
        const feeds = editor.config.get('mention.feeds');
        for (const mentionDescription of feeds){
            const { feed, marker, dropdownLimit } = mentionDescription;
            if (!isValidMentionMarker(marker)) {
                /**
				 * The marker must be a single character.
				 *
				 * Correct markers: `'@'`, `'#'`.
				 *
				 * Incorrect markers: `'$$'`, `'[@'`.
				 *
				 * See {@link module:mention/mentionconfig~MentionConfig}.
				 *
				 * @error mentionconfig-incorrect-marker
				 * @param {string} marker Configured marker
				 */ throw new CKEditorError('mentionconfig-incorrect-marker', null, {
                    marker
                });
            }
            const feedCallback = typeof feed == 'function' ? feed.bind(this.editor) : createFeedCallback(feed);
            const itemRenderer = mentionDescription.itemRenderer;
            const definition = {
                marker,
                feedCallback,
                itemRenderer,
                dropdownLimit
            };
            this._mentionsConfigurations.set(marker, definition);
        }
        this._setupTextWatcher(feeds);
        this.listenTo(editor, 'change:isReadOnly', ()=>{
            this._hideUIAndRemoveMarker();
        });
        this.on('requestFeed:response', (evt, data)=>this._handleFeedResponse(data));
        this.on('requestFeed:error', ()=>this._hideUIAndRemoveMarker());
        /**
		 * Checks if a given key code is handled by the mention UI.
		 */ function isHandledKey(keyCode) {
            return handledKeyCodes.includes(keyCode);
        }
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        // Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
        this._mentionsView.destroy();
    }
    /**
	 * Returns true when {@link #_mentionsView} is in the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon} and it is
	 * currently visible.
	 */ get _isUIVisible() {
        return this._balloon.visibleView === this._mentionsView;
    }
    /**
	 * Creates the {@link #_mentionsView}.
	 */ _createMentionView() {
        const locale = this.editor.locale;
        const mentionsView = new MentionsView(locale);
        mentionsView.items.bindTo(this._items).using((data)=>{
            const { item, marker } = data;
            const { dropdownLimit: markerDropdownLimit } = this._mentionsConfigurations.get(marker);
            // Set to 10 by default for backwards compatibility. See: #10479
            const dropdownLimit = markerDropdownLimit || this.editor.config.get('mention.dropdownLimit') || 10;
            if (mentionsView.items.length >= dropdownLimit) {
                return null;
            }
            const listItemView = new MentionListItemView(locale);
            const view = this._renderItem(item, marker);
            view.delegate('execute').to(listItemView);
            listItemView.children.add(view);
            listItemView.item = item;
            listItemView.marker = marker;
            listItemView.on('execute', ()=>{
                mentionsView.fire('execute', {
                    item,
                    marker
                });
            });
            return listItemView;
        });
        mentionsView.on('execute', (evt, data)=>{
            const editor = this.editor;
            const model = editor.model;
            const item = data.item;
            const marker = data.marker;
            const mentionMarker = editor.model.markers.get('mention');
            // Create a range on matched text.
            const end = model.createPositionAt(model.document.selection.focus);
            const start = model.createPositionAt(mentionMarker.getStart());
            const range = model.createRange(start, end);
            this._hideUIAndRemoveMarker();
            editor.execute('mention', {
                mention: item,
                text: item.text,
                marker,
                range
            });
            editor.editing.view.focus();
        });
        return mentionsView;
    }
    /**
	 * Returns item renderer for the marker.
	 */ _getItemRenderer(marker) {
        const { itemRenderer } = this._mentionsConfigurations.get(marker);
        return itemRenderer;
    }
    /**
	 * Requests a feed from a configured callbacks.
	 */ _requestFeed(marker, feedText) {
        // @if CK_DEBUG_MENTION // console.log( '%c[Feed]%c Requesting for', 'color: blue', 'color: black', `"${ feedText }"` );
        // Store the last requested feed - it is used to discard any out-of order requests.
        this._lastRequested = feedText;
        const { feedCallback } = this._mentionsConfigurations.get(marker);
        const feedResponse = feedCallback(feedText);
        const isAsynchronous = feedResponse instanceof Promise;
        // For synchronous feeds (e.g. callbacks, arrays) fire the response event immediately.
        if (!isAsynchronous) {
            this.fire('requestFeed:response', {
                feed: feedResponse,
                marker,
                feedText
            });
            return;
        }
        // Handle the asynchronous responses.
        feedResponse.then((response)=>{
            // Check the feed text of this response with the last requested one so either:
            if (this._lastRequested == feedText) {
                // It is the same and fire the response event.
                this.fire('requestFeed:response', {
                    feed: response,
                    marker,
                    feedText
                });
            } else {
                // It is different - most probably out-of-order one, so fire the discarded event.
                this.fire('requestFeed:discarded', {
                    feed: response,
                    marker,
                    feedText
                });
            }
        }).catch((error)=>{
            this.fire('requestFeed:error', {
                error
            });
            /**
				 * The callback used for obtaining mention autocomplete feed thrown and error and the mention UI was hidden or
				 * not displayed at all.
				 *
				 * @error mention-feed-callback-error
				 */ logWarning('mention-feed-callback-error', {
                marker
            });
        });
    }
    /**
	 * Registers a text watcher for the marker.
	 */ _setupTextWatcher(feeds) {
        const editor = this.editor;
        const feedsWithPattern = feeds.map((feed)=>({
                ...feed,
                pattern: createRegExp(feed.marker, feed.minimumCharacters || 0)
            }));
        const watcher = new TextWatcher(editor.model, createTestCallback(feedsWithPattern));
        watcher.on('matched', (evt, data)=>{
            const markerDefinition = getLastValidMarkerInText(feedsWithPattern, data.text);
            const selection = editor.model.document.selection;
            const focus = selection.focus;
            const markerPosition = editor.model.createPositionAt(focus.parent, markerDefinition.position);
            if (isPositionInExistingMention(focus) || isMarkerInExistingMention(markerPosition)) {
                this._hideUIAndRemoveMarker();
                return;
            }
            const feedText = requestFeedText(markerDefinition, data.text);
            const matchedTextLength = markerDefinition.marker.length + feedText.length;
            // Create a marker range.
            const start = focus.getShiftedBy(-matchedTextLength);
            const end = focus.getShiftedBy(-feedText.length);
            const markerRange = editor.model.createRange(start, end);
            // @if CK_DEBUG_MENTION // console.group( '%c[TextWatcher]%c matched', 'color: red', 'color: black', `"${ feedText }"` );
            // @if CK_DEBUG_MENTION // console.log( 'data#text', `"${ data.text }"` );
            // @if CK_DEBUG_MENTION // console.log( 'data#range', data.range.start.path, data.range.end.path );
            // @if CK_DEBUG_MENTION // console.log( 'marker definition', markerDefinition );
            // @if CK_DEBUG_MENTION // console.log( 'marker range', markerRange.start.path, markerRange.end.path );
            if (checkIfStillInCompletionMode(editor)) {
                const mentionMarker = editor.model.markers.get('mention');
                // Update the marker - user might've moved the selection to other mention trigger.
                editor.model.change((writer)=>{
                    // @if CK_DEBUG_MENTION // console.log( '%c[Editing]%c Updating the marker.', 'color: purple', 'color: black' );
                    writer.updateMarker(mentionMarker, {
                        range: markerRange
                    });
                });
            } else {
                editor.model.change((writer)=>{
                    // @if CK_DEBUG_MENTION // console.log( '%c[Editing]%c Adding the marker.', 'color: purple', 'color: black' );
                    writer.addMarker('mention', {
                        range: markerRange,
                        usingOperation: false,
                        affectsData: false
                    });
                });
            }
            this._requestFeedDebounced(markerDefinition.marker, feedText);
        // @if CK_DEBUG_MENTION // console.groupEnd();
        });
        watcher.on('unmatched', ()=>{
            this._hideUIAndRemoveMarker();
        });
        const mentionCommand = editor.commands.get('mention');
        watcher.bind('isEnabled').to(mentionCommand);
        return watcher;
    }
    /**
	 * Handles the feed response event data.
	 */ _handleFeedResponse(data) {
        const { feed, marker } = data;
        // eslint-disable-next-line @stylistic/max-len
        // @if CK_DEBUG_MENTION // console.log( `%c[Feed]%c Response for "${ data.feedText }" (${ feed.length })`, 'color: blue', 'color: black', feed );
        // If the marker is not in the document happens when the selection had changed and the 'mention' marker was removed.
        if (!checkIfStillInCompletionMode(this.editor)) {
            return;
        }
        // Reset the view.
        this._items.clear();
        for (const feedItem of feed){
            const item = typeof feedItem != 'object' ? {
                id: feedItem,
                text: feedItem
            } : feedItem;
            this._items.add({
                item,
                marker
            });
        }
        const mentionMarker = this.editor.model.markers.get('mention');
        if (this._items.length) {
            this._showOrUpdateUI(mentionMarker);
        } else {
            // Do not show empty mention UI.
            this._hideUIAndRemoveMarker();
        }
    }
    /**
	 * Shows the mentions balloon. If the panel is already visible, it will reposition it.
	 */ _showOrUpdateUI(markerMarker) {
        if (this._isUIVisible) {
            // @if CK_DEBUG_MENTION // console.log( '%c[UI]%c Updating position.', 'color: green', 'color: black' );
            // Update balloon position as the mention list view may change its size.
            this._balloon.updatePosition(this._getBalloonPanelPositionData(markerMarker, this._mentionsView.position));
        } else {
            // @if CK_DEBUG_MENTION // console.log( '%c[UI]%c Showing the UI.', 'color: green', 'color: black' );
            this._balloon.add({
                view: this._mentionsView,
                position: this._getBalloonPanelPositionData(markerMarker, this._mentionsView.position),
                singleViewMode: true,
                balloonClassName: 'ck-mention-balloon'
            });
        }
        this._mentionsView.position = this._balloon.view.position;
        this._mentionsView.selectFirst();
    }
    /**
	 * Hides the mentions balloon and removes the 'mention' marker from the markers collection.
	 */ _hideUIAndRemoveMarker() {
        // Remove the mention view from balloon before removing marker - it is used by balloon position target().
        if (this._balloon.hasView(this._mentionsView)) {
            // @if CK_DEBUG_MENTION // console.log( '%c[UI]%c Hiding the UI.', 'color: green', 'color: black' );
            this._balloon.remove(this._mentionsView);
        }
        if (checkIfStillInCompletionMode(this.editor)) {
            // @if CK_DEBUG_MENTION // console.log( '%c[Editing]%c Removing marker.', 'color: purple', 'color: black' );
            this.editor.model.change((writer)=>writer.removeMarker('mention'));
        }
        // Make the last matched position on panel view undefined so the #_getBalloonPanelPositionData() method will return all positions
        // on the next call.
        this._mentionsView.position = undefined;
    }
    /**
	 * Renders a single item in the autocomplete list.
	 */ _renderItem(item, marker) {
        const editor = this.editor;
        let view;
        let label = item.id;
        const renderer = this._getItemRenderer(marker);
        if (renderer) {
            const renderResult = renderer(item);
            if (typeof renderResult != 'string') {
                view = new MentionDomWrapperView(editor.locale, renderResult);
            } else {
                label = renderResult;
            }
        }
        if (!view) {
            const buttonView = new ButtonView(editor.locale);
            buttonView.label = label;
            buttonView.withText = true;
            view = buttonView;
        }
        return view;
    }
    /**
	 * Creates a position options object used to position the balloon panel.
	 *
	 * @param mentionMarker
	 * @param preferredPosition The name of the last matched position name.
	 */ _getBalloonPanelPositionData(mentionMarker, preferredPosition) {
        const editor = this.editor;
        const editing = editor.editing;
        const domConverter = editing.view.domConverter;
        const mapper = editing.mapper;
        const uiLanguageDirection = editor.locale.uiLanguageDirection;
        return {
            target: ()=>{
                let modelRange = mentionMarker.getRange();
                // Target the UI to the model selection range - the marker has been removed so probably the UI will not be shown anyway.
                // The logic is used by ContextualBalloon to display another panel in the same place.
                if (modelRange.start.root.rootName == '$graveyard') {
                    modelRange = editor.model.document.selection.getFirstRange();
                }
                const viewRange = mapper.toViewRange(modelRange);
                const rangeRects = Rect.getDomRangeRects(domConverter.viewRangeToDom(viewRange));
                return rangeRects.pop();
            },
            limiter: ()=>{
                const view = this.editor.editing.view;
                const viewDocument = view.document;
                const editableElement = viewDocument.selection.editableElement;
                if (editableElement) {
                    return view.domConverter.mapViewToDom(editableElement.root);
                }
                return null;
            },
            positions: getBalloonPanelPositions(preferredPosition, uiLanguageDirection)
        };
    }
}
/**
 * Returns the balloon positions data callbacks.
 */ function getBalloonPanelPositions(preferredPosition, uiLanguageDirection) {
    const positions = {
        // Positions the panel to the southeast of the caret rectangle.
        'caret_se': (targetRect)=>{
            return {
                top: targetRect.bottom + VERTICAL_SPACING,
                left: targetRect.right,
                name: 'caret_se',
                config: {
                    withArrow: false
                }
            };
        },
        // Positions the panel to the northeast of the caret rectangle.
        'caret_ne': (targetRect, balloonRect)=>{
            return {
                top: targetRect.top - balloonRect.height - VERTICAL_SPACING,
                left: targetRect.right,
                name: 'caret_ne',
                config: {
                    withArrow: false
                }
            };
        },
        // Positions the panel to the southwest of the caret rectangle.
        'caret_sw': (targetRect, balloonRect)=>{
            return {
                top: targetRect.bottom + VERTICAL_SPACING,
                left: targetRect.right - balloonRect.width,
                name: 'caret_sw',
                config: {
                    withArrow: false
                }
            };
        },
        // Positions the panel to the northwest of the caret rect.
        'caret_nw': (targetRect, balloonRect)=>{
            return {
                top: targetRect.top - balloonRect.height - VERTICAL_SPACING,
                left: targetRect.right - balloonRect.width,
                name: 'caret_nw',
                config: {
                    withArrow: false
                }
            };
        }
    };
    // Returns only the last position if it was matched to prevent the panel from jumping after the first match.
    if (Object.prototype.hasOwnProperty.call(positions, preferredPosition)) {
        return [
            positions[preferredPosition]
        ];
    }
    // By default, return all position callbacks ordered depending on the UI language direction.
    return uiLanguageDirection !== 'rtl' ? [
        positions.caret_se,
        positions.caret_sw,
        positions.caret_ne,
        positions.caret_nw
    ] : [
        positions.caret_sw,
        positions.caret_se,
        positions.caret_nw,
        positions.caret_ne
    ];
}
/**
 * Returns a marker definition of the last valid occurring marker in a given string.
 * If there is no valid marker in a string, it returns undefined.
 *
 * Example of returned object:
 *
 * ```ts
 * {
 * 	marker: '@',
 * 	position: 4,
 * 	minimumCharacters: 0
 * }
 * ````
 *
 * @param feedsWithPattern Registered feeds in editor for mention plugin with created RegExp for matching marker.
 * @param text String to find the marker in
 * @returns Matched marker's definition
 */ function getLastValidMarkerInText(feedsWithPattern, text) {
    let lastValidMarker;
    for (const feed of feedsWithPattern){
        const currentMarkerLastIndex = text.lastIndexOf(feed.marker);
        if (currentMarkerLastIndex > 0 && !text.substring(currentMarkerLastIndex - 1).match(feed.pattern)) {
            continue;
        }
        if (!lastValidMarker || currentMarkerLastIndex >= lastValidMarker.position) {
            lastValidMarker = {
                marker: feed.marker,
                position: currentMarkerLastIndex,
                minimumCharacters: feed.minimumCharacters,
                pattern: feed.pattern
            };
        }
    }
    return lastValidMarker;
}
/**
 * Creates a RegExp pattern for the marker.
 *
 * Function has to be exported to achieve 100% code coverage.
 *
 * @internal
 */ function createRegExp(marker, minimumCharacters) {
    const numberOfCharacters = minimumCharacters == 0 ? '*' : `{${minimumCharacters},}`;
    const openAfterCharacters = env.features.isRegExpUnicodePropertySupported ? '\\p{Ps}\\p{Pi}"\'' : '\\(\\[{"\'';
    const mentionCharacters = '.';
    // I wanted to make an util out of it, but since this regexp uses "u" flag, it became difficult.
    // When "u" flag is used, the regexp has "strict" escaping rules, i.e. if you try to escape a character that does not need
    // to be escaped, RegExp() will throw. It made it difficult to write a generic util, because different characters are
    // allowed in different context. For example, escaping "-" sometimes was correct, but sometimes it threw an error.
    marker = marker.replace(/[.*+?^${}()\-|[\]\\]/g, '\\$&');
    // The pattern consists of 3 groups:
    //
    // - 0 (non-capturing): Opening sequence - start of the line, space or an opening punctuation character like "(" or "\"",
    // - 1: The marker character(s),
    // - 2: Mention input (taking the minimal length into consideration to trigger the UI),
    //
    // The pattern matches up to the caret (end of string switch - $).
    //               (0:      opening sequence       )(1: marker  )(2:                typed mention              )$
    const pattern = `(?:^|[ ${openAfterCharacters}])(${marker})(${mentionCharacters}${numberOfCharacters})$`;
    return new RegExp(pattern, 'u');
}
/**
 * Creates a test callback for the marker to be used in the text watcher instance.
 *
 * @param feedsWithPattern Feeds of mention plugin configured in editor with RegExp to match marker in text
 */ function createTestCallback(feedsWithPattern) {
    const textMatcher = (text)=>{
        const markerDefinition = getLastValidMarkerInText(feedsWithPattern, text);
        if (!markerDefinition) {
            return false;
        }
        let splitStringFrom = 0;
        if (markerDefinition.position !== 0) {
            splitStringFrom = markerDefinition.position - 1;
        }
        const textToTest = text.substring(splitStringFrom);
        return markerDefinition.pattern.test(textToTest);
    };
    return textMatcher;
}
/**
 * Creates a text matcher from the marker.
 */ function requestFeedText(markerDefinition, text) {
    let splitStringFrom = 0;
    if (markerDefinition.position !== 0) {
        splitStringFrom = markerDefinition.position - 1;
    }
    const regExp = createRegExp(markerDefinition.marker, 0);
    const textToMatch = text.substring(splitStringFrom);
    const match = textToMatch.match(regExp);
    return match[2];
}
/**
 * The default feed callback.
 */ function createFeedCallback(feedItems) {
    return (feedText)=>{
        const filteredItems = feedItems// Make the default mention feed case-insensitive.
        .filter((item)=>{
            // Item might be defined as object.
            const itemId = typeof item == 'string' ? item : String(item.id);
            // The default feed is case insensitive.
            return itemId.toLowerCase().includes(feedText.toLowerCase());
        });
        return filteredItems;
    };
}
/**
 * Checks if position in inside or right after a text with a mention.
 */ function isPositionInExistingMention(position) {
    // The text watcher listens only to changed range in selection - so the selection attributes are not yet available
    // and you cannot use selection.hasAttribute( 'mention' ) just yet.
    // See https://github.com/ckeditor/ckeditor5-engine/issues/1723.
    const hasMention = position.textNode && position.textNode.hasAttribute('mention');
    const nodeBefore = position.nodeBefore;
    return hasMention || nodeBefore && nodeBefore.is('$text') && nodeBefore.hasAttribute('mention');
}
/**
 * Checks if the closest marker offset is at the beginning of a mention.
 *
 * See https://github.com/ckeditor/ckeditor5/issues/11400.
 */ function isMarkerInExistingMention(markerPosition) {
    const nodeAfter = markerPosition.nodeAfter;
    return nodeAfter && nodeAfter.is('$text') && nodeAfter.hasAttribute('mention');
}
/**
 * Checks if string is a valid mention marker.
 */ function isValidMentionMarker(marker) {
    return !!marker;
}
/**
 * Checks the mention plugins is in completion mode (e.g. when typing is after a valid mention string like @foo).
 */ function checkIfStillInCompletionMode(editor) {
    return editor.model.markers.has('mention');
}

/**
 * The mention plugin.
 *
 * For a detailed overview, check the {@glink features/mentions Mention feature} guide.
 */ class Mention extends Plugin {
    toMentionAttribute(viewElement, data) {
        return _toMentionAttribute(viewElement, data);
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Mention';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            MentionEditing,
            MentionUI
        ];
    }
}

export { Mention, MentionCommand, MentionDomWrapperView, MentionEditing, MentionListItemView, MentionUI, MentionsView, _addMentionAttributes, createRegExp as _createMentionMarkerRegExp, _toMentionAttribute };
//# sourceMappingURL=index.js.map
