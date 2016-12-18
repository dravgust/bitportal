var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (ko, $, exports) {
    ko.BaseViewModel = function (dataModel) {
        "use strict";
        var self = this;
        this.data = dataModel;
        this.loading = ko.observable(false);
  
    }
    ko.BaseViewModel.prototype.refresh = function () { }
})(ko, jQuery, app || (app = {}));