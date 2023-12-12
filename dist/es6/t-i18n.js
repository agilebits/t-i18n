import createCachedFormatter, { numberFormats, dateTimeFormats } from "./format";
import { generator, assign, splitAndEscapeReplacements } from "./helpers";
import parseIcu from "./icu";
import parseXml from "./xml";
const defaultLanguage = "en";
const getKey = (allMessages, locale, key) => {
    const messages = allMessages[locale];
    const defaultMessages = allMessages[defaultLanguage];
    if (messages && messages[key]) {
        return messages[key];
    }
    if (defaultMessages && defaultMessages[key]) {
        return defaultMessages[key];
    }
    return "";
};
const makeIntlFormatters = (locale) => {
    if (typeof Intl === "undefined") {
        const error = () => {
            throw new Error("Missing Intl");
        };
        return { date: error, number: error };
    }
    const getDateTimeFormat = () => {
        const delegate = Intl.DateTimeFormat;
        function DateTimeFormat() {
            var _a;
            const args = Array.prototype.slice.apply(arguments);
            const lang = typeof (args === null || args === void 0 ? void 0 : args[0]) === "string" ? args[0] : "en-US";
            const timeZone = typeof ((_a = args === null || args === void 0 ? void 0 : args[1]) === null || _a === void 0 ? void 0 : _a.timeZone) === "string" ? args[1].timeZone : "America/Toronto";
            return delegate.apply(this, [lang, timeZone]);
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
    const dateFormatter = createCachedFormatter(Intl.DateTimeFormat);
    const numberFormatter = createCachedFormatter(Intl.NumberFormat);
    const date = (value, style = "long", dateLocale = locale()) => {
        const format = dateTimeFormats[style] || dateTimeFormats.long;
        return dateFormatter(dateLocale, format).format(value);
    };
    const number = (value, style = "decimal", numberLocale = locale()) => {
        const format = numberFormats[style] || numberFormats.decimal;
        return numberFormatter(numberLocale, format).format(value);
    };
    return { date, number };
};
export const makeBasicT = () => {
    let messages = {};
    let locale = defaultLanguage;
    let idGenerator = generator.hyphens;
    const set = (options = {}) => {
        messages = options.messages || messages;
        locale = options.locale || locale;
        idGenerator = options.idGenerator || idGenerator;
        return { messages, locale, idGenerator };
    };
    const generateId = (message) => idGenerator(message);
    const lookup = (id, replacements = {}, defaultMessage = "") => {
        const translation = getKey(messages, locale, id) || defaultMessage || id;
        if (typeof translation === "string") {
            return parseIcu(translation, replacements);
        }
        return translation(replacements);
    };
    const T = (message, replacements = {}, id = "") => {
        return lookup(id || generateId(message), replacements, message);
    };
    const $ = (message, replacements = {}, id = "") => {
        const [icu, xml] = splitAndEscapeReplacements(replacements);
        const translatedMessage = T(message, icu, id);
        return parseXml(translatedMessage, xml);
    };
    const properties = {
        $,
        generateId,
        locale: () => locale,
        lookup,
        set,
    };
    return assign(T, properties);
};
export const makeT = () => {
    const T = makeBasicT();
    const formatters = makeIntlFormatters(T.locale);
    return assign(T, formatters);
};
export default makeT();
