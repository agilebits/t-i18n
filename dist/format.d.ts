export declare type IntlFormat = Intl.DateTimeFormat | Intl.NumberFormat;
export declare type IntlFormatType<X extends IntlFormat> = X extends Intl.DateTimeFormat ? typeof Intl.DateTimeFormat : typeof Intl.NumberFormat;
export declare type IntlFormatOptions<X extends IntlFormat> = X extends Intl.DateTimeFormat ? Intl.DateTimeFormatOptions : Intl.NumberFormatOptions;
export declare type CachedFormatter<X extends IntlFormat> = (locale: string, formatOptions?: IntlFormatOptions<X>) => X;
export declare const dateTimeFormats: {
    short: {
        month: string;
        day: string;
        year: string;
    };
    long: {
        month: string;
        day: string;
        year: string;
    };
    dateTime: {
        month: string;
        day: string;
        year: string;
        hour: string;
        minute: string;
    };
};
export declare const numberFormats: {
    currency: {
        style: string;
        currency: string;
    };
    decimal: {
        style: string;
    };
    percent: {
        style: string;
    };
};
export default function createCachedFormatter<X extends IntlFormat>(intlFormat: IntlFormatType<X>): CachedFormatter<X>;
