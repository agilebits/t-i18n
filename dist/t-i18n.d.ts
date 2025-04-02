import { IcuReplacements, Config, AnyReplacements } from "./types";
import { numberFormats, dateTimeFormats } from "./format";
export interface BasicTFunc {
    (message: string, replacements?: IcuReplacements, id?: string): string;
    $: <X>(message: string, replacements?: AnyReplacements<X>, id?: string) => (X | string)[];
    generateId: (message: string) => string;
    locale: () => string;
    lookup: (id: string, replacements?: IcuReplacements, defaultMessage?: string) => string;
    set: (options?: Partial<Config>) => Config;
}
export interface IntlFormatters {
    date: (value: Date | number, formatName?: keyof typeof dateTimeFormats, locale?: string) => string;
    number: (value: number, formatName?: keyof typeof numberFormats, locale?: string) => string;
}
export type TFunc = BasicTFunc & IntlFormatters;
export declare const makeBasicT: () => BasicTFunc;
export declare const makeT: () => TFunc;
export declare const makeErrorBasicT: (message: string) => BasicTFunc;
export declare const makeErrorT: (message: string) => TFunc;
declare const _default: TFunc;
export default _default;
