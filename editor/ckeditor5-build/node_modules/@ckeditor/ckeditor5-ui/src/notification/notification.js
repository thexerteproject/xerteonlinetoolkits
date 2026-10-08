/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/notification/notification
 */
import { ContextPlugin } from '@ckeditor/ckeditor5-core';
/**
 * The Notification plugin.
 *
 * This plugin sends a few types of notifications: `success`, `info` and `warning`. The notifications need to be
 * handled and displayed by a plugin responsible for showing the UI of the notifications. Using this plugin for dispatching
 * notifications makes it possible to switch the notifications UI.
 *
 * Note that every unhandled and not stopped `warning` notification will be displayed as a system alert.
 * See {@link module:ui/notification/notification~Notification#showWarning}.
 */
export class Notification extends ContextPlugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'Notification';
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
        // Each unhandled and not stopped `show:warning` event is displayed as a system alert.
        this.on('show:warning', (evt, data) => {
            window.alert(data.message); // eslint-disable-line no-alert
        }, { priority: 'lowest' });
    }
    /**
     * Shows a success notification.
     *
     * By default, it fires the {@link #event:show:success `show:success` event} with the given `data`. The event namespace can be extended
     * using the `data.namespace` option. For example:
     *
     * ```ts
     * showSuccess( 'Image is uploaded.', {
     * 	namespace: 'upload:image'
     * } );
     * ```
     *
     * will fire the `show:success:upload:image` event.
     *
     * You can provide the title of the notification:
     *
     * ```ts
     * showSuccess( 'Image is uploaded.', {
     * 	title: 'Image upload success'
     * } );
     * ```
     *
     * @param message The content of the notification.
     * @param data Additional data.
     * @param data.namespace Additional event namespace.
     * @param data.title The title of the notification.
     */
    showSuccess(message, data = {}) {
        this._showNotification({
            message,
            type: 'success',
            namespace: data.namespace,
            title: data.title
        });
    }
    /**
     * Shows an information notification.
     *
     * By default, it fires the {@link #event:show:info `show:info` event} with the given `data`. The event namespace can be extended
     * using the `data.namespace` option. For example:
     *
     * ```ts
     * showInfo( 'Editor is offline.', {
     * 	namespace: 'editor:status'
     * } );
     * ```
     *
     * will fire the `show:info:editor:status` event.
     *
     * You can provide the title of the notification:
     *
     * ```ts
     * showInfo( 'Editor is offline.', {
     * 	title: 'Network information'
     * } );
     * ```
     *
     * @param message The content of the notification.
     * @param data Additional data.
     * @param data.namespace Additional event namespace.
     * @param data.title The title of the notification.
     */
    showInfo(message, data = {}) {
        this._showNotification({
            message,
            type: 'info',
            namespace: data.namespace,
            title: data.title
        });
    }
    /**
     * Shows a warning notification.
     *
     * By default, it fires the {@link #event:show:warning `show:warning` event}
     * with the given `data`. The event namespace can be extended using the `data.namespace` option. For example:
     *
     * ```ts
     * showWarning( 'Image upload error.', {
     * 	namespace: 'upload:image'
     * } );
     * ```
     *
     * will fire the `show:warning:upload:image` event.
     *
     * You can provide the title of the notification:
     *
     * ```ts
     * showWarning( 'Image upload error.', {
     * 	title: 'Upload failed'
     * } );
     * ```
     *
     * Note that each unhandled and not stopped `warning` notification will be displayed as a system alert.
     * The plugin responsible for displaying warnings should `stop()` the event to prevent displaying it as an alert:
     *
     * ```ts
     * notifications.on( 'show:warning', ( evt, data ) => {
     * 	// Do something with the data.
     *
     * 	// Stop this event to prevent displaying it as an alert.
     * 	evt.stop();
     * } );
     * ```
     *
     * You can attach many listeners to the same event and `stop()` this event in a listener with a low priority:
     *
     * ```ts
     * notifications.on( 'show:warning', ( evt, data ) => {
     * 	// Show the warning in the UI, but do not stop it.
     * } );
     *
     * notifications.on( 'show:warning', ( evt, data ) => {
     * 	// Log the warning to some error tracker.
     *
     * 	// Stop this event to prevent displaying it as an alert.
     * 	evt.stop();
     * }, { priority: 'low' } );
     * ```
     *
     * @param message The content of the notification.
     * @param data Additional data.
     * @param data.namespace Additional event namespace.
     * @param data.title The title of the notification.
     */
    showWarning(message, data = {}) {
        this._showNotification({
            message,
            type: 'warning',
            namespace: data.namespace,
            title: data.title
        });
    }
    /**
     * Fires the `show` event with the specified type, namespace and message.
     *
     * @param data The message data.
     * @param data.message The content of the notification.
     * @param data.type The type of the message.
     * @param data.namespace Additional event namespace.
     * @param data.title The title of the notification.
     */
    _showNotification(data) {
        const event = data.namespace ?
            `show:${data.type}:${data.namespace}` :
            `show:${data.type}`;
        this.fire(event, {
            message: data.message,
            type: data.type,
            title: data.title || ''
        });
    }
}
