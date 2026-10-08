/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/index
 */
export { env, getUserAgent as _getUserAgent, isMac as _isMac, isWindows as _isWindows, isGecko as _isGecko, isSafari as _isSafari, isiOS as _isiOS, isAndroid as _isAndroid, isBlink as _isBlink, isRegExpUnicodePropertySupported as _isRegExpUnicodePropertySupported, isMediaForcedColors as _isMediaForcedColors, isMotionReduced as _isMotionReduced } from './env.js';
export { diff } from './diff.js';
export { fastDiff } from './fastdiff.js';
export { diffToChanges } from './difftochanges.js';
export { areConnectedThroughProperties } from './areconnectedthroughproperties.js';
export { _getEmitterListenedTo, _setEmitterId, _getEmitterId, EmitterMixin } from './emittermixin.js';
export { EventInfo } from './eventinfo.js';
export { ObservableMixin } from './observablemixin.js';
export { CKEditorError, logError, logWarning, DOCUMENTATION_URL } from './ckeditorerror.js';
export { ElementReplacer } from './elementreplacer.js';
export { abortableDebounce } from './abortabledebounce.js';
export { count } from './count.js';
export { compareArrays } from './comparearrays.js';
export { createElement } from './dom/createelement.js';
export { Config } from './config.js';
export { isIterable } from './isiterable.js';
export { DomEmitterMixin } from './dom/emittermixin.js';
export { findClosestScrollableAncestor } from './dom/findclosestscrollableancestor.js';
export { global } from './dom/global.js';
export { getAncestors } from './dom/getancestors.js';
export { getDataFromElement } from './dom/getdatafromelement.js';
export { getBorderWidths } from './dom/getborderwidths.js';
export { getRangeFromMouseEvent } from './dom/getrangefrommouseevent.js';
export { getCommonAncestor } from './dom/getcommonancestor.js';
export { getPositionedAncestor } from './dom/getpositionedancestor.js';
export { isText } from './dom/istext.js';
export { isWindow } from './dom/iswindow.js';
export { Rect } from './dom/rect.js';
export { ResizeObserver } from './dom/resizeobserver.js';
export { setDataInElement } from './dom/setdatainelement.js';
export { toUnit } from './dom/tounit.js';
export { indexOf } from './dom/indexof.js';
export { insertAt } from './dom/insertat.js';
export { isComment } from './dom/iscomment.js';
export { isNode } from './dom/isnode.js';
export { isRange } from './dom/isrange.js';
export { isValidAttributeName } from './dom/isvalidattributename.js';
export { isVisible } from './dom/isvisible.js';
export { getOptimalPosition, getConstrainedViewportRect } from './dom/position.js';
export { remove } from './dom/remove.js';
export { getVisualViewportOffset } from './dom/getvisualviewportoffset.js';
export { scrollAncestorsToShowTarget, scrollViewportToShowTarget } from './dom/scroll.js';
export { keyCodes, getCode, parseKeystroke, getEnvKeystrokeText, isArrowKeyCode, getLocalizedArrowKeyCodeDirection, isForwardArrowKeyCode } from './keyboard.js';
export { getLanguageDirection } from './language.js';
export { Locale } from './locale.js';
export { Collection } from './collection.js';
export { first } from './first.js';
export { nth } from './nth.js';
export { FocusTracker, isViewWithFocusTracker } from './focustracker.js';
export { KeystrokeHandler } from './keystrokehandler.js';
export { toArray } from './toarray.js';
export { toMap } from './tomap.js';
export { mapsEqual } from './mapsequal.js';
export { objectToMap } from './objecttomap.js';
export { add, _translate, _clear as _clearTranslations, _unifyTranslations } from './translation-service.js';
export { priorities } from './priorities.js';
export { retry, exponentialDelay } from './retry.js';
export { insertToPriorityArray } from './inserttopriorityarray.js';
export { spliceArray } from './splicearray.js';
export { uid } from './uid.js';
export { delay } from './delay.js';
export { wait } from './wait.js';
export { parseBase64EncodedObject } from './parsebase64encodedobject.js';
export { crc32 } from './crc32.js';
export { collectStylesheets } from './collectstylesheets.js';
export { formatHtml } from './formathtml.js';
export { spy } from './spy.js';
export { isCombiningMark, isHighSurrogateHalf, isLowSurrogateHalf, isInsideSurrogatePair, isInsideCombinedSymbol, isInsideEmojiSequence } from './unicode.js';
export { decodeLicenseKey } from './decodelicensekey.js';
export { isFeatureBlockedByLicenseKey } from './isfeatureblockedbylicensekey.js';
export { version, releaseDate } from './version.js';
