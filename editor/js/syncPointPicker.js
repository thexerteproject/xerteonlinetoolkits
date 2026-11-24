/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var EDITOR = (function ($, parent) {
    "use strict";

    let popcornLoading = false;
    let popcornQueue = [];

    // returns the media url for the sync point, this is specified in xwd in src, e.g. src="parent|url"
    function resolveMediaSrc(key, src) {
        if (!src) {
            return "";
        }
        let value = parent.toolbox.evaluateReference(key, src, lo_data[key] && lo_data[key].attributes, typeof lo_attributes !== "undefined" ? lo_attributes : undefined);
        if (value === undefined || value === null || String(value).trim() === "") {
            return "";
        }
        return parent.toolbox.makeAbsolute(value);
    }

    // resolves the sync point value to seconds - sync points can be set as relative values (e.g. +5) and these need to be calculated in relation to the previous sync point (or the sync point specified in relativeTo)
    function resolveAttributeToSeconds(nodeKey, attrName, stack) {
        stack = stack || {};
        const stackId = nodeKey + "|" + attrName;
        if (stack[stackId]) {
            return 0;
        }
        stack[stackId] = true;

        const attrs = lo_data[nodeKey] && lo_data[nodeKey].attributes;
        if (!attrs || attrs[attrName] === undefined || attrs[attrName] === null) {
            return 0;
        }
        const s = String(attrs[attrName]).trim();
        if (s === "") {
            return 0;
        }
        if (s.charAt(0) !== "+") {
            const num = parseFloat(s);
            return isNaN(num) ? 0 : num;
        }

        let offset = parseFloat(s.slice(1));
        if (isNaN(offset)) {
            offset = 0;
        }

        let base = 0;
        const relSpec = getWizardRelativeTo(attrs.nodeName, attrName);
        if (relSpec) {
            const ref = parent.toolbox.resolveReferenceTarget(nodeKey, relSpec);
            if (ref) {
                base = resolveAttributeToSeconds(ref.key, ref.attrName, stack);
            }
        } else {
            base = resolvePreviousSiblingSameField(nodeKey, attrName, stack);
        }
        return base + offset;
    }

    // by default, relative sync points are relative to the same attribute on the node's sibling
    // can override this by specifying relativeTo in xwd - this function returns relativeTo when it exists
    function getWizardRelativeTo(nodeName, attrName) {
        if (typeof wizard_data === "undefined" || !wizard_data[nodeName] || !wizard_data[nodeName].node_options) {
            return undefined;
        }
        const all = wizard_data[nodeName].node_options.all || [];
        for (let i = 0; i < all.length; i++) {
            if (all[i].name === attrName && all[i].value && all[i].value.relativeTo) {
                return all[i].value.relativeTo;
            }
        }
        return undefined;
    }

    // by default, relative sync points are relative to the same attribute on the node's previous sibling
    // returns this value when no relativeTo specified (which would override the default)
    function resolvePreviousSiblingSameField(key, attrName, stack) {
        const tree = $.jstree.reference("#treeview");
        if (!tree) {
            return 0;
        }
        const parentKey = tree.get_parent(key);
        if (!parentKey || !lo_data[parentKey]) {
            return 0;
        }
        const siblings = tree.get_node(parentKey).children || [];
        const idx = siblings.indexOf(key);
        for (let i = idx - 1; i >= 0; i--) {
            const sibKey = siblings[i];
            const a = lo_data[sibKey] && lo_data[sibKey].attributes;
            if (a && a[attrName] !== undefined && a[attrName] !== null && String(a[attrName]).trim() !== "") {
                return resolveAttributeToSeconds(sibKey, attrName, stack);
            }
        }
        return 0;
    }

    // returns the sync point in format hh:mm:ss
    function secondsToDisplay(seconds) {
        const num = parseFloat(seconds);
        if (isNaN(num)) {
            return String(seconds);
        }
        const hrs = Math.floor(num / 3600);
        const rem = num - hrs * 3600;
        const mins = Math.floor(rem / 60);
        const secs = rem - mins * 60;
        if (hrs > 0) {
            return hrs + ":" + (mins < 10 ? "0" : "") + mins + ":" + formatSecComponent(secs);
        }
        return (mins < 10 ? "0" : "") + mins + ":" + formatSecComponent(secs);
    }

    // returns the seconds that will be shown in hh:mm:ss
    function formatSecComponent(secs) {
        const num = Number(secs);
        if (isNaN(num)) {
            return "00";
        }
        const rounded = Math.round(num * 1000) / 1000;
        const whole = Math.floor(rounded);
        const frac = rounded - whole;
        const wholeStr = whole < 10 ? "0" + whole : String(whole);
        if (frac < 0.0005) {
            return wholeStr;
        }
        const fracDigits = frac.toFixed(3).substring(2).replace(/0+$/, "");
        return fracDigits ? wholeStr + "." + fracDigits : wholeStr;
    }

    // returns the sync point for display in the editor field
    function formatDisplayValue(stored) {
        if (stored === undefined || stored === null || String(stored).trim() === "") {
            return "00:00";
        }
        const s = String(stored).trim();
        if (s.charAt(0) === "+") {
            return s;
        }
        const num = parseFloat(s);
        if (isNaN(num)) {
            return s;
        }
        return secondsToDisplay(num);
    }

    // ensures the sync point displayed in the editor field is in the correct format hh:mm:aa
    function parseInputToStored(input) {
        const s = String(input).trim();
        if (s === "") {
            return "0";
        }
        if (s.charAt(0) === "+") {
            return s;
        }
        if (s.indexOf(":") >= 0) {
            const parts = s.split(":");
            let secs = 0;
            if (parts.length === 2) {
                secs = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
            } else if (parts.length === 3) {
                secs = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
            }
            if (!isNaN(secs)) {
                return String(secs);
            }
        }
        const n = parseFloat(s);
        if (!isNaN(n)) {
            return String(n);
        }
        return s;
    }

    // returns true if youtube
    function isYouTubeEmbed(url) {
        return String(url).toLowerCase().indexOf("youtu") > 0;
    }

    // returns true if vimeo
    function isVimeoEmbed(url) {
        return String(url).toLowerCase().indexOf("vimeo") > 0;
    }

    // returns true if peer tube
    function isPeertubeEmbed(url) {
        if (typeof isPeertubeVideo === "function") {
            return isPeertubeVideo(url);
        }
        return String(url).toLowerCase().indexOf("videos/embed") > -1;
    }

    // if vimeo or peertube, we need canplaythrough to be true before we can seek to initial sync point
    function needsDeferredEmbedSeek(url) {
        return isVimeoEmbed(url) || isPeertubeEmbed(url);
    }

    // adds start time to YouTube URL as seeking after loading player was temperamental
    function youTubeAddStartParam(url, seconds) {
        const startSec = Math.floor(Math.max(0, Number(seconds)));
        if (startSec <= 0) {
            return String(url);
        }
        let media = String(url);
        if (/[?&]start=\d+/i.test(media)) {
            return media.replace(/([?&])start=\d+/i, "$1start=" + startSec);
        }
        const sep = media.indexOf("?") < 0 ? "?" : "&";
        return media + sep + "start=" + startSec;
    }

    // returns true if it's an uploaded audio file
    function isAudioMedia(url) {
        const u = String(url).toLowerCase();
        return u.indexOf(".mp3") > -1
            || u.indexOf(".ogg") > -1
            || u.indexOf(".wav") > -1
            || u.indexOf(".m4a") > -1;
    }

    // closes lightbox if an error has occured (alert is shown prior to this)
    function closeSynchLightBox() {
        const lightbox = $.featherlight.current();
        if (lightbox) {
            lightbox.close();
        }
    }

    // popcorn / mediaPlayer.js wrapper can error without some globals set
    function ensureEditorPopcornGlobals() {
        if (typeof window.x_params === "undefined") {
            let lang = "en-GB";
            if (typeof languagecodevariable !== "undefined" && languagecodevariable) {
                lang = String(languagecodevariable);
            }
            window.x_params = { language: lang };
        }
        if (typeof window.x_volume === "undefined") {
            window.x_volume = 1;
        }
        if (typeof window.x_audioBarH === "undefined") {
            window.x_audioBarH = 30;
        }
        if (typeof window.x_mediaText === "undefined") {
            window.x_mediaText = [
                { label: "Stop" },
                { label: "Play/Pause" },
                { label: "Volume" },
                { label: "Fullscreen" },
                { label: "Captions" },
                { label: "" }
            ];
        }
        if (typeof window.x_templateLocation === "undefined") {
            window.x_templateLocation = "";
        }
        if (typeof window.xot_offline === "undefined") {
            window.xot_offline = false;
        }
    }

    // loads required js files
    function ensurePopcorn(callback) {
        ensureEditorPopcornGlobals();
        // check that popcorn has loaded
        if (typeof Popcorn !== "undefined"
            && typeof loadMedia !== "undefined"
            && typeof $.fn.mediaPlayer === "function") {
            callback();
            return;
        }
        popcornQueue.push(callback);
        if (popcornLoading) {
            return;
        }
        popcornLoading = true;

        function onScriptsReady() {
            popcornLoading = false;
            const q = popcornQueue.slice();
            popcornQueue = [];
            q.forEach(function (cb) {
                cb();
            });
        }

        function onScriptsFailed() {
            popcornLoading = false;
            popcornQueue = [];
            alert(language.synchPoint.Error.loadFailed);
            closeSynchLightBox();
        }

        const pickerScriptChain = [
            { url: "modules/common/js/popcorn/popcorn-complete.js" },
            { url: "modules/common/mediaelement/mediaelement-and-player.js" },
            { url: "modules/xerte/parent_templates/Nottingham/common/js/mediaPlayer.js", optional: true },
            { url: "modules/common/js/popcorn/config/peertube_urls.js", optional: true },
            { url: "modules/common/js/popcorn/plugins/popcorn.mediaconstructor.js" }
        ];

        function loadPickerScripts(chain, index) {
            if (index >= chain.length) {
                onScriptsReady();
                return;
            }
            const step = chain[index];
            const req = $.getScript(site_url + step.url);
            if (step.optional) {
                req.always(function () {
                    loadPickerScripts(chain, index + 1);
                });
            } else {
                req.done(function () {
                    loadPickerScripts(chain, index + 1);
                }).fail(function () {
                    onScriptsFailed();
                });
            }
        }

        loadPickerScripts(pickerScriptChain, 0);
    }

    // one-shot popcorn event listener (e.g. defer seek until canplaythrough)
    function popcornOnce(instance, type, fn) {
        if (!instance || typeof instance.on !== "function") {
            return;
        }
        const wrapper = function (event) {
            instance.off(type, wrapper);
            fn(event);
        };
        instance.on(type, wrapper);
    }

    // get the current media playback position
    function getCurrentTime(state) {
        if (state.popcornInstance) {
            try {
                return state.popcornInstance.currentTime();
            } catch (e) {
                return 0;
            }
        }
        if (state.mediaElement) {
            return state.mediaElement.currentTime;
        }
        return 0;
    }

    // moves player to current sync point (& pauses) when lightbox is opened
    function seekTo(state, time, pauseAfter) {
        const t = Math.max(0, time);
        if (state.popcornInstance) {
            try {
                state.popcornInstance.currentTime(t);
            } catch (e) {}
            if (pauseAfter === true) {
                try {
                    state.popcornInstance.pause();
                } catch (e) {}
            }
            return;
        }
        if (state.mediaElement) {
            state.mediaElement.currentTime = t;
            if (pauseAfter === true) {
                state.mediaElement.pause();
            }
        }
    }

    // called when lightbox is closed
    function destroyPlayer(state) {
        if (state.popcornInstance) {
            try {
                state.popcornInstance.pause();
                state.popcornInstance.destroy();
            } catch (e) {}
            state.popcornInstance = null;
        }
        if (state.mediaElement) {
            try {
                state.mediaElement.pause();
                state.mediaElement.removeAttribute("src");
                state.mediaElement.load();
            } catch (e) {}
            state.mediaElement = null;
        }
    }

    // builds native <audio> for MP3 preview
    function buildAudioPlayer($holder, url) {
        const $media = $("<audio>", {
            controls: true,
            preload: "metadata",
            class: "synchPointPicker__media"
        });
        $media.append($("<source>", { src: url }));
        $holder.empty().append($media);
        return $media[0];
    }

    // build video player (embed or file) via loadMedia
    function buildEmbedPlayer($holder, url, state, previewTime, onReady) {
        const holderId = "synchPickerHolder_" + Date.now();
        $holder.empty().attr("id", holderId);
        const mediaData = {
            media: url,
            autoplay: "false",
            tip: ""
        };
        state.youtubeStartParam = false;
        if (isYouTubeEmbed(mediaData.media) && previewTime > 0) {
            mediaData.media = youTubeAddStartParam(mediaData.media, previewTime);
            state.youtubeStartParam = true;
        }
        state.popcornInstance = loadMedia($holder, "video", mediaData, true);
        let readyDone = false;
        const fireReadyOnce = function () {
            if (readyDone || !state.popcornInstance) {
                return;
            }
            readyDone = true;
            onReady();
        };

        const tryReady = function () {
            if (!state.popcornInstance) {
                return;
            }

            // ensure peer tube videos jump to sync point on load
            if (isPeertubeEmbed(url)) {
                popcornOnce(state.popcornInstance, "canplaythrough", fireReadyOnce);
                popcornOnce(state.popcornInstance, "durationchange", fireReadyOnce);
                setTimeout(fireReadyOnce, 5000);
                return;
            }

            let dur = 0;
            try {
                dur = state.popcornInstance.duration();
            } catch (e) {}
            if (dur > 0 || state.popcornInstance.media) {
                fireReadyOnce();
            } else {
                popcornOnce(state.popcornInstance, "loadedmetadata", fireReadyOnce);
            }
        };
        setTimeout(tryReady, 100);
    }

    // opens lightbox containing sync point picker when the editor button is clicked
    function openPicker(options) {
        const key = options.key;
        const mediaUrl = options.mediaUrl;
        const storedValue = options.storedValue;
        const fieldName = options.fieldName;
        const onSet = options.onSet;

        const previewTime = resolveAttributeToSeconds(key, fieldName || "synch", {});
        const pickerId = "synchPicker_" + Date.now();

        const state = {
            popcornInstance: null,
            mediaElement: null,
            $timeDisplay: null
        };

        const $dialog = $("<div>", {
            id: pickerId,
            class: "synchPointPicker",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": pickerId + "_instructions"
        });

        // the buttons at the top of the lightbox
        $dialog.append(
            '<div class="synchPointButtonHolder">' +
                '<button type="button" id="' + pickerId + '_cancel" name="cancel" class="hseditModeButton" title="' + language.Alert.cancellabel + '" style="float:right">' +
                    '<i class="fas fa-2x fa-xmark" aria-hidden="true"></i>' +
                '</button>' +
                '<button type="button" id="' + pickerId + '_ok" name="ok" class="hseditModeButton" title="' + language.Alert.oklabel + '" style="float:right">' +
                    '<i class="fas fa-2x fa-check" aria-hidden="true"></i>' +
                '</button>' +
            '</div>'
        );

        // the html for the media player block - containing the media player and the current time text
        const $body = $("<div>", { class: "synchPointPicker__body" });
        const $mediaHolder = $("<div>", { class: "synchPointPicker__mediaHolder" });
        $body.append($mediaHolder);

        const $timeRow = $("<div>", { class: "synchPointPicker__timeRow" });
        state.$timeDisplay = $("<span>", {
            class: "synchPointPicker__time",
            "aria-live": "polite",
            "aria-atomic": "true",
            text: secondsToDisplay(previewTime)
        });
        $timeRow.append($("<span>", { class: "synchPointPicker__timeLabel", text: language.synchPoint.currentTime + ": " }));
        $timeRow.append(state.$timeDisplay);
        $body.append($timeRow);

        // an extra note as the current sync point is relative (e.g. +5) & using the sync point picker will change to fixed sync point
        if (String(storedValue || "").trim().charAt(0) === "+") {
            const $timeRelativeRow = $("<div>", { class: "synchPointPicker__timeRelativeRow" });
            $timeRelativeRow.append(
                $("<span>",
                { class: "synchPointPicker__timeLabel" ,
                text: language.synchPoint.relativeNote + ": " + String(storedValue).trim() + ". " + language.synchPoint.relativeHint }));
            $body.append($timeRelativeRow);
        }

        // instructions displayed below the video
        let instructions = language.synchPoint.Instructions.header;
        instructions += "<ul>";
        instructions += "<li>" + language.synchPoint.Instructions.play + "</li>";
        instructions += "<li>" + language.synchPoint.Instructions.set + "</li>";
        instructions += "<li>" + language.synchPoint.Instructions.cancel + "</li>";
        instructions += "</ul>";

        $dialog.append($body);
        $dialog.append(
            $("<div>", {
                id: pickerId + "_instructions",
                class: "hsinstructions",
                html: instructions
            })
        );

        // updates the current time shown below the media player
        function updateTimeDisplay() {
            const t = getCurrentTime(state);
            state.$timeDisplay.text(secondsToDisplay(t));
        }

        // sets up event listeners
        function bindTimeDisplayUpdates() {
            if (state.popcornInstance) {
                state.popcornInstance.on("timeupdate", updateTimeDisplay);
                state.popcornInstance.on("pause", updateTimeDisplay);
                state.popcornInstance.on("seeked", updateTimeDisplay);
            } else if (state.mediaElement) {
                $(state.mediaElement).on("timeupdate.synchPicker seeked.synchPicker", updateTimeDisplay);
            }
        }

        // remove the event listeners used by the sync point picker
        function unbindTimeDisplayUpdates() {
            if (state.popcornInstance) {
                try {
                    state.popcornInstance.off("timeupdate", updateTimeDisplay);
                    state.popcornInstance.off("pause", updateTimeDisplay);
                    state.popcornInstance.off("seeked", updateTimeDisplay);
                } catch (e) {}
            } else if (state.mediaElement) {
                $(state.mediaElement).off(".synchPicker");
            }
        }

        // loads the media player within the sync point picker lightbox
        function initPlayer($root) {
            const $mediaHolder = $root.find(".synchPointPicker__mediaHolder");

            if (isAudioMedia(mediaUrl)) {
                $(".synchPointPicker").addClass("audio");
                state.mediaElement = buildAudioPlayer($mediaHolder, mediaUrl);
                const applyAudioPreviewSeek = function () {
                    seekTo(state, previewTime);
                    updateTimeDisplay();
                };
                $(state.mediaElement).on("loadedmetadata.synchPicker", applyAudioPreviewSeek);
                if (state.mediaElement.readyState >= 1) {
                    applyAudioPreviewSeek();
                }
                bindTimeDisplayUpdates();
                return;
            }

            ensurePopcorn(function () {
                buildEmbedPlayer($mediaHolder, mediaUrl, state, previewTime, function () {
                    state.$timeDisplay.text(secondsToDisplay(previewTime));

                    const isYouTube = isYouTubeEmbed(mediaUrl);
                    const pauseAfterInitialSeek = !isPeertubeEmbed(mediaUrl);

                    let embedSeekDone = false;
                    const applyEmbedSeek = function () {
                        if (embedSeekDone || !state.popcornInstance) {
                            return;
                        }
                        embedSeekDone = true;
                        if (previewTime <= 0) {
                            return;
                        }
                        seekTo(state, previewTime, pauseAfterInitialSeek);
                        popcornOnce(state.popcornInstance, "seeked", updateTimeDisplay);
                    };

                    const scheduleDeferredEmbedSeek = function () {
                        if (previewTime <= 0) {
                            return;
                        }
                        popcornOnce(state.popcornInstance, "canplaythrough", applyEmbedSeek);
                        setTimeout(applyEmbedSeek, 3000);
                    };

                    if (isYouTube) {
                        if (!state.youtubeStartParam && previewTime > 0) {
                            applyEmbedSeek();
                        }
                    } else if (needsDeferredEmbedSeek(mediaUrl)) {
                        scheduleDeferredEmbedSeek();
                    } else {
                        applyEmbedSeek();
                    }
                    bindTimeDisplayUpdates();
                });
            });
        }

        // open the lightbox containing the html constructed above
        const featherInstance = $.featherlight($dialog, {
            closeOnClick: false,
            closeOnEsc: true,
            closeIcon: "",
            afterOpen: function () {
                const $root = this.$content;
                state.$timeDisplay = $root.find(".synchPointPicker__time");
                initPlayer($root);

                $root.find('button[name="ok"]')
                    .on("click", function () {
                        const seconds = getCurrentTime(state);
                        const rounded = Math.round(seconds * 1000) / 1000;
                        if (typeof onSet === "function") {
                            onSet(String(rounded));
                        }
                        featherInstance.close();
                    })
                    .trigger("focus");

                $root.find('button[name="cancel"]').on("click", function () {
                    featherInstance.close();
                });
            },
            beforeClose: function () {
                unbindTimeDisplayUpdates();
                if (state.popcornInstance) {
                    try { state.popcornInstance.pause(); } catch (e) {}
                } else if (state.mediaElement) {
                    try { state.mediaElement.pause(); } catch (e) {}
                }
            },
            afterClose: function () {
                destroyPlayer(state);
                if (this.$content && this.$content.length) {
                    this.$content.find(".synchPointPicker__mediaHolder").empty();
                }
            }
        });
    }

    parent.syncPointPicker = {
        resolveMediaSrc: resolveMediaSrc,
        formatDisplayValue: formatDisplayValue,
        parseInputToStored: parseInputToStored,
        openPicker: openPicker
    };

    return parent;

})(jQuery, EDITOR || {});
