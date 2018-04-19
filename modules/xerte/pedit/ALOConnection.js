function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var ALOConnection = function (options) {
    var _connectionKey = null;
    var _options = options;

    var _sendMessage = function (message, data) {
        window.parent.postMessage("ALO" + JSON.stringify({ connectionKey: _connectionKey, message: message, data: data }), "*");
    };

    var _messageReceived = function (event) {

        var messageBody = event.data;
        if (messageBody.substring(0, 3) != "ALO")
            return;

        var messageData = JSON.parse(messageBody.substring(3));

        _options.messageReceived(messageData);
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

    var _initialize = function () {
        window.addEventListener("message", _messageReceived, false);
    };

    _initialize();

    return _self;
};

var ALOConnectionPoint = new ALOConnection({
    messageReceived: function (messageData) {
        //alert("Request received");
        XTTerminate();

        var end = new Date();
        var delta = Math.abs(end.getTime() - state.start.getTime()) / 1000;
        var completion, nrvisited=0, nrcompleted=0;

        // Get Full completion (like in results)
        $.each(state.completedPages, function (i, completed) {
            // indices not defined will be visited anyway.
            // In that case 'completed' will be undefined
            if (completed) {
                nrcompleted++;
            }
            if (typeof(completed) != "undefined") {
                nrvisited++;
            }
        })

        if (nrcompleted != 0) {
            completion = Math.round((nrcompleted / state.toCompletePages.length) * 100);
        }
        else {
            completion = 0;
        }

        // Send results to PedIT
        ALOConnectionPoint.notify("activity",
            {
                completed: completion,
                score: Math.round(state.getRawScore()),
                passed: (state.getSuccessStatus() == "passed"),
                duration: Math.round(delta)
            });
    }
});

$(document).ready(function(){
    ALOConnectionPoint.handshake();
});

/*
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
*/