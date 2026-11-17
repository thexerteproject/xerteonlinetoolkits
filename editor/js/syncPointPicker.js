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

    // returns the media url for the sync point
    function resolveMediaSrc(key, src) {
        if (!src) {
            return "";
        }
        const tree = $.jstree.reference("#treeview");
        if (!tree) {
            return "";
        }
        let nodeKey = key;
        let attrName = src;
        let parts = src.split(".");
        if (parts[0] === "parent" && parts.length >= 2) {
            nodeKey = tree.get_parent(key);
            if (!nodeKey || nodeKey === "treeroot") {
                return "";
            }
            attrName = parts.slice(1).join(".");
        }
        if (!lo_data[nodeKey] || !lo_data[nodeKey].attributes) {
            return "";
        }
        const val = lo_data[nodeKey].attributes[attrName];
        if (val === undefined || val === null || String(val).trim() === "") {
            return "";
        }
        return parent.toolbox.makeAbsolute(val);
    }

    // returns the current sync time in seconds
    function resolvePreviewSeconds(key, storedValue) {
        if (storedValue === undefined || storedValue === null || String(storedValue).trim() === "") {
            return 0;
        }
        const s = String(storedValue).trim();
        if (s.charAt(0) === "+") {
            let offset = parseFloat(s.slice(1));
            if (isNaN(offset)) {
                offset = 0;
            }
            return resolvePreviousSiblingSynch(key) + offset;
        }
        const num = parseFloat(s);
        return isNaN(num) ? 0 : num;
    }

    // returns the current sync time in seconds for relative sync points (so needs to look at sibling sync points)
    function resolvePreviousSiblingSynch(key) {
        const tree = $.jstree.reference("#treeview");
        if (!tree) {
            return 0;
        }
        const parentKey = tree.get_parent(key);
        if (!parentKey || !lo_data[parentKey]) {
            return 0;
        }
        const siblings = tree.get_node(parentKey).children || [];
        let synchPoint = 0;
        for (let i=0; i<siblings.length; i++) {
            if (siblings[i] === key) {
                break;
            }
            if (!lo_data[siblings[i]] || !lo_data[siblings[i]].attributes) {
                continue;
            }
            const attrs = lo_data[siblings[i]].attributes;
            let synch = attrs.synch !== undefined ? attrs.synch : (attrs.synchStart !== undefined ? attrs.synchStart : "0");
            synch = String(synch).trim();
            if (synch.charAt(0) === "+") {
                const off = parseFloat(synch.slice(1));
                synchPoint += isNaN(off) ? 0 : off;
            } else {
                const n = parseFloat(synch);
                synchPoint = isNaN(n) ? 0 : n;
            }
        }
        return synchPoint;
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

    // returns true if video is an embedded video, e.g. YouTube
    function isEmbeddableVideo(url) {
        const u = String(url).toLowerCase();
        return u.indexOf("youtu") > 0
            || u.indexOf("vimeo") > 0
            || u.indexOf('videos/embed') > 0 // Peertube
            || u.indexOf('mediamission') > 0
            || u.indexOf('mediasite') > 0
            || u.indexOf('deltion') > 0
            || u.indexOf('yuja.com') > 0;
    }

    // returns true if youtube
    function isYouTubeEmbed(url) {
        return String(url).toLowerCase().indexOf("youtu") > 0;
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

    function closeSynchLightBox() {
        const lightbox = $.featherlight.current();
        if (lightbox) {
            lightbox.close();
        }
    }

    // popcorn vimeo wrapper expects x_params (player) and errors without it
    function ensureEditorPopcornGlobals() {
        if (typeof window.x_params === "undefined") {
            let lang = "en-GB";
            if (typeof languagecodevariable !== "undefined" && languagecodevariable) {
                lang = String(languagecodevariable);
            }
            window.x_params = { language: lang };
        }
    }

    // loads popcorn files if not already loaded
    function ensurePopcorn(callback) {
        ensureEditorPopcornGlobals();
        // check that popcorn has loaded
        if (typeof Popcorn !== "undefined" && typeof loadMedia !== "undefined") {
            callback();
            return;
        }
        popcornQueue.push(callback);
        if (popcornLoading) {
            return;
        }
        popcornLoading = true;
        $.getScript("modules/common/js/popcorn/popcorn-complete.js")
            .done(function () {
                $.getScript("modules/common/js/popcorn/plugins/popcorn.mediaconstructor.js")
                    .done(function () {
                        popcornLoading = false;
                        const q = popcornQueue.slice();
                        popcornQueue = [];
                        q.forEach(function (cb) {
                            cb();
                        });
                    })
                    .fail(function () {
                        popcornLoading = false;
                        popcornQueue = [];
                        alert(language.synchPoint.Error.loadFailed);
                        closeSynchLightBox();
                    });
            })
            .fail(function () {
                popcornLoading = false;
                popcornQueue = [];
                alert(language.synchPoint.Error.loadFailed);
                closeSynchLightBox();
            });
    }

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

    // moves player to current sync point when lightbox is opened
    function seekTo(state, time) {
        const t = Math.max(0, time);
        if (state.popcornInstance) {
            try {
                state.popcornInstance.currentTime(t);
            } catch (e) {}
            try {
                state.popcornInstance.pause();
            } catch (e) {}
            return;
        }
        if (state.mediaElement) {
            state.mediaElement.currentTime = t;
            state.mediaElement.pause();
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

    // uploaded media file
    function buildNativePlayer($holder, url, isAudio) {
        const tag = isAudio ? "audio" : "video";
        const $media = $("<" + tag + ">", {
            controls: true,
            preload: "metadata",
            class: "synchPointPicker__media"
        });
        $media.append($("<source>", { src: url }));
        $holder.empty().append($media);
        return $media[0];
    }

    // embedded media file
    function buildEmbedPlayer($holder, url, state, previewTime, onReady) {
        const holderId = "synchPickerHolder_" + Date.now();
        $holder.empty().attr("id", holderId);
        const mediaData = {
            media: url,
            autoplay: "false",
            tip: ""
        };
        if (typeof Popcorn !== "undefined" && typeof Popcorn.fixYouTubeVimeo === "function") {
            mediaData.media = Popcorn.fixYouTubeVimeo(mediaData.media);
        }
        state.youtubeStartParam = false;
        if (isYouTubeEmbed(mediaData.media) && previewTime > 0) {
            mediaData.media = youTubeAddStartParam(mediaData.media, previewTime);
            state.youtubeStartParam = true;
        }
        state.popcornInstance = loadMedia($holder, "video", mediaData, true);
        const tryReady = function () {
            if (!state.popcornInstance) {
                return;
            }
            let dur = 0;
            try {
                dur = state.popcornInstance.duration();
            } catch (e) {}
            if (dur > 0 || state.popcornInstance.media) {
                onReady();
            } else {
                popcornOnce(state.popcornInstance, "loadedmetadata", onReady);
            }
        };
        setTimeout(tryReady, 100);
    }

    // opens lightbox containing sync point picker when the editor button is clicked
    function openPicker(options) {
        const key = options.key;
        const mediaUrl = options.mediaUrl;
        const storedValue = options.storedValue;
        const onSet = options.onSet;
        const previewTime = resolvePreviewSeconds(key, storedValue);
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

        function updateTimeDisplay() {
            const t = getCurrentTime(state);
            state.$timeDisplay.text(secondsToDisplay(t));
        }

        function bindTimeDisplayUpdates() {
            if (state.popcornInstance) {
                state.popcornInstance.on("timeupdate", updateTimeDisplay);
                state.popcornInstance.on("pause", updateTimeDisplay);
                state.popcornInstance.on("seeked", updateTimeDisplay);
            } else if (state.mediaElement) {
                $(state.mediaElement).on("timeupdate.synchPicker seeked.synchPicker", updateTimeDisplay);
            }
        }

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

        function initPlayer($root) {
            const $mediaHolder = $root.find(".synchPointPicker__mediaHolder");
            if (isEmbeddableVideo(mediaUrl)) {
                ensurePopcorn(function () {
                    buildEmbedPlayer($mediaHolder, mediaUrl, state, previewTime, function () {
                        state.$timeDisplay.text(secondsToDisplay(previewTime));
                        let embedSeekDone = false;
                        const applyEmbedSeek = function () {
                            if (embedSeekDone || !state.popcornInstance) {
                                return;
                            }
                            embedSeekDone = true;
                            seekTo(state, previewTime);
                            popcornOnce(state.popcornInstance, "seeked", updateTimeDisplay);
                        };

                        const isYouTube = isYouTubeEmbed(mediaUrl);
                        const isVimeo = String(mediaUrl).toLowerCase().indexOf("vimeo") > 0;

                        if (isYouTube) {
                            if (!state.youtubeStartParam && previewTime > 0) {
                                applyEmbedSeek();
                            }
                        } else if (isVimeo) {
                            popcornOnce(state.popcornInstance, "canplaythrough", applyEmbedSeek);
                            setTimeout(applyEmbedSeek, 2500);
                        } else {
                            applyEmbedSeek();
                        }
                        bindTimeDisplayUpdates();
                    });
                });
            } else {
                let audio = isAudioMedia(mediaUrl);
                if (audio) {
                    $(".synchPointPicker").addClass("audio");
                }
                state.mediaElement = buildNativePlayer($mediaHolder, mediaUrl, audio);
                $(state.mediaElement).on("loadedmetadata.synchPicker", function () {
                    seekTo(state, previewTime);
                    updateTimeDisplay();
                });
                if (state.mediaElement.readyState >= 1) {
                    seekTo(state, previewTime);
                    updateTimeDisplay();
                }
                bindTimeDisplayUpdates();
            }
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
