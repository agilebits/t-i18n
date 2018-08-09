#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const fs = require("fs");
const glob = require("glob");
const minimist = require("minimist");
const index_1 = require("../dist/index");
const helpers = {
    "Plural": index_1.Plural,
    "generator": index_1.generator
};
function evaluate(node, src) {
    if (!node)
        return null;
    if (node.text)
        return node.text;
    const expression = node.getFullText(src);
    // evil eval
    // this allows the use of translation helper objects/functions in messages and IDs
    const evalFunc = Function(...["Plural", "generator"], "return " + expression);
    const res = evalFunc(helpers.Plural, helpers.generator);
    return res;
}
function findMethodCall(objectName, methodName, src) {
    let res = [];
    find(src);
    function find(node) {
        if (!node)
            return;
        if (node.kind === ts.SyntaxKind.CallExpression) {
            const call = node;
            if (call.expression.kind && call.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                const methodCall = call.expression, obj = methodCall.expression, method = methodCall.name;
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
    let res = [];
    find(src);
    function find(node) {
        if (!node)
            return;
        if (node.kind === ts.SyntaxKind.CallExpression) {
            const call = node, expression = call.expression, name = expression;
            if (expression && name.text === tagName) {
                res.push(node);
            }
        }
        return ts.forEachChild(node, find);
    }
    return res;
}
function extractMessages(contents) {
    const srcFile = ts.createSourceFile("file.ts", contents, ts.ScriptTarget.ES2017, false, ts.ScriptKind.TSX);
    const tCalls = [...findFunctionCall("T", srcFile), ...findMethodCall("T", "$", srcFile)];
    let messages = {};
    tCalls.forEach(c => {
        const [message, values, id] = c.arguments;
        const evaluatedMessage = evaluate(message, srcFile);
        let idText = id ? id.text : index_1.T.generateId(evaluatedMessage);
        messages[idText] = evaluatedMessage;
    });
    return messages;
}
function runner(err, files) {
    console.log(`Extracting strings from '${files[0]}' + ${files.length - 1} other files...`);
    const messages = files.map(file => new Promise(resolve => fs.readFile(file, 'utf8', (err, contents) => resolve(extractMessages(contents)))));
    Promise.all(messages).then(values => {
        const allMessages = values.reduce((all, current) => {
            return Object.assign({}, all, current);
        }, messages[0]);
        output(sort(allMessages), outPath);
    });
}
function sort(obj) {
    let sorted = {};
    Object.keys(obj).sort().forEach(function (key) {
        sorted[key] = obj[key];
    });
    return sorted;
}
function output(messages, outPath) {
    if (outPath) {
        fs.writeFileSync(outPath, JSON.stringify(messages, null, "\t"), { encoding: "utf8" });
        console.log(`Extracted ${Object.keys(messages).length} strings to '${outPath}'.`);
    }
    else {
        console.log(JSON.stringify(messages));
    }
}
const args = minimist(process.argv.slice(2));
const input = args._[0] || process.cwd() + "/**/*.ts";
const outPath = args.outfile || null;
glob(input, { absolute: true }, runner);
