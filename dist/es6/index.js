/// <reference path="../node_modules/@types/react/index.d.ts" />
export let dateTimeFormatOptions = {
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
dateTimeFormatOptions.default = dateTimeFormatOptions.long;
export let numberFormatOptions = {
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
numberFormatOptions.default = numberFormatOptions.decimal;
export const collationTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
export const defaultLanguage = "en";
const spaceRegex = /\s/g;
const nonWordRegex = /\W/g;
export const generator = {
    plain(message) {
        return message;
    },
    hyphens(message) {
        const hyphenated = message.toLowerCase().trim().replace(spaceRegex, "-").replace(nonWordRegex, '-');
        return hyphenated;
    }
};
// helper function to produce a pluralized string
export function Plural(pluralizeFor, options) {
    const { zero, one, other } = options;
    return "{" + pluralizeFor + ", plural,\n" +
        (zero ? "\t=0{" + zero + "}\n" : "") +
        (one ? "\tone{" + one + "}\n" : "") +
        ("\tother{" + other + "}}");
}
// Create cached versions of Intl.DateTimeFormat and Intl.NumberFormat
export function createCachedFormatter(intlFormat) {
    let cache = {};
    return function (locale, formatOptions) {
        const args = Array.prototype.slice.call(arguments);
        const id = locale + "-" + JSON.stringify(formatOptions);
        if (id in cache)
            return cache[id];
        const formatter = new (Function.prototype.bind.call(intlFormat, null, ...args));
        cache[id] = formatter;
        return formatter;
    };
}
export class I18n {
    constructor(options = null) {
        this.setup(Object.assign({}, I18n.defaultSetup, options));
        this.dateFormatter = createCachedFormatter(Intl.DateTimeFormat);
        this.numberFormatter = createCachedFormatter(Intl.NumberFormat);
    }
    format(type, value, formatStyle, locale = this.locale) {
        const options = (type === "date") ? dateTimeFormatOptions : numberFormatOptions;
        const formatter = (type === "date") ? this.dateFormatter : this.numberFormatter;
        return formatter.call(this, locale, (options[formatStyle] || options.default)).format(value);
    }
    mFuncForKey(key, locale = this.locale) {
        const d = this.messages[locale];
        if (!d || !d[key])
            return;
        if (typeof d[key] === "string")
            return this.compiler(d[key]);
        return d[key];
    }
    generateId(message) {
        return this.idGenerator(message);
    }
    lookup(id, replacements = null, defaultMFunc) {
        if (!defaultMFunc)
            defaultMFunc = () => id;
        let mFunc = this.mFuncForKey(id, this.locale) || this.mFuncForKey(id, defaultLanguage);
        if (!mFunc)
            mFunc = defaultMFunc;
        return mFunc(replacements);
    }
    setup(options = {}) {
        const { locale, idGenerator, messages, compiler } = options;
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
    }
}
I18n.defaultSetup = {
    messages: {},
    locale: defaultLanguage,
    idGenerator: generator.hyphens,
    compiler: (message) => () => message
};
let parser;
function parseXML(xmlString, replacements) {
    if (typeof parser === 'undefined') {
        parser = new DOMParser();
    }
    const xmlDoc = parser.parseFromString("<span>" + xmlString + "</span>", "text/xml");
    const firstNode = xmlDoc.firstChild.firstChild;
    if (firstNode.nodeName === "parseerror") {
        throw new Error("Could not parse XML string: " + firstNode.textContent);
    }
    const nodes = xmlDoc.firstChild.childNodes;
    let elements = [];
    let factory;
    let props;
    for (let i = 0; i < nodes.length; i++) {
        let { nodeName, nodeType, textContent } = nodes[i];
        if (nodeType === Node.ELEMENT_NODE) {
            let reactComponent = replacements[nodeName];
            if (Array.isArray(reactComponent)) {
                [factory, props] = reactComponent;
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
    let T = function translate(message, replacements, id) {
        if (!id)
            id = context.generateId(message);
        let defaultMFunc = context.mFuncForKey(id, defaultLanguage);
        if (!defaultMFunc)
            defaultMFunc = () => message;
        return context.lookup(id, replacements, defaultMFunc);
    };
    T._i18nInstance = context;
    T.setup = context.setup.bind(T._i18nInstance);
    T.lookup = context.lookup.bind(T._i18nInstance);
    T.date = context.format.bind(T._i18nInstance, "date");
    T.number = context.format.bind(T._i18nInstance, "number");
    T.$ = function translateReact(message, replacements, id) {
        const translatedMessage = T.apply(this, arguments);
        const reactElements = parseXML(translatedMessage, replacements);
        return reactElements;
    };
    return T;
}
export function i18nNamespace() {
    let i18nInstance = new I18n();
    return createT(i18nInstance);
}
// singleton
export const T = i18nNamespace();
// or roll your own
export const makeI18n = i18nNamespace;
