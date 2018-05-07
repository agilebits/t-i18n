/// <reference path="../node_modules/@types/mocha/index.d.ts" />

import { expect } from "chai";
import {T, makeT} from "../src/index";
import {Plural, generator} from "../src/helpers";
import {dateTimeFormatOptions, numberFormatOptions} from "../src/format";

// Shim for DOM XML parser
import { DOMParser } from "xmldom";
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
            "Hello--world": () => "Hello, world",
            "Goodbye--world": () => "Goodbye, world",
            "some-id": () => "Some message",
            "greet": () => "Hi, {name}",
            "greet-precompiled": (d: any) => "Hi, " + d.name
        },
        es: {
            "Hello--world": () => "Hola, mundo",
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

    it("should replace an XML tag with the named function and pass inner string as children", () => {
        const expected = ["Hi, ", { href: "#", children: ["Joe"] }, "!"];
        const result = T.$(
            "Hi, <link>{name}</link>!",
            {
                link: (...children) => ({ href: "#", children }),
                name: "Joe"
            }
        );
        expect(result).to.be.an('array');
        expect(result).to.deep.equal(expected);
    });

    it("should replace nested XML tags", () => {
        const expected = [
            {
                name: "a",
                children: [
                    "Visit your ",
                    { name: "strong", children: ["profile"] }
                ]
            },
            " to change your profile picture.",
        ];
        const result = T.$(
            "<link>Visit your <bold>profile</bold></link> to change your profile picture.",
            {
                link: (...children) => ({ name: "a", children }),
                bold: (...children) => ({ name: "strong", children }),
            }
        );
        expect(result).to.be.an('array');
        expect(result).to.deep.equal(expected);
    });

    it("should replace multiple identical XML tags", () => {
        const expected = [
            {
                name: "strong",
                children: ["Bold 1"]
            },
            " normal ",
            {
                name: "strong",
                children: ["Bold 2"]
            },
        ];
        const result = T.$(
            "<bold>Bold 1</bold> normal <bold>Bold 2</bold>",
            {
                bold: (...children) => ({ name: "strong", children }),
            }
        );
        expect(result).to.be.an('array');
        expect(result).to.deep.equal(expected);
    });

    it("should replace a self-closing tag", () => {
        const expected = ["A ", { text: "B" }];
        const result = T.$(
            "{a} <b />",
            {
                a: "A",
                b: () => ({ text: "B" })
            }
        );
        expect(result).to.be.an('array');
        expect(result).to.deep.equal(expected);
    });

    it("should include children even if there is no replacement", () => {
        const expected = ["Test: ", "text"];
        const result = T.$(
            "Test: <noformat>text</noformat>",
        );
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