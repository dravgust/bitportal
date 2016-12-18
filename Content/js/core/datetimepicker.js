(function (exports) {
    var DateTimePicker = (function () {
        function DateTimePicker(domElement, context, changeEventCall, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            this.domElement = domElement;
            this.changeEventCall = changeEventCall;
            var opt = $.extend(true, {
                format: "MM/DD/YYYY",
                startDate: moment().subtract(1, "days"),
                endDate: moment(),
                minDate: "01/01/2015",
                maxDate: "12/31/2015",
                dateLimit: { days: 60 },
                showDropdowns: true,
                showWeekNumbers: true,
                timePicker: false,
                timePickerIncrement: 1,
                timePicker12Hour: true,
                ranges: {},
                opens: "left",
                drops: "down",
                buttonClasses: ["btn", "btn-sm"],
                applyClass: "btn-primary",
                cancelClass: "btn-default",
                separator: " to ",
                locale: {
                    applyLabel: "Submit",
                    cancelLabel: "Cancel",
                    fromLabel: "From",
                    toLabel: "To",
                    customRangeLabel: "Custom",
                    daysOfWeek: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
                    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    firstDay: 0
                }
            }, options);
            $(domElement).daterangepicker(opt, function (start, end, label) {
                _this.changeEventCall.call(context, start, end);
            });
        }
        Object.defineProperty(DateTimePicker.prototype, "startDate", {
            get: function () {
                return this.domElement.data("daterangepicker").startDate;
            },
            set: function (value) {
                this.domElement.data("daterangepicker").setStartDate(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DateTimePicker.prototype, "endDate", {
            get: function () {
                return this.domElement.data("daterangepicker").endDate;
            },
            set: function (value) {
                this.domElement.data("daterangepicker").setEndDate(value);
            },
            enumerable: true,
            configurable: true
        });
        return DateTimePicker;
    })();
    exports.DateTimePicker = DateTimePicker;
})(window);