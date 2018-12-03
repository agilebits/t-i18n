"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var format_1 = require("./format");
var helpers_1 = require("./helpers");
var icu_1 = require("./icu");
var xml_1 = require("./xml");
var defaultLanguage = "en";
var getKey = function (allMessages, locale, key) {
    var messages = allMessages[locale];
    var defaultMessages = allMessages[defaultLanguage];
    if (messages && messages[key]) {
        return messages[key];
    }
    if (defaultMessages && defaultMessages[key]) {
        return defaultMessages[key];
    }
    return "";
};
var makeIntlFormatters = function (locale) {
    if (typeof Intl === "undefined") {
        var error = function () {
            throw new Error("Missing Intl");
        };
        return { date: error, number: error };
    }
    var getDateTimeFormat = function () {
        var delegate = Intl.DateTimeFormat;
        function DateTimeFormat() {
            var args = Array.prototype.slice.apply(arguments);
            args[0] = args[0] || "en-US";
            args[1] = args[1] || {};
            args[1].timeZone = args[1].timeZone || "America/Toronto";
            return delegate.apply(this, args);
        }
        DateTimeFormat.prototype = delegate.prototype;
        return DateTimeFormat;
    };
    try {
        Intl.DateTimeFormat();
        (new Date()).toLocaleString();
        (new Date()).toLocaleDateString();
        (new Date()).toLocaleTimeString();
    }
    catch (err) {
        Date.prototype.toLocaleString = Date.prototype.toString;
        Date.prototype.toLocaleDateString = Date.prototype.toDateString;
        Date.prototype.toLocaleTimeString = Date.prototype.toTimeString;
        Intl.DateTimeFormat = getDateTimeFormat();
    }
    var dateFormatter = format_1.default(Intl.DateTimeFormat);
    var numberFormatter = format_1.default(Intl.NumberFormat);
    var date = function (value, style, dateLocale) {
        if (style === void 0) { style = "long"; }
        if (dateLocale === void 0) { dateLocale = locale(); }
        var format = format_1.dateTimeFormats[style] || format_1.dateTimeFormats.long;
        return dateFormatter(dateLocale, format).format(value);
    };
    var number = function (value, style, numberLocale) {
        if (style === void 0) { style = "decimal"; }
        if (numberLocale === void 0) { numberLocale = locale(); }
        var format = format_1.numberFormats[style] || format_1.numberFormats.decimal;
        return numberFormatter(numberLocale, format).format(value);
    };
    return { date: date, number: number };
};
exports.makeBasicT = function () {
    var messages = {};
    var locale = defaultLanguage;
    var idGenerator = helpers_1.generator.hyphens;
    var set = function (options) {
        if (options === void 0) { options = {}; }
        messages = options.messages || messages;
        locale = options.locale || locale;
        idGenerator = options.idGenerator || idGenerator;
        return { messages: messages, locale: locale, idGenerator: idGenerator };
    };
    var generateId = function (message) { return idGenerator(message); };
    var lookup = function (id, replacements, defaultMessage) {
        if (replacements === void 0) { replacements = {}; }
        if (defaultMessage === void 0) { defaultMessage = ""; }
        var translation = getKey(messages, locale, id) || defaultMessage || id;
        if (typeof translation === "string") {
            return icu_1.default(translation, replacements);
        }
        return translation(replacements);
    };
    var T = function (message, replacements, id) {
        if (replacements === void 0) { replacements = {}; }
        if (id === void 0) { id = ""; }
        return lookup(id || generateId(message), replacements, message);
    };
    var $ = function (message, replacements, id) {
        if (replacements === void 0) { replacements = {}; }
        if (id === void 0) { id = ""; }
        var _a = helpers_1.splitAndEscapeReplacements(replacements), icu = _a[0], xml = _a[1];
        var translatedMessage = T(message, icu, id);
        return xml_1.default(translatedMessage, xml);
    };
    var properties = {
        $: $,
        generateId: generateId,
        locale: function () { return locale; },
        lookup: lookup,
        set: set,
    };
    return helpers_1.assign(T, properties);
};
exports.makeT = function () {
    var T = exports.makeBasicT();
    var formatters = makeIntlFormatters(T.locale);
    return helpers_1.assign(T, formatters);
};
exports.default = exports.makeT();
