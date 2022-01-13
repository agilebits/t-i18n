/// <reference path="../node_modules/@types/mocha/index.d.ts" />

import { expect } from "chai";
import { makeBasicT, makeT, Plural, generator, T as globalT } from "../src";
import { dateTimeFormats, numberFormats } from "../src/format";
import { BasicTFunc, TFunc } from "../src/t-i18n";

// Shim for DOM XML parser
import { DOMParser } from "xmldom";
global["DOMParser"] = DOMParser;
global["Node"] = {
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

const runBasicTTests = (T: BasicTFunc) => {
    const messages = {
        en: {
            "Hello--world": () => "Hello, world",
            "Goodbye--world": () => "Goodbye, world",
            "some-id": () => "Some message",
            "greet": () => "Hi, {name}",
            "greet-precompiled": (d: any) => "Hi, " + d.name,
            "Your--daysLeftInTrial--day-trial-starts-today": "Your {daysLeftInTrial} day trial starts today",
        },
        es: {
            "Hello--world": () => "Hola, mundo",
            "some-id": () => "Algún mensaje",
            "greet": () => "Hola, {name}",
            "greet-precompiled": (d: any) => "Hola, " + d.name,
            "not-compiled": "No compilado",
            // Actually French, but caused us an issue
            "Your--daysLeftInTrial--day-trial-starts-today": "Votre essai d'{daysLeftInTrial} jour commence aujourd'hui",
        }
    }
    T.set({
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
        expect(result).to.equal(expected);
    });

    it("should compile this specific French string", () => {
        const expected = "Votre essai d'10 jour commence aujourd'hui";
        const result = T("Your {daysLeftInTrial} day trial starts today", {daysLeftInTrial: 10});
        expect(result).to.equal(expected);
    });
}

const itShouldHaveFormatters = (T: TFunc) => {
    it("should have date function", () => {
        expect(typeof T.date).to.equal("function");
    });

    it("should have number function", () => {
        expect(typeof T.number).to.equal("function");
    });
}

const itShouldNotHaveFormatters = (T: BasicTFunc) => {
    it("should not have date function", () => {
        expect("date" in T).to.equal(false);
    });

    it("should not have number function", () => {
        expect("number" in T).to.equal(false);
    });
}

describe("global T", () => {
    runBasicTTests(globalT);
    itShouldHaveFormatters(globalT);
});

describe("T from makeT", () => {
    const T = makeT();
    runBasicTTests(T);
    itShouldHaveFormatters(T);
});

describe("T from makeBasicT", () => {
    const T = makeBasicT();
    runBasicTTests(T);
    itShouldNotHaveFormatters(T);
});

describe("T.$", () => {
    const T = makeT();

    it("should replace an XML tag with the named function and pass inner string as children", () => {
        const expected = ["Hi, ", { href: "#", children: ["Joe"] }, "!"];
        const result = T.$(
            "Hi, <link>{name}</link>!",
            {
                link: (...children) => ({ href: "#", children }),
                name: "Joe"
            }
        );
        expect(result).to.be.an("array");
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
        expect(result).to.be.an("array");
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
        expect(result).to.be.an("array");
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
        expect(result).to.be.an("array");
        expect(result).to.deep.equal(expected);
    });

    it("should flatten children if replacement is missing", () => {
        const expected = [
            "Test ",
            "A ",
            { name: "format", children: ["B"] },
        ];
        const result = T.$(
            "Test <noformat>A <format>B</format></noformat>",
            {
                format: (...children) => ({ name: "format", children })
            }
        );
        expect(result).to.be.an("array");
        expect(result).to.deep.equal(expected);
    });

    it("should ignore comments", () => {
        const expected = ["Test: "];
        const result = T.$(
            "Test: <!-- comment -->",
        );
        expect(result).to.be.an("array");
        expect(result).to.deep.equal(expected);
    });

    it("should not replace internal wrap element", () => {
        const expected = ["Test"];
        const result = T.$(
            "Test",
            {
                wrap: (...children) => ({ name: "wrap", children })
            }
        );
        expect(result).to.be.an("array");
        expect(result).to.deep.equal(expected);
    });

    it("should interpret XML entities", () => {
        const expected = [
            { name: "a", children: ["A < B"] },
            ">\"&''",
        ];
        const result = T.$(
            "<a>A &lt; B</a>&gt;&quot;&amp;&#39;&apos;",
            {
                a: (...children) => ({ name: "a", children }),
            }
        );
        expect(result).to.be.an("array");
        expect(result).to.deep.equal(expected);
    });

    it("should handle unescaped XML entities in ICU replacements", () => {
        const expected = [
            { name: "a", children: ["Jo & Joe <3"] },
            " <script> // John \"Bud\" O'Connor",
        ];
        const result = T.$(
            "<a>{test1}</a> {test2} // {test3}",
            {
                a: (...children) => ({ name: "a", children }),
                test1: "Jo & Joe <3",
                test2: "<script>",
                test3: "John \"Bud\" O'Connor",
            }
        );
        expect(result).to.be.an("array");
        expect(result).to.deep.equal(expected);
    });
});

describe("T.locale", () => {
    const T = makeT();

    it("should have default locale", () => {
        expect(T.locale()).to.equal("en");
    });

    it("should return updated locale", () => {
        T.set({ locale: "it" });
        expect(T.locale()).to.equal("it");
    });

    it("should return twice updated locale", () => {
        T.set({ locale: "de" });
        expect(T.locale()).to.equal("de");
    });
});

describe("T.date", () => {
    const T = makeT();
    T.set({
        locale: "it"
    });

    it("should print a localized date using the default format", () => {
        const date = Date.now();
        const expected = new Intl.DateTimeFormat("it", dateTimeFormats.long).format(date);
        [null, "long", "nonexistent"].forEach((format) => {
            const result = T.date(date, format as any);
            expect(result).to.equal(expected);
        });
    });

    it("should print a localized 'short' date", () => {
        const date = Date.now();
        const expected = new Intl.DateTimeFormat("it", dateTimeFormats.short).format(date);
        const result = T.date(date, "short");
        expect(result).to.equal(expected);
    });

    it("should print a date in the provided locale", () => {
        const date = Date.now();
        const expected = new Intl.DateTimeFormat("ru", dateTimeFormats.long).format(date);
        const result = T.date(date, null, "ru");
        expect(result).to.equal(expected);
    });
});


describe("T.number", () => {
    const T = makeT();
    T.set({
        locale: "he"
    });

    it("should print a localized number using the default (decimal) format", () => {
        const number = 15;
        const expected = new Intl.NumberFormat("he", numberFormats.decimal).format(number);
        [null, "decimal", "nonexistent"].forEach((format) => {
            const result = T.number(number, format as any);
            expect(result).to.equal(expected);
        });
    });

    it("should print a localized currency value in USD", () => {
        const number = 10.5;
        const expected = new Intl.NumberFormat("he", numberFormats.currency).format(number);
        const result = T.number(number, "currency");
        expect(result).to.equal(expected);
    });

    it("should print a number in the provided locale", () => {
        const number = 25;
        const expected = new Intl.NumberFormat("ko", numberFormats.decimal).format(number);
        const result = T.number(number, null, "ko");
        expect(result).to.equal(expected);
    });
});
