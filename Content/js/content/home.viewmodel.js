var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (ko, exports) {
    __extends(homeViewModel, ko.BaseViewModel);
    function homeViewModel(app, dataModel) {
        ko.BaseViewModel.call(this, dataModel);
        var self = this;

        this.balance = ko.observable();
        this.unconfirmedHistory = ko.observableArray();
        this.history = ko.observableArray();

        this.address = ko.observable();
  
        Sammy(function () {
            this.get('#home', function () {
               
                // Make a call to the protected Web API by passing in a Bearer Authorization Header
                //$.ajax({
                //    method: 'get',
                //    url: app.dataModel.userInfoUrl,
                //    contentType: "application/json; charset=utf-8",
                //    headers: {
                //        'Authorization': 'Bearer ' + app.dataModel.getAccessToken()
                //    },
                //    success: function (data) {
                //        self.myHometown('Your Hometown is : ' + data.hometown);
                //    }
                //});

                app.sessionHub.client.history = function (data) {

                    var oldItem = self.history.First(function (item) {
                        return item.transactionId === data.transactionId;
                    })();

                    if (oldItem) {
                        self.history.replace(oldItem, data);
                    } else {
                        self.history.unshift(data);
                    }

                    self.data.address().done(function (data) {
                            self.address(data.address);
                        });
                };

                app.sessionHub.client.balance = function (data) {
                    self.balance(data);
                };

               //setInterval(function () {
               //     self.balance({ "confirmed": 7.240912, "unconfirmed": 0.002, "balance": 7.242912 });

               //     var newItem = {
               //         "address": "n34CGy74Gzk9RzMiGQnftjzrmhfMK3Gm2r",
               //         "amount": 0.111,
               //         "dateTime": "2016-12-19T14:59:23.594803+00:00",
               //         "confirmed": true,
               //         "transactionId": "9d1064b978ff466f34a4577988930ed5acdec31388f2318ad7cf6db17ea2ba73" + new Date().getMilliseconds()
               //     };

               //     var oldItem = self.history.First(function (item) {
               //         return item.transactionId === "9d1064b978ff466f34a4577988930ed5acdec31388f2318ad7cf6db17ea2ba73";
               //     })();

               //     if (oldItem) {
               //         self.history.replace(oldItem, newItem);

               //     } else {
               //         self.history.unshift(newItem);
               //     }

               // }, 1000);

                self.data.address()
                    .done(function(data) {
                        self.address(data.address);
                    });

                self.data.balance()
                    .done(function (data) { self.balance(data); });

                self.data.history()
                    .done(function(data) {
                        self.history(data);
                    });

                app.view(self);
            });
            this.get("/", function() {
                app.view(app.Views.Loading);
                this.app.runRoute("get", "#home");
            });
                
            //this.get('#/setup/device/:id', function () {
            //    var id = this.params["id"];
            //    this.app.runRoute('get', '#devicesetup');
            //});
            this.notFound = function () {
                 this.swap('');
                 $("<div style='text-align:center;color:#fff'>" +
                     "<h1>404 Not Found</h1>" +
                     "<h3>Oops! You're lost.</h3>" +
                     "<p>We can not find the page you're looking for.</p>" +
                   "</div>").appendTo(this.$element());
            }
        });

        return self;
    }

    exports.addViewModel({
        name: "Home",
        bindingMemberName: "home",
        factory: homeViewModel
    });

}(ko, app || (app = {})));
