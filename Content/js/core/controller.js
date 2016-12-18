var bootbox;
(function (global) {
    var controller = (function () {
        function request(config) {
            var deffered = $.Deferred();
            var options = $.extend({
                url: "/",method: 'GET',cache: false,dataType: "json",data: {},processData: true,
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
            }, config);
            var xhr = $.ajax(options)
                .done(function (data) {
                    if (data) {
                        if (data.errorId || data.errorId === 0) {//exceptionMessage
                            if (data.reason.indexOf('AUTHENTICATION REQUIRED') > -1) {
                                window.location = "/" + window.location.pathname.split("/")[1] + "/";
                            } else if (data.reason.indexOf('GeneralError') > -1 || data.reason.indexOf('UnhandledError') > -1) {
                                bootbox.alert(getErrorContent(data.detailedInformation));
                            }
                        } else if (data.status && (String(data.status).toUpperCase() === "ERROR")) {
                            console.log(data.details);
                            bootbox.alert(getErrorContent(data.details));
                        } else {
                            return deffered.resolve(data);
                        }
                        return deffered.reject(data);
                    }
                    return deffered.resolve();
                })
                .fail(function (error, dta, message) {
                    console.log(JSON.stringify(error));
                    bootbox.alert(getErrorContent(JSON.stringify(error)));
                    return deffered.reject();
                });
            var promise = deffered.promise();
            promise.abort = function() {
                xhr.abort();
            }
            return promise;
        };
        function getErrorContent(message) {
            return '<div><p class="text-center">Error: Something went wrong.. Please contact customer support.</p><i class="fa fa-plus-square-o" style="cursor: pointer" onclick="javascript: var t = $(this); t.hide();t.next(\'i\').show().next(\'div\').show();" aria-hidden="true"></i><i class="fa fa-minus-square-o" onclick="javascript: var t = $(this); t.hide(); t.prev(\'i\').show(); t.next(\'div\').hide();" style="display: none; cursor: pointer" aria-hidden="true"></i><div id="error-info-block" style="padding: 0 15px;display: none"><textarea rows="10" cols="50" style="width:100%">' + message.escape() + '</textarea></div></div>';
        }
        function controller() {
            //this.siteUrl = "/" + window.location.pathname.split("/")[1] + "/";
            this.siteUrl = "http://localhost:9000/";
        }
        controller.prototype.get = function (url, data, dataType) {
            return request({ url: url, data: data, dataType: dataType });
        };
        controller.prototype.post = function (url, data, dataType) {
            return request({ url: url, method: 'POST', data: data, dataType: dataType });
        };
        controller.prototype.postFormData = function (url, data) {
            return request({ url: url, method: 'POST', data: data, dataType: false, processData: false, contentType: false });
        };
        controller.prototype.put = function (url, data, dataType) {
            return request({ url: url, method: 'PUT', data: data, dataType: dataType });
        };
        controller.prototype.delete = function (url, data, dataType) {
            return request({ url: url, method: 'DELETE', data: data, dataType: dataType });
        };
        controller.prototype.getImageAsync = function(src) {
            return $.Deferred(function (task) {
                var image = new Image();
                image.onload = function () { task.resolve(image); }
                image.onerror = function () { task.reject(); }
                image.src = src;
            }).promise();
        }
        return controller;
    })();
    global.Controller = controller;
})(window);