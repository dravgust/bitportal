var app;
(function (exports) {
    var sessionHub = (function () {
        function sessionHub() {
            var _this = this;

            $(function() {

                _this.hub = new WebSocket("ws://localhost:9000");

                _this.hub.onclose = function() {
                        console.log("[WebSockets] Disconnected");
                    };

                _this.hub.onerror = function(evt) {
                        console.log("Error [WebSockets]: SessionHub could not connect!\r\n" + evt.message);
                    };

                _this.hub.onopen = function() {
                        console.log("[WebSockets] Connected");
                    };

                _this.hub.onmessage = function(evt) {
                        console.log("[WebSockets] Get DATA: " + evt.data);
                    };

               $("#btnSend").click(function () {
                   if (_this.hub.readyState == WebSocket.OPEN) {
                       _this.hub.send("echo test");
                   }
                   else {
                       console.log("[WebSockets] Connection is closed");
                   }
               });
            });
        }
        return sessionHub;
    })();
    exports.SessionHub = sessionHub;
})(app || (app = {}));