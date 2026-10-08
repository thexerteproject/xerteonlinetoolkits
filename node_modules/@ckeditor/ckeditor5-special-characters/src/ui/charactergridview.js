/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module special-characters/ui/charactergridview
 */
import { View, ButtonView, addKeyboardHandlingForGrid } from 'ckeditor5/src/ui.js';
import { KeystrokeHandler, FocusTracker, global } from 'ckeditor5/src/utils.js';
import '../../theme/charactergrid.css';
/**
 * A grid of character tiles. It allows browsing special characters and selecting the character to
 * be inserted into the content.
 *
 * @internal
 */
export class CharacterGridView extends View {
    /**
     * A collection of the child tile views. Each tile represents a particular character.
     */
    tiles;
    /**
     * Tracks information about the DOM focus in the grid.
     */
    focusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * Creates an instance of a character grid containing tiles representing special characters.
     *
     * @param locale The localization services instance.
     */
    constructor(locale) {
        super(locale);
        this.tiles = this.createCollection();
        this.setTemplate({
            tag: 'div',
            children: [
                {
                    tag: 'div',
                    attributes: {
                        class: [
                            'ck',
                            'ck-character-grid__tiles'
                        ]
                    },
                    children: this.tiles
                }
            ],
            attributes: {
                class: [
                    'ck',
                    'ck-character-grid'
                ]
            }
        });
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        addKeyboardHandlingForGrid({
            keystrokeHandler: this.keystrokes,
            focusTracker: this.focusTracker,
            gridItems: this.tiles,
            numberOfColumns: () => global.window
                .getComputedStyle(this.element.firstChild) // Responsive .ck-character-grid__tiles
                .getPropertyValue('grid-template-columns')
                .split(' ')
                .length,
            uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
        });
    }
    /**
     * Creates a new tile for the grid.
     *
     * @param character A human-readable character displayed as the label (e.g. "ε").
     * @param name The name of the character (e.g. "greek small letter epsilon").
     */
    createTile(character, name) {
        const tile = new ButtonView(this.locale);
        tile.set({
            label: character,
            withText: true,
            class: 'ck-character-grid__tile'
        });
        // Labels are vital for the users to understand what character they're looking at.
        // For now we're using native title attribute for that, see #5817.
        tile.extendTemplate({
            attributes: {
                title: name
            },
            on: {
                mouseover: tile.bindTemplate.to('mouseover'),
                focus: tile.bindTemplate.to('focus')
            }
        });
        tile.on('mouseover', () => {
            this.fire('tileHover', { name, character });
        });
        tile.on('focus', () => {
            this.fire('tileFocus', { name, character });
        });
        tile.on('execute', () => {
            this.fire('execute', { name, character });
        });
        return tile;
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        for (const item of this.tiles) {
            this.focusTracker.add(item.element);
        }
        this.tiles.on('change', (eventInfo, { added, removed }) => {
            if (added.length > 0) {
                for (const item of added) {
                    this.focusTracker.add(item.element);
                }
            }
            if (removed.length > 0) {
                for (const item of removed) {
                    this.focusTracker.remove(item.element);
                }
            }
        });
        this.keystrokes.listenTo(this.element);
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.keystrokes.destroy();
    }
    /**
     * Focuses the first focusable in {@link ~CharacterGridView#tiles}.
     */
    focus() {
        this.tiles.first.focus();
    }
}
