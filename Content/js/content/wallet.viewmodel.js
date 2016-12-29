var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (ko, exports) {
    __extends(walletViewModel, ko.BaseViewModel);
    function walletViewModel(app, dataModel) {
        ko.BaseViewModel.call(this, dataModel);
        var self = this;

        this.state = ko.observable();
        this.state.subscribe(function(value) {
            self.refresh();
        });

        this.progress = ko.observable();

        this.balance = ko.observable();
        this.history = ko.observableArray();

        this.address = ko.observable();

        this.addressList = ko.observableArray();
        this.addressBook = ko.pureComputed(function() {
            return ko.toJSON(self.addressList());
        }, this);
        this.sending = ko.observable(false);
        this.payTo = ko.observable({
            address: "",
            amount: 0
        });

        this.send = function () {
            if ($('#form-sending', 'body').valid() === false) return;
            self.sending(true);
            self.data.send(self.payTo()).done(function() {
                app.navigateToHome();
            }).always(function() {
                self.sending(false);
            });
        }

        this.refresh = function() {

            self.data.balance()
                    .done(function (data) {
                        self.balance(data);
                    });


            app.sessionHub.client.balance = function (data) {
                self.balance(data);
            };
        }
  
        Sammy(function () {
            this.get('#wallet', function () {

                app.sessionHub.client.state = function(state) {
                    self.state(state);
                };
                app.sessionHub.client.progress = function (progress) {
                    self.progress(progress);
                };

                self.data.status()
                    .done(function (data) {

                        self.state(data.state);
                        self.progress(data.progress);

                        self.data.address()
                            .done(function (data) {
                                self.addressList.push(data.address);
                                self.address(data.address);
                            });



                    });

                app.view(self);
            });
            this.get("#pay", function() {
                app.view(app.Views.Loading);
                this.app.runRoute("get", "#wallet");
            });
               
        });

        return self;
    }

    exports.addViewModel({
        name: "Wallet",
        bindingMemberName: "wallet",
        factory: walletViewModel
    });

}(ko, app || (app = {})));
