var bootbox;
(function (global) {
    var controller = (function () {
        function request(config) {
            var deffered = $.Deferred();
            var options = $.extend({
                url: "/", method: 'GET', cache: false, processData: true,
                contentType:  "application/json; charset=utf-8", //'application/x-www-form-urlencoded; charset=UTF-8', 
                dataType: "json", 
                data: {}
            }, config);
            var xhr = $.ajax(options)
                .done(function (data) {
                      return deffered.resolve(data);
                })
                .fail(function (error, message) {
                    if (error.responseText) {//{"readyState":4,"responseText":"","status":415,"statusText":"Unsupported Media Type"}
                        bootbox.alert(getErrorContent(error.responseText));
                    } else {
                        bootbox.alert(getErrorContent(JSON.stringify(error).escape()));
                    }
                    return deffered.reject();
                });
            var promise = deffered.promise();
            promise.abort = function() {
                xhr.abort();
            }
            return promise;
        };
        function getErrorContent(message) {
            return '<div>' +
                '<p class="text-center">Error: Something went wrong.. Please contact customer support.</p>' +
                '<i class="fa fa-plus-square-o" style="cursor: pointer" onclick="javascript: var t = $(this); t.hide();t.next(\'i\').show().next(\'div\').show();" aria-hidden="true"></i>' +
                '<i class="fa fa-minus-square-o" onclick="javascript: var t = $(this); t.hide(); t.prev(\'i\').show(); t.next(\'div\').hide();" style="display: none; cursor: pointer" aria-hidden="true"></i>' +
                '<div id="error-info-block" style="padding: 0 15px;display: none">' +
                '<textarea rows="10" cols="80" style="width:100%">' + message + '</textarea>' +
                '</div>' +
                '</div>';
        }
        function controller() {
            //this.siteUrl = "/" + window.location.pathname.split("/")[1] + "/";
            this.siteUrl = "http://localhost:9000/";
        }

         //$.ajax({
            //    method: 'get',
            //    url: "api/wallet/status",
            //    contentType: "application/json; charset=utf-8",
            //    headers: {
            //        'Authorization': 'Bearer ' + self.data.getAccessToken()
            //    },
            //    success: function (data) {
            //        self.myHometown('Your Hometown is : ' + data.hometown);
            //    }
            //});

        controller.prototype.get = function (url, data, accessToken, dataType) {
            return request({
                url: url, data: data, dataType: dataType, headers: { 'Authorization': 'Bearer ' + accessToken } });
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