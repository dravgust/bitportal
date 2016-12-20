var app;
(function (exports) {
    var sessionHub = (function () {
        function sessionHub() {
            var _this = this;
            var hub = null;
            this.client = {
                
            };

            try {
                hub = new WebSocket("ws://localhost:9000");
            }catch(err) {
                console.log(err);
            }
            
            if (hub != null) {
            
                hub.onclose = function() {
                    console.log("[WebSockets] Disconnected");
                };
            
                hub.onerror = function(evt) {
                    console.log("Error [WebSockets]: SessionHub could not connect!\r\n" + evt.message);
                };
            
                hub.onopen = function() {
                    console.log("[WebSockets] Connected");
                };
            
                hub.onmessage = function (evt) {
                    console.log("[WebSockets] Get DATA: ");
                    console.log(evt);

                    var data = JSON.parse(evt.data);

                    if (typeof _this.client[data.cmd] === 'function') {
                        _this.client[data.cmd](data.data);
                    }

                    //Object.getOwnPropertyNames(_this.client).forEach(function (property) {
                    //    if (typeof _this.client[property] === 'function') {
                    //    }
                    //});
                };
            
                $("#btnSend")
                    .click(function() {
                        if (hub.readyState == WebSocket.OPEN) {
                            hub.send("echo test");
                        } else {
                            console.log("[WebSockets] Connection is closed");
                        }
                    });
            }
          
        }
        return sessionHub;
    })();
    exports.SessionHub = sessionHub;
})(app || (app = {}));