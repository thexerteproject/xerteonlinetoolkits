/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/bubblingeventinfo
 */
import { EventInfo } from '@ckeditor/ckeditor5-utils';
import { type ViewDocument } from '../document.js';
import { type ViewNode } from '../node.js';
import { type ViewRange } from '../range.js';
/**
 * The event object passed to bubbling event callbacks. It is used to provide information about the event as well as a tool to
 * manipulate it.
 */
export declare class BubblingEventInfo<TName extends string = string, TReturn = unknown> extends EventInfo<TName, TReturn> {
    /**
     * The view range that the bubbling should start from.
     */
    readonly startRange: ViewRange;
    /**
     * The current event phase.
     */
    private _eventPhase;
    /**
     * The current bubbling target.
     */
    private _currentTarget;
    /**
     * @param source The emitter.
     * @param name The event name.
     * @param startRange The view range that the bubbling should start from.
     */
    constructor(source: object, name: TName, startRange: ViewRange);
    /**
     * The current event phase.
     */
    get eventPhase(): BubblingEventPhase;
    /**
     * The current bubbling target.
     */
    get currentTarget(): ViewDocument | ViewNode | null;
}
/**
 * The phase the event is in.
 */
export type BubblingEventPhase = 'none' | 'capturing' | 'atTarget' | 'bubbling';
