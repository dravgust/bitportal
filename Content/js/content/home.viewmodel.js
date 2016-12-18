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
        this.history = ko.observableArray();

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

                self.data.balance()
                    .done(function (data) { self.balance(data); });

                self.data.history()
                    .done(function (data) { self.history(data); });

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
