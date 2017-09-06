/// <reference path="../node_modules/@types/mocha/index.d.ts" />

import { expect } from "chai";
import {T, makeT} from "../src/index";
import {Plural, generator} from "../src/helpers";
import {dateTimeFormatOptions, numberFormatOptions} from "../src/format";

import * as DOM from "react-dom-factories";
import * as React from "react";

// Shim for DOM XML parser
import {DOMParser } from "xmldom";
global['DOMParser'] = DOMParser;
global['Node'] = {
    ELEMENT_NODE: 1
};

describe("Plural", () => {
    const expected = "{numMinutes, plural,\n" +
                            "\t=0{0 minutes}\n" +
                            "\tone{1 minute}\n" +
                            "\tother{# minutes}}";
                            
    it("should print a formatted plural string", () => {
        const result = Plural("numMinutes", {
            one: "1 minute",
            other: "# minutes",
            zero: "0 minutes"
        });

        expect(result).to.equal(expected);
    });
});

describe("T", () => {
    const T = createI18n();
    const messages = {
        en: {
            "hello--world": () => "Hello, world",
            "goodbye--world": () => "Goodbye, world",
            "some-id": () => "Some message",
            "greet": () => "Hi, {name}",
            "greet-precompiled": (d: any) => "Hi, " + d.name
        },
        es: {
            "hello--world": () => "Hola, mundo",
            "some-id": () => "Algún mensaje",
            "greet": () => "Hola, {name}",
            "greet-precompiled": (d: any) => "Hola, " + d.name,
            "not-compiled": "No compilado",
        }
    }
    T.setup({
        locale: "es",
        messages: messages,
        idGenerator: generator.hyphens
    });

    it("should find a translation in the current locale", () => {
        const expected = "Hola, mundo";
        const result = T("Hello, world");
        expect(result).to.equal(expected);
    });

    it("should find a translation in the default locale", () => {
        const expected = "Goodbye, world";
        const result = T("Goodbye, world");
        expect(result).to.equal(expected);
    });

    it("should use the provided message if no translation is found", () => {
        const expected = "So long, world";
        const result = T("So long, world");
        expect(result).to.equal(expected);
    });

    it("should use provided ID to look up translation", () => {
        const expected = "Algún mensaje";
        const result = T("Some message", null, "some-id");
        expect(result).to.equal(expected);
    });

    it("should pass replacements to a precompiled message function", () => {
        const expected = "Hola, Mitch";
        const result = T("Hi, {name}", {name: "Mitch"}, "greet-precompiled");
        expect(result).to.equal(expected);
    });

    it("should compile a string message with replacements", () => {
        const expected = "Howdy, Mitch";
        const result = T("Howdy, {name}", {name: "Mitch"});
    });
});

describe("T.$", () => {
    const T = createI18n();
    const factory = DOM.a;
    const props = {href: "https://google.com"};
    const element = factory(props, "world");
    
    it("should replace a react component factory and pass inner string as children", () => {
        const expected = ["Hello, ", element, "!"];
        const result = T.$("Hello, <link>world</link>!", {
            link: [factory, props]
        });
        expect(result).to.be.an('array');
        expect(result).to.deep.equal(expected);
    });
    it("should replace a react component", () => {
        const expected = [element];
        const result = T.$("<link />", {
            link: element
        })
        expect(result).to.be.an('array');
        expect(result).to.deep.equal(expected);
    });
});

describe("T.date", () => {
    const T = createI18n();
    T.setup({
        locale: "it"
    });

    it("should print a localized date using the default format", () => {
        const date = Date.now();
        const expected = new Intl.DateTimeFormat("it", dateTimeFormatOptions.default).format(date);
        [null, 'default', 'nonexistent'].forEach(format => {
            const result = T.date(date, format);
            expect(result).to.equal(expected);            
        });
    });

    it("should print a localized 'short' date", () => {
        const date = Date.now();
        const expected = new Intl.DateTimeFormat("it", dateTimeFormatOptions.short).format(date);
        const result = T.date(date, "short");
        expect(result).to.equal(expected);
    });

    it("should print a date in the provided locale", () => {
        const date = Date.now();
        const expected = new Intl.DateTimeFormat("ru", dateTimeFormatOptions.default).format(date);
        const result = T.date(date, null, "ru");
        expect(result).to.equal(expected);
    });
});


describe("T.number", () => {
    const T = createI18n();
    T.setup({
        locale: "he"
    });

    it("should print a localized number using the default (decimal) format", () => {
        const number = 15;
        const expected = new Intl.NumberFormat("he", numberFormatOptions.default).format(number);
        [null, 'default', 'nonexistent'].forEach(format => {
            const result = T.number(number, format);
            expect(result).to.equal(expected);            
        });
    });

    it("should print a localized currency value in USD", () => {
        const number = 10.5;
        const expected = new Intl.NumberFormat("he", numberFormatOptions.currency).format(number);
        const result = T.number(number, "currency");
        expect(result).to.equal(expected);
    });

    it("should print a number in the provided locale", () => {
        const number = 25;
        const expected = new Intl.NumberFormat("ko", numberFormatOptions.default).format(number);
        const result = T.number(number, null, "ko");
        expect(result).to.equal(expected);
    });
});


function createI18n() {
    return makeT();
}