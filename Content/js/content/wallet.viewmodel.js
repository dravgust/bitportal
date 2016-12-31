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

            self.data.address()
                .done(function (data) {
                    self.addressList.push(data.address);
                    self.address(data.address);
                });
        }
  
        Sammy(function () {
            this.get('#wallet', function () {

                self.refresh();

                app.view(self);
            });
            this.get("#pay2", function() {
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
