function AppViewModel(dataModel) {
    // Private state
    var self = this;

    // Private operations
    function cleanUpLocation() {
        window.location.hash = "";

        if (typeof (history.pushState) !== "undefined") {
            history.pushState("", document.title, location.pathname);
        }
    }

    // Data
    self.Views = {
        Loading: {} // Other views are added dynamically by app.addViewModel(...).
    };
    self.dataModel = dataModel;
    self.sessionHub = null;
    // UI state
    self.view = ko.observable(self.Views.Loading);
    self.ajaxRequest = ko.observable(false);
    self.loading = ko.computed(function () {
        return self.view() === self.Views.Loading;
    });
    self.balance = ko.observable();
    this.state = ko.observable();
    this.state.subscribe(function (value) {
        
    });
    this.progress = ko.observable();

    this.ticker = ko.observable();
    
    $.ajaxSetup({
        beforeSend: function() {
            self.ajaxRequest(true); //IE8 SignalR use Ajax
        },
        complete: function(xhr, textStatus) {
            self.ajaxRequest(false);
        }
    });
    // UI operations

    // Other navigateToX functions are added dynamically by app.addViewModel(...).

    // Other operations
    self.addViewModel = function (options) {
        var viewItem = new options.factory(self, dataModel),
            navigator;

        // Add view to AppViewModel.Views enum (for example, app.Views.Home).
        self.Views[options.name] = viewItem;

        // Add binding member to AppViewModel (for example, app.home);
        self[options.bindingMemberName] = ko.computed(function () {
           /* if (!dataModel.getAccessToken()) {
                // The following code looks for a fragment in the URL to get the access token which will be
                // used to call the protected Web API resource
                var fragment = common.getFragment();

                if (fragment.access_token) {
                    // returning with access token, restore old hash, or at least hide token
                    window.location.hash = fragment.state || '';
                    dataModel.setAccessToken(fragment.access_token);
                } else {
                    // no token - so bounce to Authorize endpoint in AccountController to sign in or register
                    window.location = "/Account/Authorize?client_id=web&response_type=token&state=" + encodeURIComponent(window.location.hash);
                }
            }*/

            //if (self.view() !== self.Views[options.name])
            //    return "";

            return self.Views[options.name];
        });

        if (typeof (options.navigatorFactory) !== "undefined") {
            navigator = options.navigatorFactory(self, dataModel);
        } else {
            navigator = function () {
                window.location.hash = options.bindingMemberName;
            };
        }

        // Add navigation member to AppViewModel (for example, app.NavigateToHome());
        self["navigateTo" + options.name] = navigator;
    };

    self.initialize = function () {

        self.dataModel.getStatus()
            .done(function (data) {

                self.state(data.state);
                self.progress(data.progress);

                self.dataModel.getBalance()
                    .done(function (data) {
                        self.balance(data);
                    })["fail"](function (err) {
                        console.log(err);
                    });

            })["fail"](function (err) {
                console.log(err);
            });

        self.dataModel.getTicker()
            .done(function(data) {
                //{"timestamp":"1483274470","low":"954.7","high":"976","last":"971.239","volume":"245.11673584","volume30d":"13479.45378257","bid":971.329,"ask":971.4629}
                self.ticker(data);
            });

        //WebSockets
        self.sessionHub = (function () {
            var sessionHub = new self.SessionHub();
            sessionHub.client.state = function (state) {
                self.state(state);
            };
            sessionHub.client.progress = function (progress) {
                self.progress(progress);
            };
            sessionHub.client.balance = function (data) {
                self.balance(data);
            };
            return sessionHub;
        } ());
       
        Sammy().run();
    }
}

var app = new AppViewModel(new AppDataModel());
