#!/usr/bin/env node

import * as ts from "typescript";
import * as fs from "fs";
import * as glob from "glob";
import {T, Plural, generator} from "../src/index"

const helpers = {
    "Plural": Plural,
    "generator": generator
}

let currentPrefix = "";

function evaluate(node: any, src: any): any {
    if (!node) return null;
    if (node.text) return node.text;
    
    const expression = (node as ts.Node).getFullText(src);

    // evil eval
    // this allows the use of translation helper objects/functions in messages and IDs
    const evalFunc = Function(...["Plural", "generator"], "return " + expression);
    const res = evalFunc(helpers.Plural, helpers.generator);

    return res;
}

function findMethodCall(objectName: string, methodName: string, src: ts.Node) {
    let res = [];
    find(src);
    function find(node: ts.Node) {
        if (!node) return;
        if (node.kind === ts.SyntaxKind.CallExpression ) {
            const call = node as ts.CallExpression;

            if (call.expression.kind && call.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                
                const methodCall = (call.expression as ts.PropertyAccessExpression),
                        obj = (methodCall.expression as ts.Identifier),
                        method = (methodCall.name as ts.Identifier);

                if (obj.text === objectName && method.text === methodName) {
                    res.push(node);    
                }
            }
        }

        return ts.forEachChild(node, find);    
    }
    return res;
}

function findFunctionCall(tagName: string, src: ts.Node) {
    let res = [];
    find(src);
    function find(node: ts.Node) {
        if (!node) return;
        
        if (node.kind === ts.SyntaxKind.CallExpression) {
            const call = (node as ts.CallExpression),
                expression = call.expression,
                name = (expression as ts.Identifier)
                if (expression && name.text === tagName) {
                    res.push(node);
                }
        }
    
        return ts.forEachChild(node, find);    
    }
    return res;
}

function extractPrefix(contents: string) {
    const srcFile = ts.createSourceFile("file.ts", contents, ts.ScriptTarget.ES2017, false, ts.ScriptKind.TSX);    
    const setupCalls = findMethodCall("i18n", "withPrefix", srcFile);
    setupCalls.forEach(c => {
        currentPrefix = c.arguments[0].text; 
    });
}

function extractMessages(contents: string) {
    const srcFile = ts.createSourceFile("file.ts", contents, ts.ScriptTarget.ES2017, false, ts.ScriptKind.TSX);    
    const tCalls = [...findFunctionCall("T", srcFile), ...findMethodCall("T", "$", srcFile)];
    let messages = {}
    tCalls.forEach(c => {
        const [message, values, id] = c.arguments;
        const evaluatedMessage = evaluate(message, srcFile);
        let idText = id ? id.text : T._i18nInstance.generateId(evaluatedMessage);
        if (currentPrefix) idText = currentPrefix + "." + idText;
        messages[idText] = evaluatedMessage;
    })
    return messages;
}

function runner(err: any, files:string[]) {
    console.log(`Extracting strings from '${files[0]}' + ${files.length -1} other files...`);
    let allMessages = {}
    files.forEach(file => {
        currentPrefix = "";
        const contents = fs.readFileSync(file).toString();
        extractPrefix(contents);
        
        const messages = extractMessages(contents);
        allMessages = {...allMessages, ...messages};
    });


    const sortedMessages = {};
    Object.keys(allMessages).sort().forEach(function(key) {
      sortedMessages[key] = allMessages[key];
    });
    fs.writeFileSync(outPath, JSON.stringify(sortedMessages, null, "\t"), {encoding:"utf8"});
    console.log(`Extracted ${Object.keys(sortedMessages).length} strings to '${outPath}'.`);
}

const input = process.argv[2] || process.cwd() + "/**/*.ts";
const outPath = process.argv[3] || process.cwd() + "/messages.en.json";
glob(input, runner);