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
this.loadMedia = function($holder, mediaType, mediaData, mainMedia = true) {
    var $mediaHolder,
        popcornInstance,
        classes = "popcornMedia";
    
    if (mainMedia == true) {
        classes += " mainMedia";
    }
    
    if (mediaType == "video") {
        //load video - max dimensions set in mediaMetaData function below when dimensions received
        $mediaHolder = $holder;
        var $myVideo = $('<div class="' + classes + '"/>').appendTo($mediaHolder);

        // Add playervars to youtube.
        // Controls should appear and inline for iPhone (havent checked)
        if (mediaData.media.indexOf('youtu') > 0) {
            urlsep = (mediaData.media.indexOf("?") < 0 ? "?" : "&");
            mediaData.media += urlsep + "controls=2&playsinline=1"
        }
        // is it from youtube or vimeo or mediasite?
        if (mediaData.media.indexOf('youtu') > 0 
         || mediaData.media.indexOf('vimeo') > 0 
         || mediaData.media.indexOf('mediamission') > 0) {
            popcornInstance = Popcorn.smart("#" + $holder.attr("id") + " .popcornMedia", mediaData.media);
            var $videoHolder = $holder.find(".popcornMedia").addClass(popcornInstance.media._util.type).addClass("embed");
            $videoHolder.attr("aspect", mediaData.aspect);
            $videoHolder.data("popcornInstance", popcornInstance);
            if (mediaData.autoplay == "true") {
                popcornInstance.play();
            }
        } 
        else {
            $myVideo
                .attr("title", mediaData.tip)
                .css("margin", "0 auto")
                .mediaPlayer({
                    type		:"video",
                    source		:mediaData.media,
                    width		:"100%",
                    height		:"100%",
                    autoPlay	:mediaData.autoplay,
                    pageName	:"mediaLesson"
                });

            popcornInstance = Popcorn("#" +$holder.attr("id") + " video");
            if (mainMedia == true) {
                $("#" + $holder.attr("id") + " video").attr('id', 'mainVideo');
            } else {
                $("#" + $holder.attr("id") + " video").attr('id', 'video_' 
                    + $("#" + $holder.attr("id") + " video").parents('.mejs-video').attr('id'));
            }
        }
        
    } else if (mediaType == "audio") {
        // load audio in panel - width is either with of audioImage (if exists) or full width of panel
        $mediaHolder = $('<div class="mediaHolder"></div>').appendTo($holder);
        var $myAudio = $('<div class="' + classes + '"/>').appendTo($mediaHolder);
        
        $myAudio
            .attr("title", mediaData.tip)
            .mediaPlayer({
                type		:"audio",
                source		:mediaData.media,
                width       :"100%",
                autoPlay    :mediaData.autoplay
            });
        
        popcornInstance = Popcorn("#" + $holder.attr("id") + " audio");
        if (mainMedia == true) {
            $("#" + $holder.attr("id") + " audio").attr('id', 'mainAudio');
        } else {
            $("#" + $holder.attr("id") + " audio").attr('id', 'audio_' + 
                $("#" + $holder.attr("id") + " audio").parents('.mejs-audio').attr('id'));
        }
        
        if (mediaData.audioImage != "" && mediaData.audioImage != undefined) {
            var $imgHolder = $('<div class="audioImgHolder"></div>').insertBefore($myAudio),
                $img = $('<img class="audioImg" style="visibility: hidden" />').appendTo($imgHolder);
            
            $img
                .one("load", function() {
                    x_scaleImg(this, $holder.width(), $holder.height() - x_audioBarH, true, true);
                    $mediaHolder.width($(this).width());
                })
                .attr("src", x_evalURL(mediaData.audioImage))
                .each(function() { // called if loaded from cache as in some browsers load won't automatically trigger
                    if (this.complete) {
                        $(this).trigger("load");
                    }
                });
            if (mediaData.audioImageTip != "" && mediaData.audioImageTip != undefined) {
                $img.attr("alt", mediaData.audioImageTip);
            }
        }
    }
    
    // add transcript to media panel if required
    if (mediaData.transcript) {
        $mediaHolder.append('<div class="transcriptHolder"><div class="transcript">' 
            + x_addLineBreaks(mediaData.transcript) + '</div><button class="transcriptBtn"></button></div>');
        $mediaHolder.find(".transcript").hide();
        $mediaHolder.find(".transcriptBtn")
            .button({
                icons:	{secondary:"fa fa-x-btn-hide"},
                label:	mediaData.transcriptBtnTxt ? mediaData.transcriptBtnTxt : "Transcript"
            })
            .click(function() {
                // transcript slides in and out of view on click
                var $transcript = $(this).prev(".transcript");
                if ($transcript.is(":hidden") == true) {
                    $(this).button({icons: {secondary:"fa fa-x-btn-show"}});
                    $transcript.slideDown();
                } else {
                    $transcript.slideUp();
                    $(this).button({icons: {secondary:"fa fa-x-btn-hide"}});
                }
            });
        
        if (mediaType == "video") {
            $mediaHolder.find(".transcriptHolder")
                .width($mediaHolder.find(".popcornMedia").width())
                .css("margin", "0 auto");
        }
    }
    return popcornInstance;
}

// sets the size of videos. width and height take precedence over ratio
// Called using: resizeEmbededMedia($video, {ratio: 16 / 9})
this.resizeEmbededMedia = function($video, {ratio = 16 / 9, width, height}) {
    var $holder = $video.parent()

    var heightClaimed = 0;
    $holder.children().not($video).each(function() {
        heightClaimed += $(this).outerHeight(true);
    });

    var ww = $holder.width(),                   // max width
        wh = Math.floor(ww / ratio);            // height from widths perspective
        hh = $holder.height() - heightClaimed,  // max height
        hw = Math.floor(hh * ratio);            // width from heights perspective

    var w = ww < hw ? ww : hw; 
    var h = ww < hw ? wh : hh;

    if(!$video[0].getAttribute("aspect") && !$video.hasClass("mainMedia"))
    {
        w = "100%";
        h = "100%";
        $video.parent().css({
            "height": "100%"
        });
    }

    $video.css({
        "width":	width ? width : w,
        "height":	height ? height : h,
        "min-width" : 150,
        "min-height": 120
    });
};

// Test if a segment is valid and significant enough to be added to the state.
// if not, do nothing.
this.addSegment = function(videoState) {
    var segment = videoState.segment;
    if (segment.start != -1 && segment.end != -1 && segment.start < segment.end && segment.end - segment.start > 0.5)
    {
        // Pushing copy of segment
        var csegment = $.extend(true, {}, segment);
        videoState.segments.push(csegment);
    }
}

// Timeupdates are only tracked for seeks and leavepage()
this.addTrackingOnTimeUpdate = function(popcornInstance, videoState){
    var time = popcornInstance.currentTime();
    if (videoState.lastTime != time && time > 0) {
        videoState.prevTime = videoState.lastTime;
        videoState.lastTime = videoState.time;
    }
    return videoState;
}

this.addTrackingOnPlay = function(popcornInstance, videoState){
    var time = popcornInstance.currentTime();
    videoState.segment = {start: time, end: -1};
    videoState.duration = popcornInstance.duration();
    videoState.time = time;
    XTVideo(x_currentPage, "", "", "played", videoState, x_currentPageXML.getAttribute("grouping"));
    return videoState;
}

this.addTrackingOnPause = function(popcornInstance, videoState){
    var time = popcornInstance.currentTime();
    videoState.time = time;
    videoState.segment.end = time;
    this.addSegment(videoState);
    videoState.segment = {start: time, end: -1};
    videoState.duration = popcornInstance.duration();
    XTVideo(x_currentPage, "", "", "paused", videoState, x_currentPageXML.getAttribute("grouping"))
    return videoState;
}

this.addTrackingOnSeeked = function(popcornInstance, videoState){
    var time = popcornInstance.currentTime();
    videoState.time = time;
    videoState.segment.end = videoState.prevTime;
    this.addSegment(videoState);
    videoState.segment = {start: time, end: -1};
    videoState.duration = popcornInstance.duration();
    XTVideo(x_currentPage, "", "", "seeked", videoState, x_currentPageXML.getAttribute("grouping"));
    return videoState;
}

this.addTrackingOnEnded = function(popcornInstance, videoState){
    var time = popcornInstance.duration();
    videoState.duration = popcornInstance.duration();
    videoState.time = time;
    videoState.segment.end = time;
    this.addSegment(videoState);
    videoState.segment = {start: time, end: -1};
    XTVideo(x_currentPage, "", "", "paused", videoState, x_currentPageXML.getAttribute("grouping"));
    return videoState;
}
