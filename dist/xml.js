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
exports.default = parseXml;
var XML_WRAPPER = "wrap";
var parser;
function parseXml(xmlString, replacements) {
    if (typeof parser === "undefined") {
        parser = new DOMParser();
    }
    var xmlDoc = parser.parseFromString("<".concat(XML_WRAPPER, ">").concat(xmlString, "</").concat(XML_WRAPPER, ">"), "text/xml");
    if (!xmlDoc.firstChild || xmlDoc.firstChild.nodeName !== XML_WRAPPER) {
        throw new Error("Could not parse XML string");
    }
    return walk(xmlDoc.firstChild, replacements, true);
}
var NODE_TYPE_ELEMENT = 1;
var NODE_TYPE_TEXT = 3;
function walk(node, replacements, isRoot) {
    if (isRoot === void 0) { isRoot = false; }
    if (node.nodeType === NODE_TYPE_TEXT) {
        return node.nodeValue ? [node.nodeValue] : [];
    }
    else if (node.nodeType === NODE_TYPE_ELEMENT) {
        var children = Array.prototype.slice.call(node.childNodes);
        var replacedChildren = children.reduce(function (acc, child) { return __spreadArray(__spreadArray([], acc, true), walk(child, replacements), true); }, []);
        return isRoot || !replacements[node.nodeName]
            ? replacedChildren
            : [replacements[node.nodeName].apply(replacements, replacedChildren)];
    }
    else {
        return [];
    }
}
