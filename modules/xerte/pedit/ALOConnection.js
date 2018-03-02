function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var ALOConnection = function () {
    var _connectionKey = null;

    var _sendMessage = function (message, data) {
        window.parent.postMessage("ALO" + JSON.stringify({ connectionKey: _connectionKey, message: message, data: data }), "*");
    };

    var _self = {
        notify: function (message, data) {
            if (!_connectionKey) return;
            _sendMessage(message, data);
        },
        handshake: function () {
            _connectionKey = getParameterByName("aloConnectionKey", window.location.href);
            _sendMessage("READY", {});
        }
    };

    return _self;
};

var ALOConnectionAPI = function (embeddedWindow, options) {
    var settings = $.extend({}, options);

    var _self = {
        notified: function (messageData) {
            alert("notification for key: " + settings.connectionKey + " - message: " + messageData.message);
        }
    };

    return _self;
};

var ALOConnectionManager = function() {

    var apiConnections = {};

    var _messageReceived = function (event) {

        var messageBody = event.data;
        if (messageBody.substring(0,3) != "ALO")
            return;
        var embeddedWindow = event.source;

        var messageData = JSON.parse(messageBody.substring(3));

        var connectionKey = messageData.connectionKey;

        if (messageData.message == "READY") {
            apiConnections[connectionKey] = new ALOConnectionAPI(embeddedWindow, { connectionKey: connectionKey });
            return;
        }
        apiConnections[connectionKey].notified(messageData);
    };

    var _initialize = function () {
        window.addEventListener("message", _messageReceived, false);
    };

    _initialize();
};