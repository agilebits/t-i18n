#!/usr/bin/env node

import * as ts from "typescript";
import * as fs from "fs";
import * as glob from "glob";
import * as minimist from "minimist";
import {T, Plural, generator} from "../dist/index"

const helpers = {
    "Plural": Plural,
    "generator": generator
}


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

function extractMessages(contents: string) {
    const srcFile = ts.createSourceFile("file.ts", contents, ts.ScriptTarget.ES2017, false, ts.ScriptKind.TSX);    
    const tCalls = [...findFunctionCall("T", srcFile), ...findMethodCall("T", "$", srcFile)];
    let messages = {}
    tCalls.forEach(c => {
        const [message, values, id] = c.arguments;
        const evaluatedMessage = evaluate(message, srcFile);
        let idText = id ? id.text : T._i18nInstance.generateId(evaluatedMessage);
        messages[idText] = evaluatedMessage;
    })
    return messages;
}

function runner(err: any, files:string[]) {
    console.log(`Extracting strings from '${files[0]}' + ${files.length -1} other files...`);
    const messages = files.map(file =>
        new Promise(resolve =>
            fs.readFile(file, 'utf8', (err, contents) => resolve(extractMessages(contents)))
        )
    );

    Promise.all(messages).then(values => {
        const allMessages = values.reduce((all:any, current:any) => {
            return {...all, ...current};
        }, messages[0]);

        output(sort(allMessages), outPath);
    });
}

function sort(obj: any) {
    let sorted = {};
    Object.keys(obj).sort().forEach(function(key) {
        sorted[key] = obj[key];
    });
    return sorted;
}

function output(messages: any, outPath: string) {
    if (outPath) {
        fs.writeFileSync(outPath, JSON.stringify(messages, null, "\t"), {encoding:"utf8"});
        console.log(`Extracted ${Object.keys(messages).length} strings to '${outPath}'.`);
    } else {
        console.log(JSON.stringify(messages))
    }
}


const args = minimist(process.argv.slice(2));
const input = args._[0] || process.cwd() + "/**/*.ts";
const outPath = args.outfile || null;
glob(input, {absolute: true}, runner);