
ko.components.register("loading-modal", {
    viewModel: function(params) {
        this.isLoading = params.value;
        this.message = params.text || "Loading...";
    },
    template:
    '<div data-bind="visible:isLoading, text:message" style="' +
        'background: none repeat scroll 0 0 #fff;' +
        'border-radius: 5px;' +
        'box-shadow: 1px 1px 2px #393939;' +
        'display: block;' +
        'font-size: 24px;' +
        'left: 45%;' +
        'padding: 35px 3%;' +
        'position: absolute;' +
        'top: 30%;' +
        'z-index: 9999;' +
        '"></div>',
    synchronous: true
});