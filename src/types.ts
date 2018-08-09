// Messages functions have replacement/pluralization logic baked in
// Use a tool like MessageFormat to generate these from strings
//
// const mFunc = (name) => "Hello, " + name
// mFunc("Mitch") // "Hello, Mitch"
//
export type MFunc =  (replacements?: IcuReplacements) => string;
// Function to compile strings into message functions during runtime
export type Compiler = (message: string) => MFunc;



// Message functions are grouped by locale and keyed to IDs
//
// {
// 	 en: {
//		 "greeting": (name) => "Hello, " + name
//	 }
// }
//
export interface Messages {
	[s: string]: {[s: string]: string|MFunc}
}

export interface Config {
	messages: Messages;
	locale: string;
	idGenerator: (message: string) => string;
}

export type Mutable<X> = {
	[P in keyof X]: X[P];
}

// { name: "Mitch", age: 10 }
export interface IcuReplacements {
	readonly [s: string]: string | number;
}

// { strong: (txt) => $.strong({}, txt) }
export interface XmlReplacements<X> {
	readonly [s: string]: (...children: (X | string)[]) => X;
}

export interface AnyReplacements<X> {
	readonly [s: string]: string | number | ((...children: (X | string)[]) => X);
}
