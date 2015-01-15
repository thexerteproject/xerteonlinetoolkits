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
 
/**
 * Created with JetBrains PhpStorm.
 * User: tom
 * Date: 28-3-13
 * Time: 11:40
 * To change this template use File | Settings | File Templates.
 */

function enableTTS(){
    if (navigator.appName.indexOf("Microsoft") != -1){
        VoiceObj = new ActiveXObject("Sapi.SpVoice");
    }
}

function openWindow(params){
    if (params.type == "media") {
        var src = params.url + '?media=../' + params.media + ',transcript=../' + params.transcript + ',img=../' + params.img;
        window.open(src,'xerte_window',"status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=0,scrollbars=0,left=" + String((screen.width / 2) - (params.width / 2)) + ",top=" + String((screen.height / 2) - (params.height / 2)) + ",height=" + params.height + ",width=" + params.width);
    } else {
        window.open(params.url,'xerte_window',"status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=0,scrollbars=0,left=" + String((screen.width / 2) - (params.width / 2)) + ",top=" + String((screen.height / 2) - (params.height / 2)) + ",height=" + params.height + ",width=" + params.width);
    }
}

var popupInfo = new Array();
var stageW;
var stageH;
var screenSize;

function makePopUp(params) {
    //kill any existing popups
    var popup = document.getElementById("popup");
    var parent = document.getElementById("popup_parent");

    if (popup != null) {
        parent.removeChild(popup);
    }

    //make the div and style it
    var create_div = document.createElement("DIV");
    create_div.id = params.id;
    create_div.style.position = "absolute";
    create_div.style.background = params.bgColour;
    if (params.borderColour != "none") {
        create_div.style.border = "1px solid " + params.borderColour;
    }

    stageW = params.width;
    stageH = params.height;
    if (stageW == 1600 && stageH == 1200) {
        stageW = document.getElementsByTagName('body')[0].clientWidth;
        stageH = document.getElementsByTagName('body')[0].clientHeight;
    }
    if (screenSize == "full screen") {
        calcStageSize();
    }

    // save info about popup to use if screen resized
    var index = popupInfo.length;
    popupInfo[index] = new Array();
    popupInfo[index][0] = params.id;
    popupInfo[index][1] = params.type;
    popupInfo[index][2] = params.calcW;
    popupInfo[index][3] = params.calcH;
    popupInfo[index][4] = params.calcX;
    popupInfo[index][5] = params.calcY;

    if (screenSize == "fill window") {
        create_div.style.width = params.calcW + "%";
        create_div.style.height = params.calcH + "%";
        create_div.style.left = params.calcX + "%";
        create_div.style.top = params.calcY + "%";
    } else {
        create_div.style.width = calcPopupSize("width", index) + "px";
        create_div.style.height = calcPopupSize("height", index) + "px";
        create_div.style.left = calcPopupSize("x", index) + "px";
        create_div.style.top = calcPopupSize("y", index) + "px";
    }

    if (params.type == 'div') {
        create_div.innerHTML = params.src;
    } else {
        var iframe_create_div = document.createElement("IFRAME");
        iframe_create_div.id = "i" + params.id;
        iframe_create_div.name = "i" + params.id;
        iframe_create_div.src = params.src;
        if (params.type == 'jmol') {
            iframe_create_div.src += ',width=' + calcPopupSize("width", index) + ',height=' + calcPopupSize("height", index);
        }
        iframe_create_div.style.width = "100%";
        iframe_create_div.style.height = "100%";
        iframe_create_div.frameBorder = 'no';
        create_div.appendChild(iframe_create_div);
    }

    //finally append the div
    parent.appendChild(create_div);
}

function killPopUp() {
    var parent = document.getElementById("popup_parent");
    if (parent.hasChildNodes()) {
        while (parent.childNodes.length >= 1) {
            parent.removeChild(parent.firstChild);
            popupInfo.splice(0, popupInfo.length);
        }
    }
}

function calcPopupSize(type, index) {
    var num;
    if (type == "width") {
        num = stageW / 100 * popupInfo[index][2];
    } else if (type == "height") {
        num = stageH / 100 * popupInfo[index][3];
    } else if (type == "x") {
        num = stageW / 100 * popupInfo[index][4];
    } else if (type == "y") {
        num = stageH / 100 * popupInfo[index][5];
    }
    return num;
}

function calcStageSize() {
    if (stageH / stageW != 0.75) {
        var ratio = stageH / stageW;
        if (ratio > 0.75) {
            stageH = stageW * 0.75;
        } else {
            stageW = stageH / 0.75;
        }
    }
}

function resizePopup(type, width, height) {
    if (screenSize != type && !(screenSize == undefined && type == "default")) {
        var parent = document.getElementById("popup_parent");
        if (parent.hasChildNodes()) {
            if (type == "fill window") {
                for (i=0; i<popupInfo.length; i++) {
                    id = parent.childNodes[i].id;
                    document.getElementById(id).style.width = popupInfo[i][2] + "%";
                    document.getElementById(id).style.height = popupInfo[i][3] + "%";
                    document.getElementById(id).style.left = popupInfo[i][4] + "%";
                    document.getElementById(id).style.top = popupInfo[i][5] + "%";
                    if (popupInfo[i][1] == 'jmol') {
                        stageW = document.getElementsByTagName('body')[0].clientWidth;
                        stageH = document.getElementsByTagName('body')[0].clientHeight;
                        document.getElementById("ipopup"+i).contentWindow.resize(calcPopupSize("width", i), calcPopupSize("height", i));
                        //window.frames["ipopup"+i].resize(calcPopupSize("width", i), calcPopupSize("height", i));
                    }
                }
            } else {
                if (type == "full screen") {
                    stageW = document.getElementsByTagName('body')[0].clientWidth;
                    stageH = document.getElementsByTagName('body')[0].clientHeight;
                    calcStageSize();
                } else {
                    stageW = width;
                    stageH = height;
                }
                for (i=0; i<popupInfo.length; i++) {
                    id = parent.childNodes[i].id;
                    document.getElementById(id).style.width = calcPopupSize("width", i) + "px";
                    document.getElementById(id).style.height = calcPopupSize("height", i) + "px";
                    document.getElementById(id).style.left = calcPopupSize("x", i) + "px";
                    document.getElementById(id).style.top = calcPopupSize("y", i) + "px";
                    if (popupInfo[i][1] == 'jmol') {
                        document.getElementById("ipopup"+i).contentWindow.resize(calcPopupSize("width", i), calcPopupSize("height", i));
                        //window.frames["ipopup"+i].resize(calcPopupSize("width", i), calcPopupSize("height", i));
                    }
                }
            }
        }
    }
    screenSize = type;
}

function windowResized() {
    var parent = document.getElementById("popup_parent");
    if (parent.hasChildNodes() && screenSize == "full screen") {
        stageW = document.getElementsByTagName('body')[0].clientWidth;
        stageH = document.getElementsByTagName('body')[0].clientHeight;
        calcStageSize();
        for (i=0; i<popupInfo.length; i++) {
            id = parent.childNodes[i].id;
            document.getElementById(id).style.width = calcPopupSize("width", i) + "px";
            document.getElementById(id).style.height = calcPopupSize("height", i) + "px";
            document.getElementById(id).style.left = calcPopupSize("x", i) + "px";
            document.getElementById(id).style.top = calcPopupSize("y", i) + "px";
        }
    }
}
