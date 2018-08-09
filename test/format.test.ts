/// <reference path="../node_modules/@types/mocha/index.d.ts" />

import { expect } from "chai";
import createCachedFormatter from "../src/format";

describe("createCachedFormatter", () => {
    it("should create a date formatter", () => {
        const options =  {day: "numeric", month: "long", year: "numeric"};
        const date = new Date(2017, 8, 1);
        const formatter = createCachedFormatter<Intl.DateTimeFormat>(Intl.DateTimeFormat);

        const expected = new Intl.DateTimeFormat("en", options).format(date);
        const result = formatter("en", options).format(date);

        expect (result).to.equal(expected);
    });

    it("should cache a new date formatter with the same settings", () => {
        const formatter = createCachedFormatter(Intl.DateTimeFormat);
        const a = formatter("en", {month: "long", year: "2-digit"});
        const b = formatter("en", {month: "long", year: "2-digit"});

        const result = (a === b);

        expect (result).to.equal(true);
    });

    it("should create a number formatter", () => {
        const formatter = createCachedFormatter<Intl.NumberFormat>(Intl.NumberFormat);

        const expected = new Intl.NumberFormat("es").format(2.3);
        const result = formatter("es").format(2.3);
        expect (result).to.equal(expected);
    });

    it("should cache a new number formatter with the same settings", () => {
        const formatter = createCachedFormatter(Intl.NumberFormat);
        const a = formatter("ja");
        const b = formatter("ja");

        const result = (a === b);

        expect (result).to.equal(true);
    });
});
