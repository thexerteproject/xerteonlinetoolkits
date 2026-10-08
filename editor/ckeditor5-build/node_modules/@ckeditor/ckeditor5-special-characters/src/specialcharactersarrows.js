/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module special-characters/specialcharactersarrows
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * A plugin that provides special characters for the "Arrows" category.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., SpecialCharacters, SpecialCharactersArrows ],
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */
export class SpecialCharactersArrows extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'SpecialCharactersArrows';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const t = editor.t;
        const plugin = editor.plugins.get('SpecialCharacters');
        plugin.addItems('Arrows', [
            { title: t('leftwards simple arrow'), character: '←' },
            { title: t('rightwards simple arrow'), character: '→' },
            { title: t('upwards simple arrow'), character: '↑' },
            { title: t('downwards simple arrow'), character: '↓' },
            { title: t('leftwards double arrow'), character: '⇐' },
            { title: t('rightwards double arrow'), character: '⇒' },
            { title: t('upwards double arrow'), character: '⇑' },
            { title: t('downwards double arrow'), character: '⇓' },
            { title: t('leftwards dashed arrow'), character: '⇠' },
            { title: t('rightwards dashed arrow'), character: '⇢' },
            { title: t('upwards dashed arrow'), character: '⇡' },
            { title: t('downwards dashed arrow'), character: '⇣' },
            { title: t('leftwards arrow to bar'), character: '⇤' },
            { title: t('rightwards arrow to bar'), character: '⇥' },
            { title: t('upwards arrow to bar'), character: '⤒' },
            { title: t('downwards arrow to bar'), character: '⤓' },
            { title: t('up down arrow with base'), character: '↨' },
            { title: t('back with leftwards arrow above'), character: '🔙' },
            { title: t('end with leftwards arrow above'), character: '🔚' },
            { title: t('on with exclamation mark with left right arrow above'), character: '🔛' },
            { title: t('soon with rightwards arrow above'), character: '🔜' },
            { title: t('top with upwards arrow above'), character: '🔝' }
        ], { label: t('Arrows') });
    }
}
