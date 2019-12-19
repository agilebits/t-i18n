"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var XML_WRAPPER = "wrap";
var parser;
function parseXml(xmlString, replacements) {
    if (typeof parser === 'undefined') {
        parser = new DOMParser();
    }
    var xmlDoc = parser.parseFromString("<" + XML_WRAPPER + ">" + xmlString + "</" + XML_WRAPPER + ">", "text/xml");
    if (!xmlDoc.firstChild || xmlDoc.firstChild.nodeName !== XML_WRAPPER) {
        throw new Error("Could not parse XML string");
    }
    return walk(xmlDoc.firstChild, replacements, true);
}
exports.default = parseXml;
var NODE_TYPE_ELEMENT = 1;
var NODE_TYPE_TEXT = 3;
function walk(node, replacements, isRoot) {
    if (isRoot === void 0) { isRoot = false; }
    if (node.nodeType === NODE_TYPE_TEXT) {
        return node.nodeValue ? [node.nodeValue] : [];
    }
    else if (node.nodeType === NODE_TYPE_ELEMENT) {
        var children = Array.prototype.slice.call(node.childNodes);
        var replacedChildren = children.reduce(function (acc, child) { return __spreadArrays(acc, walk(child, replacements)); }, []);
        return (isRoot || !replacements[node.nodeName]
            ? replacedChildren
            : [replacements[node.nodeName].apply(replacements, replacedChildren)]);
    }
    else {
        return [];
    }
}
