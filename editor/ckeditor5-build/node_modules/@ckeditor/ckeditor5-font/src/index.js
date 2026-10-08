/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module font
 */
export { Font } from './font.js';
export { FontBackgroundColor } from './fontbackgroundcolor.js';
export { FontColor } from './fontcolor.js';
export { FontFamily } from './fontfamily.js';
export { FontSize } from './fontsize.js';
export { FontCommand } from './fontcommand.js';
export { FontBackgroundColorEditing } from './fontbackgroundcolor/fontbackgroundcolorediting.js';
export { FontBackgroundColorUI } from './fontbackgroundcolor/fontbackgroundcolorui.js';
export { FontColorEditing } from './fontcolor/fontcolorediting.js';
export { FontColorUI } from './fontcolor/fontcolorui.js';
export { FontFamilyEditing } from './fontfamily/fontfamilyediting.js';
export { FontFamilyUI } from './fontfamily/fontfamilyui.js';
export { FontSizeEditing } from './fontsize/fontsizeediting.js';
export { FontSizeUI } from './fontsize/fontsizeui.js';
export { FontBackgroundColorCommand } from './fontbackgroundcolor/fontbackgroundcolorcommand.js';
export { FontColorCommand } from './fontcolor/fontcolorcommand.js';
export { FontFamilyCommand } from './fontfamily/fontfamilycommand.js';
export { FontSizeCommand } from './fontsize/fontsizecommand.js';
export { FontColorUIBase } from './ui/colorui.js';
export { buildDefinition as _buildFontDefinition, renderUpcastAttribute as _renderUpcastFontColorAttribute, renderDowncastElement as _renderDowncastFontElement, addColorSelectorToDropdown as _addFontColorSelectorToDropdown } from './utils.js';
export { normalizeOptions as _normalizeFontFamilyOptions } from './fontfamily/utils.js';
export { normalizeOptions as _normalizeFontSizeOptions } from './fontsize/utils.js';
import './augmentation.js';
