#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var fs = require("fs");
var glob = require("glob");
var index_1 = require("../src/index");
var helpers = {
    "Plural": index_1.Plural,
    "generator": index_1.generator
};
var currentPrefix = "";
function evaluate(node, src) {
    if (!node)
        return null;
    if (node.text)
        return node.text;
    var expression = node.getFullText(src);
    // evil eval
    // this allows the use of translation helper objects/functions in messages and IDs
    var evalFunc = Function.apply(void 0, ["Plural", "generator"].concat(["return " + expression]));
    var res = evalFunc(helpers.Plural, helpers.generator);
    return res;
}
function findMethodCall(objectName, methodName, src) {
    var res = [];
    find(src);
    function find(node) {
        if (!node)
            return;
        if (node.kind === ts.SyntaxKind.CallExpression) {
            var call = node;
            if (call.expression.kind && call.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                var methodCall = call.expression, obj = methodCall.expression, method = methodCall.name;
                if (obj.text === objectName && method.text === methodName) {
                    res.push(node);
                }
            }
        }
        return ts.forEachChild(node, find);
    }
    return res;
}
function findFunctionCall(tagName, src) {
    var res = [];
    find(src);
    function find(node) {
        if (!node)
            return;
        if (node.kind === ts.SyntaxKind.CallExpression) {
            var call = node, expression = call.expression, name_1 = expression;
            if (expression && name_1.text === tagName) {
                res.push(node);
            }
        }
        return ts.forEachChild(node, find);
    }
    return res;
}
function extractPrefix(contents) {
    var srcFile = ts.createSourceFile("file.ts", contents, ts.ScriptTarget.ES2017, false, ts.ScriptKind.TSX);
    var setupCalls = findMethodCall("i18n", "withPrefix", srcFile);
    setupCalls.forEach(function (c) {
        currentPrefix = c.arguments[0].text;
    });
}
function extractMessages(contents) {
    var srcFile = ts.createSourceFile("file.ts", contents, ts.ScriptTarget.ES2017, false, ts.ScriptKind.TSX);
    var tCalls = findFunctionCall("T", srcFile).concat(findMethodCall("T", "$", srcFile));
    var messages = {};
    tCalls.forEach(function (c) {
        var _a = c.arguments, message = _a[0], values = _a[1], id = _a[2];
        var evaluatedMessage = evaluate(message, srcFile);
        var idText = id ? id.text : index_1.T._i18nInstance.generateId(evaluatedMessage);
        if (currentPrefix)
            idText = currentPrefix + "." + idText;
        messages[idText] = evaluatedMessage;
    });
    return messages;
}
function runner(err, files) {
    console.log("Extracting strings from '" + files[0] + "' + " + (files.length - 1) + " other files...");
    var allMessages = {};
    files.forEach(function (file) {
        currentPrefix = "";
        var contents = fs.readFileSync(file).toString();
        extractPrefix(contents);
        var messages = extractMessages(contents);
        allMessages = __assign({}, allMessages, messages);
    });
    var sortedMessages = {};
    Object.keys(allMessages).sort().forEach(function (key) {
        sortedMessages[key] = allMessages[key];
    });
    fs.writeFileSync(outPath, JSON.stringify(sortedMessages, null, "\t"), { encoding: "utf8" });
    console.log("Extracted " + Object.keys(sortedMessages).length + " strings to '" + outPath + "'.");
}
var input = process.argv[2] || process.cwd() + "/**/*.ts";
var outPath = process.argv[3] || process.cwd() + "/messages.en.json";
glob(input, runner);
