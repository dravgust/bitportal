(function () {
    var linq = {
        First: function (predicate) {
            return ko.computed(function () {
                return ko.utils.arrayFirst(this(), predicate);
            }, this, { deferEvaluation: true });
        },
        FirstOrDefault: function (predicate, defaultValue) {
            if (!defaultValue)
                return this.First(predicate);
            return ko.computed(function () {
                var result = ko.utils.arrayFirst(this(), predicate);
                return result ? result : defaultValue;
            }, this, { deferEvaluation: true });
        },
        Select: function (func) {
            return ko.computed(function () {
                var result = [];
                ko.utils.arrayMap(this(), function (item) {
                    result = ko.utils.unwrapObservable(func(item));
                });
                return result;
            }, this, { deferEvaluation: true });
        },
        SelectMany: function (func) {
            return ko.computed(function () {
                var result = [];
                ko.utils.arrayForEach(this(), function (item) {
                    result = result.concat(ko.utils.unwrapObservable(func(item)));
                });
                return result;
            }, this, { deferEvaluation: true });
        },
        Where: function (predicate) {
            return ko.computed(function () {
                return ko.utils.arrayFilter(this(), predicate);
            }, this, { deferEvaluation: true });
        },
        Distinct: function (func) {
            if (!func)
                return this.DistinctValue();
            return ko.computed(function () {
                var obj = {};
                return ko.utils.arrayFilter(this(), function (item) {
                    var val = ko.utils.unwrapObservable(func(item));
                    return obj[val] ? false : (obj[val] = true);
                });
            }, this, { deferEvaluation: true });
        },
        DistinctValue: function () {
            return ko.computed(function () {
                var obj = {};
                return ko.utils.arrayFilter(this(), function (val) {
                    return obj[val] ? false : (obj[val] = true);
                });
            }, this, { deferEvaluation: true });
        },
        Sum: function (func) {
            return func ? this.Select(func).Sum() : this.SumValue();
        },
        SumValue: function () {
            return ko.computed(function () {
                var result = 0;
                ko.utils.arrayForEach(this(), function (item) {
                    result = result + (+item);
                });
                return result;
            }, this, { deferEvaluation: true });
        },
        StringJoin: function (joinString) {
            joinString = joinString || ", ";
            return ko.computed(function () {
                return this().join(joinString);
            }, this, { deferEvaluation: true });
        },
        Map: function (converter) {
            var oldValues = [];
            var oldResults = [];
            return ko.computed(function () {
                var values = this().slice();
                var results = [];
                ko.utils.arrayForEach(values, function (item) {
                    var index = oldValues.indexOf(item);
                    results.push(index > -1 ? oldResults[index] : converter(item));
                });
                oldValues = values;
                oldResults = results;
                return results;
            }, this, { deferEvaluation: true });
        }
    };
    for (var i in linq) {
        ko.observableArray.fn[i] = linq[i];
        ko.computed.fn[i] = linq[i];
    }
    ko.observableArray.fn.refresh = function () {
        var data = this().slice();
        this([]);
        this(data);
    };
    ko.observableArray.fn.subscribeArrayChanged = function (addCallback, deleteCallback) {
        var previousValue = undefined;
        this.subscribe(function (prevValue) {
            previousValue = prevValue.slice(0);
        }, undefined, "beforeChange");
        this.subscribe(function (latestValue) {
            var editScript = ko.utils.compareArrays(previousValue, latestValue);
            for (var i = 0, j = editScript.length; i < j; i++) {
                switch (editScript[i].status) {
                    case "retained":
                        break;
                    case "deleted":
                        if (deleteCallback)
                            deleteCallback(editScript[i].value);
                        break;
                    case "added":
                        if (addCallback)
                            addCallback(editScript[i].value);
                        break;
                }
            }
            previousValue = undefined;
        });
    };
    ko.bindingHandlers.bsChecked = {
        init: function (element, valueAccessor, allBindingsAccessor,
        viewModel, bindingContext) {
            var value = valueAccessor();
            var newValueAccessor = function () {
                return {
                    change: function () {
                        value(element.value);
                    }
                }
            };
            ko.bindingHandlers.event.init(element, newValueAccessor,
            allBindingsAccessor, viewModel, bindingContext);
        },
        update: function (element, valueAccessor, allBindingsAccessor,
        viewModel, bindingContext) {
            if ($(element).val() == ko.unwrap(valueAccessor())) {
                setTimeout(function () {
                    $(element).closest('.btn').button('toggle');
                }, 1);
            }
        }
    }
    //ko.extenders.defaultIfNull = function (target, defaultValue) {
    //    var result = ko.pureComputed({
    //        read: function () {
    //            var _target = target();
    //            for (var key in _target) {
    //                if (_target.hasOwnProperty(key)
    //                    && ko.isObservable(_target[key])
    //                    && _target[key]() === null) {
    //                            _target[key](defaultValue);
    //                    }
    //                }
    //            return _target;
    //        },
    //        write: function (newValue) {
    //                target(newValue);
    //        }
    //    });
    //    result(target());
    //    return result;
    //};
    ko.bindingHandlers.bootstrapSwitchOn = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            $elem = $(element);
            $(element).bootstrapSwitch();
            $(element).bootstrapSwitch('setState', ko.utils.unwrapObservable(valueAccessor())); // Set intial state
            $elem.on('switch-change', function (e, data) {
                valueAccessor()(data.value);
            }); // Update the model when changed.
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var vStatus = $(element).bootstrapSwitch('state');
            var vmStatus = ko.utils.unwrapObservable(valueAccessor());
            if (vStatus != vmStatus) {
                $(element).bootstrapSwitch('setState', vmStatus);
            }
        }
    };
    ko.bindingHandlers.allocTextInput = {
        init: function (element, valueAccessor, allBindings, data, context) {
            ko.bindingHandlers.textInput.init(element, valueAccessor, allBindings, data, context);
            $(element).inputmask({ mask: "~99.9999", definitions: { '~': '[-]?'} });
        }
    }
    ko.bindingHandlers.phoneTextInput = {
        init: function (element, valueAccessor, allBindings, data, context) {
            ko.bindingHandlers.textInput.init(element, valueAccessor, allBindings, data, context);
            //$(element).inputmask({mask: '(999) 999-9999'});
        }
    }
    ko.bindingHandlers.urlTextInput = {
        init: function (element, valueAccessor, allBindings, data, context) {
            ko.bindingHandlers.textInput.init(element, valueAccessor, allBindings, data, context);
            //$(element).inputmask({mask: '(999) 999-9999'});
        }
    }
    ko.bindingHandlers.nestable = {
        init: function (element, valueAccessor, allBindings, data, context) {
            ko.bindingHandlers.textInput.init(element, valueAccessor, allBindings, data, context);
            var options = valueAccessor() || {};
            options.onchange = options.onchange || function () { };
            $(element).nestable({
                maxDepth: 1,
                group: 1
            }).on('change', function(e) {
                var list = e.length ? e : $(e.target);
                options.onchange(list.nestable('serialize'));
            });
        }
    }
    ko.bindingHandlers.htmlWithBinding = {
        'init': function () {
            return { 'controlsDescendantBindings': true };
        },
        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            element.innerHTML = valueAccessor()();
            ko.applyBindingsToDescendants(bindingContext, element);
        }
    };
    ko.bindingHandlers.qrcode = {
        'init': function (element, valueAccessor, allBindingsAccesor, viewModel, bindingContext) {
            
        },
        'update': function (element, valueAccessor, allBindingsAccesor, viewModel, bindingContext) {
            var address = ko.utils.unwrapObservable(valueAccessor());
            var qrcode = kjua(
                {
                    // render method: 'canvas' or 'image'
                    render: 'canvas',
                    // render pixel-perfect lines
                    crisp: true,
                    // minimum version: 1..40
                    minVersion: 1,
                    // error correction level: 'L', 'M', 'Q' or 'H'
                    ecLevel: 'H',
                    // size in pixel
                    size: 200,
                    // pixel-ratio, null for devicePixelRatio
                    ratio: null,
                    // code color
                    fill: '#333',
                    // background color
                    back: '#fff',
                    // content
                    text: address,
                    // roundend corners in pc: 0..100
                    rounded: 100,
                    // quiet zone in modules
                    quiet: 0,
                    // modes: 'plain', 'label' or 'image'
                    mode: 'label',
                    // label/image size and pos in pc: 0..100
                    mSize: 50,
                    mPosX: 50,
                    mPosY: 55,
                    // label
                    label: String.fromCharCode("0x0243"),
                    fontname: 'Ubuntu',
                    fontcolor: '#FF9818',
                    // image element
                    image: null
                });
            $(element).html(qrcode);
        }
    };
})();

(function () {
    String.format = function (theString) {
        var ars = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            ars[_i - 1] = arguments[_i];
        }
        for (var i = 0; i < ars.length; i++) {
            var regEx = new RegExp("\\{" + (i) + "\\}", "gm");
            theString = theString.replace(regEx, ars[i]);
        }
        return theString;
    };
    String.prototype.escape = function () {
        var tagsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        };
        return this.replace(/[&<>]/g, function (tag) {
            return tagsToReplace[tag] || tag;
        });
    };
    Array.removeWhere = function (whereObject) {
        for (var el in whereObject) {
            if (whereObject.hasOwnProperty(el)) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][el] && this[i][el] === whereObject[el]) {
                        this.splice(i, 1);
                    }
                }
            }
        }
    };
    Array.setWhere = function (whereObject, value) {
        for (var el in whereObject) {
            if (whereObject.hasOwnProperty(el)) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][el] && this[i][el] === whereObject[el])
                        this[i] = value;
                }
            }
        }
    };
    Array.prototype.findWhere = function (whereObject) {
        for (var el in whereObject) {
            if (whereObject.hasOwnProperty(el)) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][el] && this[i][el] === whereObject[el])
                        return this[i];
                }
            }
        }
        return null;
    };
})();
(function ($, window) {
    $.fn.contextMenu = function (settings) {
        return this.each(function () {

            // Open context menu
            $(this).on("contextmenu", function (e) {
                // return native menu if pressing control
                if (e.ctrlKey) return;
                if (settings.menuOpen) {
                    settings.menuOpen.call(this, $(e.target));
                }
                //open menu
                var $menu = $(settings.menuSelector)
                    .data("invokedOn", $(e.target))
                    .show()
                    .css({
                        position: "absolute",
                        left: getMenuPosition(e.clientX, 'width', 'scrollLeft'),
                        top: getMenuPosition(e.clientY - 40, 'height', 'scrollTop')
                    })
                    .off('click')
                    .on('click', 'a', function (e) {
                        $menu.hide();

                        var $invokedOn = $menu.data("invokedOn");
                        var $selectedMenu = $(e.target);

                        settings.menuSelected.call(this, $invokedOn, $selectedMenu);
                        return false;
                    });

                return false;
            });

            //make sure menu closes on any click
            $(document).click(function (e) {
                $(settings.menuSelector).hide();
            });
        });

        function getMenuPosition(mouse, direction, scrollDir) {
            var win = $(window)[direction](),
                scroll = $(window)[scrollDir](),
                menu = $(settings.menuSelector)[direction](),
                position = mouse + scroll;

            // opening menu would pass the side of the page
            if (mouse + menu > win && menu < mouse)
                position -= menu;

            return position;
        }

    };
})(jQuery, window);
(function() {
    jQuery.validator.addMethod("phoneUS", function (phone_number, element) {
        phone_number = phone_number.replace(/\s+/g, "");
        return this.optional(element) || phone_number.length > 9 &&
            phone_number.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
    }, "Please specify a valid phone number");
});
