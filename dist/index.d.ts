/// <reference path="../node_modules/@types/react/index.d.ts" />
/**
 * T.js - lightweight localization
 * v0.1
 *
 * T.js defers to standards to do the hard work of localization. The browser Intl API is use to format
 * dates and numbers. Messages are provided as functions rather than strings, so they can be compiled at build time.
 *
 *
 * Cobbled together by Mitch Cohen on July 31, 2017
 */
export declare type MFunc = (replacements?: Replacements) => string;
export declare type Compiler = (message: string) => MFunc;
export interface Replacements {
    [s: string]: any;
}
export interface Messages {
    [s: string]: {
        [s: string]: string | MFunc;
    };
}
export interface SetupOptions {
    messages?: Messages;
    locale?: string;
    idGenerator?: (message: string) => string;
    compiler?: Compiler;
}
export interface PluralOptions {
    other: string;
    one?: string;
    zero?: string;
}
export interface TFunc {
    (message: string, replacements?: Replacements, id?: string): string;
    lookup?: (id: string, replacements?: Replacements, defaultMFunc?: MFunc) => string;
    setup?: (options?: SetupOptions) => any;
    date?: (value: any, formatName?: string, locale?: string) => string;
    number?: (value: any, formatName?: string, locale?: string) => string;
    $?: (message: string, replacements?: any, id?: string) => any[];
    _i18nInstance?: I18n;
}
export declare type IntlFormat = Intl.DateTimeFormat | Intl.NumberFormat;
export declare type IntlFormatType = (typeof Intl.DateTimeFormat | typeof Intl.NumberFormat);
export declare type IntlFormatOptions = Intl.DateTimeFormatOptions | Intl.NumberFormatOptions;
export declare type CachedFormatter = (locale: string, formatOptions?: IntlFormatOptions) => IntlFormat;
export declare let dateTimeFormatOptions: {
    [s: string]: Intl.DateTimeFormatOptions;
};
export declare let numberFormatOptions: {
    [s: string]: Intl.NumberFormatOptions;
};
export declare const collationTable: string[];
export declare const defaultLanguage = "en";
export declare const generator: {
    plain(message: string): string;
    hyphens(message: string): string;
};
export declare function Plural(pluralizeFor: string, options: PluralOptions): string;
export declare function createCachedFormatter(intlFormat: (IntlFormatType)): CachedFormatter;
export declare class I18n {
    locale: string;
    messages: Messages;
    idGenerator: (message: string) => any;
    dateFormatter: CachedFormatter;
    numberFormatter: CachedFormatter;
    compiler: Compiler;
    static defaultSetup: SetupOptions;
    constructor(options?: SetupOptions);
    format(type: string, value: number | Date, formatStyle?: string, locale?: string): any;
    mFuncForKey(key: string, locale?: string): MFunc;
    generateId(message: string): any;
    lookup(id: string, replacements?: Replacements, defaultMFunc?: MFunc): string;
    setup(options?: SetupOptions): SetupOptions;
}
export declare function i18nNamespace(): TFunc;
export declare const T: TFunc;
export declare const makeI18n: typeof i18nNamespace;
