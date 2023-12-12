export type IntlFormat = Intl.DateTimeFormat | Intl.NumberFormat;
export type IntlFormatType<X extends IntlFormat> = X extends Intl.DateTimeFormat ? typeof Intl.DateTimeFormat : typeof Intl.NumberFormat;
export type IntlFormatOptions<X extends IntlFormat> = X extends Intl.DateTimeFormat ? Intl.DateTimeFormatOptions : Intl.NumberFormatOptions;
export type CachedFormatter<X extends IntlFormat> = (locale: string, formatOptions?: IntlFormatOptions<X>) => X;
export declare const dateTimeFormats: {
    readonly short: {
        readonly month: "short";
        readonly day: "numeric";
        readonly year: "numeric";
    };
    readonly long: {
        readonly month: "long";
        readonly day: "numeric";
        readonly year: "numeric";
    };
    readonly dateTime: {
        readonly month: "short";
        readonly day: "numeric";
        readonly year: "numeric";
        readonly hour: "numeric";
        readonly minute: "numeric";
    };
};
export declare const numberFormats: {
    readonly currency: {
        readonly style: "currency";
        readonly currency: "USD";
    };
    readonly decimal: {
        readonly style: "decimal";
    };
    readonly percent: {
        readonly style: "percent";
    };
};
export default function createCachedFormatter<X extends IntlFormat>(intlFormat: IntlFormatType<X>): CachedFormatter<X>;
