import { AnyReplacements, IcuReplacements, XmlReplacements } from "./types";
export interface PluralOptions {
    other: string;
    one?: string;
    zero?: string;
}
export declare const generator: {
    plain(message: string): string;
    hyphens(message: string): string;
};
export declare function Plural(pluralizeFor: string, options: PluralOptions): string;
export declare const splitAndEscapeReplacements: <X>(replacements: AnyReplacements<X>) => [IcuReplacements, XmlReplacements<X>];
export declare const assign: <T, U>(target: T, source: U) => T & U;
