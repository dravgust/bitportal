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

        }

        appDataModel.prototype.setAccessToken = function (accessToken) {
            sessionStorage.setItem("accessToken", accessToken);
        }
        appDataModel.prototype.getAccessToken = function () {
            return sessionStorage.getItem("accessToken");
        }

        appDataModel.prototype.status = function () {
            return this.get(this.siteUrl + "api/wallet/status", null, this.getAccessToken());
        }
        appDataModel.prototype.balance = function () {
            return this.get(this.siteUrl + "api/wallet/balance");
        }
        appDataModel.prototype.history = function () {
            return this.get(this.siteUrl + "api/wallet/history");
        }
        appDataModel.prototype.address = function () {
            return this.get(this.siteUrl + "api/wallet/address");
        }

        appDataModel.prototype.send = function (payTo) {
            return this.post(this.siteUrl + "api/wallet/send", JSON.stringify(payTo), "text");
        }
        return appDataModel;
    })(global.Controller);
    global.AppDataModel = appDataModel;
})(window);
