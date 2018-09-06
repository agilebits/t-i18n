"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spaceRegex = /\s/g;
var nonWordRegex = /\W/g;
exports.generator = {
    plain: function (message) {
        return message;
    },
    hyphens: function (message) {
        var hyphenated = message.trim().replace(spaceRegex, "-").replace(nonWordRegex, '-');
        return hyphenated;
    }
};
function Plural(pluralizeFor, options) {
    var zero = options.zero, one = options.one, other = options.other;
    return "{" + pluralizeFor + ", plural,\n" +
        (zero ? "\t=0{" + zero + "}\n" : "") +
        (one ? "\tone{" + one + "}\n" : "") +
        ("\tother{" + other + "}}");
}
exports.Plural = Plural;
var xmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": '&#39;'
};
var escapeXml = function (str) { return (str.replace(/[&<>"']/g, function (match) { return xmlEscapes[match]; })); };
exports.splitAndEscapeReplacements = function (replacements) {
    var icu = {};
    var xml = {};
    for (var key in replacements) {
        if (replacements.hasOwnProperty(key)) {
            var value = replacements[key];
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
exports.assign = function (target, source) {
    var to = Object(target);
    for (var nextKey in source) {
        if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
            to[nextKey] = source[nextKey];
        }
    }
    return to;
};
