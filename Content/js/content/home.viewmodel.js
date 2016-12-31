var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function ($, ko, exports) {
    function entity(parameters) {
        $.extend(this, parameters);
    }
    function observableEntity(parameters) {
        var data = $.extend({}, parameters);
        ko.mapping.fromJS(data, {}, this);
    }
    function historyRecordArray(list) {
        var _this = this;
        this._array = [];
        list.forEach(function(item) {
            var el = _this._array.findWhere({ transactionId: item.transactionId });
            if (!el) {
                _this._array.push(item);
            } else {
                el.amount += item.amount;
            }
        });
        return this._array;
    }
    historyRecordArray.prototype.push = function(item) {
        var el = this._array.findWhere({ transactionId: item.transactionId });
        if (!el) {
            this._array.push(item);
        } else {
            el.amount += item.amount;
        }
    }

    exports.Entity = entity;
    exports.ObservableEntity = observableEntity;
    exports.HistoryRecordArray = historyRecordArray;
} (jQuery, ko, window));

(function (ko, exports) {
    __extends(homeViewModel, ko.BaseViewModel);
    function homeViewModel(app, dataModel) {
        ko.BaseViewModel.call(this, dataModel);
        var self = this;
        this.history = ko.observableArray();
        this.address = ko.observable();

        this.addressList = ko.observableArray();
        this.addressBook = ko.pureComputed(function () {
            return ko.toJSON(self.addressList());
        }, this);
        this.sending = ko.observable(false);
        this.payTo = ko.observable();

        this.send = function () {
            if ($('#form-sending', 'body').valid() === false) return;
            self.sending(true);
            self.data.send(self.payTo()).done(function () {
                self.payTo(null);
                $.growl.notice({ message: "Sent successfuly!" });
            }).always(function () {
                self.sending(false);
            });
        }

        this.cancel = function() {
           
            self.payTo(null);
            app.navigateToHome();
        }

        this.refresh = function () {

            self.data.history().done(function (data) {
                self.history(new HistoryRecordArray(data));
            });

            self.data.address().done(function (data) {
                self.addressList.push(data.address);
                self.address(data.address);
            });

            app.sessionHub.client.history = function (data) {

                var list = new HistoryRecordArray(data);
                list.forEach(function (element) {

                    var itmeinlist = self.history.First(function (item) {
                        return item.transactionId === element.transactionId;
                    })();

                    if (itmeinlist) {
                        self.history.replace(itmeinlist, element);
                    } else {
                        self.history.unshift(element);
                    }

                });

                self.data.address().done(function (data) {
                    self.address(data.address);
                });
            };
        }
  
        Sammy(function () {
            this.get('#home', function () {
               
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

                self.refresh();

                app.view(self);
            });
            this.get("#wallet", function () {
                //app.view(app.Views.Loading);

                self.payTo({
                    address: null,
                    amount: null
                });
                app.navigateToHome();

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
