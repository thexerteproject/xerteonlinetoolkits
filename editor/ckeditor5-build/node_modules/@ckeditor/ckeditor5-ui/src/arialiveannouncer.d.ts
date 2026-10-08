/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { Editor } from '@ckeditor/ckeditor5-core';
import type { Locale } from '@ckeditor/ckeditor5-utils';
import { type ViewCollection } from './viewcollection.js';
import { View } from './view.js';
import '../theme/components/arialiveannouncer/arialiveannouncer.css';
/**
 * The politeness level of an `aria-live` announcement.
 *
 * Available keys are:
 * * `AriaLiveAnnouncerPoliteness.POLITE`,
 * * `AriaLiveAnnouncerPoliteness.ASSERTIVE`
 *
 * [Learn more](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions#Politeness_levels).
 */
export declare const AriaLiveAnnouncerPoliteness: {
    readonly POLITE: "polite";
    readonly ASSERTIVE: "assertive";
};
/**
 * An accessibility helper that manages all ARIA live regions associated with an editor instance. ARIA live regions announce changes
 * to the state of the editor features.
 *
 * These announcements are consumed and propagated by screen readers and give users a better understanding of the current
 * state of the editor.
 *
 * To announce a state change to an editor use the {@link #announce} method:
 *
 * ```ts
 * editor.ui.ariaLiveAnnouncer.announce( 'Text of an announcement.' );
 * ```
 */
export declare class AriaLiveAnnouncer {
    /**
     * The editor instance.
     */
    readonly editor: Editor;
    /**
     * The view that aggregates all `aria-live` regions.
     */
    view?: AriaLiveAnnouncerView;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * Sets an announcement text to an aria region that is then announced by a screen reader to the user.
     *
     * If the aria region of a specified politeness does not exist, it will be created and can be re-used later.
     *
     * The default announcement politeness level is `'polite'`.
     *
     * ```ts
     * // Most screen readers will queue announcements from multiple aria-live regions and read them out in the order they were emitted.
     * editor.ui.ariaLiveAnnouncer.announce( 'Image uploaded.' );
     * editor.ui.ariaLiveAnnouncer.announce( 'Connection lost. Reconnecting.' );
     * ```
     */
    announce(announcement: string, attributes?: AriaLiveAnnouncerPolitenessValue | AriaLiveAnnounceConfig): void;
}
/**
 * The view that aggregates all `aria-live` regions.
 */
export declare class AriaLiveAnnouncerView extends View {
    /**
     * A collection of all views that represent individual `aria-live` regions.
     */
    readonly regionViews: ViewCollection<AriaLiveAnnouncerRegionView>;
    constructor(locale: Locale);
}
/**
 * The view that represents a single `aria-live`.
 */
export declare class AriaLiveAnnouncerRegionView extends View {
    /**
     * Current politeness level of the region.
     */
    readonly politeness: AriaLiveAnnouncerPolitenessValue;
    /**
     * DOM converter used to sanitize unsafe HTML passed to {@link #announce} method.
     */
    private _domConverter;
    /**
     * Interval used to remove additions. It prevents accumulation of added nodes in region.
     */
    private _pruneAnnouncementsInterval;
    constructor(editor: Editor, politeness: AriaLiveAnnouncerPolitenessValue);
    /**
     * Appends new announcement to region.
     */
    announce({ announcement, isUnsafeHTML }: AriaLiveAppendContentAttributes): void;
    /**
     * Return current announcements list HTML element.
     */
    private get _listElement();
}
export type AriaLiveAnnouncerPolitenessValue = typeof AriaLiveAnnouncerPoliteness[keyof typeof AriaLiveAnnouncerPoliteness];
export type AriaLiveAppendContentAttributes = {
    announcement: string;
    isUnsafeHTML?: boolean;
};
export type AriaLiveAnnounceConfig = {
    politeness: AriaLiveAnnouncerPolitenessValue;
    isUnsafeHTML?: boolean;
};
