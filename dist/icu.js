"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parseIcu;
var TOKEN = {
    OPEN: "{",
    CLOSE: "}",
};
function parseIcu(icuString, replacements) {
    if (!replacements)
        return icuString;
    var currentToken = "";
    var elements = [];
    for (var i = 0; i < icuString.length; i++) {
        switch (icuString.charAt(i)) {
            case TOKEN.OPEN:
                elements.push(currentToken);
                currentToken = "";
                break;
            case TOKEN.CLOSE:
                elements.push(replacements[currentToken]);
                currentToken = "";
                break;
            default:
                currentToken += icuString.charAt(i);
        }
    }
    elements.push(currentToken);
    return elements.join("");
}
