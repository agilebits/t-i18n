"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateTimeFormats = {
    short: {
        month: "short",
        day: "numeric",
        year: "numeric"
    },
    long: {
        month: "long",
        day: "numeric",
        year: "numeric"
    },
    dateTime: {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric"
    }
};
exports.numberFormats = {
    currency: {
        style: "currency",
        currency: "USD"
    },
    decimal: {
        style: "decimal"
    },
    percent: {
        style: "percent"
    }
};
function createCachedFormatter(intlFormat) {
    var cache = {};
    return function (locale, formatOptions) {
        var args = Array.prototype.slice.call(arguments);
        var id = locale + "-" + JSON.stringify(formatOptions);
        if (id in cache)
            return cache[id];
        var formatter = new ((_a = Function.prototype.bind).call.apply(_a, [intlFormat, null].concat(args)));
        cache[id] = formatter;
        return formatter;
        var _a;
    };
}
exports.default = createCachedFormatter;
