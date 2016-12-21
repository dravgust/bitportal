var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (global) {
    var appDataModel = (function (_super) {
        __extends(appDataModel, _super);
        function appDataModel() {
            _super.apply(this, arguments);
            var self = this;

            // Data
            self.returnUrl = self.siteUrl;
            // Data access operations
            appDataModel.setAccessToken = function (accessToken) {
                sessionStorage.setItem("accessToken", accessToken);
            }
            appDataModel.getAccessToken = function () {
                return sessionStorage.getItem("accessToken");
            }
            appDataModel.prototype.balance = function () {
                return self.get(self.siteUrl + "api/wallet/balance");
            }
            appDataModel.prototype.history = function () {
                return self.get(self.siteUrl + "api/wallet/history");
            }
            appDataModel.prototype.address = function () {
                return self.get(self.siteUrl + "api/wallet/address");
            }
        }
        return appDataModel;
    })(global.Controller);
    global.AppDataModel = appDataModel;
})(window);
