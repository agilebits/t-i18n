"use strict";
/// <reference path="../node_modules/@types/react/index.d.ts" />
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateTimeFormatOptions = {
    short: {
        month: 'short',
        day: 'numeric',
        year: "numeric"
    },
    long: {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    },
    dateTime: {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }
};
exports.dateTimeFormatOptions.default = exports.dateTimeFormatOptions.long;
exports.numberFormatOptions = {
    currency: {
        style: 'currency',
        currency: "USD"
    },
    decimal: {
        style: 'decimal'
    },
    percent: {
        style: 'percent'
    }
};
exports.numberFormatOptions.default = exports.numberFormatOptions.decimal;
exports.collationTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
exports.defaultLanguage = "en";
var spaceRegex = /\s/g;
var nonWordRegex = /\W/g;
exports.generator = {
    plain: function (message) {
        return message;
    },
    hyphens: function (message) {
        var hyphenated = message.toLowerCase().trim().replace(spaceRegex, "-").replace(nonWordRegex, '-');
        return hyphenated;
    }
};
// helper function to produce a pluralized string
function Plural(pluralizeFor, options) {
    var zero = options.zero, one = options.one, other = options.other;
    return "{" + pluralizeFor + ", plural,\n" +
        (zero ? "\t=0{" + zero + "}\n" : "") +
        (one ? "\tone{" + one + "}\n" : "") +
        ("\tother{" + other + "}}");
}
exports.Plural = Plural;
// Create cached versions of Intl.DateTimeFormat and Intl.NumberFormat
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
exports.createCachedFormatter = createCachedFormatter;
var I18n = (function () {
    function I18n(options) {
        if (options === void 0) { options = null; }
        this.setup(__assign({}, I18n.defaultSetup, options));
        this.dateFormatter = createCachedFormatter(Intl.DateTimeFormat);
        this.numberFormatter = createCachedFormatter(Intl.NumberFormat);
    }
    I18n.prototype.format = function (type, value, formatStyle, locale) {
        if (locale === void 0) { locale = this.locale; }
        var options = (type === "date") ? exports.dateTimeFormatOptions : exports.numberFormatOptions;
        var formatter = (type === "date") ? this.dateFormatter : this.numberFormatter;
        return formatter.call(this, locale, (options[formatStyle] || options.default)).format(value);
    };
    I18n.prototype.mFuncForKey = function (key, locale) {
        if (locale === void 0) { locale = this.locale; }
        var d = this.messages[locale];
        if (!d || !d[key])
            return;
        if (typeof d[key] === "string")
            return this.compiler(d[key]);
        return d[key];
    };
    I18n.prototype.generateId = function (message) {
        return this.idGenerator(message);
    };
    I18n.prototype.lookup = function (id, replacements, defaultMFunc) {
        if (replacements === void 0) { replacements = null; }
        if (!defaultMFunc)
            defaultMFunc = function () { return id; };
        var mFunc = this.mFuncForKey(id, this.locale) || this.mFuncForKey(id, exports.defaultLanguage);
        if (!mFunc)
            mFunc = defaultMFunc;
        return mFunc(replacements);
    };
    I18n.prototype.setup = function (options) {
        if (options === void 0) { options = {}; }
        var locale = options.locale, idGenerator = options.idGenerator, messages = options.messages, compiler = options.compiler;
        if (idGenerator)
            this.idGenerator = idGenerator;
        if (locale)
            this.locale = locale;
        if (messages)
            this.messages = messages;
        if (compiler)
            this.compiler = compiler;
        return {
            messages: this.messages,
            locale: this.locale,
            idGenerator: this.idGenerator,
            compiler: this.compiler
        };
    };
    I18n.defaultSetup = {
        messages: {},
        locale: exports.defaultLanguage,
        idGenerator: exports.generator.hyphens,
        compiler: function (message) { return function () { return message; }; }
    };
    return I18n;
}());
exports.I18n = I18n;
var parser;
function parseXML(xmlString, replacements) {
    if (typeof parser === 'undefined') {
        parser = new DOMParser();
    }
    var xmlDoc = parser.parseFromString("<span>" + xmlString + "</span>", "text/xml");
    var firstNode = xmlDoc.firstChild.firstChild;
    if (firstNode.nodeName === "parseerror") {
        throw new Error("Could not parse XML string: " + firstNode.textContent);
    }
    var nodes = xmlDoc.firstChild.childNodes;
    var elements = [];
    var factory;
    var props;
    for (var i = 0; i < nodes.length; i++) {
        var _a = nodes[i], nodeName = _a.nodeName, nodeType = _a.nodeType, textContent = _a.textContent;
        if (nodeType === Node.ELEMENT_NODE) {
            var reactComponent = replacements[nodeName];
            if (Array.isArray(reactComponent)) {
                factory = reactComponent[0], props = reactComponent[1];
                elements.push(factory(props, textContent));
            }
            else {
                elements.push(reactComponent);
            }
        }
        else {
            elements.push(textContent);
        }
    }
    return elements;
}
function createT(context) {
    var T = function translate(message, replacements, id) {
        if (!id)
            id = context.generateId(message);
        var defaultMFunc = context.mFuncForKey(id, exports.defaultLanguage);
        if (!defaultMFunc)
            defaultMFunc = function () { return message; };
        return context.lookup(id, replacements, defaultMFunc);
    };
    T._i18nInstance = context;
    T.setup = context.setup.bind(T._i18nInstance);
    T.lookup = context.lookup.bind(T._i18nInstance);
    T.date = context.format.bind(T._i18nInstance, "date");
    T.number = context.format.bind(T._i18nInstance, "number");
    T.$ = function translateReact(message, replacements, id) {
        var translatedMessage = T.apply(this, arguments);
        var reactElements = parseXML(translatedMessage, replacements);
        return reactElements;
    };
    return T;
}
function i18nNamespace() {
    var i18nInstance = new I18n();
    return createT(i18nInstance);
}
exports.i18nNamespace = i18nNamespace;
// singleton
exports.T = i18nNamespace();
// or roll your own
exports.makeI18n = i18nNamespace;
