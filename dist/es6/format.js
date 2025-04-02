export const dateTimeFormats = {
    short: {
        month: "short",
        day: "numeric",
        year: "numeric",
    },
    long: {
        month: "long",
        day: "numeric",
        year: "numeric",
    },
    dateTime: {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
    },
};
export const numberFormats = {
    currency: {
        style: "currency",
        currency: "USD",
    },
    decimal: {
        style: "decimal",
    },
    percent: {
        style: "percent",
    },
};
export default function createCachedFormatter(intlFormat) {
    const cache = {};
    return function (locale, formatOptions) {
        const args = Array.prototype.slice.call(arguments);
        const id = locale + "-" + JSON.stringify(formatOptions);
        if (id in cache)
            return cache[id];
        const formatter = new (Function.prototype.bind.call(intlFormat, null, ...args))();
        cache[id] = formatter;
        return formatter;
    };
}
