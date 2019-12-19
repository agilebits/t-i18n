"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
        var _a;
        var args = Array.prototype.slice.call(arguments);
        var id = locale + "-" + JSON.stringify(formatOptions);
        if (id in cache)
            return cache[id];
        var formatter = new ((_a = Function.prototype.bind).call.apply(_a, __spreadArrays([intlFormat, null], args)));
        cache[id] = formatter;
        return formatter;
    };
}
exports.default = createCachedFormatter;
