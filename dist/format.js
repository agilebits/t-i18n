"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberFormats = exports.dateTimeFormats = void 0;
exports.default = createCachedFormatter;
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
        var formatter = new ((_a = Function.prototype.bind).call.apply(_a, __spreadArray([intlFormat, null], args, false)));
        cache[id] = formatter;
        return formatter;
    };
}
