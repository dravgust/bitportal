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
    function isNumberKey(evt) {
        var charCode = (evt.which) ? evt.which : event.keyCode
        if (charCode != 43 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }
    function payTo(btcUsd) {
        var self = this;
        this.address = null;

        this.amount = ko.observable(0);
        this.amountUSD = ko.observable(0);

        this.feeType = ko.observable(0);

        this.amountView = ko.pureComputed({
            read: function () {
                return (self.amountUSD() / +btcUsd).toFixed(8);
            },
            write: function (value) {
                self.amount(+value);
            },
            owner: this
        });

        this.amountUSDView = ko.pureComputed({
            read: function () {
                return (self.amount() * btcUsd).toFixed(0);
            },
            write: function (value) {
                self.amountUSD(+value);
            },
            owner: this
        });
    }

    exports.Entity = entity;
    exports.ObservableEntity = observableEntity;
    exports.HistoryRecordArray = historyRecordArray;

    exports.PayTo = payTo;
} (jQuery, ko, window));

(function (ko, exports) {
    __extends(homeViewModel, ko.BaseViewModel);
    function homeViewModel(app, dataModel) {
        ko.BaseViewModel.call(this, dataModel);
        var self = this;
        this.history = ko.observableArray();
        this.address = ko.observable();

        this.addressList = ko.observableArray(["muD8mUwh7S1emooskFC2LaFXbrxRx6paZG", "mtgt2sxRXDYdY4wYrYW7JV47JijKYhn9vH"]);
        this.addressBook = ko.pureComputed(function () {
            return ko.toJSON(self.addressList());
        }, this);
        this.sending = ko.observable(false);
        this.payTo = ko.observable();

        this.send = function () {
            $("#form-sending", "body")
                .validate({
                    invalidHandler: function (event, validator) {
                        var errors = validator.numberOfInvalids();
                        var $summary = $(".validation-summary-errors", "#form-sending");
                        if (errors) {
                            var list = $summary.html($("<ul/>"));
                            for (var key in validator.errorMap) {
                                if (validator.errorMap.hasOwnProperty(key)) {
                                        list.append($("<li/>", { text: key + ": " + validator.errorMap[key] }));
                                }
                            }
                            $summary.show();
                        } else {
                            $summary.hide();
                        }
                    }
                });
            if ($('#form-sending', 'body').valid() === false) return;
            self.sending(true);
            self.data.send(ko.mapping.toJS(self.payTo(), { 'ignore': ["amountView", "amountUSD", "amountUSDView"] }))
                .done(function () {
                self.payTo(null);
                $.growl.notice({ message: "Sent successfuly!" });
            }).always(function () {
                self.sending(false);
            });
        }

        this.cancel = function() {
            $(".validation-summary-errors", "#form-sending").hide();
            $(".buy-sell-orders > .bounceInDown:first")
                .removeClass("bounceInDown")
                .addClass("bounceOutUp");

            setTimeout(function() {
                self.payTo(null);
                $(".buy-sell-orders > .bounceOutUp:first")
                    .removeClass("bounceOutUp")
                    .addClass("bounceInDown");
            }, 1000);
            
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

                self.payTo(new PayTo(app.ticker().last));

                //$("#ex13").slider({
                //    //ticks: [0, 100, 200, 300, 400],
                //    //ticks_labels: ['$0', '$100', '$200', '$300', '$400'],
                //    //ticks_snap_bounds: 30
                //}).on("change", function(el){console.log(el)});

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
