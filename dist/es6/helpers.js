const spaceRegex = /\s/g;
const nonWordRegex = /\W/g;
export const generator = {
    plain(message) {
        return message;
    },
    hyphens(message) {
        const hyphenated = message
            .trim()
            .replace(spaceRegex, "-")
            .replace(nonWordRegex, "-");
        return hyphenated;
    },
};
export function Plural(pluralizeFor, options) {
    const { zero, one, other } = options;
    return ("{" +
        pluralizeFor +
        ", plural,\n" +
        (zero ? "\t=0{" + zero + "}\n" : "") +
        (one ? "\tone{" + one + "}\n" : "") +
        ("\tother{" + other + "}}"));
}
const xmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};
const escapeXml = (str) => str.replace(/[&<>"']/g, (match) => xmlEscapes[match]);
export const splitAndEscapeReplacements = (replacements) => {
    const icu = {};
    const xml = {};
    for (const key in replacements) {
        if (replacements.hasOwnProperty(key)) {
            const value = replacements[key];
            if (typeof value === "function") {
                xml[key] = value;
            }
            else if (typeof value === "string") {
                icu[key] = escapeXml(value);
            }
            else {
                icu[key] = value;
            }
        }
    }
    return [icu, xml];
};
export const assign = (target, source) => {
    const to = Object(target);
    for (const nextKey in source) {
        if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
            to[nextKey] = source[nextKey];
        }
    }
    return to;
};
