export type MFunc = (replacements?: IcuReplacements) => string;
export type Compiler = (message: string) => MFunc;
export interface Messages {
    [s: string]: {
        [s: string]: string | MFunc;
    };
}
export interface Config {
    messages: Messages;
    locale: string;
    idGenerator: (message: string) => string;
}
export type Mutable<X> = {
    -readonly [P in keyof X]: X[P];
};
export interface IcuReplacements {
    readonly [s: string]: string | number;
}
export interface XmlReplacements<X> {
    readonly [s: string]: (...children: (X | string)[]) => X;
}
export interface AnyReplacements<X> {
    readonly [s: string]: string | number | ((...children: (X | string)[]) => X);
}
